import type { FastifyReply, FastifyRequest } from 'fastify'

import { getUpdateEvents } from '../domain/updates.js'
import { getJobUpdatesSchema } from './get-job-updates.schema.js'

type GetJobUpdatesRequest = FastifyRequest<{
  Querystring: { ts: number }
}>

const getJobUpdatesRouteConfig = {
  schema: getJobUpdatesSchema,
  url: '/jobs/updates',
  method: 'GET',
  handler: getHandler,
}

async function getHandler(req: GetJobUpdatesRequest, rep: FastifyReply) {
  const { ts } = req.query
  const evs = getUpdateEvents(ts)
  return rep.send(evs)
}

export { getJobUpdatesRouteConfig, getHandler }
