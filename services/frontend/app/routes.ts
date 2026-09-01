import { index, route, type RouteConfig } from '@react-router/dev/routes'

export default [
  index('routes/home.tsx'),
  route('files', 'routes/files.tsx'),
  route('sse', 'routes/sse.tsx'),
  route('jobs', 'routes/jobs.tsx'),
  route('job/:id', 'routes/job-delete.tsx'),
  route('archive/:id/archive.zip', 'routes/archive.tsx'),
] satisfies RouteConfig
