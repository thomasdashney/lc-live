const keypress = require('keypress')
const { mapValues } = require('lodash')
const logger = require('./logger')
const midiManager = require('./midi-manager')
const yaml = require('js-yaml')
const fs = require('fs')
const { resolve } = require('path')
const tv4 = require('tv4')
const { createSongsSchema, createSetlistSchema } = require('./config-schemas')

const loadYmlFromRelativePath = relativePath => {
  return yaml.safeLoad(fs.readFileSync(resolve(__dirname, relativePath), 'utf8'))
}

const setlistConfig = loadYmlFromRelativePath('../config/setlist.yml')
const songsConfig = loadYmlFromRelativePath('../config/songs.yml')
const inputDevicesConfig = require('./devices/input-devices')
const outputDevicesConfig = require('./devices/output-devices')

const songsSchema = createSongsSchema(Object.keys(outputDevicesConfig))
const songsAreValid = tv4.validate(songsConfig, songsSchema)
if (!songsAreValid) {
  console.error('Song config is invalid')
  process.exit(1)
}

const setlistSchema = createSetlistSchema(Object.keys(songsConfig))
const setlistIsValid = tv4.validate(setlistConfig, setlistSchema)
if (!setlistIsValid) {
  console.error('Setlist config is invalid')
  process.exit(1)
}

const Scene = require('./app/scene')
const Song = require('./app/song')
const Setlist = require('./app/setlist')
const Performance = require('./app/performance')
const Output = require('./app/output')
const Input = require('./app/input')

const inputs = mapValues(inputDevicesConfig, config => {
  const input = midiManager.getInputByName(config.port)
  return new Input(input)
})

const outputs = mapValues(outputDevicesConfig, config => {
  const output = midiManager.getOutputByName(config.port)
  return new Output(output, config.channel, config.port)
})

/**
 * Load performance into memory from configuration
 */

const songsByKey = mapValues(songsConfig, (config, key) => {
  const sceneConfigs = config.scenes || [{ name: 'Default' }]
  const scenes = sceneConfigs.map(config => {
    const programs = mapValues(config.programs || {}, (serialized, output) => {
      const deserializeFn = outputDevicesConfig[output].deserializeProgram
      if (deserializeFn) {
        return deserializeFn(serialized)
      } else {
        return { program: serialized } // by default: no bank change
      }
    })

    console.log('programs', programs)

    return new Scene(config.name, programs)
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

/**
 * Set midi thru matrix at the performance level for now.
 * In future, this could be configured on a per song or scene basis.
 */
const matrix = {
  nord: ['prophet', 'juno']
}

const performance = new Performance(setlist, outputs, inputs, matrix)

logger.system('Booted up successfully')
logger.info('')

performance.start()

/**
 * Set up key bindings
 */

keypress(process.stdin)

const keyHandlers = {
  'right': performance.incrementScene.bind(performance),
  'left': performance.decrementScene.bind(performance),
  'down': performance.incrementSong.bind(performance),
  'up': performance.decrementSong.bind(performance),
  'q': () => process.exit(0)
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
