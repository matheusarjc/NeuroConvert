// NeuroConvert Admin Panel — Shell + Overview Screen

const ADMIN_NAV = [
  { id: 'overview', label: 'Visão geral', icon: <><polyline points="22,12 18,12 15,21 9,3 6,12 2,12"/></> },
  { id: 'users',    label: 'Usuários',    icon: <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></> },
  { id: 'subs',     label: 'Assinaturas', icon: <><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></> },
  { id: 'laudos',   label: 'Laudos',      icon: <><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></> },
];

const AdminIcon = ({ d, size = 15, stroke = '#9CA3AF' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{d}</svg>
);

const AdminShell = ({ active, setScreen, children, title }) => (
  <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#0A0A0A' }}>
    <aside style={{ width: 200, background: '#141414', borderRight: '1px solid #1C1C1C', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
      <div style={{ padding: '18px 16px 14px', borderBottom: '1px solid #1C1C1C' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 4 }}>
          <svg width="22" height="22" viewBox="0 0 36 36" fill="none">
            <rect x="4" y="6" width="6" height="24" rx="3" fill="#1D9E75"/>
            <polygon points="10,6 16,6 22,30 16,30" fill="#1D9E75"/>
            <rect x="16" y="6" width="6" height="24" rx="3" fill="#1D9E75"/>
            <circle cx="28" cy="9" r="3" fill="#25C98F"/>
          </svg>
          <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 14, fontWeight: 700, color: '#FFFFFF' }}>
            Neuro<span style={{ color: '#1D9E75' }}>Convert</span>
          </span>
        </div>
        <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 10, fontWeight: 600, color: '#EF4444', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 4, padding: '2px 6px', display: 'inline-block', letterSpacing: '0.5px' }}>ADMIN</div>
      </div>
      <nav style={{ flex: 1, padding: '10px 8px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {ADMIN_NAV.map(item => (
          <div key={item.id} onClick={() => setScreen(item.id)} style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '7px 10px', borderRadius: 7, cursor: 'pointer', background: active === item.id ? 'rgba(29,158,117,0.08)' : 'transparent', border: active === item.id ? '1px solid rgba(29,158,117,0.15)' : '1px solid transparent', transition: 'all 150ms' }}>
            <AdminIcon d={item.icon} stroke={active === item.id ? '#1D9E75' : '#6B7280'}/>
            <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, fontWeight: 500, color: active === item.id ? '#1D9E75' : '#9CA3AF' }}>{item.label}</span>
          </div>
        ))}
      </nav>
      <div style={{ padding: '12px 8px', borderTop: '1px solid #1C1C1C' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px' }}>
          <div style={{ width: 26, height: 26, borderRadius: '50%', background: '#1C1C1C', border: '1px solid #2A2A2A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 10, fontWeight: 700, color: '#9CA3AF' }}>A</span>
          </div>
          <div>
            <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, fontWeight: 500, color: '#9CA3AF' }}>Admin</div>
            <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, color: '#6B7280' }}>admin@neuroconvert.io</div>
          </div>
        </div>
      </div>
    </aside>
    <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ height: 52, borderBottom: '1px solid #1C1C1C', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', background: '#141414', flexShrink: 0 }}>
        <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 15, fontWeight: 600, color: '#FFFFFF' }}>{title}</span>
        <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, color: '#6B7280' }}>11 mai 2026</span>
      </div>
      <div style={{ flex: 1, overflow: 'auto', padding: 24, background: '#0A0A0A' }}>{children}</div>
    </main>
  </div>
);

// Sparkline mini-chart
const Spark = ({ data, color }) => {
  const w = 80, h = 32, pad = 2;
  const min = Math.min(...data), max = Math.max(...data);
  const pts = data.map((v, i) => {
    const x = pad + (i / (data.length - 1)) * (w - pad * 2);
    const y = pad + (1 - (v - min) / (max - min || 1)) * (h - pad * 2);
    return `${x},${y}`;
  }).join(' ');
  const area = `M${pts.split(' ')[0]} L${pts.split(' ').join(' L')} L${w - pad},${h} L${pad},${h} Z`;
  return (
    <svg width={w} height={h} style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id={`sg-${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25"/>
          <stop offset="100%" stopColor={color} stopOpacity="0"/>
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#sg-${color.replace('#','')})`}/>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round"/>
    </svg>
  );
};

const KpiCard = ({ label, value, sub, trend, color, spark }) => (
  <div style={{ background: '#141414', border: '1px solid #1C1C1C', borderRadius: 10, padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</div>
      {spark && <Spark data={spark} color={color || '#1D9E75'}/>}
    </div>
    <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 28, fontWeight: 700, color: color || '#FFFFFF', letterSpacing: '-0.8px', lineHeight: 1 }}>{value}</div>
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      {trend && <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, fontWeight: 600, color: trend.startsWith('+') ? '#22C55E' : '#EF4444' }}>{trend}</span>}
      <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, color: '#6B7280' }}>{sub}</span>
    </div>
  </div>
);

const AdminOverview = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 900 }}>
    {/* KPI row */}
    <div style={{ display: 'flex', gap: 12 }}>
      <KpiCard label="MRR" value="R$ 34.790" trend="+12%" sub="vs. mês anterior" color="#1D9E75" spark={[28,29,30,29,31,30,32,31,33,34]}/>
      <KpiCard label="Usuários ativos" value="412" trend="+28" sub="últimos 30 dias" spark={[310,320,330,325,340,350,360,370,380,412]}/>
      <KpiCard label="Churn rate" value="3,2%" trend="-0.4%" sub="vs. mês anterior" color="#22C55E" spark={[4.1,4.0,3.8,3.9,3.7,3.6,3.5,3.4,3.3,3.2]}/>
      <KpiCard label="Laudos / dia" value="184" trend="+22%" sub="média últimos 7 dias" spark={[120,130,140,135,150,160,155,170,175,184]}/>
    </div>

    {/* Plan breakdown + recent signups side-by-side */}
    <div style={{ display: 'flex', gap: 16 }}>
      {/* Plan breakdown */}
      <div style={{ flex: 1, background: '#141414', border: '1px solid #1C1C1C', borderRadius: 10, padding: '18px 20px' }}>
        <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 14, fontWeight: 600, color: '#FFFFFF', marginBottom: 16 }}>Distribuição de planos</div>
        {[['Free', 241, 412, '#6B7280'], ['Pro', 148, 412, '#1D9E75'], ['Enterprise', 23, 412, '#38BDF8']].map(([plan, n, total, c]) => (
          <div key={plan} style={{ marginBottom: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
              <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, color: '#9CA3AF' }}>{plan}</span>
              <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 12, fontWeight: 600, color: c }}>{n} <span style={{ fontWeight: 400, color: '#6B7280', fontSize: 11 }}>({Math.round(n/total*100)}%)</span></span>
            </div>
            <div style={{ height: 6, background: '#1C1C1C', borderRadius: 9999 }}>
              <div style={{ height: '100%', width: `${(n/total)*100}%`, background: c, borderRadius: 9999 }}/>
            </div>
          </div>
        ))}
      </div>

      {/* Recent signups */}
      <div style={{ flex: 1.4, background: '#141414', border: '1px solid #1C1C1C', borderRadius: 10, padding: '18px 20px' }}>
        <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 14, fontWeight: 600, color: '#FFFFFF', marginBottom: 14 }}>Últimos cadastros</div>
        {[
          { name: 'Camila Torres',  email: 'camila@bazartech.com',  plan: 'Pro',  date: 'hoje', mrr: 'R$197' },
          { name: 'Pedro Almeida',  email: 'pedro@agentecriar.com', plan: 'Free', date: 'hoje', mrr: '—' },
          { name: 'Julia Neves',    email: 'jneves@loop.com.br',    plan: 'Pro',  date: 'ontem',mrr: 'R$197' },
          { name: 'Rafael Santos',  email: 'rafael@mktfull.com',    plan: 'Enterprise', date: '09 mai', mrr: 'R$990' },
          { name: 'Ana Beatriz',    email: 'ana@converta.io',       plan: 'Pro',  date: '08 mai',mrr: 'R$197' },
        ].map((u, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: 12, padding: '8px 0', borderBottom: i < 4 ? '1px solid #181818' : 'none', alignItems: 'center' }}>
            <div>
              <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, fontWeight: 500, color: '#FFFFFF' }}>{u.name}</div>
              <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: '#6B7280' }}>{u.email}</div>
            </div>
            <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, fontWeight: 600,
              color: u.plan === 'Free' ? '#6B7280' : u.plan === 'Enterprise' ? '#38BDF8' : '#1D9E75',
              background: u.plan === 'Free' ? '#1C1C1C' : u.plan === 'Enterprise' ? 'rgba(56,189,248,0.08)' : 'rgba(29,158,117,0.08)',
              border: `1px solid ${u.plan === 'Free' ? '#2A2A2A' : u.plan === 'Enterprise' ? 'rgba(56,189,248,0.2)' : 'rgba(29,158,117,0.2)'}`,
              borderRadius: 9999, padding: '2px 8px' }}>{u.plan}</span>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 12, fontWeight: 600, color: u.mrr === '—' ? '#6B7280' : '#1D9E75' }}>{u.mrr}</div>
              <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 10, color: '#6B7280' }}>{u.date}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

Object.assign(window, { AdminShell, AdminOverview, AdminIcon });
