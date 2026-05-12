// NeuroConvert — Landing Features, Methodology, Pricing, Footer

const CL = {
  bg:'#0A0A0A', s1:'#141414', s2:'#1C1C1C',
  b:'rgba(255,255,255,0.08)', bs:'rgba(255,255,255,0.14)',
  p:'#1D9E75', cr:'#EF4444', wa:'#F59E0B', go:'#22C55E',
  t1:'#FFFFFF', t2:'#9CA3AF', t3:'#4B5563',
};

const SecLabel = ({ children }) => (
  <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:11, fontWeight:700, color:CL.p, letterSpacing:'1.5px', textTransform:'uppercase', marginBottom:12 }}>{children}</div>
);

const LandingHowItWorks = () => (
  <section style={{ padding:'100px 40px', maxWidth:1100, margin:'0 auto' }}>
    <div style={{ textAlign:'center', marginBottom:64 }}>
      <SecLabel>Como funciona</SecLabel>
      <h2 style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:36, fontWeight:700, color:CL.t1, letterSpacing:'-1px', lineHeight:1.2, marginBottom:12 }}>Diagnóstico completo em 3 etapas</h2>
      <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:16, color:CL.t2, maxWidth:440, margin:'0 auto' }}>Da URL ao laudo com score e ações priorizadas — em menos de 2 minutos.</p>
    </div>
    <div style={{ display:'flex', gap:0, position:'relative' }}>
      {[
        { n:'01', icon:<><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></>, title:'Cole a URL', desc:'Qualquer landing page, checkout ou página de produto. Funciona com todas as plataformas.' },
        { n:'02', icon:<><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></>, title:'Análise neuropsicológica', desc:'47 critérios avaliados automaticamente: atenção, confiança, urgência, clareza e fricção cognitiva.' },
        { n:'03', icon:<><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="16" y1="13" x2="8" y2="13"/></>, title:'Laudo com score e ações', desc:'Score 0–100, benchmark do setor, problemas por severidade e quick wins ordenados por impacto.' },
      ].map((s, i) => (
        <div key={i} style={{ flex:1, display:'flex', flexDirection:'column', gap:14, padding:'0 32px', borderLeft: i>0 ? `1px solid ${CL.b}` : 'none' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ width:36, height:36, borderRadius:9, background:'rgba(29,158,117,0.08)', border:`1px solid rgba(29,158,117,0.2)`, display:'flex', alignItems:'center', justifyContent:'center' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={CL.p} strokeWidth="2" strokeLinecap="round">{s.icon}</svg>
            </div>
            <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:12, fontWeight:700, color:CL.p }}>{s.n}</span>
          </div>
          <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:18, fontWeight:600, color:CL.t1, lineHeight:1.3 }}>{s.title}</div>
          <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:14, color:CL.t2, lineHeight:1.65 }}>{s.desc}</div>
        </div>
      ))}
    </div>
  </section>
);

// Methodology / authority section
const LandingMethodology = () => (
  <section style={{ borderTop:`1px solid ${CL.b}`, borderBottom:`1px solid ${CL.b}`, padding:'80px 40px', background:CL.s1 }}>
    <div style={{ maxWidth:1100, margin:'0 auto', display:'grid', gridTemplateColumns:'1fr 1fr', gap:64, alignItems:'center' }}>
      <div>
        <SecLabel>Metodologia científica</SecLabel>
        <h2 style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:32, fontWeight:700, color:CL.t1, letterSpacing:'-0.8px', lineHeight:1.25, marginBottom:16 }}>47 critérios baseados em pesquisa peer-reviewed</h2>
        <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:15, color:CL.t2, lineHeight:1.7, marginBottom:24 }}>Nossa engine de análise combina princípios de neuroeconomia, psicologia da persuasão e UX research para identificar os exatos pontos de fricção cognitiva que inibem a conversão.</p>
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {[
            ['Psicologia da Persuasão', 'Cialdini 1984 · 6 princípios de influência', '#1D9E75'],
            ['Neuroeconomia Comportamental', 'Kahneman & Tversky · Teoria da Perspectiva', '#38BDF8'],
            ['UX Research & Cognitive Load', 'Nielsen Norman Group · Sweller 1988', '#9CA3AF'],
            ['Attention & Memory', 'Von Restorff 1933 · Efeito de isolamento', '#9CA3AF'],
          ].map(([t, s, c]) => (
            <div key={t} style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 14px', background:CL.s2, border:`1px solid ${CL.b}`, borderRadius:8 }}>
              <div style={{ width:6, height:6, borderRadius:'50%', background:c, flexShrink:0 }}/>
              <div>
                <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13, fontWeight:500, color:CL.t1 }}>{t}</div>
                <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:10, color:CL.t3, marginTop:2 }}>{s}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
        {[
          { val:'47', label:'critérios avaliados', color:CL.p },
          { val:'2.847', label:'laudos publicados', color:CL.t1 },
          { val:'94%', label:'precisão diagnóstica', color:CL.go },
          { val:'< 2min', label:'tempo de análise', color:CL.t1 },
        ].map(m => (
          <div key={m.val} style={{ background:CL.s2, border:`1px solid ${CL.b}`, borderRadius:10, padding:'20px 18px' }}>
            <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:30, fontWeight:700, color:m.color, letterSpacing:'-1px', lineHeight:1, marginBottom:6 }}>{m.val}</div>
            <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12, color:CL.t2 }}>{m.label}</div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const LandingPricing = ({ onChoose }) => {
  const plans = [
    { name:'Free', price:'R$ 0', period:'/mês', desc:'Para explorar a plataforma', features:['3 laudos por mês','Score 0–100','Top 3 problemas','Retenção 7 dias'], cta:'Começar grátis', primary:false },
    { name:'Pro', price:'R$ 197', period:'/mês', desc:'Para times e agências', features:['20 laudos por mês','Laudo completo com categorias','Recomendações priorizadas','Validador de ideias com IA','Histórico ilimitado','Exportar PDF','● Monitoramento mensal automático'], cta:'Assinar Pro', primary:true },
    { name:'Enterprise', price:'Sob consulta', period:'', desc:'Para grandes operações', features:['Laudos ilimitados','API de integração','White-label','SLA garantido','Account manager'], cta:'Falar com vendas', primary:false },
  ];
  return (
    <section style={{ padding:'100px 40px', maxWidth:1100, margin:'0 auto' }}>
      <div style={{ textAlign:'center', marginBottom:56 }}>
        <SecLabel>Preços</SecLabel>
        <h2 style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:36, fontWeight:700, color:CL.t1, letterSpacing:'-1px' }}>Planos para cada estágio</h2>
      </div>
      <div style={{ display:'flex', gap:16, alignItems:'stretch' }}>
        {plans.map(pl => (
          <div key={pl.name} style={{ flex:1, background: pl.primary ? 'linear-gradient(150deg,#111e16,#141414)' : CL.s1, border:`1px solid ${pl.primary ? 'rgba(29,158,117,0.35)' : CL.b}`, borderRadius:14, padding:'28px 24px', display:'flex', flexDirection:'column', gap:18, position:'relative', boxShadow: pl.primary ? '0 0 40px rgba(29,158,117,0.12)' : 'none' }}>
            {pl.primary && <div style={{ position:'absolute', top:-12, left:'50%', transform:'translateX(-50%)', background:CL.p, borderRadius:9999, padding:'3px 14px', fontFamily:"'DM Sans',sans-serif", fontSize:11, fontWeight:600, color:'#fff', whiteSpace:'nowrap' }}>Mais popular</div>}
            <div>
              <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:15, fontWeight:600, color:CL.t1 }}>{pl.name}</div>
              <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12, color:CL.t2, marginTop:3 }}>{pl.desc}</div>
            </div>
            <div style={{ display:'flex', alignItems:'flex-end', gap:2 }}>
              <span style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:32, fontWeight:700, color:CL.t1, letterSpacing:'-1px', lineHeight:1 }}>{pl.price}</span>
              <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13, color:CL.t2, marginBottom:3 }}>{pl.period}</span>
            </div>
            <div style={{ height:1, background:CL.b }}/>
            <div style={{ display:'flex', flexDirection:'column', gap:9, flex:1 }}>
              {pl.features.map(f => {
                const isMonitoring = f.startsWith('●');
                const label = isMonitoring ? f.slice(2) : f;
                return (
                  <div key={f} style={{ display:'flex', alignItems:'center', gap:8, padding: isMonitoring ? '6px 8px' : '0', background: isMonitoring ? 'rgba(29,158,117,0.06)' : 'transparent', borderRadius: isMonitoring ? 6 : 0, border: isMonitoring ? '1px solid rgba(29,158,117,0.15)' : 'none', margin: isMonitoring ? '2px 0' : '0' }}>
                    {isMonitoring ? (
                      <div style={{ display:'flex', alignItems:'center', gap:4 }}>
                        <div style={{ width:6, height:6, borderRadius:'50%', background:CL.p, animation:'pulse 2s cubic-bezier(0.4,0,0.6,1) infinite', flexShrink:0 }}/>
                        <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12, color:CL.p, fontWeight:600 }}>{label}</span>
                      </div>
                    ) : (
                      <>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={CL.p} strokeWidth="2.5" strokeLinecap="round"><polyline points="20,6 9,17 4,12"/></svg>
                        <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13, color:CL.t2 }}>{label}</span>
                      </>
                    )}
                  </div>
                );
              })}
              <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}`}</style>
            </div>
            <button onClick={() => onChoose && onChoose(pl.name)} style={{ height:40, borderRadius:8, border:'none', cursor:'pointer', background: pl.primary ? CL.p : 'transparent', color: pl.primary ? '#fff' : CL.t2, border: pl.primary ? 'none' : `1px solid ${CL.b}`, fontFamily:"'DM Sans',sans-serif", fontSize:13, fontWeight:600, transition:'all 150ms' }}
              onMouseEnter={e => { if(pl.primary) e.target.style.background='#25C98F'; else { e.target.style.borderColor=CL.bs; e.target.style.color=CL.t1; }}}
              onMouseLeave={e => { if(pl.primary) e.target.style.background=CL.p; else { e.target.style.borderColor=CL.b; e.target.style.color=CL.t2; }}}>{pl.cta}</button>
          </div>
        ))}
      </div>
      {/* Monitoring callout */}
      <div style={{ marginTop:32, padding:'20px 24px', background:'linear-gradient(135deg, rgba(29,158,117,0.07), rgba(29,158,117,0.03))', border:'1px solid rgba(29,158,117,0.2)', borderRadius:12, display:'flex', gap:20, alignItems:'center' }}>
        <div style={{ display:'flex', alignItems:'center', gap:6, flexShrink:0 }}>
          <div style={{ width:8, height:8, borderRadius:'50%', background:CL.p, animation:'pulse 2s cubic-bezier(0.4,0,0.6,1) infinite' }}/>
          <span style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:14, fontWeight:700, color:CL.p, whiteSpace:'nowrap' }}>Monitoramento mensal</span>
        </div>
        <div style={{ height:32, width:1, background:'rgba(29,158,117,0.2)', flexShrink:0 }}/>
        <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13, color:CL.t2, lineHeight:1.6, margin:0 }}>
          Incluído no Plano Pro. A cada 30 dias, re-analisamos sua página automaticamente e enviamos um relatório comparando o score atual com o anterior — sem você precisar lembrar.
        </p>
        <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:11, fontWeight:600, color:CL.p, background:'rgba(29,158,117,0.1)', border:'1px solid rgba(29,158,117,0.2)', borderRadius:9999, padding:'3px 10px', flexShrink:0, whiteSpace:'nowrap' }}>Pro</span>
      </div>
    </section>
  );
};

const LandingFooter = () => (
  <footer style={{ borderTop:`1px solid ${CL.b}`, padding:'48px 40px' }}>
    <div style={{ maxWidth:1100, margin:'0 auto', display:'flex', justifyContent:'space-between', gap:40, flexWrap:'wrap' }}>
      <div style={{ maxWidth:220 }}>
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12 }}>
          <svg width="20" height="20" viewBox="0 0 36 36" fill="none"><rect x="4" y="6" width="6" height="24" rx="3" fill="#1D9E75"/><polygon points="10,6 16,6 22,30 16,30" fill="#1D9E75"/><rect x="16" y="6" width="6" height="24" rx="3" fill="#1D9E75"/><circle cx="28" cy="9" r="3" fill="#25C98F"/></svg>
          <span style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:14, fontWeight:700, color:CL.t1 }}>Neuro<span style={{ color:CL.p }}>Convert</span></span>
        </div>
        <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12, color:CL.t3, lineHeight:1.6 }}>Neuromarketing aplicado à otimização de conversão.</p>
      </div>
      {[{title:'Produto',links:['Como funciona','Preços','Exemplos','API']},{title:'Empresa',links:['Sobre','Blog','Contato']},{title:'Legal',links:['Privacidade','Termos']}].map(col => (
        <div key={col.title}>
          <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:10, fontWeight:700, color:CL.t3, textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:12 }}>{col.title}</div>
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {col.links.map(l => <a key={l} href="#" style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13, color:CL.t2, textDecoration:'none' }}>{l}</a>)}
          </div>
        </div>
      ))}
    </div>
    <div style={{ maxWidth:1100, margin:'32px auto 0', paddingTop:24, borderTop:`1px solid ${CL.b}`, display:'flex', justifyContent:'space-between' }}>
      <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:11, color:CL.t3 }}>© 2026 NeuroConvert.</span>
      <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:10, color:CL.t3 }}>v1.0.0</span>
    </div>
  </footer>
);

Object.assign(window, { LandingHowItWorks, LandingMethodology, LandingPricing, LandingFooter });
