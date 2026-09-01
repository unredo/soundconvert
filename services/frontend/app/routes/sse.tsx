import type { Route } from '../+types/root'
import { getTargetUrl } from '../services/env/env'

type Writer = (d: string) => void
interface StreamData {
  closed: boolean
  lastUpdate: number
  writer: Writer
}

const updateInterval = 10000

const startUpdateTimer = ({ lastUpdate, writer }: StreamData) =>
  setInterval(async () => {
    const base = getTargetUrl()
    const response = await fetch(new URL(`/jobs/updates?ts=${lastUpdate}`, base))
    const updateList = await response.json()
    lastUpdate = Date.now()
    writer(JSON.stringify(updateList))
  }, updateInterval)

export function action({ request }: Route.ActionArgs) {
  const streamData: StreamData = {
    closed: false,
    lastUpdate: Date.now(),
    writer: () => undefined,
  }

  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    start(controller) {
      streamData.writer = (data: string) => {
        if (streamData.closed) return
        controller.enqueue(encoder.encode(`data: ${data}\n\n`))
      }
      const interval = startUpdateTimer(streamData)
      request.signal.addEventListener('abort', () => {
        clearInterval(interval)
        controller.close()
        streamData.closed = true
      })
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  })
}
