import { readFile } from 'node:fs/promises'

const isProd = process.env['NODE_ENV'] === 'production'

const hostName = 'MR_VALKEY_HOST'
const portName = 'MR_VALKEY_PORT'
const userName = 'MR_VALKEY_USER'

try {
  process.loadEnvFile('.env')
  // oxlint-disable-next-line no-unused-vars
} catch (_) {
  console.log('No env file found')
}

const host = process.env[hostName]
const username = process.env[userName]
const port = parseInt(process.env[portName] || '6379')

let password: string = ''

if (isProd) {
  try {
    const temp = await readFile('/run/secrets/VALKEY_PW', 'utf-8')
    password = temp.substring(0, temp.length - 1)
  } catch (e) {
    const msg = e instanceof Error ? e.message : ''
    console.error(`Password not found: ${msg}`)
    process.exit(1)
  }
} else {
  password = process.env['MR_VALKEY_PASSWORD'] || ''
}

if (!host || !username || !port || password.length < 1) {
  console.error('Missing env variable(s)')
  process.exit(1)
}

const connection = {
  host,
  port,
  username,
  password,
}

export { connection }
