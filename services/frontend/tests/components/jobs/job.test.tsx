import { render } from '@testing-library/react'
import { BrowserRouter } from 'react-router'
import { describe, expect, test } from 'vitest'

import Job from '../../../app/components/jobs/job'
import { defaultJob } from '../job-factory'

describe('Job', () => {
  const renderCmp = (j: any) =>
    render(
      <BrowserRouter>
        <Job job={j} />
      </BrowserRouter>,
    )

  test('data & files', async () => {
    const screen = renderCmp(defaultJob)

    const fileOne = await screen.getByText(defaultJob.files[0].name)
    expect(fileOne.previousSibling?.textContent).toBe('\u2611')

    const fileTwo = await screen.getByText(defaultJob.files[1].name)
    expect(fileTwo.previousSibling?.textContent).toBe('\u2610')

    await screen.getByText(defaultJob.state)
    await screen.getByText(
      new Date(defaultJob.timestamp).toLocaleDateString('en-US', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }),
    )
    await screen.getByText(`Done: ${defaultJob.children.done}`)
    await screen.getByText(`Todo: ${defaultJob.children.todo}`)
    await screen.getByText(`Failed: ${defaultJob.children.failed}`)
  })

  describe('button/link', () => {
    test('state not completed', async () => {
      const screen = renderCmp(defaultJob)

      const buttons = await screen.getAllByRole('button')
      expect(buttons.length).toBe(1)
    })

    test('state completed', async () => {
      const completed = { ...defaultJob, state: 'completed' }
      const screen = renderCmp(completed)

      const buttons = await screen.getAllByText('\u2715')
      expect(buttons.length).toBe(1)
      expect(buttons[0].nodeName).toBe('BUTTON')

      const links = await screen.getAllByText('\u2913')
      expect(links.length).toBe(1)
      expect(links[0].getAttribute('href')).toBe(`/archive/${defaultJob.id}/archive.zip`)
    })
  })
})
