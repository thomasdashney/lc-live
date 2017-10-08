/* eslint-env jest */
const EventEmitter = require('events')
const Input = require('../input')

it('re-emits messaged emitted its midi input', () => {
  const midiInput = new EventEmitter()

  const listener = jest.fn()

  const input = new Input(midiInput)
  input.on('message', listener)

  const message = [0xCF, 40, 50]
  midiInput.emit('message', 500, message)

  expect(listener).toBeCalledWith(message)
})
