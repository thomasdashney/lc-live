const yaml = require('js-yaml')
const fs = require('fs')
const { resolve } = require('path')
const { pick } = require('lodash')
const tv4 = require('tv4')
const { devicesSchema, createSongsSchema, createSetlistSchema } = require('../lib/app/config-schemas')

const formatError = error => pick(error, ['message', 'params', 'dataPath'])

const loadYmlFromRelativePath = relativePath => {
  return yaml.safeLoad(fs.readFileSync(resolve(__dirname, relativePath), 'utf8'))
}

const setlistConfig = loadYmlFromRelativePath('../config/setlist.yml')
const songsConfig = loadYmlFromRelativePath('../config/songs.yml')
const devicesConfig = loadYmlFromRelativePath('../config/devices.yml')

function validateConfig (name, config, schema) {
  const valid = tv4.validate(config, schema)
  if (valid) {
    console.log(`${name}: valid`)
  } else {
    console.error(`${name}: invalid`)
    console.error(formatError(tv4.error))
    process.exit(0)
  }
}

validateConfig('Devices', devicesConfig, devicesSchema)
validateConfig('Songs', songsConfig, createSongsSchema(Object.keys(devicesConfig.outputs)))
validateConfig('Setlist', setlistConfig, createSetlistSchema(Object.keys(songsConfig)))
