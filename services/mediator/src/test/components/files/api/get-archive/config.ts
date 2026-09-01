import type { FastifyInstance } from 'fastify'

const appModulePath = '../../../../../app.js'

const fileData = 'some data for testing'
const id = 'some-id-with-eight-chars'
const folder = `/tmp/${id}`
const filePath = `${folder}/archive.zip`

const inject = (app: FastifyInstance, defaultId = id) =>
  app!.inject({
    url: `/archive/${defaultId}/archive.zip`,
    method: 'GET',
  })

export { inject, appModulePath, fileData, id, folder, filePath }
