import { useEffect, useState } from 'react'
import { useRevalidator } from 'react-router'

import type { JobInfo } from '../../state/job-data.type'
import { getJobs } from '../../state/jobs-context'
import JobCheck from './job-check'

export default function JobsData({ pagination, count }: Pick<JobInfo, 'pagination' | 'count'>) {
  const [hasNew, setHasNew] = useState(false)
  const { revalidate } = useRevalidator()
  const jobs = getJobs()

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
  }, [jobs])

  return (
    <div className="w-full flex flex-col relative">
      <JobCheck pagination={pagination} count={count} />
      {hasNew && (
        <button
          title="Reload Jobs"
          className="absolute h-12 w-12 bottom-4 left-[calc(50%-1.5rem)] p-2 text-[3rem] transition-opacity hover:cursor-pointer rounded-full bg-purple-900 hover:bg-purple-800 leading-0 pr-1 pt-2"
          onClick={async () => {
            setHasNew(false)
            await revalidate()
          }}
        >
          {'\u27F3'}
        </button>
      )}
    </div>
  )
}
