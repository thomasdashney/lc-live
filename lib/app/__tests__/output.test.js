/* eslint-env jest */
const Output = require('../output')
const { BANK_SELECT_MSB, BANK_SELECT_LSB } = require('../../constants/midi-cc-numbers')

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
    const program = 0x50
    output.changeProgram(program)
    expect(midiOutputMock.sendMessage).toBeCalledWith([0xC9, program])
  })

  it('can send bank changes', () => {
    const output = new Output(midiOutputMock, 10)
    const program = 0x50
    const bank = 5
    output.changeProgram(program, bank)
    expect(midiOutputMock.sendMessage.mock.calls).toEqual([
      [ [0xB9, BANK_SELECT_MSB, 0] ],
      [ [0xB9, BANK_SELECT_LSB, 5] ],
      [ [0xC9, program] ]
    ])
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
