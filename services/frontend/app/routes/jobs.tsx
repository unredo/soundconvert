import React, { useEffect, useState } from 'react'
import { Await, redirect } from 'react-router'

import JobsData from '~/components/jobs/jobs-data'
import { JobsProvider } from '~/state/jobs-context'

import type { Route } from '../+types/root'
import { Spinner } from '../components/home/spinner'
import { getTargetUrl } from '../services/env/env'
import type { JobInfo } from '../state/job-data.type'

export function meta() {
  return [{ title: 'SoundConvert: Jobs' }, { name: 'description', content: 'SoundConvert Jobs' }]
}

export async function loader({ url }: Route.LoaderArgs): Promise<{ data: any }> {
  const page = url.searchParams.get('page') || '0'
  if (parseInt(page) < 0) {
    throw redirect('/jobs')
  }

  const targetUrl = new URL(`/jobs?page=${page}`, getTargetUrl())
  const data = new Promise((resolve, reject) => {
    fetch(targetUrl, { cache: 'no-store' })
      .then((response) => {
        if (response.status !== 200) {
          reject(Error(`Job fetch failed: ${response.status}`))
        }
        response.json().then((data) => resolve(data))
      })
      .catch((e) => reject(e))
  })

  return { data }
}

export default function JobsRoute({ loaderData }: Route.ComponentProps) {
  const { data } = loaderData as unknown as { data: Promise<JobInfo> }
  const [date, setDate] = useState(0)

  useEffect(() => {
    setDate(Date.now())
  }, [data])

  return (
    <React.Suspense
      fallback={
        <div className="w-full h-full flex items-center justify-center">
          <Spinner />
        </div>
      }
    >
      <Await resolve={data}>
        {(value) => (
          <JobsProvider key={date} initialJobs={value.jobs || []}>
            <JobsData count={value.count} pagination={value.pagination} />
          </JobsProvider>
        )}
      </Await>
    </React.Suspense>
  )
}
