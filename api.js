// src/components/SetsTab.jsx
import { useState, useEffect, useCallback } from 'react';
import { fetchSets, fetchCardsBySet } from '../api.js';
import { getBestPrice, fmt, fmtDate } from '../utils.js';
import { Loader, ErrorBox, SkeletonCard } from './ui/index.jsx';
import { SetImg } from './ui/index.jsx';
import { CardThumb, CardDetail } from './CardComponents.jsx';

function SetCard({ set, onClick }) {
  return (
    <button onClick={onClick}
      style={{ background:'#131320', border:'1px solid #1e1e35', borderRadius:12, padding:0,
        overflow:'hidden', display:'flex', flexDirection:'column', width:'100%',
        textAlign:'left', transition:'all 0.15s' }}
      onMouseEnter={e => { e.currentTarget.style.borderColor='#2a2a4a'; e.currentTarget.style.transform='translateY(-2px)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor='#1e1e35'; e.currentTarget.style.transform='translateY(0)'; }}
    >
      <div style={{ width:'100%', aspectRatio:'16/9', background:'#08080e',
        display:'flex', alignItems:'center', justifyContent:'center', padding:14, flexShrink:0 }}>
        <SetImg set={set} style={{ maxWidth:'100%', maxHeight:'100%' }} />
      </div>
      <div style={{ padding:'9px 10px 11px', borderTop:'1px solid #0d0d18' }}>
        <div style={{ fontSize:12, fontWeight:700, color:'#e8e8f0', lineHeight:1.3, marginBottom:2 }}>{set.name}</div>
        <div style={{ fontSize:9, color:'#3a3a5a' }}>
          {fmtDate(set.releaseDate)} · {set.printedTotal || set.total} cards
        </div>
      </div>
    </button>
  );
}

function SetDetail({ set, onBack, watchlist, onWatch }) {
  const [cards, setCards]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [search, setSearch]   = useState('');
  const [sort, setSort]       = useState('number');
  const [openCard, setOpenCard] = useState(null);

  const load = useCallback(() => {
    setLoading(true); setError(null);
    fetchCardsBySet(set.id)
      .then(setCards)
      .catch(err => { console.error('API fetch failed:', err); setError(err.message); })
      .finally(() => setLoading(false));
  }, [set.id]);

  useEffect(() => { load(); }, [load]);

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

  const filtered = cards.filter(c => !search || c.name.toLowerCase().includes(search.toLowerCase()));
  const sorted   = [...filtered].sort((a, b) =>
    sort === 'price'
      ? (getBestPrice(b)?.price || 0) - (getBestPrice(a)?.price || 0)
      : parseInt(a.number || '999') - parseInt(b.number || '999'),
  );
  const total = cards.reduce((s, c) => s + (getBestPrice(c)?.price || 0), 0);

  return (
    <div className="fade">
      <button onClick={onBack} style={{ color:'#555', fontSize:12, marginBottom:14, display:'block', padding:0 }}>
        ← All Sets
      </button>

      {/* Set header */}
      <div style={{ background:'#131320', borderRadius:14, border:'1px solid #1e1e35', overflow:'hidden', marginBottom:14 }}>
        <div style={{ background:'#08080e', padding:20, display:'flex', alignItems:'center', justifyContent:'space-between', minHeight:72 }}>
          <SetImg set={set} style={{ maxWidth:160, maxHeight:48 }} />
          {total > 0 && (
            <div style={{ textAlign:'right' }}>
              <div style={{ fontSize:8, color:'#3a3a5a', letterSpacing:1, marginBottom:2 }}>SET VALUE</div>
              <div style={{ fontFamily:'monospace', fontSize:15, fontWeight:700, color:'#ffd166' }}>{fmt(total)}</div>
            </div>
          )}
        </div>
        <div style={{ padding:'10px 14px 14px' }}>
          <div style={{ fontSize:17, fontWeight:700, color:'#fff', marginBottom:3 }}>{set.name}</div>
          <div style={{ fontSize:10, color:'#444', marginBottom:6 }}>{fmtDate(set.releaseDate)}</div>
          <div style={{ display:'flex', gap:16, fontSize:10 }}>
            <span><span style={{ color:'#3a3a5a' }}>SERIES </span><span style={{ color:'#888' }}>{set.series}</span></span>
            <span><span style={{ color:'#3a3a5a' }}>CARDS </span><span style={{ color:'#888' }}>{set.printedTotal || set.total}</span></span>
          </div>
        </div>
      </div>

      {loading && (
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
          {[1,2,3,4,5,6].map(i => <SkeletonCard key={i} />)}
        </div>
      )}
      {error && <ErrorBox msg={error} onRetry={load} />}

      {!loading && !error && (
        <>
          <div style={{ display:'flex', gap:8, marginBottom:10 }}>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Find a card..."
              style={{ flex:1 }}
            />
          </div>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
            <div style={{ fontSize:9, color:'#3a3a5a', letterSpacing:1 }}>{sorted.length} CARDS</div>
            <div style={{ display:'flex', gap:6 }}>
              {[['number','#'],['price','Price']].map(([v, l]) => (
                <button key={v} onClick={() => setSort(v)}
                  style={{ padding:'4px 12px', borderRadius:12,
                    border: `1px solid ${sort === v ? '#00e5a0' : '#252545'}`,
                    background: sort === v ? '#00e5a022' : 'transparent',
                    color: sort === v ? '#00e5a0' : '#555', fontSize:10 }}>
                  {l}
                </button>
              ))}
            </div>
          </div>
          {sorted.length > 0 ? (
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
              {sorted.map(card => (
                <CardThumb
                  key={card.id} card={card}
                  onClick={() => setOpenCard(card)}
                  inWatch={watchlist.some(c => c.id === card.id)}
                  onWatch={onWatch}
                />
              ))}
            </div>
          ) : (
            <div style={{ textAlign:'center', color:'#3a3a5a', fontSize:13, padding:32 }}>No cards found.</div>
          )}
        </>
      )}
    </div>
  );
}

export default function SetsTab({ watchlist, onWatch }) {
  const [sets, setSets]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [search, setSearch]   = useState('');
  const [openSet, setOpenSet] = useState(null);

  const load = useCallback(() => {
    setLoading(true); setError(null);
    fetchSets()
      .then(setSets)
      .catch(err => { console.error('API fetch failed:', err); setError(err.message); })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  if (openSet) {
    return <SetDetail set={openSet} onBack={() => setOpenSet(null)} watchlist={watchlist} onWatch={onWatch} />;
  }
  if (loading) return <Loader msg="FETCHING SETS..." />;
  if (error)   return <ErrorBox msg={error} onRetry={load} />;

  const filtered = sets.filter(s =>
    !search || s.name.toLowerCase().includes(search.toLowerCase())
            || s.series.toLowerCase().includes(search.toLowerCase()),
  );
  const groups = filtered.reduce((acc, s) => {
    (acc[s.series] = acc[s.series] || []).push(s);
    return acc;
  }, {});

  return (
    <div className="fade">
      <input
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Find a set or series..."
        style={{ marginBottom:14 }}
      />
      {filtered.length === 0 && (
        <div style={{ textAlign:'center', color:'#3a3a5a', padding:'40px 0', fontSize:13 }}>No sets found.</div>
      )}
      {Object.entries(groups).map(([series, ss]) => (
        <div key={series} style={{ marginBottom:24 }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:12 }}>
            <div style={{ height:1, flex:1, background:'#1e1e35' }} />
            <span style={{ fontSize:9, color:'#3a3a5a', letterSpacing:3, textTransform:'uppercase', whiteSpace:'nowrap', padding:'0 6px' }}>
              {series}
            </span>
            <div style={{ height:1, flex:1, background:'#1e1e35' }} />
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
            {ss.map(set => <SetCard key={set.id} set={set} onClick={() => setOpenSet(set)} />)}
          </div>
        </div>
      ))}
    </div>
  );
}
