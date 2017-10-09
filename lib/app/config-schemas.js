const { zipObject } = require('lodash')
const programDeserializers = require('./program-deserializers')
const enumerateProperties = (keys, object) => zipObject(keys, keys.map(() => object))

const anyKey = '^.*$'

const inputDeviceSchema = {
  type: 'object',
  required: ['port'],
  properties: {
    port: { type: 'string' }
  }
}

const outputDeviceSchema = {
  type: 'object',
  required: ['port', 'channel'],
  properties: {
    port: { type: 'string' },
    channel: { type: 'integer' },
    programFormat: {
      type: 'string',
      enum: Object.keys(programDeserializers)
    }
  }
}

const devicesSchema = {
  type: 'object',
  required: ['inputs', 'outputs'],
  properties: {
    inputs: {
      type: 'object',
      patternProperties: {
        [anyKey]: inputDeviceSchema
      },
      additionalProperties: false
    },
    outputs: {
      type: 'object',
      patternProperties: {
        [anyKey]: outputDeviceSchema
      },
      additionalProperties: false
    }
  }
}

const createSongsSchema = outputs => {
  const sceneSchema = {
    type: 'object',
    required: ['name'],
    properties: {
      name: { type: 'string' },
      programs: {
        type: 'object',
        additionalProperties: false,
        properties: enumerateProperties(outputs, {
          type: ['string', 'integer']
        })
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
      [anyKey]: songSchema
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
  devicesSchema,
  createSongsSchema,
  createSetlistSchema
}
