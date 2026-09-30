module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'GET') {
    res.status(405).json({ ok: false, error: 'Method not allowed' });
    return;
  }

  if (String(req.query.token || '') !== 'cp-bridge-f36a7ca5-1b48-4a3e-9589-7b77fd1a7ef0') {
    res.status(401).json({ ok: false, error: 'Unauthorized' });
    return;
  }

  try {
    const upstream = await fetch(
      'https://wdtbanucnxnwbruwcgmv.supabase.co/functions/v1/cults-promo-cleanup-once?token=cp-7f19a6d4-9d11-4c1a-bd35-4a908c45d79e',
      { method: 'GET', headers: { 'User-Agent': 'CyberPOP-cleanup-bridge/1.0' } }
    );

    const text = await upstream.text();
    res.status(upstream.status);
    res.setHeader('Content-Type', upstream.headers.get('content-type') || 'application/json');
    res.send(text);
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: error instanceof Error ? error.message : String(error),
    });
  }
};