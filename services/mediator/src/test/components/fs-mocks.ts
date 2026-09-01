import { mock } from 'node:test'

const directoryModulePath = '../../components/files/domain/directory.js'

const mockReadableMessage = 'some message'
const mockTempDirPath = '/tmp/sndcnvrt-123'
const mockJobFolder = '/tmp/test'

function mockMakeTempDir() {
  const makeTempDirMock = mock.fn(async () => mockTempDirPath)
  mock.module(directoryModulePath, {
    exports: {
      makeTempDir: makeTempDirMock,
    },
  })
}

async function mockFs() {
  const collectedPaths: string[] = []
  const rest = await import('node:fs').then(({ default: _, ...rest }) => rest)

  const createWriteStreamMock = mock.fn((givenPath) => {
    collectedPaths.push(givenPath)
    return new WritableStream({ write: () => {} })
  })

  const createReadStreamMock = mock.fn((givenPath) => {
    collectedPaths.push(givenPath)
    return new ReadableStream({
      pull: (x) => {
        x.enqueue(mockReadableMessage)
        x.close()
      },
    })
  })

  mock.module('node:fs', {
    exports: {
      ...rest,
      createReadStream: createReadStreamMock,
      createWriteStream: createWriteStreamMock,
    },
  })

  return collectedPaths
}

export { mockFs, mockMakeTempDir, mockTempDirPath, mockJobFolder, mockReadableMessage }
