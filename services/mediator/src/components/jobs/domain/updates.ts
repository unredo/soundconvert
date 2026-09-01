type UpdateType = 'new' | 'change' | 'delete'

interface UpdateEvent {
  id: string
  timestamp: number
  type: UpdateType
}

const deleteEventsInterval = 30000

let updateList: UpdateEvent[] = []

function getUpdateEvents(timestamp: number) {
  return updateList.filter((item) => item.timestamp > timestamp)
}

function deleteOldEvents() {
  const lowerLimit = Date.now() - deleteEventsInterval
  const isNotOutdated = (ev: UpdateEvent) => {
    const curr = ev.timestamp - lowerLimit
    return curr > 0
  }
  updateList = updateList.filter(isNotOutdated)
}

function addEvent(ev: UpdateEvent) {
  for (const item of updateList) {
    if (item.id === ev.id) {
      item.timestamp = ev.timestamp
      return
    }
  }
  updateList.push(ev)
}

export {
  type UpdateType,
  type UpdateEvent,
  deleteEventsInterval,
  addEvent,
  deleteOldEvents,
  getUpdateEvents,
}
