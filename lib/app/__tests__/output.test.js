/* eslint-env jest */
const Output = require('../output')

let midiOutputMock

beforeEach(() => {
  midiOutputMock = {
    sendMessage: jest.fn()
  }
})

describe('changeProgram', () => {
  it('sends a program change message to the correct channel', () => {
    const channel = 10
    const output = new Output(midiOutputMock, channel)
    const newProgram = 0x50
    output.changeProgram(newProgram)
    expect(midiOutputMock.sendMessage).toBeCalledWith([0xC9, newProgram])
  })
})

describe('_buildMessage', () => {
  it('creates a message with one data byte', () => {
    const output = new Output(midiOutputMock, 10)
    expect(output._buildMessage(1, 2)).toHaveLength(2)
  })

  it('creates a message with two data bytes', () => {
    const output = new Output(midiOutputMock, 10)
    expect(output._buildMessage(1, 2, 3)).toHaveLength(3)
  })
})

describe('channel', () => {
  it('returns the channel', () => {
    const output = new Output(midiOutputMock, 10)
    expect(output.channel).toEqual(10)
  })
})
