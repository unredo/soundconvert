import fastifyMultipart from '@fastify/multipart'
import { type FastifyInstance, type FastifyRequest, type RequestPayload } from 'fastify'

import { onFileHandler } from '../domain/multiform.js'
import { getArchiveRouteConfig } from './get-archive.js'
import { getFileRouteConfig } from './get-file.js'
import { postFileRouteConfig } from './post-file.js'
import { postFilesRouteConfig } from './post-files.js'

async function fileContext(childServer: FastifyInstance) {
  childServer.decorateRequest('fileData')
  childServer.addContentTypeParser(
    'application/octet-stream',
    function (req: FastifyRequest, _payload: RequestPayload, done) {
      done(null, req.body)
    },
  )
  childServer.register(fastifyMultipart, {
    limits: {
      fieldNameSize: 0,
      fieldSize: 0,
      fields: 0,
      files: 10,
      fileSize: 510_485_760,
      headerPairs: 10,
      parts: 10,
    },
    attachFieldsToBody: true,
    onFile: onFileHandler,
  })

  childServer.route(postFilesRouteConfig)
  childServer.route(postFileRouteConfig)
  childServer.route(getFileRouteConfig)
  childServer.route(getArchiveRouteConfig)
}

export { fileContext }
