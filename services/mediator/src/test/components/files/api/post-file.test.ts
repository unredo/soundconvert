import { deepEqual } from 'node:assert'
import type { IncomingHttpHeaders } from 'node:http'
import test, { describe, it } from 'node:test'

import { mockFs, mockJobFolder, mockMakeTempDir } from '../../fs-mocks.js'
import { mockAllQueues } from '../../queue-mocks.js'
import { createHeaders } from './http-helpers.js'

describe('POST /file/:id', async () => {
  const fileNameOne = 'test.wav'
  const fileContentOne = 'some file content\r\n'

  const url = '/file/22'

  const headers: IncomingHttpHeaders = createHeaders(fileContentOne.length.toString())

  test('Parse & store', async (t) => {
    let collectedPaths: string[] = []
    let app

    t.afterEach(() => {
      collectedPaths = []
    })

    t.before(async () => {
      collectedPaths = await mockFs()
      mockMakeTempDir()
      mockAllQueues(t)

      ;({ app } = await import('../../../../app.js'))
    })

    it('one file', async () => {
      const form = new FormData()
      form.append('file', new Blob(fileContentOne.split('')), fileNameOne)

      const result = await app!.inject({
        url,
        headers,
        payload: form,
        method: 'POST',
      })

      deepEqual(collectedPaths, [`${mockJobFolder}/${fileNameOne}`])
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
  })
})
