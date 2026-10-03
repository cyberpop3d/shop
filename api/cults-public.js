const USERNAME = process.env.CULTS_USERNAME || 'CyberPOP';
const API_KEY = process.env.CULTS_API_KEY_ROTATED || process.env.CULTS_API_KEY || '';
const GRAPHQL_URL = 'https://cults3d.com/graphql';

function originalMediaUrl(url) {
  if (!url) return null;
  const marker = 'https://fbi.cults3d.com/';
  const index = String(url).indexOf(marker);
  return index >= 0 ? String(url).slice(index) : String(url);
}

function isVideoUrl(url) {
  return /(?:videos\.cults3d\.com|\.(?:mp4|webm|mov)(?:$|[?#]))/i.test(String(url || ''));
}

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
  res.setHeader('X-Robots-Tag', 'noindex');

  if (req.method !== 'GET') {
    res.status(405).json({ ok: false, error: 'Method not allowed.' });
    return;
  }

  if (!API_KEY) {
    res.status(503).json({ ok: false, configured: false, error: 'Cults catalog is not configured.' });
    return;
  }

  const limit = Math.min(Math.max(Number(req.query.limit || 50) || 50, 1), 50);
  const query = `
    query CyberpopPublicCatalog($limit: Int!) {
      myself {
        creationsBatch(limit: $limit, offset: 0, sort: BY_PUBLICATION) {
          total
          results {
            identifier
            slug
            name(locale: EN)
            url(locale: EN)
            illustrationImageUrl(version: LARGE)
            publishedAt
            updatedAt
            illustrations { position imageUrl(version: LARGE) }
          }
        }
      }
    }
  `;

  try {
    const auth = Buffer.from(USERNAME + ':' + API_KEY).toString('base64');
    const response = await fetch(GRAPHQL_URL, {
      method: 'POST',
      headers: {
        Authorization: 'Basic ' + auth,
        'Content-Type': 'application/json',
        'User-Agent': 'CyberPop-Public-Catalog/1.0'
      },
      body: JSON.stringify({ query, variables: { limit } })
    });
    const body = await response.json().catch(() => ({}));

    if (!response.ok || body.errors) {
      res.status(502).json({
        ok: false,
        configured: true,
        error: 'Cults catalog request failed.',
        details: body.errors?.map(error => ({ message: error.message })) || null
      });
      return;
    }

    const batch = body?.data?.myself?.creationsBatch;
    const results = Array.isArray(batch?.results) ? batch.results : [];

    res.status(200).json({
      ok: true,
      configured: true,
      total: Number(batch?.total || results.length),
      results: results.map(item => {
        const stills = (item.illustrations || [])
          .filter(image => image?.imageUrl && !isVideoUrl(image.imageUrl))
          .sort((a, b) => Number(a.position || 0) - Number(b.position || 0));
        const preferred = !isVideoUrl(item.illustrationImageUrl)
          ? item.illustrationImageUrl
          : stills[0]?.imageUrl || item.illustrationImageUrl || null;

        return {
          externalId: item.identifier,
          slug: item.slug,
          name: item.name || 'Untitled design',
          url: item.url,
          imageUrl: originalMediaUrl(preferred),
          publishedAt: item.publishedAt || null,
          updatedAt: item.updatedAt || null
        };
      }).filter(item => item.url)
    });
  } catch (error) {
    res.status(502).json({ ok: false, configured: true, error: 'Cults catalog connection failed.' });
  }
};
