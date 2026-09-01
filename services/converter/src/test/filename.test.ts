import { equal } from 'node:assert'
import test, { describe } from 'node:test'

import { changeEnding } from '../components/jobs/domain/filename.js'

describe('Filename utilities', () => {
  test('change ending', () => {
    const data = [
      { name: 'some.wav', res: 'some.ogg' },
      { name: 'some.more.wav', res: 'some.more.ogg' },
      { name: 'other', res: 'other.ogg' },
    ]

    for (const d of data) {
      const result = changeEnding(d.name, 'ogg')
      equal(result, d.res)
    }
  })
})
