import { app } from './app.js'
import {
  createListener,
  createQueues,
  closeAllQueues,
  createFlowProducer,
} from './components/jobs/data/queueSetup.js'
import {
  closeAllWorkers,
  createArchiveWorker,
  createCleanupWorker,
  createDeleteUpdateIdsWorker,
} from './components/jobs/domain/worker.js'

async function shutdown(sig: string) {
  console.log(`Got ${sig}, shutting down`)
  await Promise.allSettled([app.close(), closeAllQueues(), closeAllWorkers()])
  console.log('Shutdown done')
  process.exit(0)
}

function logError(err: any) {
  app.log.error(`Main error handler: ${err}`)
}

try {
  createQueues()
  createFlowProducer()
  createListener()
  createCleanupWorker(app.log)
  createArchiveWorker(app.log)
  createDeleteUpdateIdsWorker(app.log)
  await app.listen({ host: '0.0.0.0', port: 3000 })
} catch (err) {
  app.log.error(err)
  process.exit(1)
}

process.on('error', logError)
process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)
