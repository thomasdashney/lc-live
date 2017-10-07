const MIDISPORT_A = 'MIDISPORT 4x4 Port A'
const MIDISPORT_B = 'MIDISPORT 4x4 Port B'
const MIDISPORT_C = 'MIDISPORT 4x4 Port C'

module.exports = {
  mixer: {
    port: 'IAC Driver IAC Bus 1',
    channel: 1
  },

  nord: {
    port: 'IAC Driver IAC Bus 1',
    channel: 1,
    programChangeMessages: progNum => {
      return [
      ]
    }
  },

  prophet: {
    port: 'IAC Driver IAC Bus 1',
    channel: 10
  },

  juno: {
    port: 'IAC Driver IAC Bus 1',
    channel: 11
  }
}
