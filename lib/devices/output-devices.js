const MIDISPORT_A = 'MIDISPORT 4x4 Port A'
const MIDISPORT_B = 'MIDISPORT 4x4 Port B'
const MIDISPORT_C = 'MIDISPORT 4x4 Port C'

module.exports = {
  mixer: {
    port: 'IAC Driver IAC Bus 2',
    channel: 1
  },

  nord: {
    port: 'IAC Driver IAC Bus 2',
    channel: 1
  },

  prophet: {
    port: 'IAC Driver IAC Bus 2',
    channel: 10,
    deserializeProgram: serialized => ({
      program: serialized % 100,
      bank: Math.floor(serialized / 100)
    })
  },

  juno: {
    port: 'IAC Driver IAC Bus 2',
    channel: 11
  }
}
