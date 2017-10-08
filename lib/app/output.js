const logger = require('../logger')
const { PROGRAM_CHANGE } = require('../constants/midi-status-codes')

function formatMessage (message) {
  return message.map(n => n.toString(16).toUpperCase().padStart(2, 0))
}

class Output {
  constructor (midiOutput, channel, portName) {
    this._output = midiOutput
    this._channel = channel
    this._portName = portName
  }

  changeProgram (progNum) {
    const message = this._buildMessage(PROGRAM_CHANGE, progNum)
    this.sendMessage(message)
  }

  _buildMessage (statusCode, data1, data2 = 0) {
    const message = [(statusCode << 4) + this._channel - 1, data1]
    if (data2) message.push(data2)
    return message
  }

  sendMessage (message) {
    logger.debug(`[${formatMessage(message)}] => ${this._portName}`)
    this._output.sendMessage(message)
  }
}

module.exports = Output
