import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { afterAll, describe, expect, test, vi } from 'vitest'

import { action } from '../../app/routes/sse'

const host = 'http://localhost:3000'
const serverOpts: any = { onUnhandledRequest: 'error' }
const createServer = (json: any) => {
  const restHandlers = [
    http.get(`${host}/jobs/updates`, () => {
      return HttpResponse.json(json)
    }),
  ]
  return setupServer(...restHandlers)
}

describe('SSE', () => {
  const updateList = [{ id: 'some-id', timestamp: 123, type: 'change' }]
  let server: ReturnType<typeof setupServer>

  afterAll(() => server!.close())

  test('receive update list', async () => {
    vi.useFakeTimers()
    server = createServer(updateList)
    server.listen(serverOpts)

    const mock = vi.fn()
    const response = await action({ request: { signal: { addEventListener: mock } } } as any)
    const reader = response.body?.getReader()
    const readPromise = reader!.read()

    vi.advanceTimersByTimeAsync(10000)

    const td = new TextDecoder()
    const result = await readPromise
    const decoded = td.decode(result!.value)
    expect(decoded).toStrictEqual(`data: ${JSON.stringify(updateList)}\n\n`)

    mock.mock.calls[0][1]()
    vi.runAllTimers()
  })
})
