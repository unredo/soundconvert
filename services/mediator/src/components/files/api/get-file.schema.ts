import type { FastifySchema } from 'fastify'

const params = {
  type: 'object',
  required: ['id'],
  additionalProperties: false,
  properties: {
    id: {
      type: 'string',
      maxLength: 32,
      minLength: 8,
    },
  },
}

const querystring = {
  type: 'object',
  required: ['file'],
  additionalProperties: false,
  properties: {
    file: {
      type: 'string',
      maxLength: 100,
      minLength: 4,
    },
  },
}

const getFileSchema: FastifySchema = {
  params,
  querystring,
}

export { getFileSchema }
