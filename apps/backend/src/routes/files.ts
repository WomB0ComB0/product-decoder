import Elysia from 'elysia'
import path from 'node:path'
import fs from 'node:fs'
import { UPLOAD_DIR } from '../config/paths'

export const filesRoutes = new Elysia()
  .get('/uploads/:name', ({ params, set }) => {
    const filePath = path.join(UPLOAD_DIR, params.name)
    if (!fs.existsSync(filePath)) {
      set.status = 404
      return 'Not Found'
    }
    return new Response(Bun.file(filePath))
  })
