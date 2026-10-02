const USERNAME = process.env.CULTS_USERNAME || 'CyberPOP';
const GRAPHQL_URL = 'https://cults3d.com/graphql';
const API_KEY = process.env.CULTS_API_KEY_ROTATED || process.env.CULTS_API_KEY || '';
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://wdtbanucnxnwbruwcgmv.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_pKtNNmvdA3__Eh0KZnb2FA_3saYRIp1';

async function requireAdmin(req) {
  const authHeader = String(req.headers.authorization || '');
  const accessToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
  if (!accessToken) return { ok: false, status: 401, error: 'Admin sign-in required.' };

  try {
    const userResponse = await fetch(SUPABASE_URL + '/auth/v1/user', {
      headers: {
        Authorization: 'Bearer ' + accessToken,
        apikey: SUPABASE_PUBLISHABLE_KEY
      }
    });
    const user = await userResponse.json().catch(() => null);
    if (!userResponse.ok || !user?.id) {
      return { ok: false, status: 401, error: 'Invalid admin session.' };
    }

    const adminResponse = await fetch(
      SUPABASE_URL + '/rest/v1/sales_admin_users?select=user_id&user_id=eq.' + encodeURIComponent(user.id),
      {
        headers: {
          Authorization: 'Bearer ' + accessToken,
          apikey: SUPABASE_PUBLISHABLE_KEY
        }
      }
    );
    const rows = await adminResponse.json().catch(() => []);
    if (!adminResponse.ok || !Array.isArray(rows) || rows.length === 0) {
      return { ok: false, status: 403, error: 'Admin authorization required.' };
    }
    return { ok: true };
  } catch {
    return { ok: false, status: 401, error: 'Could not validate admin session.' };
  }
}

async function gql(apiKey, query, variables = {}) {
  const auth = Buffer.from(USERNAME + ':' + apiKey).toString('base64');
  const response = await fetch(GRAPHQL_URL, {
    method: 'POST',
    headers: {
      'Authorization': 'Basic ' + auth,
      'Content-Type': 'application/json',
      'User-Agent': 'CyberPop-Promo-Cleanup/1.0'
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

async function pickCredential(candidates) {
  const probe = `query Probe { myself { creationsBatch(limit: 1, offset: 0) { total results { id name(locale: EN) } } } }`;
  for (let i = 0; i < candidates.length; i++) {
    const key = candidates[i];
    if (!key) continue;
    const result = await gql(key, probe);
    if (result.ok && result.body?.data?.myself?.creationsBatch) {
      return { key, slot: i + 1, rateLimit: result.rateLimit };
    }
  }
  return null;
}

async function scanAll(apiKey) {
  const query = `
    query Scan($limit: Int!, $offset: Int!) {
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
            price { cents currency formatted value }
            openPriced
          }
        }
      }
    }
  `;
  const all = [];
  let offset = 0;
  const limit = 50;
  let total = 0;
  let rateLimit = null;

  do {
    const result = await gql(apiKey, query, { limit, offset });
    if (!result.ok) {
      throw new Error('Scan failed: ' + JSON.stringify(result.body?.errors || result.body));
    }
    rateLimit = result.rateLimit;
    const batch = result.body?.data?.myself?.creationsBatch;
    const rows = Array.isArray(batch?.results) ? batch.results : [];
    total = Number(batch?.total || rows.length);
    all.push(...rows);
    offset += rows.length;
    if (rows.length === 0) break;
  } while (offset < total);

  return { total, items: all, rateLimit };
}

const IMAGE_LINE = '![GET ALL September DROPS](https://i.imgur.com/llN5uPY.png)';
const PATREON_LINE = 'Patreon: [link](https://www.patreon.com/cw/CyberPop)';

function cleanDescription(text) {
  if (typeof text !== 'string') return text;
  if (!text.includes(IMAGE_LINE) && !text.includes(PATREON_LINE)) return text;
  const newline = text.includes('\r\n') ? '\r\n' : '\n';
  const lines = text.split(/\r?\n/);
  const filtered = lines.filter(line => {
    const trimmed = line.trim();
    return trimmed !== IMAGE_LINE && trimmed !== PATREON_LINE;
  });
  let out = filtered.join(newline);
  const triple = newline === '\r\n' ? /(?:\r\n){3,}/g : /\n{3,}/g;
  out = out.replace(triple, newline + newline);
  out = out.replace(newline === '\r\n' ? /^(?:\r\n)+/ : /^\n+/, '');
  return out;
}

function buildMatches(items) {
  return items.map(item => {
    const before = typeof item.description === 'string' ? item.description : '';
    const after = cleanDescription(before);
    return { ...item, before, after, changed: before !== after };
  }).filter(item => item.changed);
}

async function introspect(apiKey) {
  const query = `
    query MutationInfo {
      __schema {
        mutationType {
          name
          fields {
            name
            args {
              name
              type { kind name ofType { kind name ofType { kind name } } }
            }
            type { kind name ofType { kind name } }
          }
        }
      }
      creationType: __type(name: "Creation") {
        fields {
          name
          type { kind name ofType { kind name ofType { kind name } } }
        }
      }
      moneyType: __type(name: "Money") {
        fields {
          name
          type { kind name ofType { kind name ofType { kind name } } }
        }
      }
      discountType: __type(name: "Discount") {
        fields {
          name
          type { kind name ofType { kind name ofType { kind name } } }
        }
      }
    }
  `;
  const result = await gql(apiKey, query);
  const mutationType = result.body?.data?.__schema?.mutationType || null;
  const fields = mutationType?.fields || [];
  const creationFields = result.body?.data?.creationType?.fields || [];
  const moneyFields = result.body?.data?.moneyType?.fields || [];
  const discountFields = result.body?.data?.discountType?.fields || [];
  return {
    ok: result.ok,
    status: result.status,
    mutationTypeName: mutationType?.name || null,
    mutationFields: fields,
    creationPricingFields: creationFields.filter(field => /price|curr|open|discount|promo|sale/i.test(field.name)),
    moneyFields,
    discountFields,
    errors: result.body?.errors || null,
    rateLimit: result.rateLimit
  };
}

async function applyMatches(apiKey, matches) {
  const outcomes = [];
  const batchSize = 5;

  for (let start = 0; start < matches.length; start += batchSize) {
    const chunk = matches.slice(start, start + batchSize);
    const fields = chunk.map((item, index) =>
      `u${index}: updateCreation(id: ${JSON.stringify(item.id)}, description: ${JSON.stringify(item.after)}, locale: EN) { creation { id } errors }`
    ).join('\n');

    const mutation = `mutation Cleanup {\n${fields}\n}`;
    const result = await gql(apiKey, mutation);
    const aliasResults = result.body?.data || {};
    const aliasErrors = Object.entries(aliasResults)
      .filter(([, value]) => value && Array.isArray(value.errors) && value.errors.length)
      .map(([alias, value]) => ({ alias, errors: value.errors }));

    outcomes.push({
      start,
      count: chunk.length,
      ok: result.ok && aliasErrors.length === 0,
      graphqlErrors: result.body?.errors || null,
      aliasErrors,
      rateLimit: result.rateLimit
    });

    if (!result.ok || aliasErrors.length) break;
  }

  return outcomes;
}

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Robots-Tag', 'noindex');

  if (req.method !== 'GET') {
    res.status(405).json({ ok: false, error: 'Method not allowed.' });
    return;
  }

  const admin = await requireAdmin(req);
  if (!admin.ok) {
    res.status(admin.status).json({ ok: false, error: admin.error });
    return;
  }

  if (!API_KEY) {
    res.status(503).json({
      ok: false,
      configured: false,
      error: 'The rotated Cults API credential is not configured.'
    });
    return;
  }

  try {
    const mode = String(req.query.mode || 'scan');

    if (mode === 'introspect') {
      const info = await introspect(API_KEY);
      res.status(info.ok ? 200 : 502).json({
        ok: info.ok,
        mode,
        credentialSource: 'server-env',
        mutationTypeName: info.mutationTypeName,
        mutationFields: info.mutationFields,
        creationPricingFields: info.creationPricingFields,
        moneyFields: info.moneyFields,
        discountFields: info.discountFields,
        errors: info.errors,
        rateLimit: info.rateLimit
      });
      return;
    }

    const before = await scanAll(API_KEY);
    const matches = buildMatches(before.items);

    if (mode !== 'apply') {
      res.status(200).json({
        ok: true,
        mode: 'scan',
        credentialSource: 'server-env',
        totalDesigns: before.total,
        scanned: before.items.length,
        matched: matches.length,
        imageLineMatches: before.items.filter(x => String(x.description || '').includes(IMAGE_LINE)).length,
        patreonLineMatches: before.items.filter(x => String(x.description || '').includes(PATREON_LINE)).length,
        examples: matches.slice(0, 12).map(x => ({ name: x.name, url: x.url, price: x.price, openPriced: x.openPriced })),
        rateLimit: before.rateLimit
      });
      return;
    }

    const outcomes = await applyMatches(API_KEY, matches);
    const after = await scanAll(API_KEY);
    const remaining = buildMatches(after.items);

    res.status(outcomes.every(x => x.ok) && remaining.length === 0 ? 200 : 502).json({
      ok: outcomes.every(x => x.ok) && remaining.length === 0,
      mode: 'apply',
      credentialSource: 'server-env',
      beforeMatched: matches.length,
      attemptedUpdates: outcomes.reduce((sum, x) => sum + (x.ok ? x.count : 0), 0),
      batches: outcomes,
      remainingMatched: remaining.length,
      remaining: remaining.slice(0, 20).map(x => ({ name: x.name, url: x.url })),
      rateLimit: after.rateLimit
    });
  } catch (error) {
    res.status(500).json({ ok: false, error: error?.message || 'Unexpected cleanup error.' });
  }
};
