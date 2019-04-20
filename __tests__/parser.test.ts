import Parser, { Command } from '../src/parser'

const parser = new Parser({
  prefix: '!'
})

test('parse simple command', () => {
  let result = parser.parse('!help')
  expect(result).not.toBeNull()

  let command = result as Command
  expect(command.name).toEqual('help')
})

test('parse command with options', () => {
  let result = parser.parse('!command --key test arg1 arg2')
  expect(result).not.toBeNull()

  let command = result as Command
  expect(command.name).toEqual('command')
  expect(command.args).toHaveProperty('key', 'test')
  expect(command.args).toHaveProperty('_', ['arg1', 'arg2'])
})
