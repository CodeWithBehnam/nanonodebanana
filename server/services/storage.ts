import { mkdir, writeFile } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

/**
 * Base directory for file storage.
 */
const STORAGE_DIR = join(process.cwd(), 'data', 'uploads')

/**
 * Ensure storage directory exists.
 */
async function ensureStorageDir(): Promise<void> {
  if (!existsSync(STORAGE_DIR)) {
    await mkdir(STORAGE_DIR, { recursive: true })
  }
}

/**
 * Save a file to the storage directory.
 *
 * @param file - The file to save
 * @param filename - The filename to use
 * @returns The full path to the saved file
 */
export async function saveFile(file: File, filename: string): Promise<string> {
  await ensureStorageDir()

  const filePath = join(STORAGE_DIR, filename)
  const buffer = await file.arrayBuffer()

  await writeFile(filePath, Buffer.from(buffer))

  return filePath
}

/**
 * Get the public URL for a stored file.
 *
 * @param filename - The filename
 * @returns The URL path to access the file
 */
export function getFileUrl(filename: string): string {
  return `/uploads/${filename}`
}

/**
 * Get the full path to a stored file.
 *
 * @param filename - The filename
 * @returns The full filesystem path
 */
export function getFilePath(filename: string): string {
  return join(STORAGE_DIR, filename)
}
