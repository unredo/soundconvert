import { useEffect, useState } from 'react'

import type { JobData } from '../../state/job-data.type'
import { getJobsDispatch } from '../../state/jobs-context'
import { JobAction } from './job-action'
import LabelText from './label-text'

interface JobProps {
  job: JobData
}

export default function Job({ job }: JobProps) {
  const {
    actions: { cleanup },
  } = job
  const [time, setTime] = useState('')
  const dispatch = getJobsDispatch()
  const isDisabled = job.state !== 'completed' || cleanup

  useEffect(() => {
    setTime(
      new Date(job.timestamp).toLocaleDateString('en-US', {
        year: '2-digit',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }),
    )
  }, [job])

  async function deleteJobCallback(job: JobData) {
    await fetch(`/job/${job.id}`, { method: 'DELETE' })
    dispatch!({ type: 'remove', job })
  }

  return (
    <div
      className="h-full w-96 flex flex-col gap-6 border p-4 rounded-md relative"
      style={{ textDecoration: cleanup ? 'line-through' : '' }}
    >
      <div className="absolute right-4 flex flex-col gap-4">
        <JobAction
          title="Remove Job"
          url={`/job/${job.id}`}
          text={'\u2715'}
          cb={() => deleteJobCallback(job)}
        />
        {!isDisabled && (
          <JobAction
            title="Download Results"
            url={`/archive/${job.id}/archive.zip`}
            text={'\u2913'}
          />
        )}
      </div>

      <LabelText label={'State'} text={job.state} />
      <LabelText label={'Date'} text={time} />

      <div className="grow">
        <p className="text-sm">Files:</p>
        <ul className="list-disc max-h-36 overflow-auto">
          {job.files.map((f) => (
            <li key={f.name} className="flex gap-2">
              <span role="checkbox" aria-checked={f.done ? 'true' : 'false'}>
                {f.done ? '\u2611' : '\u2610'}
              </span>
              <span>{f.name}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex gap-2 justify-between text-sm">
        <p>Todo: {job.children.todo}</p>
        <p>Done: {job.children.done}</p>
        <p>Failed: {job.children.failed}</p>
      </div>
    </div>
  )
}
