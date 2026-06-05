// src/components/HomeTab.jsx
import { useState, useEffect } from 'react';
import { fetchTrending } from '../api.js';
import { getBestPrice, fmtFull } from '../utils.js';
import { Loader, ErrorBox, SkeletonRow } from './ui/index.jsx';
import { TrendRow, CardDetail } from './CardComponents.jsx';

export default function HomeTab({ watchlist, onWatch, portfolioValue, onTabChange }) {
  const [trending, setTrending]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [openCard, setOpenCard]   = useState(null);

  useEffect(() => {
    fetchTrending()
      .then(setTrending)
      .catch(err => {
        console.error('API fetch failed:', err);
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, []);

  if (openCard) {
    return (
      <CardDetail
        card={openCard}
        onClose={() => setOpenCard(null)}
        inWatch={watchlist.some(c => c.id === openCard.id)}
        onWatch={onWatch}
      />
    );
  }

  return (
    <div className="fade">
      {/* Portfolio banner */}
      {watchlist.length > 0 && (
        <div style={{ background:'linear-gradient(135deg,#0d1a14,#0a1210)', border:'1px solid #1e3528',
          borderRadius:14, padding:16, marginBottom:16 }}>
          <div style={{ fontSize:9, color:'#00e5a066', letterSpacing:3, marginBottom:4 }}>MY PORTFOLIO</div>
          <div style={{ fontFamily:'monospace', fontSize:28, fontWeight:700, color:'#fff', marginBottom:4 }}>
            {portfolioValue >= 1000 ? '$' + (portfolioValue / 1000).toFixed(2) + 'K' : fmtFull(portfolioValue)}
          </div>
          <div style={{ display:'flex', gap:16, fontSize:10 }}>
            <span style={{ color:'#00e5a0' }}>
              {watchlist.filter(c => getBestPrice(c)).length} priced cards
            </span>
            <button onClick={() => onTabChange('portfolio')} style={{ color:'#00e5a0', fontSize:10, padding:0 }}>
              View Portfolio →
            </button>
          </div>
        </div>
      )}

      {/* Trending Today */}
      <div style={{ marginBottom:16 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
          <div style={{ fontSize:16, fontWeight:700, color:'#e8e8f0' }}>Trending Today</div>
          <button onClick={() => onTabChange('rankings')} style={{ fontSize:11, color:'#00e5a0', padding:0 }}>
            View All →
          </button>
        </div>

        {loading && [1,2,3,4].map(i => <SkeletonRow key={i} />)}
        {error && (
          <ErrorBox msg={`Trending unavailable: ${error}`} />
        )}
        {!loading && !error && trending.slice(0, 8).map(card => (
          <TrendRow
            key={card.id}
            card={card}
            onClick={() => setOpenCard(card)}
            inWatch={watchlist.some(c => c.id === card.id)}
            onWatch={onWatch}
          />
        ))}
      </div>

      {/* Quick links — always shown even if trending fails */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
        {[
          ['🃏 Browse Sets',   'sets'],
          ['🔍 Search Cards',  'search'],
          ['📊 Rankings',      'rankings'],
          ['⭐ Portfolio',     'portfolio'],
        ].map(([label, tabId]) => (
          <button key={tabId} onClick={() => onTabChange(tabId)}
            style={{ background:'#131320', border:'1px solid #1e1e35', borderRadius:12, padding:'14px 12px',
              textAlign:'left', color:'#888', fontSize:12, fontWeight:600, transition:'all 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor='#00e5a044'; e.currentTarget.style.color='#e8e8f0'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor='#1e1e35';   e.currentTarget.style.color='#888'; }}>
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
