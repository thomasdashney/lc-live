/**
 * This module should be loaded as a forked node process.
 *
 * It loads configuration from files.
 *
 * It emits a "loaded" message when the app has loaded all configuration into memory.
 * At this point, you can send "start" to start the performance.
 *
 * Once the performance has started, you can increment/decrement songs & scenes.
 *
 * It will emit messages when the app has changed.
 */

const { mapValues } = require('lodash')
const midiManager = require('./midi-manager')
const yaml = require('js-yaml')
const fs = require('fs')
const { resolve } = require('path')
const tv4 = require('tv4')
const { devicesSchema, createSongsSchema, createSetlistSchema } = require('./config-schemas')
const programDeserializers = require('./program-deserializers')

const loadYmlFromRelativePath = relativePath => {
  return yaml.safeLoad(fs.readFileSync(resolve(__dirname, relativePath), 'utf8'))
}

const setlistConfig = loadYmlFromRelativePath('../../config/setlist.yml')
const songsConfig = loadYmlFromRelativePath('../../config/songs.yml')
const devicesConfig = loadYmlFromRelativePath('../../config/devices.yml')

function loadPerformanceFromConfiguration () {
  const devicesAreValid = tv4.validate(devicesConfig, devicesSchema)
  if (!devicesAreValid) {
    console.error('Devices config is invalid')
    process.exit(1)
  }

  const songsSchema = createSongsSchema(Object.keys(devicesConfig.outputs))
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

  const Scene = require('./scene')
  const Song = require('./song')
  const Setlist = require('./setlist')
  const Performance = require('./performance')
  const Output = require('./output')
  const Input = require('./input')

  const inputs = mapValues(devicesConfig.inputs, config => {
    const input = midiManager.getInputByName(config.port)
    return new Input(input)
  })

  const outputs = mapValues(devicesConfig.outputs, config => {
    const output = midiManager.getOutputByName(config.port)
    return new Output(output, config.channel, config.port)
  })

  /**
   * Load performance into memory from configuration
   */

  function deserializePrograms (programs) {
    return mapValues(programs, (serialized, output) => {
      const { programDeserializer } = devicesConfig.outputs[output]

      if (programDeserializer) {
        return programDeserializers[programDeserializer](serialized)
      } else {
        return { program: serialized } // by default: no bank change
      }
    })
  }

  const songsByKey = mapValues(songsConfig, (config, key) => {
    const sceneConfigs = config.scenes || [{ name: 'Default' }]
    const scenes = sceneConfigs.map(config => {
      return new Scene(config.name, deserializePrograms(config.programs || {}))
    })

    return new Song(config.name || key, deserializePrograms(config.programs || {}), scenes)
  })

  const setlist = new Setlist(setlistConfig.map(key => songsByKey[key]))

  /**
   * Set midi thru matrix at the performance level for now.
   * In future, this could be configured on a per song or scene basis.
   */
  const matrix = {
    nord: ['prophet', 'juno']
  }

  return new Performance(setlist, outputs, inputs, matrix)
}

const performance = loadPerformanceFromConfiguration()

/**
 * Configure process handlers
 */

const emit = (type, payload = null) => {
  process.send({ type, payload })
}

performance.on('loadedScene', (songIndex, sceneIndex) => {
  emit('loadedScene', {
    songIndex,
    sceneIndex
  })
})

const messageHandlers = {
  start: () => {
    performance.start()
    emit('started')
  },
  incrementScene: () => {
    performance.incrementScene()
  },
  decrementScene: () => {
    performance.decrementScene()
  },
  incrementSong: () => {
    performance.incrementSong()
  },
  decrementSong: () => {
    performance.decrementSong()
  }
}

process.on('message', message => {
  if (messageHandlers[message]) {
    messageHandlers[message]()
  }
})

emit('loaded', performance)
