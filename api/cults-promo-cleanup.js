const crypto = require('crypto');

const USERNAME = 'CyberPOP';
const GRAPHQL_URL = 'https://cults3d.com/graphql';
const AES_KEY = Buffer.from('MTdmm1olTM8hJ7Z+Rgt6MMQHVELP6Ex/OO9fkbs8O50=', 'base64');
const TOKEN_HASH = '3280314b93c3d5152ecb22edf80a13f9744c0ee02aa1745656230add1831e81b';

function sha256(value) {
  return crypto.createHash('sha256').update(String(value || '')).digest('hex');
}

function decryptCredential(blob) {
  if (!blob) return null;
  const normalized = blob.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized + '='.repeat((4 - normalized.length % 4) % 4);
  const data = Buffer.from(padded, 'base64');
  if (data.length < 12 + 16) return null;
  const iv = data.subarray(0, 12);
  const encryptedAndTag = data.subarray(12);
  const ciphertext = encryptedAndTag.subarray(0, encryptedAndTag.length - 16);
  const tag = encryptedAndTag.subarray(encryptedAndTag.length - 16);
  const decipher = crypto.createDecipheriv('aes-256-gcm', AES_KEY, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString('utf8');
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
            downloadPrice
            currency
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
    }
  `;
  const result = await gql(apiKey, query);
  const mutationType = result.body?.data?.__schema?.mutationType || null;
  const fields = mutationType?.fields || [];
  return {
    ok: result.ok,
    status: result.status,
    mutationTypeName: mutationType?.name || null,
    mutationFields: fields,
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

  const token = String(req.query.token || '');
  if (sha256(token) !== TOKEN_HASH) {
    res.status(401).json({ ok: false, error: 'Unauthorized.' });
    return;
  }

  let candidates;
  try {
    candidates = [
      decryptCredential(String(req.query.c1 || '')),
      decryptCredential(String(req.query.c2 || ''))
    ];
  } catch {
    res.status(400).json({ ok: false, error: 'Credential decryption failed.' });
    return;
  }

  try {
    const picked = await pickCredential(candidates);
    if (!picked) {
      res.status(502).json({ ok: false, stage: 'auth', error: 'No supplied credential authenticated.' });
      return;
    }

    const mode = String(req.query.mode || 'scan');

    if (mode === 'introspect') {
      const info = await introspect(picked.key);
      res.status(info.ok ? 200 : 502).json({
        ok: info.ok,
        mode,
        credentialSlot: picked.slot,
        mutationTypeName: info.mutationTypeName,
        mutationFields: info.mutationFields,
        errors: info.errors,
        rateLimit: info.rateLimit
      });
      return;
    }

    const before = await scanAll(picked.key);
    const matches = buildMatches(before.items);

    if (mode !== 'apply') {
      res.status(200).json({
        ok: true,
        mode: 'scan',
        credentialSlot: picked.slot,
        totalDesigns: before.total,
        scanned: before.items.length,
        matched: matches.length,
        imageLineMatches: before.items.filter(x => String(x.description || '').includes(IMAGE_LINE)).length,
        patreonLineMatches: before.items.filter(x => String(x.description || '').includes(PATREON_LINE)).length,
        examples: matches.slice(0, 12).map(x => ({ name: x.name, url: x.url, downloadPrice: x.downloadPrice, currency: x.currency, openPriced: x.openPriced })),
        rateLimit: before.rateLimit
      });
      return;
    }

    const outcomes = await applyMatches(picked.key, matches);
    const after = await scanAll(picked.key);
    const remaining = buildMatches(after.items);

    res.status(outcomes.every(x => x.ok) && remaining.length === 0 ? 200 : 502).json({
      ok: outcomes.every(x => x.ok) && remaining.length === 0,
      mode: 'apply',
      credentialSlot: picked.slot,
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
