interface JobData {
  id: string
  state: string
  timestamp: number
  progress: string
  files: {
    name: string
    done: boolean
  }[]
  actions: {
    cleanup: boolean
    download: boolean
  }
  children: {
    todo: number
    failed: number
    done: number
  }
}

interface JobInfo {
  count: number
  jobs: JobData[]
  pagination: { pages: number; current: number }
}

export { type JobData, type JobInfo }
