import { equal } from 'node:assert'
import test, { describe } from 'node:test'

import { type UpdateEvent, type UpdateType } from '../../../../components/jobs/domain/updates.js'

describe('update events', () => {
  const importPath = '../../../../components/jobs/domain/updates.js'
  const ts = Date.now()
  const createEvent = (id: string, type: UpdateType = 'change', timestamp = ts): UpdateEvent => ({
    id,
    timestamp,
    type,
  })

  test('addEvent', async () => {
    const mod = await import(importPath + '?idx=1')

    mod.addEvent(createEvent('1'))
    mod.addEvent(createEvent('2'))
    mod.addEvent(createEvent('3'))

    const result = mod.getUpdateEvents(ts - 1)
    equal(result.length, 3)
  })

  test('getUpdateEvents', async () => {
    const mod = await import(importPath + '?idx=2')

    mod.addEvent(createEvent('1'))
    mod.addEvent(createEvent('2'))

    let result = mod.getUpdateEvents(Date.now())
    equal(result.length, 0)

    result = mod.getUpdateEvents(ts - 1)
    equal(result.length, 2)
  })

  test('deleteOldEvents', async () => {
    const mod = await import(importPath + '?idx=2')

    mod.addEvent(createEvent('1', 'change', ts - mod.deleteEventsInterval))
    mod.addEvent(createEvent('2', 'change', ts + 10))
    mod.deleteOldEvents()

    const result = mod.getUpdateEvents(ts - 1)
    equal(result.length, 1)
    equal(result[0].id, '2')
  })
})
