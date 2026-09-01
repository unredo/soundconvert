import { getJobs } from '../../state/jobs-context'
import JobList from './job-list'

interface JobsProps {
  count: number
  pagination: { pages: number; current: number }
}

export default function JobCheck({ count, pagination }: JobsProps) {
  const hasPrevious = pagination.current > 0
  const hasNext = pagination.current < pagination.pages - 1
  const jobs = getJobs()
  const sortedJobs = jobs?.sort((a, b) => b.timestamp - a.timestamp)

  return (
    <>
      {count < 1 && (
        <div className="w-full h-full flex justify-center items-center">
          <p>No jobs available</p>
        </div>
      )}
      {count > 0 && (
        <JobList
          jobs={sortedJobs}
          page={pagination.current}
          hasNext={hasNext}
          hasPrevious={hasPrevious}
        />
      )}
    </>
  )
}
