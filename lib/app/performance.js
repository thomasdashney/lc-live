const { forEach, pick, values } = require('lodash')
const chalk = require('chalk')
const logger = require('../logger')
const { getChannel } = require('../midi-utils')

class Performance {
  constructor (setlist, outputs, inputs, matrix) {
    this._setlist = setlist
    this._outputs = outputs
    this._inputs = inputs
    this._matrix = matrix
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

    this.logSetlist()
    this.loadScene(0, 0)
    this.logCurrentSongAndScene()
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
  }

  logSetlist () {
    logger.info(chalk.magenta('Setlist:'))
    this.setlist.songs.forEach(song => {
      logger.info(`  ${chalk.white(song.name)}`)
    })
    logger.info('') // line break
  }

  logCurrentScene () {
    const sceneName = this.currentScene.name
    const numScenes = this.currentSong.scenes.length
    logger.info(`  ${chalk.yellow(sceneName)} ${chalk.grey(`(${this.currentSceneIndex + 1}/${numScenes})`)}`)
  }

  logCurrentSongAndScene () {
    logger.info(chalk.green(this.currentSong.name))
    this.logCurrentScene()
  }

  incrementScene () {
    if (this.currentSong.sceneAt(this.currentSceneIndex + 1)) {
      // go to next scene within song
      this.loadScene(this.currentSongIndex, this.currentSceneIndex + 1)
      this.logCurrentScene()
    } else if (this.setlist.songAt(this.currentSongIndex + 1)) {
      // go to first scene of next song
      this.loadScene(this.currentSongIndex + 1, 0)
      this.logCurrentSongAndScene()
    }
  }

  decrementScene () {
    if (this.currentSong.sceneAt(this.currentSceneIndex - 1)) {
      // go to previous scene in same song
      this.loadScene(this.currentSongIndex, this.currentSceneIndex - 1)
      this.logCurrentScene()
    } else if (this.setlist.songAt(this.currentSongIndex - 1)) {
      // go to last scene in previous song
      const song = this.setlist.songAt(this.currentSongIndex - 1)
      this.loadScene(this.currentSongIndex - 1, song.scenes.length - 1)
      this.logCurrentSongAndScene()
    }
  }

  incrementSong () {
    if (this.setlist.songAt(this.currentSongIndex + 1)) {
      // go to next song
      this.loadScene(this.currentSongIndex + 1, 0)
      this.logCurrentSongAndScene()
    }
  }

  decrementSong () {
    if (this.currentSceneIndex === 0 && this.setlist.songAt(this.currentSongIndex - 1)) {
      // go to previous song
      this.loadScene(this.currentSongIndex - 1, 0)
      this.logCurrentSongAndScene()
    } else if (this.currentSceneIndex > 0) {
      // go to first scene of current song
      this.loadScene(this.currentSongIndex, 0)
      this.logCurrentScene()
    }
  }
}

module.exports = Performance
