import type { Route } from '../+types/root'
import { getTargetUrl } from '../services/env/env'

export async function loader({ params }: Route.LoaderArgs) {
  const { id } = params as { id: string }
  const targetUrl = new URL(`/archive/${id}/archive.zip`, getTargetUrl())
  const response = await fetch(targetUrl)
  const { status, body, headers } = response

  return new Response(body, {
    status,
    headers: {
      'Content-Type': headers.get('Content-Type')!,
      'Content-Disposition': headers.get('Content-Disposition')!,
    },
  })
}
