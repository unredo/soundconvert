import { render } from '@testing-library/react'
import { BrowserRouter } from 'react-router'
import { describe, expect, test } from 'vitest'
import '@testing-library/dom'

import { JobAction } from '../../../app/components/jobs/job-action'

describe('JobAction', () => {
  const text = 'Some text to show'
  const title = 'Some title'
  const url = 'http://localhost:12345/some/path'

  const renderCmp = (text: string, url: string, cb?: () => void) =>
    render(
      <BrowserRouter>
        <JobAction text={text} title={title} url={url} cb={cb} />
      </BrowserRouter>,
    )

  test('no callback, show link', async () => {
    const { container } = renderCmp(text, url)

    const links = container.querySelectorAll('a')
    const buttons = container.querySelectorAll('button')

    expect(links.length).toBe(1)
    expect(links[0].title).toBe(title)
    expect(links[0].textContent).toBe(text)
    expect(links[0].getAttribute('href')).toBe(url)
    expect(buttons.length).toBe(0)
  })

  test('callback, show button', async () => {
    let count = 0
    const { container } = await renderCmp(text, url, () => count++)

    const links = container.querySelectorAll('a')
    const buttons = container.querySelectorAll('button')
    buttons[0].click()

    expect(count).toBe(1)
    expect(links.length).toBe(0)
    expect(buttons.length).toBe(1)
    expect(buttons[0].textContent).toBe(text)
    expect(buttons[0].title).toBe(title)
  })
})
