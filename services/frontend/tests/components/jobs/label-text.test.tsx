import { findByText, render } from '@testing-library/react'
import { describe, expect, test } from 'vitest'

import LabelText from '../../../app/components/jobs/label-text'

describe('LabelText', () => {
  const label = 'some label'
  const text = 'some text'

  test('layout', async () => {
    const { container } = render(<LabelText label={label} text={text} />)

    const lbl = await findByText(container, `${label}:`)
    const txt = await findByText(container, text)

    expect(lbl.nextSibling).toBe(txt)
    expect(txt.getAttribute('aria-labelledby')).toBe(lbl.id)
  })
})
