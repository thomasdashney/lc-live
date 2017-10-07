const { input: Input, output: Output } = require('midi')
const { times, values } = require('lodash')

function getPortMapping (io) {
  return times(io.getPortCount(), n => n).reduce((prev, portNum) => {
    return Object.assign({}, prev, {
      [io.getPortName(portNum)]: portNum
    })
  }, {})
}

const inputPortMapping = getPortMapping(new Input())
const outputPortMapping = getPortMapping(new Output())

const inputsByName = {}
const outputsByName = {}

module.exports = {
  getOutputByName: name => {
    if (!outputsByName[name]) {
      const portNum = outputPortMapping[name]
      if (portNum === undefined) {
        throw new Error(`${name} could not be found`)
      }

      const output = new Output()
      output.openPort(portNum)
      outputsByName[name] = output
    }

    return outputsByName[name]
  },
  availableInputPorts: inputPortMapping,
  availableOutputPorts: outputPortMapping
}

process.on('exit', code => {
  // gracefully close ports. dunno if this needs to happen or not
  ;[inputsByName, outputsByName].forEach(devices => {
    values(devices).forEach(device => device.closePort())
  })
})
