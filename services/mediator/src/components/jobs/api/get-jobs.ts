import type { FastifyReply, FastifyRequest } from 'fastify'

import { jobConfig } from '../data/config.js'
import { getJobInfo } from '../data/queueFlow.js'
import { getJobsSchema } from './get-jobs.schema.js'

type JobGetRequest = FastifyRequest<{
  Querystring: { page: number }
}>

const getJobsRouteConfig = {
  schema: getJobsSchema,
  url: '/jobs',
  method: 'GET',
  handler: getHandler,
}

function calcPagination(count: number, page: number) {
  const pages = Math.ceil(count / jobConfig.jobsPerPage)
  return {
    pages,
    current: page,
  }
}

async function getHandler(req: JobGetRequest, rep: FastifyReply) {
  const { page } = req.query
  const info = await getJobInfo(page)
  return rep.send({ ...info, pagination: calcPagination(info?.count || 0, page) })
}

export { getJobsRouteConfig, getHandler }
