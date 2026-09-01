import { createWriteStream } from 'fs'
import { rm } from 'fs/promises'
import Stream from 'node:stream'
import { join, normalize } from 'path'

import type { ConnectionOptions, Job } from 'bullmq'
import { Worker } from 'bullmq'

import { convert } from '../domain/convert.js'
import { getMediatorUrl } from '../domain/env.js'
import { upload } from '../domain/upload.js'
import { createUploadUrl } from '../domain/url.js'

interface JobData {
  folder: string
  file: string
}

function createWorker(connection: ConnectionOptions, queueName: string, tmpDirPath: string) {
  return new Worker(
    queueName,
    async (job: Job<JobData>) => {
      const { data, id } = job
      const file = normalize(data.file)

      if (file.length < 4 || file.length > 100 || !file.includes('.')) {
        throw Error(`Job ${id}: Illegal file name`)
      }

      console.log(`Job running [${id}, ${data.file}]`)

      const url = createUploadUrl(getMediatorUrl(), id!, data.file)
      const res = await fetch(url)
      const ws = createWriteStream(join(tmpDirPath, data.file))
      await res.body?.pipeTo(Stream.Writable.toWeb(ws))

      const resultFileName = await convert(tmpDirPath, data.file)
      await rm(join(tmpDirPath, data.file), { force: true })

      if (!resultFileName) {
        console.log(`Job [${id}] no output file`)
        throw Error('No output file')
      }

      await upload(url.href, tmpDirPath, resultFileName)
      await rm(join(tmpDirPath, resultFileName), { force: true })

      return resultFileName
    },
    { connection },
  )
}

export { createWorker }
