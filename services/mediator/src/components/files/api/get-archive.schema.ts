import type { FastifySchema } from 'fastify'

const getArchiveSchema: FastifySchema = {
  params: {
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
  },
}

export { getArchiveSchema }
