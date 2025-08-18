import path from 'node:path'
export const BACKEND_ROOT = path.resolve(process.cwd())
export const UPLOAD_DIR = path.join(BACKEND_ROOT, 'uploads')
