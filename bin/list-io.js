const midiManager = require('../lib/app/midi-manager')

console.log('Inputs:', Object.keys(midiManager.availableInputPorts))
console.log('Outputs:', Object.keys(midiManager.availableOutputPorts))

process.exit(0)
