import type { FastifyInstance } from 'fastify'

import { deleteJobsRouteConfig } from './delete-job.js'
import { getJobUpdatesRouteConfig } from './get-job-updates.js'
import { getJobsRouteConfig } from './get-jobs.js'

async function jobContext(childServer: FastifyInstance) {
  childServer.route(getJobsRouteConfig)
  childServer.route(deleteJobsRouteConfig)
  childServer.route(getJobUpdatesRouteConfig)
}

export { jobContext }
