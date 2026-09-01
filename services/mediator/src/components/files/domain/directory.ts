import { mkdtemp } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

async function makeTempDir() {
  try {
    const name = join(tmpdir(), 'sndcnv-')
    return await mkdtemp(name)
  } catch (err) {
    console.error(err)
    throw Error()
  }
}

export { makeTempDir }
