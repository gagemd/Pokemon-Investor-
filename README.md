# PickTCG – Pokémon Investment Tracker

A Vite + React frontend with an Express proxy backend.  
All Pokémon TCG API calls go through the Express server — no CORS issues in any browser.

---

## Quick start

```bash
npm install
npm run dev
```

Opens:
- **Frontend** → http://localhost:5173
- **API server** → http://localhost:3001

---

## Project structure

```
pokemon-investor/
├── server/
│   └── index.js          # Express proxy + caching
├── src/
│   ├── main.jsx           # React entry
│   ├── App.jsx            # Tabs + state
│   ├── api.js             # Frontend → /api/* calls
│   ├── utils.js           # Price helpers + scoring
│   ├── index.css
│   └── components/
│       ├── ui/index.jsx   # Loader, ErrorBox, SkeletonCard, CardImg, SetImg
│       ├── CardComponents.jsx  # CardThumb, TrendRow, CardDetail
│       ├── HomeTab.jsx
│       ├── SetsTab.jsx
│       ├── SearchTab.jsx
│       ├── RankingsTab.jsx
│       └── PortfolioTab.jsx
├── index.html
├── vite.config.js
└── package.json
```

---

## API routes (backend)

| Route | Cache | Description |
|---|---|---|
| `GET /api/sets` | 24 hours | All sets, newest first |
| `GET /api/cards/set/:setId` | 24 hours | All cards in a set |
| `GET /api/cards/search?q=` | 10 min | Card name search |
| `GET /api/trending?rarity=&q=` | 30 min | Top-priced cards |

---

## Optional: add an API key

A free key from https://dev.pokemontcg.io/ removes rate limits.

```bash
cp .env.example .env
# Edit .env and add your key
```

---

## Deploy to production

```bash
npm run build        # builds frontend to /dist
npm start            # serves dist + API on PORT (default 3001)
```

Set `NODE_ENV=production` and `PORT=` in your hosting environment.

Works on: Railway, Render, Fly.io, any Node.js host.
