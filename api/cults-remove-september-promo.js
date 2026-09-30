function stripExactPromoBlock(text) {
  if (typeof text !== 'string') return text;
  const pattern = /(?:^|\r?\n)[ \t]*!\[GET ALL September DROPS\]\(https:\/\/i\.imgur\.com\/llN5uPY\.png\)[ \t]*\r?\n[ \t]*Patreon:[ \t]*\[link\]\(https:\/\/www\.patreon\.com\/cw\/CyberPop\)[ \t]*(?=\r?\n|$)/g;
  return text.replace(pattern, '\n').replace(/\n{3,}/g, '\n\n');
}

async function cultsRequest(username, apiKey, query, variables) {
  const auth = Buffer.from(username + ':' + apiKey).toString('base64');
  const response = await fetch('https://cults3d.com/graphql', {
    method: 'POST',
    headers: {
      'Authorization': 'Basic ' + auth,
      'Content-Type': 'application/json',
      'User-Agent': 'CyberPop-September-Promo-Cleanup/1.0'
    },
    body: JSON.stringify({ query, variables })
  });
  const body = await response.json().catch(() => ({}));
  return {
    ok: response.ok && !body.errors,
    status: response.status,
    body,
    rateLimit: {
      limit: response.headers.get('x-ratelimit-limit'),
      remaining: response.headers.get('x-ratelimit-remaining'),
      reset: response.headers.get('x-ratelimit-reset')
    }
  };
}

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'GET') {
    res.status(405).json({ ok: false, error: 'Method not allowed' });
    return;
  }

  const username = 'CyberPOP';
  const apiKey = process.env.CULTS_API_KEY_ROTATED;
  if (!apiKey) {
    res.status(503).json({ ok: false, error: 'Cults credential is not configured.' });
    return;
  }

  const limit = Math.min(Math.max(Number(req.query.limit || 20) || 20, 1), 20);
  const offset = Math.max(Number(req.query.offset || 0) || 0, 0);
  const apply = req.query.confirm === 'REMOVE_EXACT_SEPTEMBER_PROMO_2026';

  const listQuery = `
    query SeptemberPromoCleanupBatch($limit: Int!, $offset: Int!) {
      myself {
        creationsBatch(limit: $limit, offset: $offset, sort: BY_PUBLICATION) {
          total
          results {
            id
            identifier
            slug
            name(locale: EN)
            description(locale: EN)
            url(locale: EN)
          }
        }
      }
    }
  `;

  try {
    const snapshot = await cultsRequest(username, apiKey, listQuery, { limit, offset });
    if (!snapshot.ok) {
      res.status(502).json({
        ok: false,
        stage: 'snapshot',
        status: snapshot.status,
        errors: snapshot.body && snapshot.body.errors ? snapshot.body.errors : snapshot.body
      });
      return;
    }

    const batch = snapshot.body?.data?.myself?.creationsBatch;
    const results = Array.isArray(batch?.results) ? batch.results : [];
    const matches = results.map(item => {
      const before = item.description || '';
      const after = stripExactPromoBlock(before);
      return {
        id: item.id,
        identifier: item.identifier,
        slug: item.slug,
        name: item.name,
        url: item.url,
        changed: after !== before,
        after
      };
    }).filter(item => item.changed);

    if (!apply || matches.length === 0) {
      res.status(200).json({
        ok: true,
        applied: false,
        total: Number(batch?.total || results.length),
        offset,
        limit,
        scanned: results.length,
        matched: matches.length,
        items: matches.map(({ id, identifier, slug, name, url }) => ({ id, identifier, slug, name, url })),
        rateLimit: snapshot.rateLimit
      });
      return;
    }

    const fields = matches.map((item, index) => {
      return `u${index}: updateCreation(id: ${JSON.stringify(item.id)}, description: ${JSON.stringify(item.after)}, locale: EN) { creation { id url(locale: EN) } errors }`;
    }).join('\n');

    const mutation = `mutation SeptemberPromoCleanup {\n${fields}\n}`;
    const updated = await cultsRequest(username, apiKey, mutation, {});

    if (!updated.ok) {
      res.status(502).json({
        ok: false,
        stage: 'update',
        offset,
        matched: matches.length,
        status: updated.status,
        errors: updated.body && updated.body.errors ? updated.body.errors : updated.body,
        rateLimit: updated.rateLimit
      });
      return;
    }

    const data = updated.body?.data || {};
    const items = matches.map((item, index) => ({
      name: item.name,
      slug: item.slug,
      url: item.url,
      result: data['u' + index] || null
    }));

    res.status(200).json({
      ok: true,
      applied: true,
      total: Number(batch?.total || results.length),
      offset,
      limit,
      scanned: results.length,
      matched: matches.length,
      items,
      rateLimit: updated.rateLimit
    });
  } catch (error) {
    res.status(500).json({ ok: false, error: error && error.message ? error.message : 'Unexpected cleanup failure.' });
  }
};
