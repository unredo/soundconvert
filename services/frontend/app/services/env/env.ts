const hostName = 'FE_TARGET_HOST'
const portName = 'FE_TARGET_PORT'

try {
  process.loadEnvFile('.env')
  // oxlint-disable-next-line no-unused-vars
} catch (_) {
  console.log('No env file found')
}

const host = process.env[hostName]
const port = process.env[portName]

const msg = `Missing env variable(s): ${host ? '' : hostName} ${port ? '' : portName}`
if (!host || !port) {
  console.error(msg)
  process.exit(1)
}

const targetUrl = new URL(`http://${host}:${port}`)

function getTargetUrl() {
  return targetUrl
}

export { getTargetUrl }
