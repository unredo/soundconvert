import { deepEqual } from 'node:assert'
import test, { describe } from 'node:test'

import { createFileInfo } from '../../../../components/files/domain/file-info.js'

describe('FileInfo tests', () => {
  test('create FileInfo', () => {
    const f = createFileInfo()
    deepEqual(f, { count: 0, files: [] })
  })
})
