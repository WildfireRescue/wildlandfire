#!/usr/bin/env node
const url = process.argv[2];
if (!url) { console.error('Usage: node fetch-og.cjs <url>'); process.exit(2); }
(async () => {
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const html = await res.text();
    const meta = (name) => {
      const r1 = new RegExp(`<meta[^>]*property=\\"${name}\\"[^>]*content=\\"([^\\\"]+)\\"[^>]*>`, 'i');
      const r2 = new RegExp(`<meta[^>]*name=\\"${name}\\"[^>]*content=\\"([^\\\"]+)\\"[^>]*>`, 'i');
      const m = html.match(r1) || html.match(r2);
      return m ? m[1] : null;
    };
    const linkRel = (rel) => {
      const r = new RegExp(`<link[^>]*rel=\\"${rel}\\"[^>]*href=\\"([^\\\"]+)\\"[^>]*>`, 'i');
      const m = html.match(r);
      return m ? m[1] : null;
    };
    const out = {
      og_title: meta('og:title') || meta('title'),
      og_description: meta('og:description') || meta('description'),
      og_image: meta('og:image'),
      og_site: meta('og:site_name'),
      favicon: linkRel('icon') || linkRel('shortcut icon'),
      url
    };
    console.log(JSON.stringify(out, null, 2));
  } catch (err) {
    console.error('Fetch failed:', String(err));
    process.exit(1);
  }
})();
