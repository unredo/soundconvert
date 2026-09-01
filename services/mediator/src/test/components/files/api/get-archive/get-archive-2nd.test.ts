import { equal } from 'node:assert'
import test, { describe, mock } from 'node:test'

import { vol, fs } from 'memfs'

import { mockAllQueues } from '../../../queue-mocks.js'
import { appModulePath, fileData, filePath, folder, id, inject } from './config.js'

describe('GET /archive', () => {
  test('wrong state', async (t) => {
    vol.fromJSON({ [filePath]: fileData })
    mock.module('node:fs', { exports: fs })
    mock.module('node:fs/promises', { exports: fs.promises })
    mockAllQueues(t, { folder, id, state: 'waiting' })

    const { app } = await import(appModulePath)
    const res = await inject(app)

    equal(res.statusCode, 404)
  })
})
