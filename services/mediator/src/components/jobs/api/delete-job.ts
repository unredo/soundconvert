import type { FastifyReply, FastifyRequest } from 'fastify'

import { removeFlowJob } from '../data/queueFlow.js'
import { deleteJobSchema } from './delete-job.schema.js'

type JobGetRequest = FastifyRequest<{
  Params: { id: string }
}>

const deleteJobsRouteConfig = {
  schema: deleteJobSchema,
  url: '/job/:id',
  method: 'DELETE',
  handler: deleteHandler,
}

async function deleteHandler(req: JobGetRequest, rep: FastifyReply) {
  const { id } = req.params
  await removeFlowJob(id)
  return rep.send({ id })
}

export { deleteJobsRouteConfig, deleteHandler }
