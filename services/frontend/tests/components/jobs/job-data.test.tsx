import { render } from '@testing-library/react'
import { http } from 'msw'
import { setupServer } from 'msw/node'
import React, { act } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router'
import { describe, expect, test, vi } from 'vitest'

import JobsData from '../../../app/components/jobs/jobs-data'
import { getJobsDispatch, JobsProvider } from '../../../app/state/jobs-context'
import { createJobs } from '../job-factory'

const host = 'http://localhost:3000'
const serverOpts: any = { onUnhandledRequest: 'error' }
const createHandlers = (data: { type: string; id: string }[]) => [
  http.post(host + '/sse', () => {
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify(data)}\n\n`))
        setTimeout(() => controller.close(), 200)
      },
    })
    return new Response(stream, {
      headers: {
        connection: 'keep-alive',
        'content-type': 'text/event-stream',
        'cache-control': 'no-cache',
      },
    })
  }),
]

const buttonText = '\u27F3'
const jobs = createJobs(4)

let dispatch: React.ActionDispatch<any>
const RenderCmp = () => {
  dispatch = getJobsDispatch()!
  return <JobsData count={4} pagination={{ current: 0, pages: 1 }}></JobsData>
}
const renderCmpWrapper = () => {
  return (
    <JobsProvider initialJobs={jobs}>
      <RenderCmp></RenderCmp>
    </JobsProvider>
  )
}

const router = createBrowserRouter([{ path: '/', Component: renderCmpWrapper }])

describe('JobsData', () => {
  describe('reload button', () => {
    test('hide when job gets deleted by the user', async () => {
      vi.useFakeTimers()
      const server = setupServer(...createHandlers([{ id: jobs[0].id, type: 'delete' }]))
      server.listen(serverOpts)
      const screen = render(<RouterProvider router={router} />)

      await act(() => dispatch({ job: { id: jobs[0].id }, type: 'remove' }))
      await act(() => vi.advanceTimersByTimeAsync(100))

      const btn = screen.queryByText(buttonText)
      expect(btn).toBe(null)
    })

    test('show for new job', async () => {
      vi.useFakeTimers()
      const server = setupServer(
        ...createHandlers([
          {
            id: 'some-id',
            type: 'new',
          },
        ]),
      )
      server.listen(serverOpts)
      const screen = render(<RouterProvider router={router} />)

      let reloadBtn = screen.queryByText(buttonText)
      expect(reloadBtn).toBe(null)

      await act(() => vi.runAllTimersAsync())

      reloadBtn = screen.queryByText(buttonText)
      expect(reloadBtn?.title).toBe('Reload Jobs')

      server.close()
    })

    test('show for known deleted job', async () => {
      vi.useFakeTimers()
      const server = setupServer(
        ...createHandlers([
          {
            id: jobs[0].id,
            type: 'delete',
          },
        ]),
      )
      server.listen(serverOpts)
      const screen = render(<RouterProvider router={router} />)

      let reloadBtn = screen.queryByText(buttonText)
      expect(reloadBtn).toBe(null)

      await act(() => vi.runAllTimersAsync())

      reloadBtn = screen.queryByText(buttonText)
      expect(reloadBtn?.title).toBe('Reload Jobs')

      server.close()
    })

    test('hide for unknown changed job', async () => {
      vi.useFakeTimers()
      const server = setupServer(
        ...createHandlers([
          {
            id: 'unknown',
            type: 'change',
          },
        ]),
      )
      server.listen(serverOpts)
      const screen = render(<RouterProvider router={router} />)

      let reloadBtn = screen.queryByText(buttonText)
      expect(reloadBtn).toBe(null)

      await act(() => vi.runAllTimersAsync())

      reloadBtn = screen.queryByText(buttonText)
      expect(reloadBtn).toBe(null)

      server.close()
    })
  })
})
