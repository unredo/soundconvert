import { access, mkdir } from 'node:fs/promises'
import { createServer } from 'node:http'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { createWorker } from './components/jobs/data/worker.js'
import { parseAndCheckArgs } from './components/jobs/domain/env.js'

const connection = await parseAndCheckArgs()
const tmpDirPath = join(tmpdir(), 'work')
const queueName = 'sndcnvrt-convert'

try {
  await access(tmpDirPath)
} catch (err: unknown) {
  if (err instanceof Error && 'code' in err && err.code === 'ENOENT') {
    process.stdout.write('Creating working directory...')
    await mkdir(tmpDirPath)
    process.stdout.write(' done!\n')
  } else {
    throw err
  }
}

console.log('Waiting for jobs')

const server = createServer((_, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' })
  res.end(
    JSON.stringify({
      status: 'ready',
    }),
  )
})

const worker = createWorker(connection, queueName, tmpDirPath)

async function shutdown(sig: string) {
  console.log(`Received ${sig}, shutting down`)
  server.close(() => console.log('Closed server'))
  await worker.close()
  process.exit(0)
}

worker.on('error', (e) => {
  console.error(e)
})

worker.on('completed', (j) => {
  console.log(`Job completed [${j.id}]`)
})

worker.on('failed', (j) => {
  console.log(`Job failed [${j?.id}]`)
})

process.on('error', (err) => {
  console.error(`Main error handler: ${err}`)
})
process.addListener('SIGTERM', shutdown)
process.addListener('SIGINT', shutdown)

server.listen(3001)
