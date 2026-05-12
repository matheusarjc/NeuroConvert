// NeuroConvert — Onboarding Flow
// Step 1: Welcome · Step 2: URL + Context · Step 3: Analyzing · Step 4: Score reveal

const C_OB = {
  bg:'#0A0A0A', s1:'#141414', s2:'#1C1C1C',
  b:'rgba(255,255,255,0.07)', bs:'rgba(255,255,255,0.13)',
  p:'#1D9E75', cr:'#EF4444', wa:'#F59E0B', go:'#22C55E',
  t1:'#FFFFFF', t2:'#9CA3AF', t3:'#4B5563',
};

// ── Step indicator ────────────────────────────────────────
const StepDots = ({ current, total }) => (
  <div style={{ display:'flex', alignItems:'center', gap:6 }}>
    {Array.from({ length: total }).map((_, i) => (
      <div key={i} style={{ height:3, borderRadius:9999, transition:'all 0.3s cubic-bezier(0.16,1,0.3,1)', background: i === current ? C_OB.p : i < current ? 'rgba(29,158,117,0.3)' : 'rgba(255,255,255,0.1)', width: i === current ? 20 : 8 }}/>
    ))}
  </div>
);

// ── Step 1: Welcome ───────────────────────────────────────
const StepWelcome = ({ onNext }) => {
  const [vis, setVis] = React.useState(false);
  React.useEffect(() => { const t = setTimeout(() => setVis(true), 80); return () => clearTimeout(t); }, []);

  return (
    <div style={{ opacity: vis?1:0, transform: vis?'none':'translateY(20px)', transition:'all 0.5s cubic-bezier(0.16,1,0.3,1)', display:'flex', flexDirection:'column', gap:32, maxWidth:520 }}>
      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
        <svg width="32" height="32" viewBox="0 0 36 36" fill="none">
          <rect x="4" y="6" width="6" height="24" rx="3" fill="#1D9E75"/>
          <polygon points="10,6 16,6 22,30 16,30" fill="#1D9E75"/>
          <rect x="16" y="6" width="6" height="24" rx="3" fill="#1D9E75"/>
          <circle cx="28" cy="9" r="3" fill="#25C98F"/>
        </svg>
        <span style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:20, fontWeight:700, color:C_OB.t1 }}>Neuro<span style={{ color:C_OB.p }}>Convert</span></span>
      </div>

      <div>
        <h1 style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:36, fontWeight:700, color:C_OB.t1, letterSpacing:'-1px', lineHeight:1.1, marginBottom:14 }}>
          Descubra o que está impedindo seus visitantes de comprar
        </h1>
        <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:16, color:C_OB.t2, lineHeight:1.7, marginBottom:0 }}>
          NeuroConvert analisa sua página com 47 critérios neuropsicológicos e entrega um laudo com score 0–100 e ações priorizadas por impacto na conversão.
        </p>
      </div>

      <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
        {[
          ['Score 0–100', 'Diagnóstico preciso com benchmark do seu setor', '#1D9E75'],
          ['Problemas classificados', 'Crítico, atenção e bom — com princípio científico identificado', '#9CA3AF'],
          ['Quick wins', 'Ações priorizadas por impacto estimado na conversão', '#9CA3AF'],
        ].map(([title, desc, c]) => (
          <div key={title} style={{ display:'flex', alignItems:'flex-start', gap:12, padding:'12px 14px', background:C_OB.s1, border:`1px solid ${C_OB.b}`, borderRadius:10 }}>
            <div style={{ width:18, height:18, borderRadius:'50%', background:'rgba(29,158,117,0.1)', border:'1px solid rgba(29,158,117,0.2)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, marginTop:1 }}>
              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#1D9E75" strokeWidth="3" strokeLinecap="round"><polyline points="20,6 9,17 4,12"/></svg>
            </div>
            <div>
              <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13, fontWeight:500, color:C_OB.t1, marginBottom:2 }}>{title}</div>
              <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12, color:C_OB.t2 }}>{desc}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12, color:C_OB.t3 }}>Grátis · Sem cartão · &lt;2 minutos</div>
        <button onClick={onNext} style={{ height:44, padding:'0 28px', background:C_OB.p, color:'#fff', border:'none', borderRadius:9, fontFamily:"'DM Sans',sans-serif", fontSize:15, fontWeight:600, cursor:'pointer', transition:'all 150ms' }}
          onMouseEnter={e => { e.target.style.background='#25C98F'; e.target.style.transform='translateY(-1px)'; }}
          onMouseLeave={e => { e.target.style.background=C_OB.p; e.target.style.transform='none'; }}>
          Fazer primeira análise →
        </button>
      </div>
    </div>
  );
};

// ── Step 2: URL + Context ─────────────────────────────────
const StepUrl = ({ onNext, onBack }) => {
  const [url, setUrl] = React.useState('');
  const [type, setType] = React.useState('landing');
  const [context, setContext] = React.useState('');
  const [vis, setVis] = React.useState(false);
  React.useEffect(() => { const t = setTimeout(() => setVis(true), 60); return () => clearTimeout(t); }, []);

  const types = [
    { id:'landing', label:'Landing page' },
    { id:'checkout', label:'Checkout' },
    { id:'home', label:'Home' },
    { id:'product', label:'Produto' },
  ];

  return (
    <div style={{ opacity: vis?1:0, transform: vis?'none':'translateY(16px)', transition:'all 0.4s cubic-bezier(0.16,1,0.3,1)', display:'flex', flexDirection:'column', gap:24, maxWidth:520 }}>
      <div>
        <h2 style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:26, fontWeight:700, color:C_OB.t1, letterSpacing:'-0.6px', marginBottom:6 }}>Qual página você quer diagnosticar?</h2>
        <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:14, color:C_OB.t2 }}>Comece com a sua principal página de conversão.</p>
      </div>

      {/* URL */}
      <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
        <label style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12, fontWeight:600, color:C_OB.t2 }}>URL da página <span style={{ color:C_OB.cr }}>*</span></label>
        <input value={url} onChange={e => setUrl(e.target.value)} type="url" placeholder="https://suapagina.com.br"
          style={{ height:44, padding:'0 14px', background:C_OB.s1, border:`1px solid ${C_OB.b}`, borderRadius:9, fontFamily:"'DM Sans',sans-serif", fontSize:14, color:C_OB.t1, outline:'none', transition:'border-color 150ms' }}
          onFocus={e => e.target.style.borderColor='rgba(29,158,117,0.5)'}
          onBlur={e => e.target.style.borderColor=C_OB.b}/>
        <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:11, color:C_OB.t3 }}>A página precisa ser publicamente acessível</span>
      </div>

      {/* Type selector */}
      <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
        <label style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12, fontWeight:600, color:C_OB.t2 }}>Tipo de página</label>
        <div style={{ display:'flex', gap:8 }}>
          {types.map(t => (
            <button key={t.id} onClick={() => setType(t.id)} style={{ flex:1, height:38, borderRadius:8, border:'1px solid', cursor:'pointer', fontFamily:"'DM Sans',sans-serif", fontSize:12, fontWeight:500, transition:'all 150ms', borderColor: type===t.id ? 'rgba(29,158,117,0.4)' : C_OB.b, background: type===t.id ? 'rgba(29,158,117,0.08)' : 'transparent', color: type===t.id ? C_OB.p : C_OB.t2 }}>{t.label}</button>
          ))}
        </div>
      </div>

      {/* Context — key feature */}
      <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <label style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12, fontWeight:600, color:C_OB.t2 }}>Contexto da página</label>
          <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:11, color:C_OB.p, fontWeight:500 }}>Melhora muito o diagnóstico</span>
        </div>
        <textarea value={context} onChange={e => setContext(e.target.value)} rows={3}
          placeholder="Ex: Vendo curso de gestão financeira para empreendedores 30–50 anos. Ticket de R$497. Principal objeção: 'não tenho tempo para fazer o curso'."
          style={{ padding:'10px 14px', background:C_OB.s1, border:`1px solid ${C_OB.b}`, borderRadius:9, fontFamily:"'DM Sans',sans-serif", fontSize:13, color:C_OB.t1, outline:'none', resize:'vertical', lineHeight:1.6 }}
          onFocus={e => e.target.style.borderColor='rgba(29,158,117,0.5)'}
          onBlur={e => e.target.style.borderColor=C_OB.b}/>
        <div style={{ padding:'10px 12px', background:'rgba(29,158,117,0.05)', border:'1px solid rgba(29,158,117,0.15)', borderRadius:8, display:'flex', gap:8, alignItems:'flex-start' }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#1D9E75" strokeWidth="2" strokeLinecap="round" style={{ flexShrink:0, marginTop:1 }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:11, color:C_OB.t2, lineHeight:1.6 }}>
            Descreva o <strong style={{ color:C_OB.t1 }}>objetivo</strong>, o <strong style={{ color:C_OB.t1 }}>público</strong> e a <strong style={{ color:C_OB.t1 }}>principal objeção</strong>. Quanto mais contexto, mais preciso o diagnóstico.
          </span>
        </div>
      </div>

      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <button onClick={onBack} style={{ background:'none', border:'none', fontFamily:"'DM Sans',sans-serif", fontSize:13, color:C_OB.t3, cursor:'pointer', padding:0 }}>← Voltar</button>
        <button onClick={() => url && onNext({ url, type, context })} style={{ height:44, padding:'0 28px', background: url ? C_OB.p : 'rgba(255,255,255,0.05)', color: url ? '#fff' : C_OB.t3, border:'none', borderRadius:9, fontFamily:"'DM Sans',sans-serif", fontSize:14, fontWeight:600, cursor: url ? 'pointer' : 'not-allowed', transition:'all 150ms' }}>
          Analisar página →
        </button>
      </div>
    </div>
  );
};

// ── Step 3: Analyzing ─────────────────────────────────────
const StepAnalyzing = ({ data, onDone }) => {
  const [step, setStep] = React.useState(0);
  const steps = [
    'Acessando a página…',
    'Capturando estrutura e conteúdo…',
    'Avaliando clareza da proposta de valor…',
    'Analisando fricção cognitiva no CTA…',
    'Verificando elementos de confiança…',
    'Calculando score e identificando quick wins…',
    'Gerando laudo final…',
  ];

  React.useEffect(() => {
    const iv = setInterval(() => {
      setStep(s => {
        if (s >= steps.length - 1) { clearInterval(iv); setTimeout(onDone, 700); return s; }
        return s + 1;
      });
    }, 700);
    return () => clearInterval(iv);
  }, []);

  const progress = Math.round((step / (steps.length - 1)) * 100);

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:28, maxWidth:480 }}>
      <div>
        <h2 style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:22, fontWeight:700, color:C_OB.t1, marginBottom:6 }}>Analisando sua página</h2>
        <p style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:11, color:C_OB.t3, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{data?.url}</p>
      </div>

      {/* Progress ring */}
      <div style={{ display:'flex', justifyContent:'center', padding:'16px 0' }}>
        <div style={{ position:'relative', width:120, height:120 }}>
          <svg width="120" height="120" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="7"/>
            <circle cx="60" cy="60" r="50" fill="none" stroke="#1D9E75" strokeWidth="7"
              strokeDasharray="314" strokeDashoffset={314-(progress/100)*314}
              strokeLinecap="round" transform="rotate(-90 60 60)"
              style={{ transition:'stroke-dashoffset 0.6s cubic-bezier(0.16,1,0.3,1)', filter:'drop-shadow(0 0 6px rgba(29,158,117,0.4))' }}/>
          </svg>
          <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
            <span style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:32, fontWeight:700, color:C_OB.p, lineHeight:1 }}>{progress}</span>
            <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:10, color:C_OB.t3, marginTop:3 }}>%</span>
          </div>
        </div>
      </div>

      {/* Steps checklist */}
      <div style={{ background:C_OB.s1, border:`1px solid ${C_OB.b}`, borderRadius:12, padding:'16px 18px', display:'flex', flexDirection:'column', gap:9 }}>
        {steps.map((s, i) => {
          const done = i < step;
          const active = i === step;
          return (
            <div key={s} style={{ display:'flex', alignItems:'center', gap:10, opacity: done||active ? 1 : 0.25, transition:'opacity 0.3s' }}>
              <div style={{ width:18, height:18, borderRadius:'50%', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', background: done ? 'rgba(29,158,117,0.12)' : 'transparent', border:`1.5px solid ${done ? 'rgba(29,158,117,0.5)' : active ? C_OB.p : 'rgba(255,255,255,0.1)'}`, transition:'all 0.3s' }}>
                {done && <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#1D9E75" strokeWidth="3" strokeLinecap="round"><polyline points="20,6 9,17 4,12"/></svg>}
                {active && <div style={{ width:6, height:6, borderRadius:'50%', background:C_OB.p }}/>}
              </div>
              <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12, color: active ? C_OB.t1 : C_OB.t2 }}>{s}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ── Step 4: Score reveal ──────────────────────────────────
const StepReveal = ({ onViewFull, onDashboard }) => {
  const score = 54;
  const scoreColor = '#F59E0B';
  const r = 66, stroke = 11, circ = 2 * Math.PI * r;
  const [animated, setAnimated] = React.useState(0);
  const [count, setCount] = React.useState(0);
  const [vis, setVis] = React.useState(false);

  React.useEffect(() => {
    const t1 = setTimeout(() => { setVis(true); setAnimated(score); }, 200);
    const t0 = performance.now();
    const raf = (now) => {
      const p = Math.min((now - t0) / 1400, 1);
      const e = 1 - Math.pow(2, -10 * p);
      setCount(Math.round(score * e));
      if (p < 1) requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);
    return () => { clearTimeout(t1); };
  }, []);

  const size = 144;
  const offset = circ - (animated / 100) * circ;
  const lossPercent = Math.round((100 - score) * 0.45);

  return (
    <div style={{ opacity: vis?1:0, transform: vis?'none':'scale(0.97)', transition:'all 0.5s cubic-bezier(0.16,1,0.3,1)', display:'flex', flexDirection:'column', gap:24, maxWidth:520 }}>
      {/* Score hero */}
      <div style={{ background:C_OB.s1, border:`1px solid ${C_OB.b}`, borderRadius:14, padding:'28px 32px', textAlign:'center' }}>
        <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:11, fontWeight:700, color:C_OB.t3, textTransform:'uppercase', letterSpacing:'0.7px', marginBottom:16 }}>Sua primeira análise</p>
        <div style={{ position:'relative', width:size, height:size, margin:'0 auto 16px' }}>
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ overflow:'visible' }}>
            <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={stroke}/>
            <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={scoreColor} strokeWidth={stroke}
              strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
              transform={`rotate(-90 ${size/2} ${size/2})`}
              style={{ transition:'stroke-dashoffset 1.4s cubic-bezier(0.16,1,0.3,1)', filter:`drop-shadow(0 0 8px ${scoreColor}55)` }}/>
          </svg>
          <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
            <span style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:60, fontWeight:700, color:scoreColor, lineHeight:1, letterSpacing:'-2px' }}>{count}</span>
            <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:10, fontWeight:700, color:scoreColor, textTransform:'uppercase', letterSpacing:'1px', marginTop:3 }}>Atenção</span>
          </div>
        </div>
        <p style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:20, fontWeight:700, color:C_OB.t1, letterSpacing:'-0.4px', marginBottom:6 }}>
          Você está perdendo <span style={{ fontFamily:"'JetBrains Mono',monospace", color:C_OB.cr }}>{lossPercent}%</span> de conversão
        </p>
        <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13, color:C_OB.t2 }}>2 problemas críticos e 4 pontos de atenção identificados</p>
      </div>

      {/* Top 3 quick wins */}
      <div style={{ background:C_OB.s1, border:`1px solid ${C_OB.b}`, borderRadius:12, padding:'16px 18px' }}>
        <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:10, fontWeight:700, color:C_OB.t3, textTransform:'uppercase', letterSpacing:'0.6px', marginBottom:12 }}>Top 3 quick wins</p>
        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          {[
            { n:1, action:'Adicionar depoimentos acima do CTA', impact:'+11% CR', principle:'Prova Social · Cialdini' },
            { n:2, action:'Inserir badge de garantia junto ao botão', impact:'+7% CR', principle:'Aversão ao Risco' },
            { n:3, action:'Reescrever headline com benefício direto', impact:'+6% CR', principle:'Fluência de Processamento' },
          ].map(w => (
            <div key={w.n} style={{ display:'grid', gridTemplateColumns:'20px 1fr auto', gap:10, alignItems:'center' }}>
              <div style={{ width:20, height:20, borderRadius:'50%', background:'rgba(245,158,11,0.1)', border:'1px solid rgba(245,158,11,0.25)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <span style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:10, fontWeight:700, color:C_OB.wa }}>{w.n}</span>
              </div>
              <div>
                <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12, fontWeight:500, color:C_OB.t1 }}>{w.action}</div>
                <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:9, color:C_OB.t3, marginTop:2 }}>{w.principle}</div>
              </div>
              <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:12, fontWeight:700, color:C_OB.go }}>{w.impact}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display:'flex', gap:10 }}>
        <button onClick={onViewFull} style={{ flex:1, height:44, background:C_OB.p, color:'#fff', border:'none', borderRadius:9, fontFamily:"'DM Sans',sans-serif", fontSize:14, fontWeight:600, cursor:'pointer', transition:'background 150ms' }}
          onMouseEnter={e => e.target.style.background='#25C98F'} onMouseLeave={e => e.target.style.background=C_OB.p}>
          Ver laudo completo →
        </button>
        <button onClick={onDashboard} style={{ height:44, padding:'0 18px', background:'transparent', color:C_OB.t2, border:`1px solid ${C_OB.b}`, borderRadius:9, fontFamily:"'DM Sans',sans-serif", fontSize:13, cursor:'pointer' }}>
          Dashboard
        </button>
      </div>
    </div>
  );
};

// ── Root onboarding component ─────────────────────────────
const DashOnboarding = ({ onComplete }) => {
  const [step, setStep] = React.useState(0);
  const [analysisData, setAnalysisData] = React.useState(null);

  return (
    <div style={{ minHeight:'calc(100vh - 56px)', display:'flex', alignItems:'center', justifyContent:'center', padding:40 }}>
      <div style={{ display:'flex', flexDirection:'column', gap:24, width:'100%', maxWidth:560 }}>
        {/* Step dots */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <StepDots current={step} total={4}/>
          <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:10, color:C_OB.t3 }}>{step+1} / 4</span>
        </div>

        {step === 0 && <StepWelcome onNext={() => setStep(1)}/>}
        {step === 1 && <StepUrl onNext={(d) => { setAnalysisData(d); setStep(2); }} onBack={() => setStep(0)}/>}
        {step === 2 && <StepAnalyzing data={analysisData} onDone={() => setStep(3)}/>}
        {step === 3 && <StepReveal onViewFull={() => onComplete('detail')} onDashboard={() => onComplete('home')}/>}
      </div>
    </div>
  );
};

Object.assign(window, { DashOnboarding });
