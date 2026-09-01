import {
  findAllByRole,
  findAllByText,
  findByRole,
  findByText,
  render,
} from '@testing-library/react'
import { act } from 'react'
import { afterEach, describe, expect, test, vi } from 'vitest'

import Home from '../../../app/components/home/home'

let onFileChangeFn: (f: File[]) => void

vi.mock(import('../../../app/components/home/file-input'), () => ({
  default: vi.fn((props: any) => {
    onFileChangeFn = props.onFileChange
    return <p>MOCKED</p>
  }),
}))

vi.mock(import('../../../app/services/upload/upload'), () => ({
  upload: vi.fn(() => Promise.resolve('TESTED')),
}))

describe('Home', () => {
  const isDisabled = (btn: HTMLElement) => btn.getAttribute('disabled') === ''

  afterEach(() => {
    vi.clearAllMocks()
  })

  test('initial state', async () => {
    const { container } = render(<Home />)

    const btn = await findAllByRole(container, 'button')
    expect(btn.length).toBe(1)
    expect(isDisabled(btn[0])).toBeTruthy()

    await findAllByText(container, 'Create A Processing Job')
    await findAllByText(container, 'Create Job')
    await findAllByText(container, 'MOCKED')
  })

  test('file change', async () => {
    const { container } = render(<Home />)
    const { upload } = await import('../../../app/services/upload/upload')
    act(() => onFileChangeFn([{ name: 'file.wav' } as any]))

    const btn = await findByRole(container, 'button')
    await act(async () => btn.click())

    expect(isDisabled(btn)).toBeTruthy()
    expect(upload).toHaveBeenCalled()
    await findByText(container, 'TESTED')

    expect(container.querySelector('svg')).toBeFalsy()
  })
})
