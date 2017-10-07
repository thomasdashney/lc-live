const { forEach } = require('lodash')
const chalk = require('chalk')
const logger = require('../logger')

class Performance {
  constructor (setlist, outputs) {
    this._setlist = setlist
    this._outputs = outputs
  }

  start () {
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

  // This can prob be refactored

  loadScene (newSongIndex, newSceneIndex) {
    // update current indexes
    this.currentSongIndex = newSongIndex
    this.currentSceneIndex = newSceneIndex

    // grab the current scene by index
    const scene = this.currentScene

    // send program changes to each device
    const { programs = {} } = scene
    forEach(programs, (program, deviceName) => {
      const outputDevice = this._outputs[deviceName]
      if (!outputDevice) {
        logger.warn(`WARNING - could not find ${deviceName} for ${this.currentSong.name} - ${scene.name}`)
        return
      }

      outputDevice.changeProgram(program)
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
