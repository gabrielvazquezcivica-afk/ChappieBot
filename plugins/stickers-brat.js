import fs from 'fs'
import path from 'path'
import os from 'os'
import axios from 'axios'
import { spawn } from 'child_process'

async function createSticker(buffer) {
  const tmpIn = path.join(os.tmpdir(), `brat_${Date.now()}.png`)
  const tmpOut = path.join(os.tmpdir(), `brat_${Date.now()}.webp`)
  fs.writeFileSync(tmpIn, buffer)

  // ───── FFmpeg: fondo blanco + overlay + webp ─────
  await new Promise((resolve, reject) => {
    const ff = spawn('ffmpeg', [
      '-i', tmpIn,
      '-vf', 'format=rgba,scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=white',
      '-vcodec', 'libwebp',
      '-lossless', '1',
      '-loop', '0',
      '-preset', 'default',
      '-an',
      '-vsync', '0',
      '-y',
      tmpOut
    ])
    ff.on('close', code => code === 0 ? resolve() : reject(new Error('FFmpeg fallo')))
    ff.on('error', reject)
  })

  const result = fs.readFileSync(tmpOut)
  fs.unlinkSync(tmpIn)
  fs.unlinkSync(tmpOut)
  return result
}
