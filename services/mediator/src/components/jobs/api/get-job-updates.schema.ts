import type { FastifySchema } from 'fastify'

const getJobUpdatesSchema: FastifySchema = {
  querystring: {
    type: 'object',
    required: ['ts'],
    properties: {
      ts: {
        type: 'number',
        minimum: 0,
      },
    },
  },
  response: {
    '2xx': {
      type: 'array',
      items: {
        type: 'object',
        required: ['id', 'timestamp', 'type'],
        properties: {
          id: {
            type: 'string',
            maxLength: 32,
            minLength: 4,
          },
          timestamp: {
            type: 'number',
            min: 0,
          },
          type: {
            type: 'string',
            maxLength: 50,
          },
        },
      },
    },
  },
}

export { getJobUpdatesSchema }
