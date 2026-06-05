// src/components/PortfolioTab.jsx
import { useState } from 'react';
import { getBestPrice, calcScore, SCORE_COLOR, SCORE_LABEL, fmtFull, fmt } from '../utils.js';
import { CardImg } from './ui/index.jsx';
import { CardDetail } from './CardComponents.jsx';

export function PortfolioTab({ watchlist, onWatch }) {
  const [openCard, setOpenCard] = useState(null);
  const [sort, setSort]         = useState('value');

  if (openCard) {
    return (
      <CardDetail
        card={openCard}
        onClose={() => setOpenCard(null)}
        inWatch={true}
        onWatch={onWatch}
      />
    );
  }

  if (!watchlist.length) {
    return (
      <div style={{ textAlign:'center', padding:'60px 16px', color:'#3a3a5a', fontSize:13, lineHeight:2.2 }}>
        Your portfolio is empty.<br />
        Tap + on any card to add it.<br />
        <span style={{ color:'#252545' }}>Search cards, browse sets, or check Rankings.</span>
      </div>
    );
  }

  const priced  = watchlist.filter(c => getBestPrice(c) != null);
  const total   = priced.reduce((s, c) => s + (getBestPrice(c)?.price || 0), 0);
  const avg     = priced.length > 0 ? total / priced.length : 0;

  const sorted = [...watchlist].sort((a, b) => {
    if (sort === 'value') return (getBestPrice(b)?.price || 0) - (getBestPrice(a)?.price || 0);
    if (sort === 'score') return calcScore(b) - calcScore(a);
    return (a.name || '').localeCompare(b.name || '');
  });

  return (
    <div className="fade">
      {/* Portfolio header */}
      <div style={{ background:'linear-gradient(135deg,#0d1a14,#0a1210)', border:'1px solid #1e3528',
        borderRadius:14, padding:20, marginBottom:16 }}>
        <div style={{ fontSize:9, color:'#00e5a066', letterSpacing:3, marginBottom:6 }}>MY PORTFOLIO</div>
        <div style={{ fontFamily:'monospace', fontSize:32, fontWeight:700, color:'#fff', marginBottom:12 }}>
          {total >= 1000 ? '$' + (total / 1000).toFixed(2) + 'K' : fmtFull(total)}
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8 }}>
          {[
            [watchlist.length,        'TOTAL CARDS', '#e8e8f0'],
            [priced.length,           'WITH PRICE',  '#00e5a0'],
            [avg > 0 ? fmtFull(avg) : '—', 'AVG VALUE', '#ffd166'],
          ].map(([val, lbl, cl]) => (
            <div key={lbl} style={{ background:'#ffffff0a', borderRadius:8, padding:'8px 10px', textAlign:'center' }}>
              <div style={{ fontFamily:'monospace', fontSize: typeof val === 'string' && val.length > 6 ? 13 : 18,
                fontWeight:700, color:cl, marginBottom:2 }}>
                {val}
              </div>
              <div style={{ fontSize:8, color:'#3a3a5a', letterSpacing:1 }}>{lbl}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Sort + count */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
        <div style={{ fontSize:14, fontWeight:700, color:'#e8e8f0' }}>My Cards</div>
        <div style={{ display:'flex', gap:5 }}>
          {[['value','Value'],['score','Score'],['name','A–Z']].map(([v, l]) => (
            <button key={v} onClick={() => setSort(v)}
              style={{ padding:'3px 9px', borderRadius:10,
                border: `1px solid ${sort === v ? '#00e5a0' : '#252545'}`,
                background: sort === v ? '#00e5a022' : 'transparent',
                color: sort === v ? '#00e5a0' : '#555', fontSize:9 }}>
              {l}
            </button>
          ))}
        </div>
      </div>

      {sorted.map(card => {
        const price = getBestPrice(card);
        const score = calcScore(card);
        const cl    = SCORE_COLOR(score);

        return (
          <button key={card.id}
            onClick={() => setOpenCard(card)}
            style={{ display:'flex', gap:12, alignItems:'center', width:'100%',
              background:'#131320', border:'1px solid #1e1e35', borderRadius:12,
              padding:10, marginBottom:8, textAlign:'left', transition:'border-color 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.borderColor='#2a2a4a'}
            onMouseLeave={e => e.currentTarget.style.borderColor='#1e1e35'}
          >
            <div style={{ width:48, aspectRatio:'63/88', borderRadius:8, overflow:'hidden', flexShrink:0, background:'#08080e' }}>
              <CardImg card={card} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontSize:13, fontWeight:700, color:'#e8e8f0', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', marginBottom:2 }}>
                {card.name}
              </div>
              <div style={{ fontSize:10, color:'#3a3a5a', marginBottom:2 }}>{card.set?.name}</div>
              <div style={{ fontSize:8, color:'#444' }}>{card.rarity}</div>
            </div>
            <div style={{ textAlign:'right', flexShrink:0 }}>
              {price ? (
                <div style={{ fontFamily:'monospace', fontSize:14, fontWeight:700, color:'#ffd166', marginBottom:4 }}>
                  {fmtFull(price.price)}
                </div>
              ) : (
                <div style={{ fontSize:10, color:'#252545', marginBottom:4 }}>No price</div>
              )}
              <div style={{ display:'flex', alignItems:'center', justifyContent:'flex-end', gap:4, marginBottom:4 }}>
                <div style={{ width:20, height:20, borderRadius:'50%', border:`1.5px solid ${cl}`,
                  display:'flex', alignItems:'center', justifyContent:'center',
                  fontFamily:'monospace', fontSize:8, fontWeight:700, color:cl }}>
                  {score}
                </div>
                <div style={{ fontSize:7, color:cl, letterSpacing:0.5 }}>{SCORE_LABEL(score)}</div>
              </div>
              <button
                onClick={e => { e.stopPropagation(); onWatch(card); }}
                style={{ fontSize:8, color:'#444' }}>
                Remove
              </button>
            </div>
          </button>
        );
      })}
    </div>
  );
}
