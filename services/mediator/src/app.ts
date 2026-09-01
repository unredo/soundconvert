import Fastify from 'fastify'

import { fileContext } from './components/files/api/context.js'
import { jobContext } from './components/jobs/api/context.js'
import { getLoggerConfig } from './components/logger/logger.js'

const nodeEnv = process.env['NODE_ENV'] || ''

const app = Fastify({
  logger: getLoggerConfig(nodeEnv.toLowerCase()),
})

app.register(fileContext)
app.register(jobContext)

export { app }
