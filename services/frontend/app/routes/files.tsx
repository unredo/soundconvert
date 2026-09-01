import { fetch } from 'undici'

import type { Route } from '../+types/root'
import { getTargetUrl } from '../services/env/env'

export async function action({ request }: Route.ActionArgs) {
  const targetUrl = new URL(`/files`, getTargetUrl())
  const result = await fetch(targetUrl, {
    method: request.method,
    body: request.body,
    duplex: 'half',
    headers: {
      'Content-Type': request.headers.get('Content-Type') || '',
      'Content-Length': request.headers.get('Content-Length') || '',
    },
  })
  return result.status
}
