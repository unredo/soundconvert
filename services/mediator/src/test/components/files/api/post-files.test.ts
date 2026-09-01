import { deepEqual, equal } from 'node:assert'
import type { IncomingHttpHeaders } from 'node:http'
import test, { describe, it } from 'node:test'

import { mockFs, mockMakeTempDir, mockTempDirPath } from '../../fs-mocks.js'
import { mockAllQueues } from '../../queue-mocks.js'
import { createForm, createHeaders } from './http-helpers.js'

describe('POST /files', async () => {
  const fileNameOne = 'test.wav'
  const fileContentOne = 'some file content\r\n'
  const fileNameTwo = 'test2.wav'
  const fileContentTwo = 'some other file content\r\n'

  const headers: IncomingHttpHeaders = createHeaders(fileContentOne.length.toString())

  test('Parse & store', async (t) => {
    let collectedPaths: string[] = []
    let app

    t.afterEach(() => {
      while (collectedPaths.pop()) {}
    })

    t.before(async () => {
      collectedPaths = await mockFs()
      mockMakeTempDir()
      mockAllQueues(t)

      ;({ app } = await import('../../../../app.js'))
    })

    it('one file', async () => {
      const form = createForm({ data: fileContentOne, name: fileNameOne })
      const result = await app!.inject({
        headers,
        url: '/files',
        payload: form,
        method: 'POST',
      })

      deepEqual(collectedPaths, [`${mockTempDirPath}/${fileNameOne}`])
      deepEqual(result.json(), {
        id: 22,
        info: {
          count: 1,
          files: [
            {
              name: fileNameOne,
              type: 'application/octet-stream',
              encoding: '7bit',
            },
          ],
        },
      })
    })

    it('two files', async () => {
      const form = createForm(
        { data: fileContentOne, name: fileNameOne },
        { data: fileContentTwo, name: fileNameTwo },
      )

      const result = await app!.inject({
        headers,
        url: '/files',
        payload: form,
        method: 'POST',
      })

      deepEqual(collectedPaths, [
        `${mockTempDirPath}/${fileNameOne}`,
        `${mockTempDirPath}/${fileNameTwo}`,
      ])
      deepEqual(result.json(), {
        id: 22,
        info: {
          count: 2,
          files: [
            {
              name: fileNameOne,
              type: 'application/octet-stream',
              encoding: '7bit',
            },
            {
              name: fileNameTwo,
              type: 'application/octet-stream',
              encoding: '7bit',
            },
          ],
        },
      })
    })

    it('invalid filenames', async () => {
      const invalidFileNames = [
        'something/../../more',
        '/etc/',
        'wrong.txt%00',
        'x'.repeat(80),
        't.x',
        'some&^thing',
      ]

      for (const name of invalidFileNames) {
        const form = new FormData()
        form.append('file', new Blob(fileContentOne.split('')), name)

        const result = await app!.inject({
          url: '/files',
          headers,
          payload: form,
          method: 'POST',
        })

        equal(result.statusCode, 400)
      }
    })
  })
})
