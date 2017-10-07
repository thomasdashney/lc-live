const keypress = require('keypress')
const { mapValues } = require('lodash')
const setlistConfig = require('../config/setlist')
const songConfig = require('../config/songs')
const outputDevicesConfig = require('../config/output-devices')
const logger = require('../lib/logger')
const midiManager = require('../lib/midi-manager')

const Scene = require('../lib/scene')
const Song = require('../lib/song')
const Setlist = require('../lib/setlist')
const Performance = require('../lib/performance')
const Output = require('../lib/output')

const outputs = mapValues(outputDevicesConfig, config => {
  const output = midiManager.getOutputByName(config.port)
  return new Output(output, config.channel, config.port)
})

/**
 * Load performance into memory from configuration
 */

const songsByKey = mapValues(songConfig, (config, key) => {
  const sceneConfigs = config.scenes || [{ name: 'Default' }]
  const scenes = sceneConfigs.map(config => {
    return new Scene(config.name, config.programs || {})
  })

  return new Song(config.name || key, scenes)
})

const setlist = new Setlist(setlistConfig.map(key => {
  const song = songsByKey[key]

  if (!song) {
    throw new Error(`Setlist defined ${song} which does not exist`)
  }

  return song
}))

const performance = new Performance(setlist, outputs)

logger.clear()
logger.system('Booted up successfully')

performance.start()

/**
 * Set up key bindings
 */

keypress(process.stdin)

const keyHandlers = {
  'right': performance.incrementScene.bind(performance),
  'left': performance.decrementScene.bind(performance),
  'down': performance.incrementSong.bind(performance),
  'up': performance.decrementSong.bind(performance)
}

process.stdin.on('keypress', (ch, key) => {
  const { ctrl, shift, name } = key

  if (!ctrl && !shift) {
    const handler = keyHandlers[key.name]
    if (handler) {
      handler()
    }
  } else if (ctrl && !shift && name === 'c') {
    process.exit(0)
  }
})

process.stdin.setRawMode(true)
process.stdin.resume()
process.on('exit', code => {
  if (code === 0) {
    logger.system('Shutting down by request')
  } else {
    logger.system('Shutting down unexpectedly')
  }
})
