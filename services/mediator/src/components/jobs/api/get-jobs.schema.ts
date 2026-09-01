import type { FastifySchema } from 'fastify'

const getJobsSchema: FastifySchema = {
  querystring: {
    type: 'object',
    required: ['page'],
    additionalProperties: false,
    properties: {
      page: {
        type: 'integer',
        minimum: 0,
      },
    },
  },
  response: {
    '2xx': {
      type: 'object',
      required: ['count', 'jobs', 'pagination'],
      properties: {
        count: {
          type: 'integer',
          minimum: 0,
        },
        pagination: {
          type: 'object',
          required: ['pages', 'current'],
          properties: {
            pages: {
              type: 'number',
              minimum: 0,
            },
            current: {
              type: 'number',
              minimum: 0,
            },
          },
        },
        jobs: {
          type: 'array',
          items: {
            type: 'object',
            required: ['id', 'state', 'timestamp', 'actions', 'files', 'children'],
            properties: {
              id: {
                type: 'string',
                maxLength: 32,
              },
              state: {
                type: 'string',
                maxLength: 50,
              },
              timestamp: {
                type: 'number',
                minimum: 0,
              },
              progress: {
                type: 'string',
                maxLength: 3,
              },
              actions: {
                type: 'object',
                required: ['cleanup'],
                properties: {
                  cleanup: {
                    type: 'boolean',
                  },
                },
              },
              files: {
                type: 'array',
                items: {
                  type: 'object',
                  required: ['name', 'done'],
                  properties: {
                    name: { type: 'string', maxLength: 100 },
                    done: { type: 'boolean' },
                  },
                },
              },
              children: {
                type: 'object',
                required: ['todo', 'failed', 'done'],
                properties: {
                  todo: {
                    type: 'integer',
                    minimum: 0,
                  },
                  failed: {
                    type: 'integer',
                    minimum: 0,
                  },
                  done: {
                    type: 'integer',
                    minimum: 0,
                  },
                },
              },
            },
          },
        },
      },
    },
  },
}

export { getJobsSchema }
