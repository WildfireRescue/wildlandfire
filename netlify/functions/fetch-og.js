// Netlify serverless function to fetch OpenGraph metadata for a given URL.
// POST { url: 'https://...' }

export async function handler(event) {
  try {
    const body = event.httpMethod === 'POST' && event.body ? JSON.parse(event.body) : null;
    const url = (body && body.url) || (event.queryStringParameters && event.queryStringParameters.url);
    if (!url) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Missing url parameter' }) };
    }

    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; WildlandFireBot/1.0)' } });
    const html = await res.text();

    const meta = (name) => {
      const r1 = new RegExp(`<meta[^>]*property=["']${name}["'][^>]*content=["']([^"']+)["'][^>]*>`, 'i');
      const r2 = new RegExp(`<meta[^>]*name=["']${name}["'][^>]*content=["']([^"']+)["'][^>]*>`, 'i');
      const m = html.match(r1) || html.match(r2);
      return m ? decodeHtmlEntity(m[1]) : null;
    };

    const linkRel = (rel) => {
      const r = new RegExp(`<link[^>]*rel=["']${rel}["'][^>]*href=["']([^"']+)["'][^>]*>`, 'i');
      const m = html.match(r);
      return m ? decodeHtmlEntity(m[1]) : null;
    };

    const og_title = meta('og:title') || meta('title') || null;
    const og_description = meta('og:description') || meta('description') || null;
    const og_image = meta('og:image') || null;
    const og_site = meta('og:site_name') || null;
    const favicon = linkRel('icon') || linkRel('shortcut icon') || null;

    return {
      statusCode: 200,
      body: JSON.stringify({ og_title, og_description, og_image, og_site, favicon, url }),
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: String(err) }) };
  }
}

function decodeHtmlEntity(str) {
  if (!str) return str;
  return str.replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
}
