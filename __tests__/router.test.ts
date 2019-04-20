import Router from '../src/router'

const router = new Router()

test("route simple command", done => {
  router.route('help', (command) => {
    expect(command).toHaveProperty('name', 'help')
    expect(command).toHaveProperty('args', { _: [] })
    done()
  })

  router.process('!help')
})

test("route simple command with payload", done => {
  let mockPayload = jest.fn()

  router.route('test', (command, payload) => {
    expect(command).toHaveProperty('name', 'test')
    expect(command).toHaveProperty('args', { _: ['arg1', 'arg2'] })
    expect(payload).not.toBeUndefined()
    expect(payload).toBe(mockPayload)
    done()
  })

  router.process('!test arg1 arg2', mockPayload)
})
