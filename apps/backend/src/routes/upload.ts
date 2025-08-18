import Elysia, { t } from 'elysia'
import { randomUUID } from 'node:crypto'
import path from 'node:path'
import fs from 'node:fs/promises'

const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads')

async function ensureDir(p: string) {
  await fs.mkdir(p, { recursive: true })
}

export const uploadRoutes = new Elysia({ prefix: '/api' })
  .post(
    '/upload',
    async ({ body, request, set }) => {
      const file = (body as any).image as File
      if (!file) {
        set.status = 400
        return { error: 'No file field "image" found.' }
      }

      if (!file.type?.startsWith('image/')) {
        set.status = 415
        return { error: 'Only image uploads are allowed.' }
      }

      const ext = file.name?.split('.').pop() || 'bin'
      const id = randomUUID()
      const filename = `${id}.${ext}`

      await ensureDir(UPLOAD_DIR)
      const filepath = path.join(UPLOAD_DIR, filename)
      const arrayBuf = await file.arrayBuffer()
      await Bun.write(filepath, arrayBuf)

      const origin = `${request.headers.get('x-forwarded-proto') || 'http'}://${request.headers.get('host')}`
      const url = `${origin}/uploads/${filename}`

      return {
        id,
        name: file.name,
        type: file.type,
        size: file.size,
        url
      }
    },
    {
      body: t.Object({
        image: t.File({ maxSize: 10 * 1024 * 1024 }) // 10MB
      }),
      detail: { tags: ['upload'] }
    }
  )
