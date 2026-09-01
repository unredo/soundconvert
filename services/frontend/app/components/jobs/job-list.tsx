import { Link } from 'react-router'

import type { JobData } from '../../state/job-data.type'
import Job from './job'

interface JobListProps {
  jobs: JobData[]
  hasPrevious: boolean
  hasNext: boolean
  page: number
}

const getInactive = (name: string) => <span className="opacity-40 transition-opacity">{name}</span>

export default function JobList({ jobs, hasPrevious, hasNext, page }: JobListProps) {
  return (
    <>
      <ul className="flex flex-wrap gap-y-8 gap-x-8 grow overflow-auto px-4 justify-center">
        {jobs.map((j) => (
          <li className="max-h-96" key={j.id}>
            <Job job={j} />
          </li>
        ))}
      </ul>
      <div className="flex justify-between border-t pt-4 mt-8 ">
        {hasPrevious ? <Link to={`/jobs?page=${page - 1}`}>Prev</Link> : getInactive('Prev')}
        {hasNext ? <Link to={`/jobs?page=${page + 1}`}>Next</Link> : getInactive('Next')}
      </div>
    </>
  )
}
