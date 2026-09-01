import { equal, throws } from 'node:assert'
import test, { describe } from 'node:test'

import { changeFileEnding } from '../../../../components/files/domain/file-ending.js'

describe('File ending', () => {
  test('change ending', () => {
    const res = changeFileEnding('some.file.wav', 'ogg')
    equal(res, 'some.file.ogg')
  })

  test('no dot', () => {
    throws(() => changeFileEnding('somefile', 'ogg'))
  })
})
