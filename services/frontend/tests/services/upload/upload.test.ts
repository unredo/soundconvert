import { http, HttpResponse } from 'msw'
import { setupServer, type SetupServer } from 'msw/node'
import { describe, expect, test, vi } from 'vitest'

import { upload } from '../../../app/services/upload/upload'

const append = vi.fn()
const formDataMock = vi.fn(function (_: HTMLFormElement) {
  return {
    get: vi.fn(),
    append,
  }
})

vi.stubGlobal('FormData', formDataMock)

const host = 'http://localhost:3000'
const serverOpts: any = { onUnhandledRequest: 'error' }
const createServer = (status: number) => {
  const restHandlers = [
    http.post(`${host}/files`, () => {
      return HttpResponse.text('ok', { status })
    }),
  ]
  return setupServer(...restHandlers)
}

const files: File[] = [
  { name: 'one.wav' } as unknown as File,
  { name: 'two.wav' } as unknown as File,
]

describe('Upload', () => {
  let srv: SetupServer

  const cleanup = () => {
    srv.close()
    append.mockClear()
  }

  test('success', async () => {
    srv = createServer(200)
    srv.listen(serverOpts)

    const result = await upload(files, new FormData())
    expect(result).toBe(undefined)
    expect(append).toHaveBeenCalledWith('file', files[0], files[0].name)
    expect(append).toHaveBeenCalledWith('file', files[1], files[1].name)
    expect(append).toHaveBeenCalledTimes(files.length)

    cleanup()
  })

  test('HTTP errors', async () => {
    const defaultText = 'Something went wrong...'
    const errors = [
      { status: 500, text: defaultText },
      { status: 400, text: defaultText },
      { status: 404, text: 'Could not connect to the service' },
    ]

    for (const e of errors) {
      srv = createServer(e.status)
      srv.listen(serverOpts)

      const result = await upload(files, new FormData())
      expect(result).toBe(e.text)
      expect(append).toHaveBeenCalledWith('file', files[0], files[0].name)
      expect(append).toHaveBeenCalledWith('file', files[1], files[1].name)
      expect(append).toHaveBeenCalledTimes(files.length)

      cleanup()
    }
  })
})
