import { Elysia } from 'elysia'
import { cors } from '@elysiajs/cors'
import { staticPlugin } from '@elysiajs/static'
import { UPLOAD_DIR } from './config/paths'
import { uploadRoutes } from './routes/upload'
import { filesRoutes } from './routes/files'

const app = new Elysia()
  .use(cors())
  .use(staticPlugin({ assets: UPLOAD_DIR, prefix: '/uploads' }))
  .use(filesRoutes)
  .use(uploadRoutes)
  .get('/health', () => ({ ok: true }))
  .listen(process.env.SERVER_PORT ? Number(process.env.SERVER_PORT) : 3001)

console.log(`Backend listening on http://localhost:${app.server?.port}`)
