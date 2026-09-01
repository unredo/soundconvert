import { render } from '@testing-library/react'
import { useEffect } from 'react'
import { BrowserRouter } from 'react-router'
import { assert, describe, test } from 'vitest'

import type { JobData } from '../../app/state/job-data.type'
import { getJobs, getJobsDispatch, JobsProvider } from '../../app/state/jobs-context'

const createJob = (id: string, state = 'none'): JobData => ({
  id,
  children: { todo: 2, failed: 0, done: 0 },
  files: [],
  progress: '0',
  state,
  actions: { cleanup: false, download: false },
  timestamp: Date.now(),
})

const TestCmp = () => {
  const jobs = getJobs()
  const dispatch = getJobsDispatch()

  useEffect(() => {
    dispatch!({ job: createJob('2'), type: 'remove' })
    dispatch!({ job: createJob('1', 'done'), type: 'update' })
  }, [])

  return (
    <ul>
      {jobs.map((j) => (
        <li key={j.id} id={j.id}>
          {j.state}
        </li>
      ))}
    </ul>
  )
}

describe('JobsContext', () => {
  test('getJobs', async () => {
    const renderCmp = (jobs: JobData[]) =>
      render(
        <BrowserRouter>
          <JobsProvider initialJobs={jobs}>
            <TestCmp />
          </JobsProvider>
        </BrowserRouter>,
      )

    const screen = renderCmp([createJob('1'), createJob('2', 'some'), createJob('3')])

    const first = await screen.findByText('done')
    assert(first.textContent, 'done')
    assert(first.id, '1')

    const second = screen.queryAllByText('some')
    assert(second, undefined)

    const third = await screen.findByText('none')
    assert(third.id, '3')
  })
})
