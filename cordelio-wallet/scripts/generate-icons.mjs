import { deflateSync } from 'node:zlib'
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const outDir = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '../public/icons',
)

function crc32(buffer) {
  let crc = ~0
  for (const byte of buffer) {
    crc ^= byte
    for (let bit = 0; bit < 8; bit += 1) {
      crc = crc & 1 ? 0xedb88320 ^ (crc >>> 1) : crc >>> 1
    }
  }
  return ~crc >>> 0
}

function chunk(type, data) {
  const length = Buffer.alloc(4)
  length.writeUInt32BE(data.length)
  const typeBuffer = Buffer.from(type)
  const checksum = Buffer.alloc(4)
  checksum.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])))
  return Buffer.concat([length, typeBuffer, data, checksum])
}

function inRoundedSquare(x, y, radius) {
  const clampedX = Math.min(Math.max(x, radius), 1 - radius)
  const clampedY = Math.min(Math.max(y, radius), 1 - radius)
  const dx = x - clampedX
  const dy = y - clampedY
  return dx * dx + dy * dy <= radius * radius
}

function paint(x, y, size) {
  const px = (x + 0.5) / size
  const py = (y + 0.5) / size
  if (!inRoundedSquare(px, py, 0.22)) return [0, 0, 0, 0]

  const dx = px - 0.5
  const dy = py - 0.52
  const distance = Math.hypot(dx, dy)
  const angle = Math.atan2(dy, dx)
  const onLetter =
    distance < 0.3 && distance > 0.16 && Math.abs(angle) > 0.75
  if (onLetter) return [255, 255, 255, 255]
  return [76, 29, 149, 255]
}

function png(size) {
  const stride = size * 4 + 1
  const raw = Buffer.alloc(stride * size)
  for (let y = 0; y < size; y += 1) {
    const row = y * stride
    raw[row] = 0
    for (let x = 0; x < size; x += 1) {
      const [red, green, blue, alpha] = paint(x, y, size)
      const index = row + 1 + x * 4
      raw[index] = red
      raw[index + 1] = green
      raw[index + 2] = blue
      raw[index + 3] = alpha
    }
  }

  const header = Buffer.alloc(13)
  header.writeUInt32BE(size, 0)
  header.writeUInt32BE(size, 4)
  header[8] = 8
  header[9] = 6

  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', header),
    chunk('IDAT', deflateSync(raw)),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

mkdirSync(outDir, { recursive: true })
for (const size of [16, 32, 48, 128]) {
  writeFileSync(resolve(outDir, `icon-${size}.png`), png(size))
}
