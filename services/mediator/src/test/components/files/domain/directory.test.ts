import { ok } from 'node:assert'
import { rmdir, stat } from 'node:fs/promises'
import test, { describe } from 'node:test'

import { makeTempDir } from '../../../../components/files/domain/directory.js'

describe('Temporary directory tests', async () => {
  let tmp: string | undefined

  test('make directory', async (t) => {
    tmp = await makeTempDir()
    const s = await stat(tmp!)

    ok(s.isDirectory())

    t.after(() => {
      if (tmp) rmdir(tmp)
    })
  })
})
