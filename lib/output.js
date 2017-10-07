const logger = require('./logger')

function formatMessage (message) {
  return message.map(n => n.toString(16).toUpperCase().padStart(2, 0))
}

class Output {
  constructor (midiOutput, channel, portName) {
    this._output = midiOutput
    this._channel = channel
    this._portName = portName
    this.PGM_CHNG = 0xC0 + channel - 1
  }

  changeProgram (progNum) {
    const message = [this.PGM_CHNG, progNum]
    this._sendMessage(message)
  }

  _sendMessage (message) {
    logger.debug(`[${formatMessage(message)}] => ${this._portName}`)
    this._output.sendMessage(message)
  }
}

module.exports = Output
