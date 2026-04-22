const SITE = 'https://k1212gh.dev'

export default function robots() {
  return {
    rules: [
      { userAgent: '*', allow: '/' },
    ],
    sitemap: `${SITE}/sitemap.xml`,
    host: SITE,
  }
}
