import type { Route } from '../+types/root'
import { getTargetUrl } from '../services/env/env'

export async function action({ params }: Route.ActionArgs) {
  const { id } = params as { id: string }
  const targetUrl = new URL(`/job/${id}`, getTargetUrl())
  const response = await fetch(targetUrl, { method: 'DELETE' })
  return response.status
}
