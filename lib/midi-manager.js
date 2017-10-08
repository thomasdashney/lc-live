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

const getIOByName = (IO, mapping, iosByName) => {
  return name => {
    if (!iosByName[name]) {
      const portNum = mapping[name]
      if (portNum === undefined) {
        throw new Error(`${name} could not be found`)
      }

      const io = new IO()
      io.openPort(portNum)
      iosByName[name] = io
    }

    return iosByName[name]
  }
}

module.exports = {
  getOutputByName: getIOByName(Output, outputPortMapping, inputsByName),
  getInputByName: getIOByName(Input, inputPortMapping, outputsByName),
  availableInputPorts: inputPortMapping,
  availableOutputPorts: outputPortMapping
}

process.on('exit', code => {
  // gracefully close ports. dunno if this needs to happen or not
  ;[inputsByName, outputsByName].forEach(devices => {
    values(devices).forEach(device => device.closePort())
  })
})
