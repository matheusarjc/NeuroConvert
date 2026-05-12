// NeuroConvert — Landing Hero v2
// Loss framing · Benchmark anchor · Authority signals

const C_L = {
  bg: '#0A0A0A', s1: '#141414', s2: '#1C1C1C',
  b: 'rgba(255,255,255,0.08)', bs: 'rgba(255,255,255,0.14)',
  p: '#1D9E75', cr: '#EF4444', wa: '#F59E0B', go: '#22C55E',
  t1: '#FFFFFF', t2: '#9CA3AF', t3: '#4B5563',
};

const ScoreRing = ({ score, color, size = 160, stroke = 12 }) => {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const [cur, setCur] = React.useState(0);
  React.useEffect(() => { const t = setTimeout(() => setCur(score), 300); return () => clearTimeout(t); }, [score]);
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ overflow:'visible' }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={stroke}/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={circ - (cur/100)*circ}
        strokeLinecap="round" transform={`rotate(-90 ${size/2} ${size/2})`}
        style={{ transition:'stroke-dashoffset 1.2s cubic-bezier(0.16,1,0.3,1)', filter:`drop-shadow(0 0 6px ${color}55)` }}/>
    </svg>
  );
};

const LandingNav = () => {
  const [scrolled, setScrolled] = React.useState(false);
  React.useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);
  return (
    <nav style={{ position:'fixed', top:0, left:0, right:0, zIndex:100, height:60, padding:'0 40px', display:'flex', alignItems:'center', justifyContent:'space-between', background: scrolled ? 'rgba(10,10,10,0.92)' : 'transparent', backdropFilter: scrolled ? 'blur(12px)' : 'none', borderBottom: scrolled ? `1px solid ${C_L.b}` : '1px solid transparent', transition:'all 300ms cubic-bezier(0.16,1,0.3,1)' }}>
      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
        <svg width="26" height="26" viewBox="0 0 36 36" fill="none"><rect x="4" y="6" width="6" height="24" rx="3" fill="#1D9E75"/><polygon points="10,6 16,6 22,30 16,30" fill="#1D9E75"/><rect x="16" y="6" width="6" height="24" rx="3" fill="#1D9E75"/><circle cx="28" cy="9" r="3" fill="#25C98F"/></svg>
        <span style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:17, fontWeight:700, color:C_L.t1 }}>Neuro<span style={{ color:C_L.p }}>Convert</span></span>
      </div>
      <div style={{ display:'flex', gap:28 }}>
        {['Metodologia','Exemplos','Preços'].map(l => (
          <a key={l} href="#" style={{ fontFamily:"'DM Sans',sans-serif", fontSize:14, fontWeight:500, color:C_L.t2, textDecoration:'none', transition:'color 150ms' }}
            onMouseEnter={e => e.target.style.color=C_L.t1} onMouseLeave={e => e.target.style.color=C_L.t2}>{l}</a>
        ))}
      </div>
      <div style={{ display:'flex', gap:10, alignItems:'center' }}>
        <a href="#" style={{ fontFamily:"'DM Sans',sans-serif", fontSize:14, color:C_L.t2, textDecoration:'none' }}>Entrar</a>
        <button style={{ height:36, padding:'0 18px', background:C_L.p, color:'#fff', border:'none', borderRadius:7, fontFamily:"'DM Sans',sans-serif", fontSize:13, fontWeight:600, cursor:'pointer', transition:'background 150ms' }}
          onMouseEnter={e => e.target.style.background='#25C98F'} onMouseLeave={e => e.target.style.background=C_L.p}>
          Analisar grátis
        </button>
      </div>
    </nav>
  );
};

const LandingHero = ({ onAnalyze }) => {
  const DEMO_SCORE = 54;
  const DEMO_COLOR = '#F59E0B';
  const SECTOR_SCORE = 61;

  return (
    <section style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:'80px 40px 60px', background:C_L.bg, position:'relative', overflow:'hidden' }}>
      {/* Subtle grid */}
      <div style={{ position:'absolute', inset:0, opacity:0.025, backgroundImage:'linear-gradient(rgba(255,255,255,0.6) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.6) 1px,transparent 1px)', backgroundSize:'48px 48px', pointerEvents:'none' }}/>

      <div style={{ maxWidth:1100, width:'100%', display:'flex', gap:72, alignItems:'center' }}>
        {/* Left: copy */}
        <div style={{ flex:1, display:'flex', flexDirection:'column', gap:20 }}>

          {/* Social proof ticker */}
          <div style={{ display:'flex', alignItems:'center', gap:8, width:'fit-content' }}>
            <div style={{ display:'flex' }}>
              {['#22C55E','#1D9E75','#25C98F'].map((c,i) => (
                <div key={i} style={{ width:22, height:22, borderRadius:'50%', background:c, border:'1.5px solid #0A0A0A', marginLeft: i>0 ? -7:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <span style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:9, fontWeight:700, color:'#fff' }}>A</span>
                </div>
              ))}
            </div>
            <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12, color:C_L.t2 }}>
              <span style={{ color:C_L.t1, fontWeight:600 }}>412 equipes</span> analisaram páginas esta semana
            </span>
          </div>

          {/* Loss-framing headline */}
          <h1 style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:50, fontWeight:700, lineHeight:1.08, letterSpacing:'-1.5px', color:C_L.t1, maxWidth:540 }}>
            Você está perdendo receita em cada visita que não converte
          </h1>

          <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:16, lineHeight:1.7, color:C_L.t2, maxWidth:460 }}>
            NeuroConvert identifica os bloqueios neuropsicológicos que impedem seus visitantes de comprar — e entrega um laudo com score 0–100 e ações priorizadas.
          </p>

          {/* URL input */}
          <div style={{ display:'flex', gap:8 }}>
            <div style={{ position:'relative', flex:1 }}>
              <input type="url" placeholder="https://suapagina.com.br"
                style={{ width:'100%', height:48, padding:'0 14px', background:C_L.s1, border:`1px solid ${C_L.b}`, borderRadius:8, fontFamily:"'DM Sans',sans-serif", fontSize:14, color:C_L.t1, outline:'none' }}
                onFocus={e => e.target.style.borderColor='rgba(29,158,117,0.5)'}
                onBlur={e => e.target.style.borderColor=C_L.b}/>
            </div>
            <button onClick={onAnalyze} style={{ height:48, padding:'0 24px', background:C_L.p, color:'#fff', border:'none', borderRadius:8, fontFamily:"'DM Sans',sans-serif", fontSize:14, fontWeight:600, cursor:'pointer', whiteSpace:'nowrap', transition:'all 150ms' }}
              onMouseEnter={e => { e.target.style.background='#25C98F'; e.target.style.transform='translateY(-1px)'; }}
              onMouseLeave={e => { e.target.style.background=C_L.p; e.target.style.transform='none'; }}>
              Analisar gratuitamente →
            </button>
          </div>
          <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:11, color:C_L.t3 }}>Grátis · Sem cartão · Resultado em &lt;2 min</p>

          {/* Authority badges */}
          <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginTop:4 }}>
            {['Cialdini · Persuasão', 'Kahneman · Comportamental', 'Nielsen Norman · UX'].map(b => (
              <div key={b} style={{ display:'flex', alignItems:'center', gap:5, padding:'4px 10px', background:C_L.s1, border:`1px solid ${C_L.b}`, borderRadius:6 }}>
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke={C_L.t3} strokeWidth="2" strokeLinecap="round"><path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18"/></svg>
                <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:10, color:C_L.t3 }}>{b}</span>
              </div>
            ))}
          </div>

          {/* Key stats */}
          <div style={{ display:'flex', gap:32, paddingTop:8, borderTop:`1px solid ${C_L.b}`, marginTop:4 }}>
            {[['2.847', 'laudos publicados'], ['R$ 4.2M', 'em receita recuperada'], ['94%', 'de precisão nos diagnósticos']].map(([v, l]) => (
              <div key={v}>
                <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:22, fontWeight:700, color:C_L.t1, letterSpacing:'-0.5px', lineHeight:1 }}>{v}</div>
                <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:11, color:C_L.t3, marginTop:3 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: benchmark + score demo */}
        <div style={{ flexShrink:0, display:'flex', flexDirection:'column', gap:10, width:340 }}>

          {/* 1. Benchmark anchor — shown first */}
          <div style={{ background:C_L.s1, border:`1px solid ${C_L.b}`, borderRadius:12, padding:'14px 18px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <div>
              <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:9, fontWeight:700, color:C_L.t3, textTransform:'uppercase', letterSpacing:'0.7px', marginBottom:4 }}>Benchmark do setor</div>
              <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12, color:C_L.t2 }}>E-commerce BR · média</div>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <svg width="44" height="44" viewBox="0 0 44 44">
                <circle cx="22" cy="22" r="18" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="4"/>
                <circle cx="22" cy="22" r="18" fill="none" stroke={C_L.t3} strokeWidth="4"
                  strokeDasharray={2*Math.PI*18} strokeDashoffset={2*Math.PI*18*(1-SECTOR_SCORE/100)}
                  strokeLinecap="round" transform="rotate(-90 22 22)"/>
              </svg>
              <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:26, fontWeight:700, color:C_L.t2, letterSpacing:'-1px' }}>{SECTOR_SCORE}</span>
            </div>
          </div>

          {/* 2. Your score demo */}
          <div style={{ background:C_L.s1, border:`1px solid ${C_L.b}`, borderRadius:12, padding:'20px', boxShadow:'0 20px 60px rgba(0,0,0,0.5)' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
              <div>
                <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:9, fontWeight:700, color:C_L.t3, textTransform:'uppercase', letterSpacing:'0.7px', marginBottom:2 }}>Sua landing page</div>
                <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:10, color:C_L.t3 }}>NC-00847 · exemplo</div>
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:5, padding:'3px 9px', background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.25)', borderRadius:6 }}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={C_L.cr} strokeWidth="2.5" strokeLinecap="round"><polyline points="18,15 12,9 6,15"/></svg>
                <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:10, fontWeight:700, color:C_L.cr }}>-7 vs. setor</span>
              </div>
            </div>
            <div style={{ display:'flex', justifyContent:'center', position:'relative', marginBottom:16 }}>
              <ScoreRing score={DEMO_SCORE} color={DEMO_COLOR} size={140} stroke={11}/>
              <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', textAlign:'center' }}>
                <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:52, fontWeight:700, color:DEMO_COLOR, lineHeight:1, letterSpacing:'-2px' }}>{DEMO_SCORE}</div>
                <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:10, fontWeight:700, color:DEMO_COLOR, textTransform:'uppercase', letterSpacing:'1px' }}>Atenção</div>
              </div>
            </div>
            {/* Mini findings */}
            {[['Prova social ausente','cr','+11% CR'], ['Garantia mal posicionada','cr','+7% CR'], ['Urgência insuficiente','wa','+4% CR']].map(([t, sev, imp]) => (
              <div key={t} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'6px 0', borderBottom:`1px solid ${C_L.b}` }}>
                <div style={{ display:'flex', alignItems:'center', gap:7 }}>
                  <div style={{ width:5, height:5, borderRadius:'50%', background: sev==='cr' ? C_L.cr : C_L.wa, flexShrink:0 }}/>
                  <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:11, color:C_L.t2 }}>{t}</span>
                </div>
                <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:10, fontWeight:700, color: sev==='cr' ? C_L.cr : C_L.wa }}>{imp}</span>
              </div>
            ))}
            {/* Loss summary */}
            <div style={{ marginTop:12, padding:'10px 12px', background:'rgba(239,68,68,0.06)', border:'1px solid rgba(239,68,68,0.15)', borderRadius:8 }}>
              <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:11, color:C_L.cr }}>
                Receita estimada em risco: <span style={{ fontFamily:"'JetBrains Mono',monospace", fontWeight:700 }}>R$ 8.200/mês</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

Object.assign(window, { LandingNav, LandingHero, ScoreRing });
