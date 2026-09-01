import {
  type ActionDispatch,
  createContext,
  type PropsWithChildren,
  useContext,
  useReducer,
} from 'react'

import type { JobData } from '~/state/job-data.type'

type ActionType = 'remove' | 'update'
interface Action {
  type: ActionType
  job: JobData
}

function jobsReducer(jobs: JobData[], action: Action) {
  switch (action.type) {
    case 'remove': {
      return jobs.filter((j) => j.id !== action.job.id)
    }
    case 'update': {
      const idx = jobs.findIndex((val) => val.id === action.job.id)
      jobs[idx] = action.job
      return jobs
    }
    default: {
      throw Error('Unknown action: ' + action.type)
    }
  }
}

const JobsContext = createContext<JobData[]>([])
const JobsDispatchContext = createContext<ActionDispatch<[Action]> | undefined>(undefined)

function JobsProvider({ children, initialJobs }: PropsWithChildren & { initialJobs: JobData[] }) {
  const [jobs, dispatch] = useReducer(jobsReducer, initialJobs)

  return (
    <JobsContext value={jobs}>
      <JobsDispatchContext value={dispatch}> {children}</JobsDispatchContext>
    </JobsContext>
  )
}

function getJobs() {
  return useContext(JobsContext)
}

function getJobsDispatch() {
  return useContext(JobsDispatchContext)
}

export { JobsProvider, getJobs, getJobsDispatch }
