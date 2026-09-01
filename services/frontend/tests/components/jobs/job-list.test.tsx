import { findAllByText, findByText, render } from '@testing-library/react'
import { BrowserRouter } from 'react-router'
import { describe, expect, test, vi } from 'vitest'

import JobList from '../../../app/components/jobs/job-list'
import { createJobs } from '../job-factory'

vi.mock(import('../../../app/components/jobs/job'), () => ({
  default: vi.fn(() => <p>MOCKED</p>),
}))

describe('JobList', () => {
  test('empty list', () => {
    const { container } = render(<JobList jobs={[]} hasNext={false} hasPrevious={false} page={0} />)
    const lis = container.querySelectorAll('li')
    expect(lis.length).toBe(0)
  })

  test('single page', async () => {
    const jobs = createJobs(6)

    const { container } = render(
      <JobList jobs={jobs} hasNext={false} hasPrevious={false} page={0} />,
    )

    const jobsMocks = await findAllByText(container, 'MOCKED')
    expect(jobsMocks.length).toBe(jobs.length)

    const prev = await findByText(container, 'Prev')
    const next = await findByText(container, 'Next')
    expect(prev.nodeName).toBe('SPAN')
    expect(next.nodeName).toBe('SPAN')
  })

  test('several pages', async () => {
    const page = 2
    const jobs = createJobs(6)

    const { container } = render(
      <BrowserRouter>
        <JobList jobs={jobs} hasNext={true} hasPrevious={true} page={page} />
      </BrowserRouter>,
    )

    const prev = await findByText(container, 'Prev')
    expect(prev.nodeName).toBe('A')
    expect(prev.getAttribute('href')).toBe(`/jobs?page=${page - 1}`)

    const next = await findByText(container, 'Next')
    expect(next.nodeName).toBe('A')
    expect(next.getAttribute('href')).toBe(`/jobs?page=${page + 1}`)
  })
})
