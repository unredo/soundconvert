import { getAllByText, render } from '@testing-library/react'
import { BrowserRouter } from 'react-router'
import { describe, expect, test } from 'vitest'

import Nav from '../../../app/components/nav/nav'

describe('Nav', () => {
  test('success', async () => {
    const { container } = render(
      <BrowserRouter>
        <Nav />
      </BrowserRouter>,
    )

    for (const x of ['Home', 'Jobs']) {
      const lnk = await getAllByText(container, x)
      expect(lnk.length).toBe(1)
      expect(lnk[0].nodeName).toBe('A')
    }
  })
})
