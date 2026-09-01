import type { FastifySchema } from 'fastify'

const deleteJobSchema: FastifySchema = {
  params: {
    type: 'object',
    required: ['id'],
    properties: {
      id: {
        type: 'string',
        maxLength: 32,
        minLength: 4,
      },
    },
  },
  response: {
    '2xx': {
      type: 'object',
      required: ['id'],
      properties: {
        id: {
          type: 'string',
          maxLenght: 32,
          minLength: 4,
        },
      },
    },
  },
}

export { deleteJobSchema }
