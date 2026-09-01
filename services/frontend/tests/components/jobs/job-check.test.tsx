import { getByText, render } from '@testing-library/react'
import { describe, test, vi } from 'vitest'

import JobCheck from '../../../app/components/jobs/job-check'

vi.mock(import('../../../app/components/jobs/job-list'), () => ({
  default: vi.fn(() => <p>MOCKED</p>),
}))

describe('JobCheck', () => {
  test('no jobs', async () => {
    const { container } = render(<JobCheck count={0} pagination={{ current: 0, pages: 0 }} />)
    await getByText(container, 'No jobs available')
  })

  test('jobs available', async () => {
    const { container } = render(<JobCheck count={10} pagination={{ current: 0, pages: 2 }} />)
    await getByText(container, 'MOCKED')
  })
})
