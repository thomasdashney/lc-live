/* eslint-env jest */

const { prophet, nord } = require('../output-devices')

describe('prophet deserializeProgram', () => {
  it('deserializes prophet-formatted patch numbers', () => {
    expect(prophet.deserializeProgram(99)).toEqual({ bank: 0, program: 99 })
    expect(prophet.deserializeProgram(100)).toEqual({ bank: 1, program: 0 })
    expect(prophet.deserializeProgram(499)).toEqual({ bank: 4, program: 99 })
  })
})

describe('nord deserializeProgram', () => {
  it('deserializes nord-formatted patch numbers', () => {
    expect(nord.deserializeProgram('1:1')).toEqual({ program: 0 })
    expect(nord.deserializeProgram('1:6')).toEqual({ program: 5 })
    expect(nord.deserializeProgram('2:1')).toEqual({ program: 6 })
    expect(nord.deserializeProgram('6:1')).toEqual({ program: 30 })
    expect(nord.deserializeProgram('6:6')).toEqual({ program: 35 })
    expect(nord.deserializeProgram('7:1')).toEqual({ program: 36 })
    expect(nord.deserializeProgram('10:1')).toEqual({ program: 54 })
  })
})
