/* eslint-env jest */

const { getChannel, createStatusByte } = require('../midi-utils')

describe('getChannel', () => {
  it('returns the correct 1-indexed channel of the status byte', () => {
    expect(getChannel(0xC0)).toEqual(1)
    expect(getChannel(0xC4)).toEqual(5)
    expect(getChannel(0xCF)).toEqual(16)
  })
})

describe('createStatusByte', () => {
  it('creates a status byte using the status code and the correct midi channel', () => {
    expect(createStatusByte(0xA, 16)).toEqual(0xAF)
    expect(createStatusByte(0xA, 6)).toEqual(0xA5)
    expect(createStatusByte(0xA, 1)).toEqual(0xA0)
  })
})
