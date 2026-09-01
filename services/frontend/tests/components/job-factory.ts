import type { JobData } from '~/state/job-data.type'

const defaultJob: JobData = {
  actions: { cleanup: false, download: false },
  children: { done: 1, todo: 1, failed: 0 },
  files: [
    { name: 'one.wav', done: true },
    { name: 'two.wav', done: false },
  ],
  id: 'some-id',
  progress: '0',
  state: 'waiting',
  timestamp: Date.now(),
}

function createJobs(length: number, timestamp?: number) {
  const arr: JobData[] = []
  for (let i = 0; i < length; i++) {
    arr.push({
      ...defaultJob,
      id: defaultJob.id + `_${i}`,
      timestamp: timestamp ? timestamp + i * 1000 : defaultJob.timestamp,
    })
  }
  return arr
}

export { createJobs, defaultJob }
