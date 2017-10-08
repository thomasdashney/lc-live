const { zipObject } = require('lodash')
const enumerateProperties = (keys, object) => zipObject(keys, keys.map(() => object))

const createSongsSchema = outputs => {
  const sceneSchema = {
    type: 'object',
    required: ['name'],
    properties: {
      name: { type: 'string' },
      programs: {
        type: 'object',
        additionalProperties: false,
        properties: enumerateProperties(outputs, { type: 'integer' })
      }
    }
  }

  const songSchema = {
    type: 'object',
    required: ['name'],
    properties: {
      name: { type: 'string' },
      scenes: {
        type: 'array',
        minItems: 1,
        items: sceneSchema
      }
    }
  }

  const songsSchema = {
    type: 'object',
    patternProperties: {
      '^.*$': songSchema
    },
    additionalProperties: false
  }

  return songsSchema
}

const createSetlistSchema = songKeys => ({
  type: 'array',
  items: {
    type: 'string',
    enum: songKeys
  }
})

module.exports = {
  createSongsSchema,
  createSetlistSchema
}
