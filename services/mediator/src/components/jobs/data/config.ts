const prefix = 'sndcnvrt'
const jobConfig = {
  jobsPerPage: 6,
  jobCompletedAge: 1800,
  jobFailedAge: 3600,
}

const queueNames = {
  flow: `${prefix}-flow`,
  convert: `${prefix}-convert`,
  cleanup: `${prefix}-cleanup`,
  deleteIds: `${prefix}-deleteIds`,
}

export { jobConfig, queueNames }
