const MIDISPORT_A = 'MIDISPORT 4x4 Port A'
const MIDISPORT_B = 'MIDISPORT 4x4 Port B'
const MIDISPORT_C = 'MIDISPORT 4x4 Port C'

module.exports = {
  mixer: {
    port: MIDISPORT_A,
    channel: 1
  },

  nord: {
    port: MIDISPORT_B,
    channel: 1
  },

  prophet: {
    port: MIDISPORT_B,
    channel: 10
  },

  juno: {
    port: MIDISPORT_C,
    channel: 11
  }
}
