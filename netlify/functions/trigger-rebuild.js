/**
 * trigger-rebuild.js
 * Netlify Function: triggers a new site build via the Netlify Build Hook URL.
 *
 * Called by the blog editor after a post is published so that:
 *   1. Vite build runs → new static HTML generated for /blog/* routes
 *   2. Netlify CDN cache is cleared for blog pages
 *   3. Sitemap and RSS feed are regenerated
 *
 * Required environment variables (set in Netlify Site Settings → Environment):
 *   NETLIFY_BUILD_HOOK_URL  — the full Deploy Hook URL from Netlify
 *   REBUILD_SECRET          — a shared secret the editor sends in the Authorization header
 *
 * How to get the build hook URL:
 *   Netlify Dashboard → Site → Site configuration → Build & deploy → Build hooks → Add build hook
 *
 * The editor triggers this endpoint after every successful publish action.
 * Debouncing / idempotency is handled by Netlify (it queues/deduplicates concurrent triggers).
 */

exports.handler = async (event) => {
  // Only accept POST
  if (event.httpMethod !== 'POST') {
    return respond(405, { ok: false, error: 'Method Not Allowed' });
  }

  const buildHookUrl = (process.env.NETLIFY_BUILD_HOOK_URL || '').trim();
  const rebuildSecret = (process.env.REBUILD_SECRET || '').trim();

  // Validate environment
  if (!buildHookUrl) {
    console.error('[trigger-rebuild] NETLIFY_BUILD_HOOK_URL not set');
    return respond(500, { ok: false, error: 'Build hook not configured' });
  }

  // Validate caller secret when REBUILD_SECRET is configured
  if (rebuildSecret) {
    const authHeader = (event.headers?.authorization || event.headers?.Authorization || '').trim();
    const providedSecret = authHeader.startsWith('Bearer ')
      ? authHeader.slice(7).trim()
      : authHeader;

    if (providedSecret !== rebuildSecret) {
      console.warn('[trigger-rebuild] Unauthorized rebuild attempt');
      return respond(401, { ok: false, error: 'Unauthorized' });
    }
  }

  try {
    const hookResponse = await fetch(buildHookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      // Netlify build hooks accept an optional payload; pass a trigger reason
      body: JSON.stringify({ trigger: 'blog-publish', timestamp: new Date().toISOString() }),
    });

    if (!hookResponse.ok) {
      const body = await hookResponse.text().catch(() => 'unknown');
      console.error('[trigger-rebuild] Hook returned non-OK:', hookResponse.status, body);
      return respond(502, { ok: false, error: `Hook returned ${hookResponse.status}` });
    }

    console.log('[trigger-rebuild] Build triggered successfully');
    return respond(200, { ok: true, message: 'Site rebuild triggered' });
  } catch (err) {
    console.error('[trigger-rebuild] Unexpected error:', err?.message || err);
    return respond(500, { ok: false, error: 'Failed to trigger rebuild' });
  }
};

function respond(statusCode, body) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
    },
    body: JSON.stringify(body),
  };
}
