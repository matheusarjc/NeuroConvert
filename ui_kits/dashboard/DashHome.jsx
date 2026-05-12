// NeuroConvert Dashboard — Home v2
// 3-col layout: Score chart | Conversion impact + laudos table | Issues + plan

// ── Smooth bezier path from data points ─────────────────
const smoothPath = (pts) => {
  if (pts.length < 2) return '';
  let d = `M ${pts[0][0]},${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(pts.length - 1, i + 2)];
    const cp1x = p1[0] + (p2[0] - p0[0]) * 0.18;
    const cp1y = p1[1] + (p2[1] - p0[1]) * 0.18;
    const cp2x = p2[0] - (p3[0] - p1[0]) * 0.18;
    const cp2y = p2[1] - (p3[1] - p1[1]) * 0.18;
    d += ` C ${cp1x.toFixed(2)},${cp1y.toFixed(2)} ${cp2x.toFixed(2)},${cp2y.toFixed(2)} ${p2[0]},${p2[1]}`;
  }
  return d;
};

// ── Score evolution datasets ──────────────────────────────
const DATASETS = {
  '7D':  [54, 56, 55, 58, 61, 59, 63],
  '30D': [38, 40, 39, 43, 42, 46, 48, 51, 50, 54, 53, 57, 56, 60, 62, 59, 64, 67, 65, 70, 69, 72, 71, 75, 73, 77, 76, 80, 79, 83],
  '90D': [22, 26, 24, 29, 31, 28, 33, 35, 32, 38, 40, 37, 42, 44, 41, 47, 49, 46, 51, 53, 50, 55, 57, 54, 59, 61, 58, 63, 65, 62, 67, 70, 68, 72, 71, 74, 76, 73, 78, 77, 80, 79, 83, 82, 84, 83, 86, 85, 83, 87, 86, 88, 87, 85, 88, 89, 87, 90, 88, 87, 86, 84, 83, 85, 84, 86, 87, 85, 86, 88, 87, 86, 85, 83, 84, 85, 83, 84, 86, 87, 85, 83, 84, 86, 85, 84, 83, 82, 83, 84],
};

const PERIOD_LABELS = { '7D': ['Seg','Ter','Qua','Qui','Sex','Sáb','Dom'], '30D': ['1 abr','8 abr','15 abr','22 abr','29 abr','6 mai','11 mai'], '90D': ['Jan','Fev','Mar','Abr','Mai'] };

// ── Score Chart ───────────────────────────────────────────
const ScoreChart = () => {
  const [period, setPeriod] = React.useState('30D');
  const [hoverIdx, setHoverIdx] = React.useState(null);
  const W = 340, H = 160, PX = 16, PY = 12;

  const raw = DATASETS[period];
  const min = Math.min(...raw) - 5;
  const max = Math.max(...raw) + 5;

  const toX = (i) => PX + (i / (raw.length - 1)) * (W - PX * 2);
  const toY = (v) => PY + (1 - (v - min) / (max - min)) * (H - PY * 2);
  const pts = raw.map((v, i) => [toX(i), toY(v)]);

  const linePath = smoothPath(pts);
  const areaPath = linePath + ` L ${pts[pts.length-1][0]},${H} L ${pts[0][0]},${H} Z`;

  const scoreNow = raw[raw.length - 1];
  const scoreStart = raw[0];
  const delta = scoreNow - scoreStart;
  const scoreColor = scoreNow >= 70 ? '#22C55E' : scoreNow >= 40 ? '#F59E0B' : '#EF4444';

  const labels = PERIOD_LABELS[period];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0, height: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 2 }}>Evolução do score</div>
          <div style={{ fontSize: 12, color: '#6B7280' }}>Score médio · todas as páginas</div>
        </div>
        {/* Period tabs */}
        <div style={{ display: 'flex', background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: 3, gap: 1 }}>
          {['7D','30D','90D'].map(p => (
            <button key={p} onClick={() => setPeriod(p)} style={{
              padding: '4px 10px', borderRadius: 6, border: 'none', cursor: 'pointer',
              background: period === p ? '#1C1C1C' : 'transparent',
              color: period === p ? '#FFFFFF' : '#6B7280',
              fontFamily: "'DM Sans',sans-serif", fontSize: 11, fontWeight: 600,
              transition: 'all 150ms',
            }}>{p}</button>
          ))}
        </div>
      </div>

      {/* Big score delta */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 16 }}>
        <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 42, fontWeight: 700, color: scoreColor, letterSpacing: '-1.5px', lineHeight: 1 }}>{scoreNow}</span>
        <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 20, fontWeight: 700, color: '#9CA3AF', letterSpacing: '-0.5px' }}>/ 100</span>
        <div style={{ marginLeft: 4, display: 'flex', alignItems: 'center', gap: 4, background: delta >= 0 ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', border: `1px solid ${delta >= 0 ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`, borderRadius: 6, padding: '3px 8px' }}>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={delta >= 0 ? '#22C55E' : '#EF4444'} strokeWidth="2.5" strokeLinecap="round"><polyline points={delta >= 0 ? '18,15 12,9 6,15' : '18,9 12,15 6,9'}/></svg>
          <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 12, fontWeight: 700, color: delta >= 0 ? '#22C55E' : '#EF4444' }}>{delta >= 0 ? '+' : ''}{delta} pts</span>
        </div>
      </div>

      {/* SVG Chart */}
      <div style={{ position: 'relative', flex: 1 }}
        onMouseLeave={() => setHoverIdx(null)}>
        <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ overflow: 'visible' }}>
          <defs>
            <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={scoreColor} stopOpacity="0.2"/>
              <stop offset="100%" stopColor={scoreColor} stopOpacity="0"/>
            </linearGradient>
          </defs>
          {/* Horizontal grid lines */}
          {[25, 50, 75].map(v => {
            const y = toY(v);
            return y > 0 && y < H ? (
              <g key={v}>
                <line x1={PX} y1={y} x2={W - PX} y2={y} stroke="rgba(255,255,255,0.04)" strokeWidth="1"/>
                <text x={PX - 4} y={y + 3} textAnchor="end" fill="#2A2A2A" fontSize="9" fontFamily="DM Sans">{v}</text>
              </g>
            ) : null;
          })}
          {/* Area fill */}
          <path d={areaPath} fill="url(#chartGrad)"/>
          {/* Line */}
          <path d={linePath} fill="none" stroke={scoreColor} strokeWidth="2" strokeLinejoin="round"/>
          {/* Hover dot */}
          {hoverIdx !== null && (
            <>
              <line x1={pts[hoverIdx][0]} y1={PY} x2={pts[hoverIdx][0]} y2={H} stroke="rgba(255,255,255,0.08)" strokeWidth="1" strokeDasharray="3 3"/>
              <circle cx={pts[hoverIdx][0]} cy={pts[hoverIdx][1]} r="5" fill={scoreColor} stroke="#141414" strokeWidth="2"/>
            </>
          )}
          {/* Invisible hover targets */}
          {pts.map(([x, y], i) => (
            <rect key={i} x={x - (W/raw.length/2)} y={0} width={W/raw.length} height={H}
              fill="transparent" style={{ cursor: 'crosshair' }}
              onMouseEnter={() => setHoverIdx(i)}/>
          ))}
        </svg>
        {/* Tooltip */}
        {hoverIdx !== null && (
          <div style={{
            position: 'absolute',
            left: `${(pts[hoverIdx][0] / W * 100)}%`,
            top: `${(pts[hoverIdx][1] / H * 100) - 28}%`,
            transform: 'translateX(-50%)',
            background: '#1C1C1C', border: '1px solid #2A2A2A', borderRadius: 7,
            padding: '5px 10px', pointerEvents: 'none', zIndex: 10,
            whiteSpace: 'nowrap',
          }}>
            <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 15, fontWeight: 700, color: scoreColor }}>{raw[hoverIdx]}</div>
            <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 10, color: '#6B7280' }}>Score · {labels[Math.floor(hoverIdx / raw.length * (labels.length - 1))] || ''}</div>
          </div>
        )}
      </div>

      {/* X-axis labels */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
        {labels.map(l => (
          <span key={l} style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 9, color: '#2A2A2A' }}>{l}</span>
        ))}
      </div>
    </div>
  );
};

// ── Conversion Impact column ──────────────────────────────
const ImpactCol = ({ onOpenLaudo }) => {
  const laudos = [
    { rank: 1, id:'NC-00847', name:'LP Black Friday',   score:54, color:'#F59E0B', delta:'+14', risk:'R$8.200', monitoring:true,  daysUntil:16 },
    { rank: 2, id:'NC-00831', name:'Checkout Anual',    score:73, color:'#22C55E', delta:'+9',  risk:'R$2.100', monitoring:true,  daysUntil:7  },
    { rank: 3, id:'NC-00818', name:'Home – Q2',         score:38, color:'#EF4444', delta:'-3',  risk:'R$6.400', monitoring:false, daysUntil:0  },
    { rank: 4, id:'NC-00804', name:'LP Produto X',      score:67, color:'#F59E0B', delta:'+5',  risk:'R$1.700', monitoring:false, daysUntil:0  },
    { rank: 5, id:'NC-00791', name:'Checkout Trial',    score:81, color:'#22C55E', delta:'+12', risk:'R$400',   monitoring:true,  daysUntil:22 },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0, height: '100%' }}>
      {/* Hero metric */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 10 }}>Receita estimada em risco</div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, marginBottom: 6 }}>
          <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 40, fontWeight: 700, color: '#EF4444', letterSpacing: '-1.5px', lineHeight: 1 }}>R$&thinsp;18.400</span>
          <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, color: '#6B7280', paddingBottom: 6 }}>/mês</span>
        </div>
        <div style={{ fontSize: 12, color: '#9CA3AF', lineHeight: 1.5 }}>
          Receita deixada na mesa por problemas neuropsicológicos não corrigidos em <span style={{ color: '#FFFFFF', fontWeight: 500 }}>3 páginas ativas</span>.
        </div>
        {/* Sub-stats */}
        <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
          {[['Uplift potencial', '+27% CR', '#22C55E'], ['Problemas críticos', '5 abertos', '#EF4444'], ['Páginas analisadas', '7 total', '#9CA3AF']].map(([l, v, c]) => (
            <div key={l} style={{ flex: 1, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '8px 10px' }}>
              <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 9, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: 4 }}>{l}</div>
              <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 15, fontWeight: 700, color: c }}>{v}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Laudos table */}
      <div style={{ fontSize: 11, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 10 }}>Páginas por impacto</div>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.35}}`}</style>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* Header */}
        <div style={{ display: 'grid', gridTemplateColumns: '20px 1fr 52px 52px 70px', gap: 8, padding: '6px 10px' }}>
          {['#', 'Página', 'Score', 'Δ', 'Em risco'].map(h => (
            <div key={h} style={{ fontSize: 9, fontWeight: 600, color: '#2A2A2A', textTransform: 'uppercase', letterSpacing: '0.4px' }}>{h}</div>
          ))}
        </div>
        {laudos.map((l) => (
          <div key={l.id} onClick={() => onOpenLaudo(l)}
            style={{ display: 'grid', gridTemplateColumns: '20px 1fr 52px 52px 70px', gap: 8, padding: '8px 10px', borderRadius: 8, cursor: 'pointer', transition: 'background 150ms', alignItems: 'center' }}
            onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.03)'}
            onMouseLeave={e => e.currentTarget.style.background='transparent'}>
            <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 11, fontWeight: 700, color: '#2A2A2A' }}>#{l.rank}</span>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 500, color: '#FFFFFF', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.name}</div>
              <div style={{ display:'flex', alignItems:'center', gap:5, marginTop:3 }}>
                <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, color: '#2A2A2A' }}>{l.id}</div>
                {l.monitoring && (
                  <div style={{ display:'inline-flex', alignItems:'center', gap:3, padding:'1px 6px', background:'rgba(29,158,117,0.08)', border:'1px solid rgba(29,158,117,0.18)', borderRadius:9999 }}>
                    <div style={{ width:4, height:4, borderRadius:'50%', background:'#1D9E75', animation:'pulse 2s cubic-bezier(0.4,0,0.6,1) infinite' }}/>
                    <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:9, fontWeight:600, color:'#1D9E75' }}>{l.daysUntil}d</span>
                  </div>
                )}
              </div>
            </div>
            <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 16, fontWeight: 700, color: l.color }}>{l.score}</span>
            <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 12, fontWeight: 700, color: l.delta.startsWith('+') ? '#22C55E' : '#EF4444' }}>{l.delta}</span>
            <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 11, fontWeight: 600, color: '#F59E0B' }}>{l.risk}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ── Issues + Plan column ──────────────────────────────────
const RightCol = ({ onNewAnalysis }) => {
  const issues = [
    { sev: 'C', color: '#EF4444', title: 'Prova social ausente no CTA', page: 'LP Black Friday', impact: '+11% CR', days: 4 },
    { sev: 'C', color: '#EF4444', title: 'Garantia não visível acima do fold', page: 'Home – Q2', impact: '+7% CR', days: 12 },
    { sev: 'A', color: '#F59E0B', title: 'Headline sem benefício específico', page: 'LP Black Friday', impact: '+6% CR', days: 4 },
    { sev: 'A', color: '#F59E0B', title: 'Ausência de urgência real', page: 'LP Produto X', impact: '+4% CR', days: 7 },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, height: '100%' }}>
      {/* Urgent issues */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Ações prioritárias</div>
          <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 10, fontWeight: 700, color: '#EF4444', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 9999, padding: '1px 7px' }}>5 em aberto</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {issues.map((issue, i) => (
            <div key={i} style={{ background: 'rgba(255,255,255,0.025)', border: `1px solid rgba(255,255,255,0.06)`, borderLeft: `3px solid ${issue.color}`, borderRadius: '0 8px 8px 0', padding: '10px 12px', cursor: 'pointer', transition: 'background 150ms' }}
              onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.04)'}
              onMouseLeave={e => e.currentTarget.style.background='rgba(255,255,255,0.025)'}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 6 }}>
                <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, fontWeight: 500, color: '#FFFFFF', lineHeight: 1.35, flex: 1 }}>{issue.title}</div>
                <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 11, fontWeight: 700, color: issue.color, flexShrink: 0 }}>{issue.impact}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 5 }}>
                <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 10, color: '#6B7280' }}>{issue.page}</span>
                <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 10, color: '#2A2A2A' }}>há {issue.days}d</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Plan card */}
      <div style={{ background: 'linear-gradient(145deg, rgba(29,158,117,0.12), rgba(29,158,117,0.04))', border: '1px solid rgba(29,158,117,0.2)', borderRadius: 12, padding: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
          <div>
            <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 13, fontWeight: 600, color: '#FFFFFF' }}>Plano Pro</div>
            <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>13 laudos restantes este mês</div>
          </div>
          <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 10, fontWeight: 600, color: '#1D9E75', background: 'rgba(29,158,117,0.15)', border: '1px solid rgba(29,158,117,0.3)', borderRadius: 9999, padding: '2px 8px' }}>Pro</span>
        </div>
        {/* Usage bar */}
        <div style={{ height: 5, background: 'rgba(255,255,255,0.08)', borderRadius: 9999, marginBottom: 12 }}>
          <div style={{ height: '100%', width: '35%', background: '#1D9E75', borderRadius: 9999 }}/>
        </div>
        <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, color: '#6B7280', marginBottom: 10 }}>
          Você usou <span style={{ color: '#FFFFFF', fontWeight: 500 }}>7 de 20</span> laudos. Renova em 19 jun.
        </div>
        <button onClick={onNewAnalysis} style={{ width: '100%', height: 34, background: '#1D9E75', color: '#fff', border: 'none', borderRadius: 7, fontFamily: "'DM Sans',sans-serif", fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'background 150ms' }}
          onMouseEnter={e => e.target.style.background='#25C98F'}
          onMouseLeave={e => e.target.style.background='#1D9E75'}>
          + Nova análise
        </button>
      </div>

      {/* Methodology badge */}
      <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 10, padding: '12px 14px', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
        <div style={{ width: 28, height: 28, borderRadius: 7, background: 'rgba(29,158,117,0.1)', border: '1px solid rgba(29,158,117,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#1D9E75" strokeWidth="2" strokeLinecap="round"><polyline points="22,12 18,12 15,21 9,3 6,12 2,12"/></svg>
        </div>
        <div>
          <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, fontWeight: 600, color: '#9CA3AF', marginBottom: 3 }}>47 critérios neuropsicológicos</div>
          <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 10, color: '#6B7280', lineHeight: 1.5 }}>Metodologia baseada em pesquisas de Nielsen Norman Group, Cialdini e neuroeconomia comportamental.</div>
        </div>
      </div>
    </div>
  );
};

// ── Main DashHome ─────────────────────────────────────────
const DashHome = ({ onOpenLaudo, onNewAnalysis }) => (
  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.1fr 0.75fr', gap: 16, height: 'calc(100vh - 96px)', minHeight: 0 }}>

    {/* Left: Score chart */}
    <div style={{ background: '#141414', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: '20px 20px 14px', display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' }}>
      <ScoreChart/>
    </div>

    {/* Center: Conversion impact + laudos */}
    <div style={{ background: '#141414', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: '20px', display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' }}>
      <ImpactCol onOpenLaudo={onOpenLaudo}/>
    </div>

    {/* Right: Issues + plan */}
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0, minHeight: 0, overflow: 'auto' }}>
      <RightCol onNewAnalysis={onNewAnalysis}/>
    </div>
  </div>
);

Object.assign(window, { DashHome, LAUDOS: [
  { id: 'NC-00847', name: 'Landing page – Black Friday', score: 54, color: '#F59E0B', label: 'Atenção', critical: 2, warning: 4, date: '11 mai 2026' },
  { id: 'NC-00831', name: 'Checkout – Plano Anual',      score: 73, color: '#22C55E', label: 'Bom',    critical: 0, warning: 3, date: '08 mai 2026' },
  { id: 'NC-00818', name: 'Home – Versão Q2',            score: 38, color: '#EF4444', label: 'Crítico', critical: 4, warning: 5, date: '02 mai 2026' },
  { id: 'NC-00804', name: 'Landing page – Produto X',    score: 67, color: '#F59E0B', label: 'Atenção', critical: 1, warning: 3, date: '24 abr 2026' },
  { id: 'NC-00791', name: 'Checkout – Free Trial',       score: 81, color: '#22C55E', label: 'Bom',    critical: 0, warning: 1, date: '17 abr 2026' },
], MiniGauge: ({ score, color, size = 52, stroke = 6 }) => {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ flexShrink: 0 }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#1C1C1C" strokeWidth={stroke}/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={circ-(score/100)*circ}
        strokeLinecap="round" transform={`rotate(-90 ${size/2} ${size/2})`}/>
    </svg>
  );
}});
