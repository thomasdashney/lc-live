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
    channel: 1,
    deserializeProgram: serialized => {
      const base6String = serialized.split(':')
        .map(n => parseInt(n, 10))
        .map(n => n - 1)
        .map(n => n.toString(6))
        .join('')

      return { program: parseInt(base6String, 6) }
    }
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
