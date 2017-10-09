const { PROGRAM_CHANGE, CTRL_CHANGE } = require('../constants/midi-status-codes')
const { BANK_SELECT_LSB } = require('../constants/midi-cc-numbers')
const { createStatusByte } = require('./midi-utils')

class Output {
  constructor (midiOutput, channel, portName) {
    this._output = midiOutput
    this._channel = channel
    this._portName = portName
  }

  get channel () {
    return this._channel
  }

  changeProgram (program, bank) {
    const messages = [
      this._buildMessage(PROGRAM_CHANGE, program)
    ]

    if (bank) {
      messages.unshift(
        this._buildMessage(CTRL_CHANGE, BANK_SELECT_LSB, bank)
      )
    }

    messages.forEach(this.sendMessage.bind(this))
  }

  _buildMessage (statusCode, data1, data2 = 0) {
    const message = [createStatusByte(statusCode, this.channel), data1]
    if (data2) message.push(data2)
    return message
  }

  sendMessage (message) {
    this._output.sendMessage(message)
  }
}

module.exports = Output
