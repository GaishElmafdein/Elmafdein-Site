export const CHUNK_SIZE = 1200
export const CHUNK_OVERLAP = 150
export function chunkText(text: string): string[] {
  const parts: string[] = []
  let i = 0
  while (i < text.length) {
    const end = Math.min(text.length, i + CHUNK_SIZE)
    parts.push(text.slice(i, end))
    i += CHUNK_SIZE - CHUNK_OVERLAP
  }
  return parts
}
