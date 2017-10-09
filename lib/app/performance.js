const EventEmitter = require('events')
const { forEach, pick, values } = require('lodash')
const { getChannel } = require('./midi-utils')

class Performance extends EventEmitter {
  constructor (setlist, outputs, inputs, matrix) {
    super()
    this._setlist = setlist
    this._outputs = outputs
    this._inputs = inputs
    this._matrix = matrix
  }

  toJSON () {
    return {
      currentSongIndex: this.currentSongIndex,
      currentSceneIndex: this.currentSceneIndex,
      songs: this.setlist.songs
    }
  }

  start () {
    // configure listeners for the inputs
    forEach(this._matrix, (outputPorts, inputPort) => {
      const outputs = values(pick(this._outputs, outputPorts))
      this._inputs[inputPort].on('message', message => {
        outputs.forEach(output => {
          if (output.channel === getChannel(message[0])) {
            output.sendMessage(message)
          }
        })
      })

      // TODO: remove this listener at some point
    })

    this.loadScene(0, 0)
  }

  get currentSong () {
    return this.setlist.songAt(this.currentSongIndex)
  }

  get currentScene () {
    return this.currentSong.sceneAt(this.currentSceneIndex)
  }

  get setlist () {
    return this._setlist
  }

  loadScene (newSongIndex, newSceneIndex) {
    // validate
    const song = this.setlist.songAt(newSongIndex)
    if (!song) {
      throw new Error(`No song exists at index ${newSongIndex}`)
    } else if (!song.sceneAt(newSceneIndex)) {
      throw new Error(`No scene exists for song ${song.name} at index ${newSongIndex}`)
    }

    // update current indexes
    this.currentSongIndex = newSongIndex
    this.currentSceneIndex = newSceneIndex

    // send program changes to each device
    const { programs = {} } = this.currentScene
    forEach(programs, (program, deviceName) => {
      const outputDevice = this._outputs[deviceName]
      outputDevice.changeProgram(program.program, program.bank)
    })

    // emit message indicating which scene we've entered
    this.emit('loadedScene', this.currentSongIndex, this.currentSceneIndex)
  }

  incrementScene () {
    if (this.currentSong.sceneAt(this.currentSceneIndex + 1)) {
      // go to next scene within song
      this.loadScene(this.currentSongIndex, this.currentSceneIndex + 1)
    } else if (this.setlist.songAt(this.currentSongIndex + 1)) {
      // go to first scene of next song
      this.loadScene(this.currentSongIndex + 1, 0)
    }
  }

  decrementScene () {
    if (this.currentSong.sceneAt(this.currentSceneIndex - 1)) {
      // go to previous scene in same song
      this.loadScene(this.currentSongIndex, this.currentSceneIndex - 1)
    } else if (this.setlist.songAt(this.currentSongIndex - 1)) {
      // go to last scene in previous song
      const song = this.setlist.songAt(this.currentSongIndex - 1)
      this.loadScene(this.currentSongIndex - 1, song.scenes.length - 1)
    }
  }

  incrementSong () {
    if (this.setlist.songAt(this.currentSongIndex + 1)) {
      // go to next song
      this.loadScene(this.currentSongIndex + 1, 0)
    }
  }

  decrementSong () {
    if (this.currentSceneIndex === 0 && this.setlist.songAt(this.currentSongIndex - 1)) {
      // go to previous song
      this.loadScene(this.currentSongIndex - 1, 0)
    } else if (this.currentSceneIndex > 0) {
      // go to first scene of current song
      this.loadScene(this.currentSongIndex, 0)
    }
  }
}

module.exports = Performance
