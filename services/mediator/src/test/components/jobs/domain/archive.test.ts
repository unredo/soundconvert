import { deepEqual, rejects } from 'node:assert'
import test, { describe } from 'node:test'

import type { FastifyBaseLogger } from 'fastify'
import { vol, fs } from 'memfs'

describe('createArchive', () => {
  const archiveModulePath = '../../../../components/jobs/domain/archive.js'
  const path = '/tmp/some/path'

  test('success', async (t) => {
    t.before(() => {
      vol.fromJSON({
        [`${path}/one.ogg`]: 'fileOneContent',
        [`${path}/two.ogg`]: 'fileTwoContent',
        [`${path}/three.ogg`]: 'fileThreeContent',
      })
      t.mock.module('node:fs', { exports: fs })
      t.mock.module('node:fs/promises', { exports: fs.promises })
    })

    const { createArchive } = await import(archiveModulePath)
    await createArchive({} as FastifyBaseLogger, 'id', path)

    const { readdir } = await import('fs/promises')
    const dir = await readdir(path)

    deepEqual(['archive.zip'], dir)

    t.mock.reset()
  })

  test('failure', async (t) => {
    t.before(() => {
      vol.fromJSON({
        [`${path}/one.ogg`]: 'fileOneContent',
      })

      t.mock.module('node:fs', {
        exports: {
          ...fs,
          createReadStream: () => {
            return {
              writable: true,
              closed: false,
              close: () => {},
              pipe: () => {
                return new ReadableStream({
                  pull: () => {
                    throw Error('pull')
                  },
                })
              },
            }
          },
        },
      })
      t.mock.module('node:fs/promises', { exports: fs.promises })
    })

    const { createArchive } = await import(archiveModulePath + '?no=1')
    rejects(() => createArchive({} as FastifyBaseLogger, 'id', path))
  })
})
