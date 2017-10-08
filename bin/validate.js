const yaml = require('js-yaml')
const fs = require('fs')
const { resolve } = require('path')
const { pick } = require('lodash')
const tv4 = require('tv4')
const { createSongsSchema, createSetlistSchema } = require('../lib/config-schemas')

const formatError = error => pick(error, ['message', 'params', 'dataPath'])

const loadYmlFromRelativePath = relativePath => {
  return yaml.safeLoad(fs.readFileSync(resolve(__dirname, relativePath), 'utf8'))
}

const setlistConfig = loadYmlFromRelativePath('../config/setlist.yml')
const songsConfig = loadYmlFromRelativePath('../config/songs.yml')
const outputDevices = require('../lib/devices/output-devices')

const songsSchema = createSongsSchema(Object.keys(outputDevices))
const songsAreValid = tv4.validate(songsConfig, songsSchema)
if (songsAreValid) {
  console.log('Songs are valid')
} else {
  console.error('Songs are invalid')
  console.error(formatError(tv4.error))
  process.exit(0)
}

const setlistSchema = createSetlistSchema(Object.keys(songsConfig))
const setlistIsValid = tv4.validate(setlistConfig, setlistSchema)
if (setlistIsValid) {
  console.log('Setlist is valid')
} else {
  console.error('Setlist is invalid')
  console.error(formatError(tv4.error))
  process.exit(0)
}
