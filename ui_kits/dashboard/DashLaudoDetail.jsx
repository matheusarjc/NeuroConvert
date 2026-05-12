// NeuroConvert — Laudo Detail v3
// Grammarly sidebar · Ahrefs dimensions · Science badges · Framer Motion



// ── CSS-based animation helpers ──────────────────────────
const FadeIn = ({ children, delay = 0, y = 12, x = 0, style = {} }) => {
  const [vis, setVis] = React.useState(false);
  React.useEffect(() => { const t = setTimeout(() => setVis(true), delay); return () => clearTimeout(t); }, []);
  return (
    <div style={{ opacity: vis?1:0, transform: vis?'none':`translate(${x}px,${y}px)`, transition:`opacity 0.35s cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 0.35s cubic-bezier(0.16,1,0.3,1) ${delay}ms`, ...style }}>
      {children}
    </div>
  );
};

// ── Color tokens ──────────────────────────────────────────
const C = {
  bg:'#0A0A0A', s1:'#141414', s2:'#1C1C1C', s3:'#242424',
  b:'rgba(255,255,255,0.07)', bs:'rgba(255,255,255,0.13)',
  p:'#1D9E75', cr:'#EF4444', wa:'#F59E0B', go:'#22C55E',
  t1:'#FFFFFF', t2:'#9CA3AF', t3:'#4B5563',
};

// ── Score count-up hook ───────────────────────────────────
const useCountUp = (target, ms = 1400) => {
  const [v, setV] = React.useState(0);
  React.useEffect(() => {
    const t0 = performance.now();
    const raf = (now) => {
      const p = Math.min((now - t0) / ms, 1);
      const e = 1 - Math.pow(2, -10 * p);
      setV(Math.round(target * e));
      if (p < 1) requestAnimationFrame(raf);
    };
    const id = requestAnimationFrame(raf);
    return () => cancelAnimationFrame(id);
  }, [target]);
  return v;
};

// ── Severity chip: color + icon + label ──────────────────
const SEV_MAP = {
  critical: { color: C.cr, label: 'CRÍTICO',
    icon: <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>, },
  warning:  { color: C.wa, label: 'ATENÇÃO',
    icon: <circle cx="12" cy="12" r="10"/> },
  good:     { color: C.go, label: 'BOM',
    icon: <polyline points="20,6 9,17 4,12"/> },
};

const SevChip = ({ level }) => {
  const s = SEV_MAP[level] || SEV_MAP.good;
  return (
    <div style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'3px 9px', borderRadius:6, background:`${s.color}14`, border:`1px solid ${s.color}30` }}>
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={s.color} strokeWidth="2.5" strokeLinecap="round">{s.icon}</svg>
      <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:10, fontWeight:700, letterSpacing:'0.5px', color:s.color }}>{s.label}</span>
    </div>
  );
};

// ── Science principle badge ───────────────────────────────
const ScienceBadge = ({ principle }) => (
  <div style={{ display:'inline-flex', alignItems:'center', gap:4, padding:'2px 8px', borderRadius:4, background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)' }}>
    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke={C.t3} strokeWidth="2" strokeLinecap="round"><path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18"/></svg>
    <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:9, fontWeight:500, color:C.t3, letterSpacing:'0.2px' }}>{principle}</span>
  </div>
);

// ── Finding card ──────────────────────────────────────────
const FindingCard = ({ f, index, locked }) => (
  <FadeIn delay={index * 60} y={10}>
  <div style={{ background:C.s2, border:`1px solid ${C.b}`, borderRadius:10, padding:'14px 16px', display:'flex', flexDirection:'column', gap:9, filter: locked ? 'blur(3px)' : 'none', userSelect: locked ? 'none' : 'auto' }}>
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:8, flexWrap:'wrap', gap:6 }}>
      <SevChip level={f.sev}/>
      <ScienceBadge principle={f.principle}/>
    </div>
    <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13, fontWeight:500, color:C.t1, lineHeight:1.4 }}>{f.title}</div>
    <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12, color:C.t2, lineHeight:1.6 }}>{f.desc}</div>
    {f.sev !== 'good' && (
      <div style={{ display:'flex', alignItems:'center', gap:6, paddingTop:4, borderTop:`1px solid ${C.b}` }}>
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={f.sev === 'critical' ? C.cr : C.wa} strokeWidth="2.5" strokeLinecap="round"><polyline points="18,15 12,9 6,15"/></svg>
        <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:11, color: f.sev === 'critical' ? C.cr : C.wa }}>
          Você está perdendo <strong>+{f.impact}% de CR</strong> por este item
        </span>
      </div>
    )}
  </div>
  </FadeIn>
);

// ── Dimension section (collapsible, Ahrefs-style) ─────────
const DIM_ICONS = {
  'Confiança':        <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></>,
  'Urgência':         <><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></>,
  'Hierarquia Visual':<><line x1="21" y1="10" x2="3" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="21" y1="18" x2="3" y2="18"/></>,
  'Clareza':          <><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></>,
  'Fricção no CTA':   <><polyline points="22,12 18,12 15,21 9,3 6,12 2,12"/></>,
};

const DimensionSection = ({ dim, defaultOpen }) => {
  const [open, setOpen] = React.useState(defaultOpen || false);
  const critCount = dim.findings.filter(f => f.sev === 'critical').length;
  const warnCount = dim.findings.filter(f => f.sev === 'warning').length;
  const scoreColor = dim.score >= 70 ? C.go : dim.score >= 40 ? C.wa : C.cr;

  return (
    <div style={{ background:C.s1, border:`1px solid ${C.b}`, borderRadius:10, overflow:'hidden' }}>
      {/* Header */}
      <div onClick={() => setOpen(o => !o)}
        style={{ display:'grid', gridTemplateColumns:'20px 1fr auto auto', alignItems:'center', gap:12, padding:'13px 16px', cursor:'pointer', transition:'background 150ms' }}
        onMouseEnter={e => e.currentTarget.style.background=C.s2}
        onMouseLeave={e => e.currentTarget.style.background='transparent'}>
        <div style={{ transform: open?'rotate(90deg)':'rotate(0deg)', transition:'transform 0.2s cubic-bezier(0.16,1,0.3,1)' }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={C.t3} strokeWidth="2.5" strokeLinecap="round"><polyline points="9,18 15,12 9,6"/></svg>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={scoreColor} strokeWidth="1.8" strokeLinecap="round">{DIM_ICONS[dim.name] || <circle cx="12" cy="12" r="10"/>}</svg>
          <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13, fontWeight:500, color:C.t1 }}>{dim.name}</span>
        </div>
        {/* Mini score bar */}
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <div style={{ width:80, height:4, background:'rgba(255,255,255,0.06)', borderRadius:9999 }}>
            <div style={{ height:'100%', width:`${dim.score}%`, background:scoreColor, borderRadius:9999, transition:'width 0.8s cubic-bezier(0.16,1,0.3,1)' }}/>
          </div>
          <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:12, fontWeight:500, color:scoreColor, minWidth:24 }}>{dim.score}</span>
        </div>
        {/* Issue badges */}
        <div style={{ display:'flex', gap:4 }}>
          {critCount > 0 && <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:10, fontWeight:600, color:C.cr, background:`${C.cr}14`, border:`1px solid ${C.cr}28`, borderRadius:9999, padding:'1px 7px' }}>{critCount}C</span>}
          {warnCount > 0 && <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:10, fontWeight:600, color:C.wa, background:`${C.wa}14`, border:`1px solid ${C.wa}28`, borderRadius:9999, padding:'1px 7px' }}>{warnCount}A</span>}
          {critCount === 0 && warnCount === 0 && <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:10, fontWeight:600, color:C.go, background:`${C.go}14`, border:`1px solid ${C.go}28`, borderRadius:9999, padding:'1px 7px' }}>✓</span>}
        </div>
      </div>

      {/* Findings */}
      <div style={{ maxHeight: open?'1200px':'0', overflow:'hidden', transition:'max-height 0.35s cubic-bezier(0.16,1,0.3,1)', opacity: open?1:0, transitionProperty:'max-height, opacity' }}>
        <div style={{ padding:'0 12px 12px', display:'flex', flexDirection:'column', gap:6 }}>
          {dim.findings.map((f, i) => <FindingCard key={i} f={f} index={i}/>)}
        </div>
      </div>
    </div>
  );
};

// ── Score sidebar ─────────────────────────────────────────
const ScoreSidebar = ({ laudo, onBack }) => {
  const score = useCountUp(laudo.score);
  const scoreColor = laudo.score >= 70 ? C.go : laudo.score >= 40 ? C.wa : C.cr;
  const SECTOR_SCORE = 61;
  const size = 160, stroke = 12, r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const [ringScore, setRingScore] = React.useState(0);
  React.useEffect(() => { const t = setTimeout(() => setRingScore(laudo.score), 100); return () => clearTimeout(t); }, [laudo.score]);

  return (
    <div style={{ width:264, flexShrink:0, height:'100%', overflowY:'auto', borderRight:`1px solid ${C.b}`, padding:'20px 20px', display:'flex', flexDirection:'column', gap:20, background:C.s1 }}>
      {/* Back */}
      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
        <button onClick={onBack} style={{ background:'none', border:`1px solid ${C.b}`, borderRadius:6, color:C.t2, fontFamily:"'DM Sans',sans-serif", fontSize:11, padding:'4px 10px', cursor:'pointer', display:'flex', alignItems:'center', gap:4, transition:'border-color 150ms' }}
          onMouseEnter={e => e.currentTarget.style.borderColor=C.bs}
          onMouseLeave={e => e.currentTarget.style.borderColor=C.b}>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15,18 9,12 15,6"/></svg> Voltar
        </button>
        <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:9, color:C.t3 }}>{laudo.id}</span>
      </div>

      {/* Benchmark anchor — shown FIRST for anchoring effect */}
      <div style={{ padding:'12px 14px', background:C.s2, border:`1px solid ${C.b}`, borderRadius:10 }}>
        <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:9, fontWeight:700, color:C.t3, textTransform:'uppercase', letterSpacing:'0.7px', marginBottom:8 }}>Benchmark do setor</div>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          {/* Small gauge */}
          <svg width={52} height={52} viewBox="0 0 52 52">
            <circle cx={26} cy={26} r={22} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={5}/>
            <circle cx={26} cy={26} r={22} fill="none" stroke={C.t3} strokeWidth={5}
              strokeDasharray={2 * Math.PI * 22}
              strokeDashoffset={2 * Math.PI * 22 * (1 - SECTOR_SCORE/100)}
              strokeLinecap="round" transform="rotate(-90 26 26)"/>
          </svg>
          <div>
            <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:24, fontWeight:700, color:C.t2, lineHeight:1, letterSpacing:'-1px' }}>{SECTOR_SCORE}</div>
            <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:10, color:C.t3, marginTop:3 }}>E-commerce · média</div>
          </div>
        </div>
      </div>

      {/* Your score — after benchmark for anchoring */}
      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
        <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:9, fontWeight:700, color:C.t3, textTransform:'uppercase', letterSpacing:'0.7px', alignSelf:'flex-start' }}>Sua página</div>
        <div style={{ position:'relative', width:size, height:size }}>
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ overflow:'visible' }}>
            <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={stroke}/>
            <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={scoreColor} strokeWidth={stroke}
              strokeDasharray={circ} strokeDashoffset={circ - (ringScore/100)*circ}
              strokeLinecap="round" transform={`rotate(-90 ${size/2} ${size/2})`}
              style={{ transition:'stroke-dashoffset 1.4s cubic-bezier(0.16,1,0.3,1)', filter:`drop-shadow(0 0 6px ${scoreColor}60)` }}/>
          </svg>
          <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
            <span style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:72, fontWeight:700, color:scoreColor, lineHeight:1, letterSpacing:'-3px' }}>{score}</span>
            <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:10, fontWeight:700, color:scoreColor, letterSpacing:'1px', textTransform:'uppercase', marginTop:2 }}>
              {laudo.score >= 70 ? 'Bom' : laudo.score >= 40 ? 'Atenção' : 'Crítico'}
            </span>
          </div>
        </div>

        {/* vs benchmark */}
        <div style={{ display:'flex', alignItems:'center', gap:5, marginTop:-4 }}>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={laudo.score > SECTOR_SCORE ? C.go : C.cr} strokeWidth="2.5" strokeLinecap="round"><polyline points={laudo.score > SECTOR_SCORE ? '18,15 12,9 6,15' : '18,9 12,15 6,9'}/></svg>
          <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:11, color:laudo.score > SECTOR_SCORE ? C.go : C.cr, fontWeight:500 }}>
            {laudo.score > SECTOR_SCORE ? '+' : ''}{laudo.score - SECTOR_SCORE} vs. setor
          </span>
        </div>
      </div>

      {/* Issue counts */}
      <div style={{ display:'flex', flexDirection:'column', gap:6, padding:'12px 14px', background:C.s2, border:`1px solid ${C.b}`, borderRadius:10 }}>
        {[[laudo.critical || 2, 'crítico', C.cr], [laudo.warning || 4, 'atenção', C.wa], [2, 'bom', C.go]].map(([n, l, c]) => (
          <div key={l} style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <div style={{ display:'flex', alignItems:'center', gap:6 }}>
              <div style={{ width:6, height:6, borderRadius:'50%', background:c, flexShrink:0 }}/>
              <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12, color:C.t2 }}>{l}</span>
            </div>
            <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:12, fontWeight:500, color:c }}>{n}</span>
          </div>
        ))}
      </div>

      {/* Page info */}
      <div style={{ marginTop:'auto', paddingTop:12, borderTop:`1px solid ${C.b}` }}>
        <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12, fontWeight:500, color:C.t1, marginBottom:2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{laudo.name}</div>
        <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:9, color:C.t3 }}>{laudo.date}</div>
      </div>
    </div>
  );
};

// ── Dimensions data ───────────────────────────────────────
const DIMS = [
  { name:'Confiança', score:31, findings:[
    { sev:'critical', title:'Ausência de prova social próxima ao CTA', principle:'Prova Social · Cialdini 1984', impact:11, desc:'Visitantes chegam ao botão de conversão sem avaliações ou depoimentos. A janela de decisão ocorre sem ativação de conformidade social — o gatilho de confiança mais eficaz documentado.' },
    { sev:'critical', title:'Garantia ausente ou mal posicionada na área do CTA', principle:'Aversão à Perda · Kahneman', impact:7, desc:'A garantia de devolução não está visível. Ausência de redução de risco percebido aumenta o custo psicológico de conversão — especialmente em compras acima de R$ 100.' },
  ]},
  { name:'Urgência', score:48, findings:[
    { sev:'warning', title:'Ausência de indicadores de urgência real', principle:'Desconto Hiperbólico', impact:4, desc:'Sem prazo ou escassez visível, o visitante não percebe custo de adiamento. O cérebro valoriza recompensas imediatas — sem urgência, a decisão é postergada.' },
  ]},
  { name:'Hierarquia Visual', score:55, findings:[
    { sev:'warning', title:'Excesso de elementos competindo por atenção no hero', principle:'Lei de Hick · Hick 1952', impact:6, desc:'Mais de 5 CTAs e blocos de texto visíveis simultaneamente aumentam a carga cognitiva. A Lei de Hick prevê que cada opção adicional reduz a velocidade de decisão.' },
  ]},
  { name:'Clareza', score:82, findings:[
    { sev:'good', title:'Proposta de valor identificável no primeiro scroll', principle:'Fluência de Processamento', impact:0, desc:'A headline principal comunica o benefício em menos de 3 segundos de leitura. Processamento fluente aumenta a percepção de credibilidade e reduz fricção inicial.' },
  ]},
  { name:'Fricção no CTA', score:76, findings:[
    { sev:'good', title:'CTA usa verbo de ação orientado a benefício', principle:'Princípio de Affordance · Norman', impact:0, desc:'O botão principal segue o padrão recomendado: verbo imperativo + benefício específico. Affordance clara reduz hesitação de clique.' },
  ]},
];

// ── Main content ──────────────────────────────────────────
const MainContent = ({ laudo }) => {
  const lossPercent = Math.round((100 - laudo.score) * 0.45);

  return (
    <div style={{ flex:1, overflowY:'auto', padding:'24px 28px', display:'flex', flexDirection:'column', gap:24 }}>

      {/* 1. Loss headline */}
      <FadeIn delay={0} y={16}>
        <div style={{ padding:'20px 22px', background:C.s1, border:`1px solid ${C.b}`, borderRadius:12 }}>
          <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:22, fontWeight:700, color:C.t1, lineHeight:1.3, letterSpacing:'-0.5px', marginBottom:8 }}>
            Você está perdendo{' '}
            <span style={{ color:C.cr, fontFamily:"'JetBrains Mono',monospace" }}>{lossPercent}%</span>
            {' '}de conversão
          </div>
          <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13, color:C.t2, lineHeight:1.6 }}>
            {laudo.critical || 2} problemas críticos e {laudo.warning || 4} pontos de atenção foram identificados na análise neuropsicológica de <span style={{ color:C.t1, fontWeight:500 }}>47 critérios</span>. Cada dia sem correção representa{' '}
            <span style={{ fontFamily:"'JetBrains Mono',monospace", color:C.wa }}>R$ 612</span> em receita não convertida.
          </div>
        </div>
      </FadeIn>

      {/* 2. Dimensions */}
      <div>
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:12 }}>
          <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:10, fontWeight:700, color:C.t3, textTransform:'uppercase', letterSpacing:'0.6px' }}>Dimensões de análise</span>
          <div style={{ flex:1, height:1, background:C.b }}/>
          <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:10, color:C.t3 }}>5 categorias</span>
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
          {DIMS.map((dim, i) => (
            <DimensionSection key={dim.name} dim={dim} defaultOpen={dim.score < 70 && i < 2}/>
          ))}
        </div>
      </div>

      {/* 3. Quick wins */}
      <div>
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:12 }}>
          <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:10, fontWeight:700, color:C.t3, textTransform:'uppercase', letterSpacing:'0.6px' }}>Quick wins</span>
          <div style={{ flex:1, height:1, background:C.b }}/>
          <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:10, color:C.wa }}>+18% CR total estimado</span>
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
          {[
            { rank:1, action:'Adicionar 2–3 depoimentos com foto acima do CTA principal', impact:11, effort:'baixo', principle:'Prova Social' },
            { rank:2, action:'Inserir badge de garantia de 7 dias ao lado do botão de compra', impact:7, effort:'baixo', principle:'Aversão à Perda' },
            { rank:3, action:'Reescrever headline com fórmula: [Resultado específico] + [Para quem] + [Sem objeção principal]', impact:6, effort:'médio', principle:'Fluência de Processamento' },
          ].map((w, i) => (
            <FadeIn key={i} delay={100 + i*70} x={-8} y={0}>
            <div style={{ display:'grid', gridTemplateColumns:'28px 1fr auto', gap:12, padding:'13px 16px', background:C.s1, border:`1px solid ${C.b}`, borderRadius:10, alignItems:'flex-start' }}>
              <div style={{ width:28, height:28, borderRadius:'50%', background:`${C.wa}14`, border:`1px solid ${C.wa}28`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <span style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:12, fontWeight:700, color:C.wa }}>{w.rank}</span>
              </div>
              <div>
                <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13, fontWeight:500, color:C.t1, marginBottom:4, lineHeight:1.4 }}>{w.action}</div>
                <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                  <ScienceBadge principle={w.principle}/>
                  <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:9, fontWeight:600, color:C.t3, background:'rgba(255,255,255,0.04)', border:`1px solid ${C.b}`, borderRadius:4, padding:'2px 7px' }}>Esforço {w.effort}</span>
                </div>
              </div>
              <div style={{ textAlign:'right', flexShrink:0 }}>
                <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:14, fontWeight:700, color:C.go }}>+{w.impact}%</div>
                <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:9, color:C.t3 }}>CR est.</div>
              </div>
            </div>
            </FadeIn>
          ))}
        </div>
      </div>

      {/* 4. Freemium gate */}
      <div style={{ position:'relative', borderRadius:12, overflow:'hidden' }}>
        {/* Blurred fake content */}
        <div style={{ filter:'blur(5px)', pointerEvents:'none', userSelect:'none', padding:'20px', background:C.s1, border:`1px solid ${C.b}`, borderRadius:12, display:'flex', flexDirection:'column', gap:12 }}>
          <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:10, fontWeight:700, color:C.t3, textTransform:'uppercase', letterSpacing:'0.6px' }}>Análise cognitiva profunda</div>
          {[70,90,60].map(w => (
            <div key={w} style={{ height:12, background:C.s2, borderRadius:4, width:`${w}%` }}/>
          ))}
          <div style={{ height:80, background:C.s2, borderRadius:8 }}/>
          <div style={{ height:12, background:C.s2, borderRadius:4, width:'80%' }}/>
          <div style={{ height:12, background:C.s2, borderRadius:4, width:'55%' }}/>
        </div>
        {/* Lock overlay */}
        <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:12, background:'rgba(10,10,10,0.7)', backdropFilter:'blur(2px)', borderRadius:12, border:`1px solid ${C.b}` }}>
          <div style={{ width:44, height:44, borderRadius:12, background:C.s2, border:`1px solid ${C.bs}`, display:'flex', alignItems:'center', justifyContent:'center' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={C.t2} strokeWidth="1.8" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          </div>
          <div style={{ textAlign:'center' }}>
            <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:15, fontWeight:600, color:C.t1, marginBottom:4 }}>Análise cognitiva profunda</div>
            <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12, color:C.t2, marginBottom:14 }}>Mapeamento de heurísticas, eye-tracking simulado e recomendações de copy. Plano Pro.</div>
          </div>
          <button style={{ height:36, padding:'0 20px', background:C.p, color:'#fff', border:'none', borderRadius:7, fontFamily:"'DM Sans',sans-serif", fontSize:13, fontWeight:600, cursor:'pointer', transition:'background 150ms' }}
            onMouseEnter={e => e.target.style.background='#25C98F'}
            onMouseLeave={e => e.target.style.background=C.p}>
            Desbloquear com Pro →
          </button>
        </div>
      </div>

      {/* 5. Idea Validator */}
      <IdeaValidator laudo={laudo}/>

    </div>
  );
};
const VERDICTS = {
  RECOMENDADO:    { color: '#22C55E', bg: 'rgba(34,197,94,0.1)',  border: 'rgba(34,197,94,0.25)',  icon: <polyline points="20,6 9,17 4,12"/> },
  NEUTRO:         { color: '#9CA3AF', bg: 'rgba(156,163,175,0.08)', border: 'rgba(156,163,175,0.2)', icon: <><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></> },
  CONTRAINDICADO: { color: '#EF4444', bg: 'rgba(239,68,68,0.1)',  border: 'rgba(239,68,68,0.25)',  icon: <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></> },
};

const IdeaValidator = ({ laudo }) => {
  const [idea, setIdea] = React.useState('');
  const [result, setResult] = React.useState(null);
  const [loading, setLoading] = React.useState(false);

  const validate = async () => {
    if (!idea.trim() || loading) return;
    setLoading(true); setResult(null);
    try {
      const text = await window.claude.complete({
        messages: [{ role: 'user', content:
`Você é um especialista sênior em neuromarketing, CRO e psicologia do consumidor.

CONTEXTO DA PÁGINA:
- Nome: "${laudo.name}"
- Score NeuroConvert: ${laudo.score}/100 (${laudo.label})
- Problemas críticos identificados: ausência de prova social no CTA, garantia mal posicionada acima do fold

IDEIA DO USUÁRIO: "${idea}"

Avalie esta ideia de melhoria. Responda EXATAMENTE neste formato JSON (sem markdown):
{
  "veredicto": "RECOMENDADO" ou "NEUTRO" ou "CONTRAINDICADO",
  "principio": "Nome do princípio científico relevante (ex: Prova Social · Cialdini)",
  "impacto": "+X% CR" ou "neutro",
  "analise": "2-3 frases em português direto explicando por quê este veredicto.",
  "atencao": "Uma frase sobre risco ou cuidado, ou null se não houver."
}` }]
      });
      try {
        const json = JSON.parse(text.trim());
        setResult(json);
      } catch {
        setResult({ veredicto: 'NEUTRO', principio: '—', impacto: '—', analise: text, atencao: null });
      }
    } catch { setResult({ veredicto: 'NEUTRO', principio: '—', impacto: '—', analise: 'Erro ao processar. Tente novamente.', atencao: null }); }
    setLoading(false);
  };

  const v = result ? (VERDICTS[result.veredicto] || VERDICTS.NEUTRO) : null;

  return (
    <div style={{ background:C.s1, border:`1px solid ${C.b}`, borderRadius:12, padding:'20px' }}>
      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:14 }}>
        <div style={{ width:28, height:28, borderRadius:7, background:'rgba(29,158,117,0.1)', border:'1px solid rgba(29,158,117,0.2)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={C.p} strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
        </div>
        <div>
          <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:14, fontWeight:600, color:C.t1 }}>Valide uma ideia de melhoria</div>
          <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:11, color:C.t3 }}>IA avalia se a ideia é neuropsicologicamente sólida</div>
        </div>
      </div>

      <div style={{ display:'flex', gap:8 }}>
        <input value={idea} onChange={e => setIdea(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && validate()}
          placeholder='Ex: "Adicionar um timer de contagem regressiva de 24h no CTA"'
          style={{ flex:1, height:40, padding:'0 14px', background:C.s2, border:`1px solid ${C.b}`, borderRadius:8, fontFamily:"'DM Sans',sans-serif", fontSize:13, color:C.t1, outline:'none' }}
          onFocus={e => e.target.style.borderColor='rgba(29,158,117,0.4)'}
          onBlur={e => e.target.style.borderColor=C.b}/>
        <button onClick={validate} disabled={!idea.trim() || loading} style={{ height:40, padding:'0 18px', background: idea.trim() && !loading ? C.p : 'rgba(255,255,255,0.05)', color: idea.trim() && !loading ? '#fff' : C.t3, border:'none', borderRadius:8, fontFamily:"'DM Sans',sans-serif", fontSize:13, fontWeight:600, cursor: idea.trim() && !loading ? 'pointer' : 'not-allowed', transition:'all 150ms', whiteSpace:'nowrap' }}>
          {loading ? 'Analisando…' : 'Analisar →'}
        </button>
      </div>

      {loading && (
        <div style={{ marginTop:14, display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:16, height:16, border:`2px solid ${C.p}`, borderTopColor:'transparent', borderRadius:'50%', animation:'spin 0.8s linear infinite' }}/>
          <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12, color:C.t2 }}>Consultando base neuropsicológica…</span>
        </div>
      )}

      {result && v && (
        <FadeIn delay={0} y={8}>
        <div style={{ marginTop:14, padding:'14px 16px', background:v.bg, border:`1px solid ${v.border}`, borderRadius:10 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10, flexWrap:'wrap', gap:8 }}>
            <div style={{ display:'flex', alignItems:'center', gap:7 }}>
              <div style={{ width:22, height:22, borderRadius:6, background:`${v.color}20`, display:'flex', alignItems:'center', justifyContent:'center' }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={v.color} strokeWidth="2.5" strokeLinecap="round">{v.icon}</svg>
              </div>
              <span style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:13, fontWeight:700, color:v.color, letterSpacing:'0.3px' }}>{result.veredicto}</span>
            </div>
            <div style={{ display:'flex', gap:6 }}>
              {result.principio !== '—' && <ScienceBadge principle={result.principio}/>}
              {result.impacto !== '—' && result.impacto !== 'neutro' && (
                <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:11, fontWeight:700, color:v.color, background:`${v.color}14`, border:`1px solid ${v.border}`, borderRadius:4, padding:'2px 8px' }}>{result.impacto}</span>
              )}
            </div>
          </div>
          <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12, color:C.t2, lineHeight:1.6, marginBottom: result.atencao ? 8 : 0 }}>{result.analise}</p>
          {result.atencao && (
            <div style={{ display:'flex', gap:6, alignItems:'flex-start', paddingTop:8, borderTop:`1px solid ${v.border}` }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={C.wa} strokeWidth="2" strokeLinecap="round" style={{ flexShrink:0, marginTop:2 }}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:11, color:C.wa, lineHeight:1.5 }}>{result.atencao}</span>
            </div>
          )}
        </div>
        </FadeIn>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  );
};

Object.assign(window, { IdeaValidator });
const DashLaudoDetail = ({ laudo, onBack }) => (
  <div style={{ display:'flex', height:'calc(100vh - 56px)', margin:'-20px', overflow:'hidden', background:C.bg }}>
    <ScoreSidebar laudo={laudo} onBack={onBack}/>
    <MainContent laudo={laudo}/>
  </div>
);

Object.assign(window, { DashLaudoDetail });
