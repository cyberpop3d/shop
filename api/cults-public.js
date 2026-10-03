const USERNAME = process.env.CULTS_USERNAME || 'CyberPOP';
const API_KEY = process.env.CULTS_API_KEY_ROTATED || process.env.CULTS_API_KEY || '';
const GRAPHQL_URL = 'https://cults3d.com/graphql';
const PROFILE_URL = 'https://cults3d.com/en/users/' + encodeURIComponent(USERNAME) + '/3d-models?from=user_creations&only_no_ai=true&user_nick=' + encodeURIComponent(USERNAME);

function originalMediaUrl(url) {
  if (!url) return null;
  const marker = 'https://fbi.cults3d.com/';
  const index = String(url).indexOf(marker);
  return index >= 0 ? String(url).slice(index) : String(url);
}

function isVideoUrl(url) {
  return /(?:videos\.cults3d\.com|\.(?:mp4|webm|mov)(?:$|[?#]))/i.test(String(url || ''));
}

function decodeHtml(value) {
  return String(value || '')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)));
}

function metaContent(html, key, attr = 'property') {
  const escaped = key.replace(/[.*+?^$()|[\]\\]/g, '\\$&');
  const first = new RegExp('<meta[^>]+(?:' + attr + ')=["\\\']' + escaped + '["\\\'][^>]+content=["\\\']([^"\\\']+)["\\\']', 'i');
  const second = new RegExp('<meta[^>]+content=["\\\']([^"\\\']+)["\\\'][^>]+(?:' + attr + ')=["\\\']' + escaped + '["\\\']', 'i');
  return decodeHtml(html.match(first)?.[1] || html.match(second)?.[1] || '');
}

function publishedAtFromHtml(html) {
  return metaContent(html, 'article:published_time') ||
    decodeHtml(html.match(/"datePublished"\s*:\s*"([^"]+)"/i)?.[1] || '') ||
    decodeHtml(html.match(/<time[^>]+datetime=["']([^"']+)["']/i)?.[1] || '') ||
    null;
}

function productLinksFromProfile(html, limit) {
  const links = [];
  const seen = new Set();
  const re = /href=["']((?:https:\/\/cults3d\.com)?\/en\/3d-model\/[^"'?#]+)(?:[^"']*)["']/gi;
  let match;
  while ((match = re.exec(html)) && links.length < limit) {
    const url = match[1].startsWith('http') ? match[1] : 'https://cults3d.com' + match[1];
    if (seen.has(url)) continue;
    seen.add(url);
    links.push(url);
  }
  return links;
}

async function fetchProductCard(url) {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'CyberPop-Public-Catalog/1.0',
        'Accept-Language': 'en'
      }
    });
    if (!response.ok) return null;
    const html = await response.text();
    const ogUrl = metaContent(html, 'og:url') || url;
    const title = metaContent(html, 'og:title') || metaContent(html, 'twitter:title', 'name');
    const image = metaContent(html, 'og:image') || metaContent(html, 'twitter:image', 'name');
    const slug = new URL(ogUrl).pathname.split('/').filter(Boolean).pop() || null;
    return {
      externalId: slug,
      slug,
      name: title ? title.replace(/\s*[・|—-]\s*Cults.*$/i, '').trim() : slug,
      url: ogUrl,
      imageUrl: originalMediaUrl(image) || null,
      publishedAt: publishedAtFromHtml(html),
      updatedAt: null
    };
  } catch {
    return null;
  }
}

async function scrapePublicCatalog(limit) {
  const response = await fetch(PROFILE_URL, {
    headers: {
      'User-Agent': 'CyberPop-Public-Catalog/1.0',
      'Accept-Language': 'en'
    }
  });
  if (!response.ok) throw new Error('Cults public profile request failed.');
  const html = await response.text();
  const links = productLinksFromProfile(html, limit);
  if (!links.length) throw new Error('No Cults design links were found on the public profile.');

  const results = (await Promise.all(links.map(fetchProductCard))).filter(item => item?.url);
  if (!results.length) throw new Error('Cults design pages could not be read.');
  return results;
}

async function fetchGraphqlCatalog(limit) {
  const query = \`
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
  \`;

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
  if (!response.ok || body.errors) throw new Error('Cults API request failed.');

  const batch = body?.data?.myself?.creationsBatch;
  const results = Array.isArray(batch?.results) ? batch.results : [];
  return {
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
  };
}

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'public, s-maxage=120, stale-while-revalidate=600');
  res.setHeader('X-Robots-Tag', 'noindex');

  if (req.method !== 'GET') {
    res.status(405).json({ ok: false, error: 'Method not allowed.' });
    return;
  }

  const limit = Math.min(Math.max(Number(req.query.limit || 24) || 24, 1), 50);

  try {
    if (API_KEY) {
      const catalog = await fetchGraphqlCatalog(limit);
      res.status(200).json({
        ok: true,
        configured: true,
        source: 'graphql',
        total: catalog.total,
        results: catalog.results
      });
      return;
    }

    const results = await scrapePublicCatalog(limit);
    res.status(200).json({
      ok: true,
      configured: false,
      source: 'public-profile',
      total: results.length,
      results
    });
  } catch (error) {
    res.status(502).json({
      ok: false,
      configured: Boolean(API_KEY),
      error: error?.message || 'Cults catalog connection failed.'
    });
  }
};
