import { useEffect, useState } from 'react'
import { useRevalidator } from 'react-router'

import type { JobInfo } from '~/state/job-data.type'
import { JobsProvider } from '~/state/jobs-context'

import JobCheck from './job-check'

export default function JobsData({ jobs, pagination, count }: JobInfo) {
  const [date, setDate] = useState(Date.now())
  const [hasNew, setHasNew] = useState(false)
  const { revalidate } = useRevalidator()

  useEffect(() => {
    setDate(Date.now())
  }, [jobs])

  useEffect(() => {
    const controller = new AbortController()

    async function connect() {
      const response = await fetch('/sse', {
        method: 'POST',
        signal: controller.signal,
      })

      const reader = response.body!.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { value, done } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        for (const event of chunk.split('\n\n')) {
          if (event.startsWith('data: ')) {
            const items: { id: string; type: string }[] = JSON.parse(event.slice(6))

            const jobIds = jobs.map((j) => j.id)
            const newItems = items.filter((i) => i.type === 'new').length > 0
            const deletedItems =
              items.filter((i) => i.type === 'delete' && jobIds.includes(i.id)).length > 0
            const changedItems =
              items.filter((i) => i.type === 'change' && jobIds.includes(i.id)).length > 0

            if (newItems || deletedItems || changedItems) {
              setHasNew(true)
            }
          }
        }
      }
    }

    connect()
      .then(() => console.log('SSE connected'))
      .catch((e) => {
        if (typeof e === 'string' || (e.code && e.code === 20)) {
          return
        }
        const msg = e instanceof Error ? e.message : ''
        console.error(msg)
      })

    return () => {
      controller.abort('Left job page')
    }
  }, [])

  return (
    <JobsProvider key={date} initialJobs={jobs || []}>
      <div className="w-full flex flex-col">
        <JobCheck pagination={pagination} count={count} />
        {hasNew && (
          <button
            className="absolute bottom-0 left-1/2 p-2 text-[3rem] transition-opacity"
            onClick={async () => {
              setHasNew(false)
              await revalidate()
            }}
          >
            {'\u27F3'}
          </button>
        )}
      </div>
    </JobsProvider>
  )
}
