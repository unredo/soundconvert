import { deepEqual, equal, rejects } from 'node:assert'
import { createReadStream } from 'node:fs'
import test, { before, describe, mock, type Mock } from 'node:test'

import { vol, fs } from 'memfs'
import { MockAgent, setGlobalDispatcher } from 'undici'

const uploadModulePath = '../components/jobs/domain/upload.js'

const url = 'http://localhost:3000'
const urlPath = `${url}/file`
const tmpPath = '/tmp/some/path'
const file = 'file.ogg'

let createReadStreamMock: Mock<typeof createReadStream>
let upload: (url: string, path: string, file: string) => Promise<void>

describe('Upload', () => {
  let agent: MockAgent

  before(async () => {
    vol.fromJSON({ [`${tmpPath}/${file}`]: 'some data' })

    agent = new MockAgent()
    setGlobalDispatcher(agent)

    const noop = () => {}
    createReadStreamMock = mock.fn(
      createReadStream,
      () => ({ closed: false, close: noop, on: noop, pipe: noop }) as any,
    )
    mock.module('node:fs', { exports: { ...fs, createReadStream: createReadStreamMock } })
    mock.module('node:fs/promises', { exports: fs.promises })

    ;({ upload } = await import(uploadModulePath))
  })

  test('success', async () => {
    agent
      .get(url)
      .intercept({ path: 'file', method: 'POST' })
      .reply(() => ({
        statusCode: 200,
      }))

    await upload(urlPath, tmpPath, file)
    equal(1, createReadStreamMock!.mock.calls.length)
    deepEqual([`${tmpPath}/${file}`], createReadStreamMock.mock.calls[0].arguments)
  })

  test('request fail', async () => {
    agent
      .get(url)
      .intercept({ path: 'file', method: 'POST' })
      .replyWithError(new Error('oh no, this failed'))

    await rejects(() => upload(urlPath, tmpPath, file), new Error('Upload failed: fetch failed'))
  })

  test('response fail', async () => {
    agent
      .get(url)
      .intercept({ path: 'file', method: 'POST' })
      .reply(() => ({
        statusCode: 400,
      }))

    await rejects(() => upload(urlPath, tmpPath, file), new Error('400, Bad Request'))
  })
})
