import { describe, test, expect } from 'vitest'

import { getErrorMsg } from '../../app/utils/error'

describe('getErrorMsg', () => {
  test('with Error', () => {
    const msg = 'oh no'
    const res = getErrorMsg(new Error(msg))
    expect(res).toBe(msg)
  })

  test('without Error', () => {
    const msg = 'oh no'
    const res = getErrorMsg({ msg })
    expect(res).toBe('')
  })
})
