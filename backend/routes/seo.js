import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const router = express.Router();

// Servir sitemap.xml
router.get('/sitemap.xml', (req, res) => {
  // Chemin relatif pour Vercel
  const sitemapPath = path.join(__dirname, '../../frontend/public/sitemap.xml');
  
  if (fs.existsSync(sitemapPath)) {
    res.setHeader('Content-Type', 'application/xml');
    res.sendFile(path.resolve(sitemapPath));
  } else {
    // Fallback si le fichier n'existe pas
    res.setHeader('Content-Type', 'application/xml');
    res.send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${process.env.FRONTEND_URL || process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://aishield.app'}/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`);
  }
});

// Servir robots.txt pour le site
router.get('/robots.txt', (req, res) => {
  const robotsPath = path.join(__dirname, '../../frontend/public/robots-site.txt');
  
  if (fs.existsSync(robotsPath)) {
    res.setHeader('Content-Type', 'text/plain');
    res.sendFile(path.resolve(robotsPath));
  } else {
    // Générer un robots.txt par défaut
    const siteUrl = process.env.FRONTEND_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://aishield.app');
    res.setHeader('Content-Type', 'text/plain');
    res.send(`User-agent: *
Allow: /

Sitemap: ${siteUrl}/sitemap.xml
`);
  }
});

export default router;

