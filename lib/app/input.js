const EventEmitter = require('events')

class Input extends EventEmitter {
  constructor (midiInput) {
    super()
    this._input = midiInput
    this._input.on('message', this._handleMessage.bind(this))
  }

  _handleMessage (deltaTime, message) {
    this.emit('message', message)
  }
}

module.exports = Input
