import { findAllByRole, findAllByText, render } from '@testing-library/react'
import { describe, test } from 'vitest'

import FileInput from '../../../app/components/home/file-input'

describe('FileInput', () => {
  test('initial state', async () => {
    const onChange = () => {}
    const { container } = render(<FileInput onFileChange={onChange} />)
    await findAllByRole(container, 'button')
    await findAllByText(container, 'Click Or Drop Files')
  })
})
