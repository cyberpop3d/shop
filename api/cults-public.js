const SUPABASE_URL = 'https://wdtbanucnxnwbruwcgmv.supabase.co';
const SUPABASE_ANON_JWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndkdGJhbnVjbnhud2JydXdjZ212Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk3MzkxOTcsImV4cCI6MjA5NTMxNTE5N30.K9CfXXjeAGYT0WN6gwnQl27RI70nQC-jd3j4SW9NJ9A';

function originalMediaUrl(url) {
  if (!url) return null;
  const marker = 'https://fbi.cults3d.com/';
  const index = String(url).indexOf(marker);
  return index >= 0 ? String(url).slice(index) : String(url);
}

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
  res.setHeader('X-Robots-Tag', 'noindex');

  if (req.method !== 'GET') {
    res.status(405).json({ ok: false, error: 'Method not allowed.' });
    return;
  }

  const limit = Math.min(Math.max(Number(req.query.limit || 24) || 24, 1), 50);

  try {
    const response = await fetch(
      SUPABASE_URL + '/functions/v1/cults-public-catalog?limit=' + encodeURIComponent(limit),
      {
        headers: {
          Authorization: 'Bearer ' + SUPABASE_ANON_JWT,
          apikey: SUPABASE_ANON_JWT,
          'User-Agent': 'CyberPop-Catalog-Proxy/1.0'
        }
      }
    );
    const payload = await response.json().catch(() => ({}));

    if (!response.ok || !payload?.ok || !Array.isArray(payload?.results)) {
      res.status(502).json({
        ok: false,
        configured: true,
        error: payload?.error || 'Cults catalog request failed.'
      });
      return;
    }

    res.status(200).json({
      ok: true,
      configured: true,
      source: 'supabase-edge',
      total: Number(payload.total || payload.results.length),
      results: payload.results.map(item => ({
        externalId: item.externalId || null,
        slug: item.slug || null,
        name: item.name || 'Untitled design',
        url: item.url || null,
        imageUrl: originalMediaUrl(item.imageUrl),
        publishedAt: item.publishedAt || null,
        updatedAt: item.updatedAt || null
      })).filter(item => item.url)
    });
  } catch (error) {
    res.status(502).json({
      ok: false,
      configured: true,
      error: 'Cults catalog connection failed.'
    });
  }
};
