// NeuroConvert Dashboard — Nova Análise screen

const DashNewAnalysis = ({ onComplete }) => {
  const [step, setStep] = React.useState('form'); // 'form' | 'loading' | 'done'
  const [url, setUrl] = React.useState('');
  const [progress, setProgress] = React.useState(0);
  const [progressLabel, setProgressLabel] = React.useState('');

  const loadingSteps = [
    'Acessando a página…',
    'Capturando elementos visuais…',
    'Avaliando hierarquia de conteúdo…',
    'Analisando fricção cognitiva…',
    'Calculando score de confiança…',
    'Gerando laudo…',
  ];

  const startAnalysis = () => {
    if (!url) return;
    setStep('loading');
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setProgress(Math.round((i / loadingSteps.length) * 100));
      setProgressLabel(loadingSteps[i - 1] || '');
      if (i >= loadingSteps.length) {
        clearInterval(interval);
        setTimeout(() => setStep('done'), 600);
      }
    }, 600);
  };

  if (step === 'loading') return (
    <div style={{ maxWidth: 500, display: 'flex', flexDirection: 'column', gap: 28, padding: '40px 0' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 20, fontWeight: 600, color: '#FFFFFF' }}>Analisando sua página</div>
        <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: '#9CA3AF' }}>{url}</div>
      </div>
      {/* Animated gauge placeholder */}
      <div style={{ display: 'flex', justifyContent: 'center', padding: '24px 0' }}>
        <div style={{ position: 'relative', width: 120, height: 120 }}>
          <svg width="120" height="120" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="50" fill="none" stroke="#222222" strokeWidth="8"/>
            <circle cx="60" cy="60" r="50" fill="none" stroke="#1D9E75" strokeWidth="8"
              strokeDasharray="314" strokeDashoffset={314 - (progress / 100) * 314}
              strokeLinecap="round" transform="rotate(-90 60 60)"
              style={{ transition: 'stroke-dashoffset 0.5s cubic-bezier(0.16,1,0.3,1)' }}/>
          </svg>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 28, fontWeight: 700, color: '#1D9E75' }}>{progress}</span>
          </div>
        </div>
      </div>
      <div style={{ background: '#141414', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: '14px 18px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {loadingSteps.map((s, i) => {
            const done = (i / loadingSteps.length) * 100 < progress;
            const active = progressLabel === s;
            return (
              <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 10, opacity: done || active ? 1 : 0.3, transition: 'opacity 0.3s' }}>
                <div style={{ width: 18, height: 18, borderRadius: '50%', border: `1.5px solid ${done ? '#1D9E75' : active ? '#1D9E75' : '#2A2A2A'}`, background: done ? 'rgba(29,158,117,0.15)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {done && <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#1D9E75" strokeWidth="3" strokeLinecap="round"><polyline points="20,6 9,17 4,12"/></svg>}
                  {active && <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#1D9E75' }}/>}
                </div>
                <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: active ? '#FFFFFF' : '#9CA3AF' }}>{s}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  if (step === 'done') return (
    <div style={{ maxWidth: 480, display: 'flex', flexDirection: 'column', gap: 24, padding: '40px 0' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: '32px', background: '#141414', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, textAlign: 'center' }}>
        <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2.5" strokeLinecap="round"><polyline points="20,6 9,17 4,12"/></svg>
        </div>
        <div>
          <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 20, fontWeight: 700, color: '#FFFFFF', marginBottom: 6 }}>Laudo gerado com sucesso</div>
          <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: '#9CA3AF' }}>Score 54 · 2 problemas críticos detectados</div>
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
          <button onClick={onComplete} style={{ height: 40, padding: '0 20px', background: '#1D9E75', color: '#fff', border: 'none', borderRadius: 7, fontFamily: "'DM Sans',sans-serif", fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Ver laudo completo</button>
          <button onClick={() => { setStep('form'); setUrl(''); setProgress(0); }} style={{ height: 40, padding: '0 16px', background: 'transparent', color: '#9CA3AF', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 7, fontFamily: "'DM Sans',sans-serif", fontSize: 13, cursor: 'pointer' }}>Nova análise</button>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ maxWidth: 560, display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 20, fontWeight: 600, color: '#FFFFFF', marginBottom: 6 }}>Analisar uma página</h2>
        <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 14, color: '#9CA3AF' }}>Cole a URL completa da página que deseja diagnosticar. A análise leva menos de 2 minutos.</p>
      </div>

      <div style={{ background: '#141414', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '28px 24px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, fontWeight: 500, color: '#9CA3AF' }}>URL da página <span style={{ color: '#EF4444' }}>*</span></label>
          <input value={url} onChange={e => setUrl(e.target.value)}
            type="url" placeholder="https://suapagina.com.br/landing"
            style={{ height: 42, padding: '0 14px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, fontFamily: "'DM Sans',sans-serif", fontSize: 14, color: '#FFFFFF', outline: 'none' }}
            onFocus={e => e.target.style.borderColor='#1D9E75'}
            onBlur={e => e.target.style.borderColor='#2A2A2A'}/>
          <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, color: '#6B7280' }}>A página precisa ser acessível publicamente</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, fontWeight: 500, color: '#9CA3AF' }}>Tipo de página</label>
          <select style={{ height: 42, padding: '0 14px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, fontFamily: "'DM Sans',sans-serif", fontSize: 14, color: '#FFFFFF', outline: 'none', appearance: 'none' }}>
            <option>Landing page</option><option>Checkout</option><option>Home</option><option>Produto</option>
          </select>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, fontWeight: 500, color: '#9CA3AF' }}>Contexto adicional <span style={{ color: '#6B7280', fontWeight: 400 }}>(opcional)</span></label>
          <textarea placeholder="Ex: página de venda de curso online, público 35–50 anos, CTA para compra direta…" rows={3}
            style={{ padding: '10px 14px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: '#FFFFFF', outline: 'none', resize: 'vertical', lineHeight: 1.5 }}
            onFocus={e => e.target.style.borderColor='#1D9E75'}
            onBlur={e => e.target.style.borderColor='#2A2A2A'}/>
        </div>

        <div style={{ height: 1, background: '#2A2A2A' }}/>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, color: '#6B7280' }}>
            Laudos restantes: <span style={{ color: '#FFFFFF', fontWeight: 600 }}>7 de 20</span>
          </div>
          <button onClick={startAnalysis} disabled={!url}
            style={{ height: 40, padding: '0 24px', background: url ? '#1D9E75' : '#1a2d40', color: url ? '#fff' : '#6B7280', border: 'none', borderRadius: 8, fontFamily: "'DM Sans',sans-serif", fontSize: 14, fontWeight: 600, cursor: url ? 'pointer' : 'not-allowed', transition: 'all 150ms' }}>
            Iniciar análise →
          </button>
        </div>
      </div>

      <div style={{ background: '#141414', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: '14px 18px', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0, marginTop: 1 }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, color: '#9CA3AF', lineHeight: 1.6 }}>
          A análise avalia mais de 40 critérios neuropsicológicos. Para resultados mais precisos, adicione contexto sobre o objetivo da página e o perfil do visitante ideal.
        </p>
      </div>
    </div>
  );
};

Object.assign(window, { DashNewAnalysis });
