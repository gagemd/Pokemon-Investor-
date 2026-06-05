// src/components/ui/index.jsx
import { useState } from 'react';

export function Loader({ msg = 'Loading...' }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', padding:'52px 0', gap:14 }}>
      <div style={{ width:28, height:28, border:'3px solid #1a1a2e', borderTop:'3px solid #00e5a0', borderRadius:'50%', animation:'spin 0.7s linear infinite' }} />
      <div style={{ fontSize:11, color:'#444', letterSpacing:2 }}>{msg}</div>
    </div>
  );
}

export function ErrorBox({ msg, onRetry }) {
  return (
    <div style={{ background:'#1a0a0a', border:'1px solid #3a1a1a', borderRadius:10, padding:16, margin:'16px 0' }}>
      <div style={{ fontSize:12, color:'#ff4757', marginBottom:6, fontWeight:600 }}>Unable to load</div>
      <div style={{ fontSize:10, color:'#663333', lineHeight:1.6, marginBottom: onRetry ? 10 : 0 }}>{msg}</div>
      {onRetry && (
        <button onClick={onRetry}
          style={{ padding:'6px 14px', background:'#ff475722', border:'1px solid #ff4757', borderRadius:8, color:'#ff4757', fontSize:10 }}>
          Retry
        </button>
      )}
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div style={{ background:'#131320', borderRadius:10, overflow:'hidden' }}>
      <div className="skeleton" style={{ width:'100%', aspectRatio:'63/88' }} />
      <div style={{ padding:'8px 8px 10px' }}>
        <div className="skeleton" style={{ height:11, marginBottom:6 }} />
        <div className="skeleton" style={{ height:9, width:'60%', marginBottom:8 }} />
        <div className="skeleton" style={{ height:14, width:'50%', marginLeft:'auto' }} />
      </div>
    </div>
  );
}

export function SkeletonRow() {
  return (
    <div style={{ display:'flex', gap:12, background:'#131320', borderRadius:12, padding:10, marginBottom:8 }}>
      <div className="skeleton" style={{ width:52, aspectRatio:'63/88', borderRadius:8, flexShrink:0 }} />
      <div style={{ flex:1 }}>
        <div className="skeleton" style={{ height:13, marginBottom:6 }} />
        <div className="skeleton" style={{ height:10, width:'70%', marginBottom:4 }} />
        <div className="skeleton" style={{ height:9, width:'40%' }} />
      </div>
      <div style={{ width:70 }}>
        <div className="skeleton" style={{ height:16, marginBottom:4 }} />
        <div className="skeleton" style={{ height:9 }} />
      </div>
    </div>
  );
}

// card.images.large → card.images.small → "Image unavailable"
export function CardImg({ card, style = {} }) {
  const [idx, setIdx] = useState(0);
  const srcs = [card.images?.large, card.images?.small].filter(Boolean);
  if (!srcs.length || idx >= srcs.length) {
    return (
      <div style={{ ...style, background:'#08080e', display:'flex', alignItems:'center',
        justifyContent:'center', color:'#252545', fontSize:9, textAlign:'center', padding:6 }}>
        Image<br/>unavailable
      </div>
    );
  }
  return (
    <img
      src={srcs[idx]}
      alt={card.name || ''}
      style={{ ...style, display:'block' }}
      loading="lazy"
      onError={() => {
        console.error('API fetch failed: card image load error', srcs[idx]);
        setIdx(i => i + 1);
      }}
    />
  );
}

// set.images.logo → set.images.symbol → "No logo"
export function SetImg({ set, style = {} }) {
  const [idx, setIdx] = useState(0);
  const srcs = [set.images?.logo, set.images?.symbol].filter(Boolean);
  if (!srcs.length || idx >= srcs.length) {
    return (
      <div style={{ ...style, display:'flex', alignItems:'center', justifyContent:'center',
        color:'#252545', fontSize:10, textAlign:'center' }}>
        No logo
      </div>
    );
  }
  return (
    <img
      src={srcs[idx]}
      alt={set.name || ''}
      style={{ ...style, display:'block', objectFit:'contain' }}
      loading="lazy"
      onError={() => {
        console.error('API fetch failed: set logo load error', srcs[idx]);
        setIdx(i => i + 1);
      }}
    />
  );
}
