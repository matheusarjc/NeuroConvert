// NeuroConvert — Comparison View + Monitoring Badge
// Prototyping Feature 1 (Re-análise Antes/Depois) e Feature 2 (Monitoramento)

// ── Gauge pair for comparison ─────────────────────────────
const CompGauge = ({ score, color, label, date, size = 130, stroke = 11 }) => {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const [cur, setCur] = React.useState(0);
  React.useEffect(() => { const t = setTimeout(() => setCur(score), 200); return () => clearTimeout(t); }, [score]);
  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:8 }}>
      <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:9, fontWeight:700, color:'#4B5563', textTransform:'uppercase', letterSpacing:'0.7px' }}>{label}</div>
      <div style={{ position:'relative', width:size, height:size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={stroke}/>
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
            strokeDasharray={circ} strokeDashoffset={circ-(cur/100)*circ}
            strokeLinecap="round" transform={`rotate(-90 ${size/2} ${size/2})`}
            style={{ transition:'stroke-dashoffset 1.2s cubic-bezier(0.16,1,0.3,1)', filter:`drop-shadow(0 0 5px ${color}50)` }}/>
        </svg>
        <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
          <span style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:40, fontWeight:700, color, letterSpacing:'-1.5px', lineHeight:1 }}>{score}</span>
          <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:9, color, fontWeight:600, textTransform:'uppercase', letterSpacing:'1px', marginTop:2 }}>
            {score >= 70 ? 'Bom' : score >= 40 ? 'Atenção' : 'Crítico'}
          </span>
        </div>
      </div>
      <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:10, color:'#4B5563' }}>{date}</span>
    </div>
  );
};

// ── Dimension row ─────────────────────────────────────────
const SEV_COLORS = { critical:'#EF4444', warning:'#F59E0B', good:'#22C55E' };
const SEV_LABELS = { critical:'Crítico', warning:'Atenção', good:'Bom' };

const DimRow = ({ name, scoreBefore, scoreAfter, sevBefore, sevAfter }) => {
  const delta = scoreAfter - scoreBefore;
  const changed = sevBefore !== sevAfter;
  const improved = scoreAfter > scoreBefore;
  return (
    <div style={{ display:'grid', gridTemplateColumns:'1fr 100px 100px 60px', gap:12, padding:'10px 16px', borderBottom:'1px solid rgba(255,255,255,0.05)', alignItems:'center', background: changed ? (improved ? 'rgba(34,197,94,0.03)' : 'rgba(239,68,68,0.03)') : 'transparent' }}>
      <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12, fontWeight:500, color:'#FFFFFF' }}>{name}</span>
      {/* Before */}
      <div style={{ display:'flex', alignItems:'center', gap:5 }}>
        <div style={{ width:5, height:5, borderRadius:'50%', background:SEV_COLORS[sevBefore], flexShrink:0 }}/>
        <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:11, color:SEV_COLORS[sevBefore] }}>{SEV_LABELS[sevBefore]}</span>
        <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:10, color:'#4B5563', marginLeft:4 }}>{scoreBefore}</span>
      </div>
      {/* After */}
      <div style={{ display:'flex', alignItems:'center', gap:5 }}>
        <div style={{ width:5, height:5, borderRadius:'50%', background:SEV_COLORS[sevAfter], flexShrink:0 }}/>
        <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:11, color:SEV_COLORS[sevAfter] }}>{SEV_LABELS[sevAfter]}</span>
        <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:10, color:'#4B5563', marginLeft:4 }}>{scoreAfter}</span>
      </div>
      {/* Delta */}
      <div style={{ display:'flex', alignItems:'center', gap:3, justifyContent:'flex-end' }}>
        {delta !== 0 && (
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={delta > 0 ? '#22C55E' : '#EF4444'} strokeWidth="2.5" strokeLinecap="round">
            <polyline points={delta > 0 ? '18,15 12,9 6,15' : '18,9 12,15 6,9'}/>
          </svg>
        )}
        <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:11, fontWeight:700, color: delta > 0 ? '#22C55E' : delta < 0 ? '#EF4444' : '#4B5563' }}>
          {delta > 0 ? `+${delta}` : delta === 0 ? '—' : delta}
        </span>
      </div>
    </div>
  );
};

// ── Monitoring badge ──────────────────────────────────────
const MonitoringBadge = ({ daysUntil }) => (
  <div style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'3px 9px', background:'rgba(29,158,117,0.08)', border:'1px solid rgba(29,158,117,0.2)', borderRadius:9999 }}>
    <div style={{ width:6, height:6, borderRadius:'50%', background:'#1D9E75', animation:'pulse 2s cubic-bezier(0.4,0,0.6,1) infinite' }}/>
    <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:10, fontWeight:600, color:'#1D9E75' }}>
      Monitorando · próxima análise em {daysUntil}d
    </span>
    <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }`}</style>
  </div>
);

// ── Main comparison view ──────────────────────────────────
const DashComparisonView = ({ onViewFull, onBack }) => {
  const comparison = {
    previous: { score: 38, analyzed_at: '11 abr 2026' },
    current:  { score: 54, analyzed_at: '11 mai 2026' },
    delta: 16, improved: true, days: 30,
  };
  const dims = [
    { name:'Confiança',         scoreBefore:31, scoreAfter:52, sevBefore:'critical', sevAfter:'warning' },
    { name:'Urgência',          scoreBefore:48, scoreAfter:51, sevBefore:'warning',  sevAfter:'warning' },
    { name:'Hierarquia Visual', scoreBefore:29, scoreAfter:60, sevBefore:'critical', sevAfter:'good'    },
    { name:'Clareza',           scoreBefore:82, scoreAfter:84, sevBefore:'good',     sevAfter:'good'    },
    { name:'Fricção no CTA',    scoreBefore:55, scoreAfter:74, sevBefore:'warning',  sevAfter:'good'    },
  ];
  const resolved = dims.filter(d => d.sevBefore === 'critical' && d.sevAfter !== 'critical');
  const stilCritical = dims.filter(d => d.sevAfter === 'critical').length;

  const card = { background:'#141414', border:'1px solid rgba(255,255,255,0.07)', borderRadius:12 };

  return (
    <div style={{ maxWidth:780, display:'flex', flexDirection:'column', gap:16 }}>
      {/* Back */}
      <div style={{ display:'flex', alignItems:'center', gap:12 }}>
        <button onClick={onBack} style={{ background:'none', border:'1px solid rgba(255,255,255,0.08)', borderRadius:6, color:'#9CA3AF', fontFamily:"'DM Sans',sans-serif", fontSize:11, padding:'4px 10px', cursor:'pointer', display:'flex', alignItems:'center', gap:4 }}>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15,18 9,12 15,6"/></svg> Voltar
        </button>
        {/* Evolution badge */}
        <div style={{ display:'flex', alignItems:'center', gap:6, padding:'5px 12px', background:'rgba(34,197,94,0.08)', border:'1px solid rgba(34,197,94,0.25)', borderRadius:8 }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2.5" strokeLinecap="round"><polyline points="20,6 9,17 4,12"/></svg>
          <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12, fontWeight:600, color:'#22C55E' }}>Evolução detectada — {comparison.days} dias desde última análise</span>
        </div>
        <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:10, color:'#4B5563', marginLeft:'auto' }}>Landing page – Black Friday</span>
      </div>

      {/* Score comparison */}
      <div style={{ ...card, padding:'28px 32px' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:40 }}>
          <CompGauge score={comparison.previous.score} color="#6B7280" label="Antes" date={comparison.previous.analyzed_at} size={130} stroke={11}/>

          {/* Delta center */}
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
            <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:48, fontWeight:700, color:'#22C55E', letterSpacing:'-2px', lineHeight:1 }}>+{comparison.delta}</div>
            <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12, color:'#9CA3AF' }}>pontos</div>
            <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:11, color:'#4B5563', marginTop:4, textAlign:'center' }}>
              score evoluiu <span style={{ fontFamily:"'JetBrains Mono',monospace", color:'#22C55E', fontWeight:600 }}>+42%</span><br/>em {comparison.days} dias
            </div>
          </div>

          <CompGauge score={comparison.current.score} color="#F59E0B" label="Depois" date={comparison.current.analyzed_at} size={130} stroke={11}/>
        </div>
      </div>

      {/* Dimension evolution table */}
      <div style={card}>
        <div style={{ padding:'12px 16px', borderBottom:'1px solid rgba(255,255,255,0.07)', display:'grid', gridTemplateColumns:'1fr 100px 100px 60px', gap:12 }}>
          {['Dimensão','Antes','Depois','Δ'].map(h => (
            <span key={h} style={{ fontFamily:"'DM Sans',sans-serif", fontSize:9, fontWeight:700, color:'#4B5563', textTransform:'uppercase', letterSpacing:'0.5px' }}>{h}</span>
          ))}
        </div>
        {dims.map(d => <DimRow key={d.name} {...d}/>)}
      </div>

      {/* Quick wins resolved */}
      {resolved.length > 0 && (
        <div style={{ ...card, padding:'16px 20px' }}>
          <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:10, fontWeight:700, color:'#4B5563', textTransform:'uppercase', letterSpacing:'0.6px', marginBottom:10 }}>Quick wins implementados</div>
          <div style={{ display:'flex', flexDirection:'column', gap:7 }}>
            {[
              { principle:'Prova Social · Cialdini', action:'Depoimentos adicionados acima do CTA' },
              { principle:'Lei de Hick', action:'CTA secundário removido — foco no principal' },
            ].map((w, i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:9 }}>
                <div style={{ width:18, height:18, borderRadius:'50%', background:'rgba(34,197,94,0.12)', border:'1px solid rgba(34,197,94,0.25)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="3" strokeLinecap="round"><polyline points="20,6 9,17 4,12"/></svg>
                </div>
                <div>
                  <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:10, color:'#1D9E75' }}>{w.principle}</span>
                  <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:11, color:'#9CA3AF', marginLeft:8 }}>— {w.action}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CTA */}
      <div style={{ ...card, padding:'16px 20px', display:'flex', alignItems:'center', justifyContent:'space-between', gap:16 }}>
        {stilCritical > 0 ? (
          <>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13, color:'#9CA3AF' }}>
                Ainda há <span style={{ fontFamily:"'JetBrains Mono',monospace", fontWeight:700, color:'#EF4444' }}>{stilCritical}</span> problema crítico sem correção
              </span>
            </div>
            <button onClick={onViewFull} style={{ height:36, padding:'0 18px', background:'#1D9E75', color:'#fff', border:'none', borderRadius:7, fontFamily:"'DM Sans',sans-serif", fontSize:13, fontWeight:600, cursor:'pointer', whiteSpace:'nowrap', transition:'background 150ms' }}
              onMouseEnter={e => e.target.style.background='#25C98F'} onMouseLeave={e => e.target.style.background='#1D9E75'}>
              Ver laudo completo →
            </button>
          </>
        ) : (
          <>
            <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13, color:'#9CA3AF' }}>Excelente evolução! Analise a página de um concorrente →</span>
            <button style={{ height:36, padding:'0 18px', background:'rgba(29,158,117,0.1)', color:'#1D9E75', border:'1px solid rgba(29,158,117,0.25)', borderRadius:7, fontFamily:"'DM Sans',sans-serif", fontSize:13, fontWeight:600, cursor:'pointer' }}>Nova análise</button>
          </>
        )}
      </div>

      {/* Monitoring activated badge */}
      <div style={{ display:'flex', alignItems:'center', gap:10, padding:'12px 16px', background:'rgba(29,158,117,0.05)', border:'1px solid rgba(29,158,117,0.15)', borderRadius:10 }}>
        <MonitoringBadge daysUntil={30}/>
        <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12, color:'#9CA3AF' }}>
          Próxima análise automática em <span style={{ fontFamily:"'JetBrains Mono',monospace", color:'#1D9E75', fontWeight:600 }}>30 dias</span>. Você receberá um email se o score mudar.
        </span>
      </div>
    </div>
  );
};

Object.assign(window, { DashComparisonView, MonitoringBadge });
