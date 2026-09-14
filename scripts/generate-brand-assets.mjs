import { readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { chromium } from '@playwright/test'

// Resize the approved artwork and render its share layout. No image generation.
const asset = (path) =>
  fileURLToPath(new URL(`../public/${path}`, import.meta.url))
const master = `data:image/png;base64,${(await readFile(asset('brand/pelican-master.png'))).toString('base64')}`
const mark = `data:image/svg+xml;base64,${(await readFile(asset('brand-mark.svg'))).toString('base64')}`
const browser = await chromium.launch({ headless: true })
try {
  const page = await browser.newPage({
    viewport: { width: 1200, height: 630 },
    deviceScaleFactor: 1,
  })
  async function resize(source, size, type, background, inset = 0) {
    const data = await page.evaluate(
      async ({ source, size, type, background, inset }) => {
        const image = new Image()
        image.src = source
        await image.decode()
        const canvas = document.createElement('canvas')
        canvas.width = canvas.height = size
        const ctx = canvas.getContext('2d')
        if (background) {
          ctx.fillStyle = background
          ctx.fillRect(0, 0, size, size)
        }
        ctx.imageSmoothingQuality = 'high'
        ctx.drawImage(image, inset, inset, size - inset * 2, size - inset * 2)
        return canvas.toDataURL(type, 0.9).split(',')[1]
      },
      { source, size, type, background, inset },
    )
    return Buffer.from(data, 'base64')
  }
  for (const size of [320, 640]) {
    await writeFile(
      asset(`brand/pelican-${size}.webp`),
      await resize(master, size, 'image/webp'),
    )
  }
  const favicon = await resize(mark, 32, 'image/png')
  await writeFile(asset('favicon-32.png'), favicon)
  // One PNG-backed 32px entry is supported by modern ICO consumers.
  const ico = Buffer.alloc(22)
  ico.writeUInt16LE(1, 2)
  ico.writeUInt16LE(1, 4)
  ico[6] = ico[7] = 32
  ico.writeUInt16LE(1, 10)
  ico.writeUInt16LE(32, 12)
  ico.writeUInt32LE(favicon.length, 14)
  ico.writeUInt32LE(22, 18)
  await writeFile(asset('favicon.ico'), Buffer.concat([ico, favicon]))
  await writeFile(
    asset('apple-touch-icon.png'),
    await resize(master, 180, 'image/png', '#F7F6FA', 10),
  )
  await page.setContent(`<!doctype html><html><head><style>
    *{box-sizing:border-box}body{margin:0;width:1200px;height:630px;background:#F7F6FA;color:#242131;font-family:Arial,sans-serif;display:flex;align-items:center;padding:72px;gap:56px}
    body>div{min-width:0;flex:1}img{width:390px;height:390px;flex:none}h1{font-size:66px;letter-spacing:-3px;line-height:1.02;margin:0 0 26px}p{font-size:28px;line-height:1.4;color:#494352;margin:0}small{display:block;font-size:20px;color:#6340A3;margin-top:32px}
    </style></head><body><img src="${master}" alt=""><div><h1>Public Parish</h1><p>See how local government is changing.</p><small>publicparish.com</small></div></body></html>`)
  await page.locator('img').evaluate((image) => image.decode())
  await page.screenshot({ path: asset('brand/share.png') })
  console.log(
    'Generated pelican WebP sizes, browser icons and 1200 × 630 share image.',
  )
} finally {
  await browser.close()
}
