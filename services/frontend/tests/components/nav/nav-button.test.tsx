import { getAllByText, render } from '@testing-library/react'
import { BrowserRouter } from 'react-router'
import { describe, expect, test } from 'vitest'

import NavButton from '../../../app/components/nav/nav-button'

describe('NavButton', () => {
  test('success', async () => {
    const name = 'Some Name'
    const url = '/some/url'

    const { container } = render(
      <BrowserRouter>
        <NavButton name={name} url={url} />
      </BrowserRouter>,
    )

    const lnk = await getAllByText(container, name)
    expect(lnk.length).toBe(1)
    expect(lnk[0].nodeName).toBe('A')
    expect(lnk[0].getAttribute('href')).toBe(url)
  })
})
