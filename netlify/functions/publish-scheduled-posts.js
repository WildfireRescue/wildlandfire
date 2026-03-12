const { createClient } = require('@supabase/supabase-js');

const urlCandidates = [
  process.env.SUPABASE_URL,
  process.env.VITE_SUPABASE_URL,
];

const serviceKeyCandidates = [
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  process.env.SUPABASE_SERVICE_KEY,
  process.env.SUPABASE_KEY,
];

const schedulerSecretCandidates = [
  process.env.PUBLISH_SCHEDULE_SECRET,
  process.env.CRON_SHARED_SECRET,
];

function firstNonEmpty(values) {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }
  return '';
}

function getHeader(event, name) {
  const headers = event?.headers || {};
  const target = name.toLowerCase();

  for (const key of Object.keys(headers)) {
    if (key.toLowerCase() === target) {
      const value = headers[key];
      if (typeof value === 'string') return value.trim();
      if (Array.isArray(value)) return String(value[0] || '').trim();
      if (value != null) return String(value).trim();
      return '';
    }
  }

  return '';
}

function extractProvidedSecret(event) {
  const fromHeader = firstNonEmpty([
    getHeader(event, 'x-publish-secret'),
    getHeader(event, 'x-scheduler-secret'),
  ]);

  const authHeader = getHeader(event, 'authorization');
  const fromAuthBearer = authHeader.toLowerCase().startsWith('bearer ')
    ? authHeader.slice(7).trim()
    : '';

  const querySecret = event?.queryStringParameters?.secret;
  const fromQuery = typeof querySecret === 'string' ? querySecret.trim() : '';

  return firstNonEmpty([fromHeader, fromAuthBearer, fromQuery]);
}

exports.handler = async (event) => {
  const supabaseUrl = firstNonEmpty(urlCandidates);
  const serviceRoleKey = firstNonEmpty(serviceKeyCandidates);
  const schedulerSecret = firstNonEmpty(schedulerSecretCandidates);
  const triggerHeader = getHeader(event, 'x-netlify-event');
  const triggerLower = triggerHeader.toLowerCase();
  const isScheduledTrigger = triggerLower.includes('schedule');

  if (schedulerSecret && !isScheduledTrigger) {
    const providedSecret = extractProvidedSecret(event);

    if (providedSecret !== schedulerSecret) {
      console.warn('[publish-scheduled-posts] Unauthorized manual invoke');
      return json(401, {
        ok: false,
        error: 'Unauthorized',
        message: 'Provide a valid scheduler secret via x-publish-secret or Authorization: Bearer <secret>.',
      });
    }
  }

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('[publish-scheduled-posts] Missing Supabase server credentials');
    return json(500, {
      ok: false,
      error: 'Missing SUPABASE_URL/VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY',
    });
  }

  try {
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const { data, error } = await supabase.rpc('publish_due_scheduled_posts');

    if (error) {
      console.error('[publish-scheduled-posts] RPC error:', error);
      return json(500, {
        ok: false,
        error: error.message || 'Failed to publish due scheduled posts',
        code: error.code || null,
      });
    }

    const updatedCount = typeof data === 'number' ? data : Number(data ?? 0);
    const safeCount = Number.isFinite(updatedCount) ? updatedCount : 0;

    return json(200, {
      ok: true,
      updatedCount: safeCount,
      trigger: triggerHeader || 'manual',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[publish-scheduled-posts] Unexpected error:', error);
    return json(500, {
      ok: false,
      error: error?.message || 'Unexpected error',
    });
  }
};

function json(statusCode, body) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
    },
    body: JSON.stringify(body),
  };
}
