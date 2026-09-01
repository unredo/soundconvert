import { readFile } from 'node:fs/promises'

interface EnvVariables {
  host: string
  port: number
  username: string
  password: string
}

try {
  process.loadEnvFile('.env')
  // oxlint-disable-next-line no-unused-vars
} catch (_) {
  console.log('No env file found')
}

const nodeEnv = process.env['NODE_ENV'] || ''
const isProd = nodeEnv.toLowerCase() === 'production'

function envIsProd() {
  return isProd
}

async function parseAndCheckArgs() {
  const config: { var: string; name: keyof EnvVariables }[] = [
    { var: 'CR_VALKEY_HOST', name: 'host' },
    { var: 'CR_VALKEY_PORT', name: 'port' },
    { var: 'CR_VALKEY_USER', name: 'username' },
  ]

  const errors: string[] = []
  const data: EnvVariables = { host: '', password: '', port: -1, username: '' }

  if (isProd) {
    try {
      const temp = await readFile('/run/secrets/VALKEY_PW', 'utf-8')
      data.password = temp.substring(0, temp.length - 1)
    } catch (e) {
      const msg = e instanceof Error ? e.message : ''
      console.error(`Password missing: ${msg}`)
      process.exit(1)
    }
  } else {
    config.push({ var: 'CR_VALKEY_PASSWORD', name: 'password' })
  }

  for (const item of config) {
    const env = process.env[item.var]

    if (!env) {
      errors.push(`${item.name} - ${item.var}`)
      continue
    }

    if (item.name in data) {
      if (item.name === 'port') {
        data[item.name] = parseInt(env)
      } else {
        data[item.name] = env
      }
    }
  }

  if (errors.length > 0) {
    console.log('Missing environment variables:')
    for (const e of errors) {
      console.log(` - ${e}`)
    }
    process.exit(1)
  }

  return data
}

function getMediatorUrl() {
  const host = process.env['CR_MEDIATOR_HOST']
  const port = process.env['CR_MEDIATOR_PORT']

  if (!host || !port) {
    throw Error('Missing env variable(s) CR_MEDIATOR_*')
  }

  return new URL(`http://${host}:${port}`)
}

export { envIsProd, parseAndCheckArgs, getMediatorUrl, type EnvVariables }
