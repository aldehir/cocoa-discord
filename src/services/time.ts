import axios from 'axios'
import * as moment from 'moment'
import * as Discord from 'discord.js'

import logger from '../logger'

import Router from '../router'
import Service from '../service'
import { Command } from '../parser'

const GOOGLE_API_URL = "https://maps.googleapis.com/maps/api"
const GOOGLE_FINDPLACE_ENDPOINT = "place/findplacefromtext/json"
const GOOGLE_TIMEZONE_ENDPOINT = "timezone/json"

export interface TimeAPI {
  getTime(query: string): Promise<TimeAPIResponse>
}

export interface TimeAPIResponse {
  location: string
  time: moment.Moment
}

interface PlaceResponse {
  name: string
  address: string
  location: [number, number]
}

export class GoogleTimeAPI implements TimeAPI {
  readonly apiKey: string

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  async getTime(query: string): Promise<TimeAPIResponse> {
    let place = await this.findPlaceFromText(query)
    let epoch = await this.getEpochTimeFromPlace(place)
    return {
      location: place.address,
      time: moment.unix(epoch).utc()
    }
  }

  async findPlaceFromText(input: string): Promise<PlaceResponse> {
    let queryService = () => {
      let url = `${GOOGLE_API_URL}/${GOOGLE_FINDPLACE_ENDPOINT}`
      return axios.get(url, {
        params: {
          input: input,
          inputtype: 'textquery',
          key: this.apiKey,
          fields: 'formatted_address,name,geometry/location'
        }
      })
    }

    let isResponseValid = (response: any): boolean => {
      let data = response.data
      if (!data || !data.candidates || data.candidates.length == 0) {
        return false
      }
      return true
    }

    let response = await queryService()

    if (!isResponseValid(response)) {
      throw { message: "Failed to get response" }
    }

    let best = response.data.candidates[0]
    let location = best.geometry.location

    return {
      name: best['name'],
      address: best['formatted_address'],
      location: [location.lat, location.lng]
    }
  }

  async getEpochTimeFromPlace(place: PlaceResponse): Promise<number> {
    let queryService = (timestamp: number) => {
      let url = `${GOOGLE_API_URL}/${GOOGLE_TIMEZONE_ENDPOINT}`

      return axios.get(url, {
        params: {
          location: `${place.location[0]},${place.location[1]}`,
          timestamp: String(timestamp),
          key: this.apiKey
        }
      })
    }

    let isResponseOK = (response: any): boolean => {
      return (response.data && response.data.status === 'OK')
    }

    let currentTimeInSeconds = Math.floor((new Date()).getTime() / 1000)
    let response = await queryService(currentTimeInSeconds)

    if (!isResponseOK) {
      throw { message: "Error getting timezone information" }
    }

    let dstOffset = response.data.dstOffset
    let rawOffset = response.data.rawOffset

    return currentTimeInSeconds + dstOffset + rawOffset
  }
}

export default class TimeService implements Service {
  private timeAPI: TimeAPI

  constructor(timeAPI: TimeAPI) {
    this.timeAPI = timeAPI
  }

  inject(router: Router) {
    router.route('time', this.onTime.bind(this))
  }

  async onTime(command: Command, msg: any) {
    let message = msg as Discord.Message
    let query = command.args._.join(' ')

    if (query.length === 0) {
      message.channel.send(`Usage: !time <place>`, { code: true })
      return
    }

    try {
      let response = await this.timeAPI.getTime(query)
      let formattedTime = response.time.format("dddd, MMMM Do YYYY, h:mm:ss a")
      message.channel.send(`The current time in ${response.location} is:\n\n${formattedTime}`, { code: true })
    } catch(err) {
      console.error(err)
      message.channel.send(`Query failed`, { code: true })
    }
  }
}
