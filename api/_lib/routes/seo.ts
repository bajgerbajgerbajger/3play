import { Router } from 'express'
import Video from '../models/Video.js'
import Profile from '../models/Profile.js'
import dbConnect from '../lib/db.js'

const router = Router()

router.get('/robots.txt', (req, res) => {
  const domain = process.env.APP_ORIGIN || 'https://3play.cz'
  const robots = `User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin/
Disallow: /studio/

Sitemap: ${domain}/sitemap.xml`

  res.type('text/plain').send(robots)
})

router.get('/sitemap.xml', async (req, res) => {
  await dbConnect()
  const domain = process.env.APP_ORIGIN || 'https://3play.cz'
  
  // Fetch latest public videos
  const videos = await Video.find({ visibility: 'published', status: 'ready' })
    .sort({ createdAt: -1 })
    .limit(1000)
    .select('id updatedAt')

  // Fetch profiles
  const profiles = await Profile.find({})
    .limit(1000)
    .select('handle updatedAt')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${domain}/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${domain}/auth</loc>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
  ${profiles.map(p => `
  <url>
    <loc>${domain}/channel/${p.handle.replace('@', '')}</loc>
    <lastmod>${new Date(p.updatedAt || Date.now()).toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`).join('')}
  ${videos.map(v => `
  <url>
    <loc>${domain}/watch/${v.id}</loc>
    <lastmod>${new Date(v.updatedAt || Date.now()).toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>`).join('')}
</urlset>`

  res.type('application/xml').send(xml)
})

export default router
