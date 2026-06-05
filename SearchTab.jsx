// server/index.js
// Proxies all Pokemon TCG API calls server-side — no CORS issues in browser.
// Node 18+ built-in fetch is used; no node-fetch needed.

const express = require('express');
const NodeCache = require('node-cache');
const path = require('path');

const app = express();
const cache = new NodeCache({ checkperiod: 120 });

const TCG_BASE = 'https://api.pokemontcg.io/v2';
const API_KEY = process.env.POKEMON_TCG_API_KEY || '';

// Cache TTLs in seconds
const TTL = {
  sets:     86400,   // 24 hours
  setCards: 86400,   // 24 hours
  search:   600,     // 10 minutes
  trending: 1800,    // 30 minutes
};

// ── Core proxy helper ─────────────────────────────────────────────────────────
async function proxyTCG(apiPath, res, ttl) {
  const cacheKey = apiPath;

  const hit = cache.get(cacheKey);
  if (hit !== undefined) {
    console.log(`[CACHE HIT] ${apiPath}`);
    return res.json(hit);
  }

  try {
    const headers = { 'Content-Type': 'application/json' };
    if (API_KEY) headers['X-Api-Key'] = API_KEY;

    const url = `${TCG_BASE}${apiPath}`;
    console.log(`[FETCH] ${url}`);

    const resp = await fetch(url, { headers });

    if (!resp.ok) {
      const body = await resp.text().catch(() => '');
      throw new Error(`TCG API ${resp.status}: ${body.slice(0, 120)}`);
    }

    const data = await resp.json();
    cache.set(cacheKey, data, ttl);
    res.json(data);
  } catch (err) {
    console.error('API fetch failed:', err.message);
    res.status(502).json({ error: err.message });
  }
}

// ── API routes ────────────────────────────────────────────────────────────────

// GET /api/sets
app.get('/api/sets', (_req, res) => {
  proxyTCG('/sets?orderBy=-releaseDate&pageSize=250', res, TTL.sets);
});

// GET /api/cards/search?q=charizard
app.get('/api/cards/search', (req, res) => {
  const q = (req.query.q || '').trim();
  if (!q) return res.status(400).json({ error: 'Query parameter q is required.' });
  const encoded = encodeURIComponent(`name:"*${q}*"`);
  proxyTCG(`/cards?q=${encoded}&pageSize=24`, res, TTL.search);
});

// GET /api/cards/set/:setId
app.get('/api/cards/set/:setId', (req, res) => {
  const { setId } = req.params;
  if (!setId) return res.status(400).json({ error: 'setId is required.' });
  proxyTCG(`/cards?q=set.id:${setId}&orderBy=number&pageSize=250`, res, TTL.setCards);
});

// GET /api/trending?rarity=sir&q=
app.get('/api/trending', (req, res) => {
  const q      = (req.query.q      || '').trim();
  const rarity = (req.query.rarity || '').trim();

  let query;
  if (q) {
    query = `name:"*${q}*"`;
  } else if (rarity === 'sir')     query = 'rarity:"Special Illustration Rare"';
  else if (rarity === 'ir')        query = 'rarity:"Illustration Rare"';
  else if (rarity === 'hyper')     query = 'rarity:"Hyper Rare"';
  else if (rarity === 'fullart')   query = 'rarity:"Full Art"';
  else if (rarity === 'ultra')     query = 'rarity:"Ultra Rare"';
  else if (rarity === 'holo')      query = 'rarity:"Rare Holo"';
  else                             query = 'tcgplayer.prices.holofoil.market:[10 TO *]';

  proxyTCG(
    `/cards?q=${encodeURIComponent(query)}&orderBy=-tcgplayer.prices.holofoil.market&pageSize=50`,
    res,
    TTL.trending,
  );
});

// ── Serve built frontend in production ────────────────────────────────────────
if (process.env.NODE_ENV === 'production') {
  const distDir = path.join(__dirname, '..', 'dist');
  app.use(express.static(distDir));
  app.get('*', (_req, res) => res.sendFile(path.join(distDir, 'index.html')));
}

// ── Start ─────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`PickTCG API server → http://localhost:${PORT}`);
  if (!API_KEY) console.warn('[WARN] No POKEMON_TCG_API_KEY set — rate limits apply.');
});
