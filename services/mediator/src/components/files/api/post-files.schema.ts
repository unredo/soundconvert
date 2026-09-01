import type { FastifySchema } from 'fastify'

const minStringLength = 5
const maxStringLength = 75
const maxNumFiles = 10

const fileNamePattern = '^[A-Za-z0-9-_]{3,50}(\\.?[A-Za-z0-9]{1,50}){0,5}$'

const headerSchema = {
  type: 'object',
  properties: {
    'content-type': { type: 'string' },
    'content-length': { type: 'string' },
  },
  required: ['content-type', 'content-length'],
} as const

const bodySchema = {
  type: 'object',
  required: ['file'],
  additionalProperties: false,
  properties: {
    file: {
      anyOf: [
        {
          $ref: '#/$defs/file',
        },
        {
          type: 'array',
          items: { $ref: '#/$defs/file' },
        },
      ],
    },
  },
  $defs: {
    file: {
      $id: 'file',
      type: 'object',
      required: [
        'filename',
        'file',
        //'mimetype',
        'type',
      ],
      properties: {
        file: {
          type: 'object',
        },
        filename: {
          pattern: fileNamePattern,
          type: 'string',
          minLength: minStringLength,
          maxLength: maxStringLength,
        },
        // mimetype: {
        //   type: 'string',
        //   pattern: '^audio/wav$',
        // },
        type: {
          type: 'string',
          pattern: '^file$',
        },
      },
    },
  },
} as const

const responseSchema = {
  '2xx': {
    type: 'object',
    required: ['id', 'info'],
    additionalProperties: false,
    properties: {
      id: { type: 'string', maxLength: maxStringLength },
      info: {
        type: 'object',
        required: ['count', 'files'],
        properties: {
          count: {
            type: 'number',
            minimum: 0,
            maximum: maxNumFiles,
          },
          files: {
            type: 'array',
            items: {
              type: 'object',
              required: ['name', 'encoding', 'type'],
              properties: {
                name: {
                  type: 'string',
                  maxLength: maxStringLength,
                },
                encoding: {
                  type: 'string',
                  maxLength: maxStringLength,
                },
                type: {
                  type: 'string',
                  maxLength: maxStringLength,
                },
              },
            },
          },
        },
      },
    },
  },
} as const

const multiFileSchema: FastifySchema = {
  body: bodySchema,
  headers: headerSchema,
  response: responseSchema,
}

export { multiFileSchema }
