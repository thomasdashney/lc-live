/* eslint-env jest */

const { prophet6, nord, juno } = require('../program-deserializers')

describe('prophet', () => {
  it('deserializes prophet-formatted patch numbers', () => {
    expect(prophet6(99)).toEqual({ bank: 0, program: 99 })
    expect(prophet6(100)).toEqual({ bank: 1, program: 0 })
    expect(prophet6(499)).toEqual({ bank: 4, program: 99 })
  })
})

describe('nord', () => {
  it('deserializes nord-formatted patch numbers', () => {
    expect(nord('1:1')).toEqual({ program: 0 })
    expect(nord('1:6')).toEqual({ program: 5 })
    expect(nord('2:1')).toEqual({ program: 6 })
    expect(nord('6:1')).toEqual({ program: 30 })
    expect(nord('6:6')).toEqual({ program: 35 })
    expect(nord('7:1')).toEqual({ program: 36 })
    expect(nord('10:1')).toEqual({ program: 54 })
  })
})

describe('juno', () => {
  it('deserializes juno-formatted patch numbers', () => {
    expect(juno('1:1')).toEqual({ program: 0 })
    expect(juno('1:8')).toEqual({ program: 7 })
    expect(juno('2:1')).toEqual({ program: 8 })
  })
})
