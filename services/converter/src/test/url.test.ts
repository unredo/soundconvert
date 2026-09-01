import { equal } from 'node:assert'
import test from 'node:test'

import { createUploadUrl } from '../components/jobs/domain/url.js'

test('Create upload URL', () => {
  const url = createUploadUrl(new URL('http://host:3000'), 'id', 'file')
  equal(url, 'http://host:3000/file/id?file=file')
})
