// NeuroConvert Admin — Users & Subscriptions Screens

const USERS = [
  { name: 'Rafael Mendes',  email: 'rafael@agencia.com',    plan: 'Pro',        laudos: 7,  limit: 20, mrr: 'R$197',  status: 'ativo',    joined: 'mar 2026' },
  { name: 'Camila Torres',  email: 'camila@bazartech.com',  plan: 'Pro',        laudos: 14, limit: 20, mrr: 'R$197',  status: 'ativo',    joined: 'mai 2026' },
  { name: 'Julia Neves',    email: 'jneves@loop.com.br',    plan: 'Pro',        laudos: 20, limit: 20, mrr: 'R$197',  status: 'limite',   joined: 'abr 2026' },
  { name: 'Rafael Santos',  email: 'rafael@mktfull.com',    plan: 'Enterprise', laudos: 91, limit: 999,mrr: 'R$990',  status: 'ativo',    joined: 'mai 2026' },
  { name: 'Ana Beatriz',    email: 'ana@converta.io',       plan: 'Pro',        laudos: 3,  limit: 20, mrr: 'R$197',  status: 'ativo',    joined: 'mai 2026' },
  { name: 'Pedro Almeida',  email: 'pedro@agentecriar.com', plan: 'Free',       laudos: 2,  limit: 3,  mrr: '—',      status: 'ativo',    joined: 'mai 2026' },
  { name: 'Fernanda Lima',  email: 'fernanda@convershop.io',plan: 'Free',       laudos: 3,  limit: 3,  mrr: '—',      status: 'churned',  joined: 'fev 2026' },
  { name: 'Marcos Vieira',  email: 'marcos@digimkt.com.br', plan: 'Pro',        laudos: 9,  limit: 20, mrr: 'R$197',  status: 'ativo',    joined: 'jan 2026' },
];

const statusStyle = (s) => ({
  ativo:    { color: '#22C55E', bg: 'rgba(34,197,94,0.08)',   border: 'rgba(34,197,94,0.2)',   label: 'ativo' },
  limite:   { color: '#F59E0B', bg: 'rgba(245,158,11,0.08)',  border: 'rgba(245,158,11,0.2)',  label: 'no limite' },
  churned:  { color: '#EF4444', bg: 'rgba(239,68,68,0.08)',   border: 'rgba(239,68,68,0.2)',   label: 'churned' },
}[s] || {});

const planColor = (p) => p === 'Enterprise' ? '#38BDF8' : p === 'Pro' ? '#1D9E75' : '#6B7280';
const planBg    = (p) => p === 'Enterprise' ? 'rgba(56,189,248,0.08)' : p === 'Pro' ? 'rgba(29,158,117,0.08)' : '#1C1C1C';
const planBorder= (p) => p === 'Enterprise' ? 'rgba(56,189,248,0.2)' : p === 'Pro' ? 'rgba(29,158,117,0.2)' : '#2A2A2A';

const AdminUsers = () => {
  const [q, setQ] = React.useState('');
  const filtered = USERS.filter(u => u.name.toLowerCase().includes(q.toLowerCase()) || u.email.toLowerCase().includes(q.toLowerCase()));

  return (
    <div style={{ maxWidth: 900, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', gap: 10 }}>
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar por nome ou e-mail…"
          style={{ flex: 1, height: 36, padding: '0 12px', background: '#141414', border: '1px solid #1C1C1C', borderRadius: 7, fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: '#FFFFFF', outline: 'none' }}
          onFocus={e => e.target.style.borderColor='#1D9E75'}
          onBlur={e => e.target.style.borderColor='#1C1C1C'}/>
        <select style={{ height: 36, padding: '0 12px', background: '#141414', border: '1px solid #1C1C1C', borderRadius: 7, fontFamily: "'DM Sans',sans-serif", fontSize: 12, color: '#9CA3AF', outline: 'none' }}>
          <option>Todos os planos</option><option>Free</option><option>Pro</option><option>Enterprise</option>
        </select>
        <select style={{ height: 36, padding: '0 12px', background: '#141414', border: '1px solid #1C1C1C', borderRadius: 7, fontFamily: "'DM Sans',sans-serif", fontSize: 12, color: '#9CA3AF', outline: 'none' }}>
          <option>Todos os status</option><option>Ativo</option><option>No limite</option><option>Churned</option>
        </select>
      </div>

      <div style={{ background: '#141414', border: '1px solid #1C1C1C', borderRadius: 10, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 80px 100px 90px 80px', padding: '10px 18px', borderBottom: '1px solid #1C1C1C' }}>
          {['Usuário', 'Plano', 'Laudos', 'Status', 'MRR', 'Membro desde'].map(h => (
            <div key={h} style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 10, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</div>
          ))}
        </div>
        {filtered.map((u, i) => {
          const ss = statusStyle(u.status);
          return (
            <div key={u.email} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 80px 100px 90px 80px', padding: '12px 18px', borderBottom: i < filtered.length-1 ? '1px solid #111111' : 'none', alignItems: 'center', cursor: 'pointer', transition: 'background 150ms' }}
              onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.02)'}
              onMouseLeave={e => e.currentTarget.style.background='transparent'}>
              <div>
                <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, fontWeight: 500, color: '#FFFFFF' }}>{u.name}</div>
                <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: '#6B7280', marginTop: 1 }}>{u.email}</div>
              </div>
              <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, fontWeight: 600, color: planColor(u.plan), background: planBg(u.plan), border: `1px solid ${planBorder(u.plan)}`, borderRadius: 9999, padding: '2px 9px', width: 'fit-content' }}>{u.plan}</span>
              <div>
                <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 13, fontWeight: 600, color: u.laudos >= u.limit ? '#F59E0B' : '#FFFFFF' }}>{u.laudos}<span style={{ fontFamily: "'DM Sans',sans-serif", fontWeight: 400, fontSize: 11, color: '#6B7280' }}>/{u.limit === 999 ? '∞' : u.limit}</span></div>
                <div style={{ height: 3, background: '#1C1C1C', borderRadius: 9999, marginTop: 4, width: 40 }}>
                  <div style={{ height: '100%', width: `${Math.min((u.laudos/u.limit)*100,100)}%`, background: u.laudos >= u.limit ? '#F59E0B' : '#1D9E75', borderRadius: 9999 }}/>
                </div>
              </div>
              <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, fontWeight: 600, color: ss.color, background: ss.bg, border: `1px solid ${ss.border}`, borderRadius: 9999, padding: '2px 9px', width: 'fit-content' }}>{ss.label}</span>
              <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 12, fontWeight: 600, color: u.mrr === '—' ? '#6B7280' : '#1D9E75' }}>{u.mrr}</span>
              <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, color: '#6B7280' }}>{u.joined}</span>
            </div>
          );
        })}
      </div>
      <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, color: '#6B7280' }}>{filtered.length} usuários encontrados</div>
    </div>
  );
};

const SUBS = [
  { id: 'sub_1Nz3kT', user: 'Rafael Santos',  plan: 'Enterprise', mrr: 'R$990',  status: 'active',   next: '01 jun 2026', card: '••4891' },
  { id: 'sub_1Nz1aA', user: 'Camila Torres',  plan: 'Pro',        mrr: 'R$197',  status: 'active',   next: '11 jun 2026', card: '••3241' },
  { id: 'sub_1NyxPQ', user: 'Julia Neves',    plan: 'Pro',        mrr: 'R$197',  status: 'active',   next: '09 jun 2026', card: '••7730' },
  { id: 'sub_1NywZZ', user: 'Ana Beatriz',    plan: 'Pro',        mrr: 'R$197',  status: 'active',   next: '08 jun 2026', card: '••5514' },
  { id: 'sub_1NyrVV', user: 'Marcos Vieira',  plan: 'Pro',        mrr: 'R$197',  status: 'past_due', next: '03 jun 2026', card: '••8872' },
  { id: 'sub_1NypAB', user: 'Fernanda Lima',  plan: 'Pro',        mrr: 'R$197',  status: 'canceled', next: '—',           card: '••6601' },
];

const subStatusStyle = (s) => ({
  active:    { color: '#22C55E', bg: 'rgba(34,197,94,0.08)',  border: 'rgba(34,197,94,0.2)',  label: 'Ativa' },
  past_due:  { color: '#F59E0B', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)', label: 'Inadimplente' },
  canceled:  { color: '#EF4444', bg: 'rgba(239,68,68,0.08)',  border: 'rgba(239,68,68,0.2)',  label: 'Cancelada' },
}[s] || {});

const AdminSubs = () => (
  <div style={{ maxWidth: 900, display: 'flex', flexDirection: 'column', gap: 16 }}>
    <div style={{ display: 'flex', gap: 12 }}>
      {[['Receita ativa', 'R$ 2.168', '#1D9E75'], ['Assinaturas ativas', '11', null], ['Inadimplentes', '1', '#F59E0B'], ['Canceladas', '1', '#EF4444']].map(([l,v,c]) => (
        <div key={l} style={{ background: '#141414', border: '1px solid #1C1C1C', borderRadius: 9, padding: '14px 18px', flex: 1 }}>
          <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 10, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>{l}</div>
          <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 24, fontWeight: 700, color: c || '#FFFFFF', letterSpacing: '-0.5px' }}>{v}</div>
        </div>
      ))}
    </div>
    <div style={{ background: '#141414', border: '1px solid #1C1C1C', borderRadius: 10, overflow: 'hidden' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr 80px 100px 110px 80px', padding: '10px 18px', borderBottom: '1px solid #1C1C1C' }}>
        {['ID Stripe', 'Usuário', 'Plano', 'Status', 'Próx. cobrança', 'Cartão'].map(h => (
          <div key={h} style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 10, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</div>
        ))}
      </div>
      {SUBS.map((s, i) => {
        const ss = subStatusStyle(s.status);
        return (
          <div key={s.id} style={{ display: 'grid', gridTemplateColumns: '130px 1fr 80px 100px 110px 80px', padding: '12px 18px', borderBottom: i < SUBS.length-1 ? '1px solid #111111' : 'none', alignItems: 'center', transition: 'background 150ms', cursor: 'pointer' }}
            onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.015)'}
            onMouseLeave={e => e.currentTarget.style.background='transparent'}>
            <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: '#6B7280' }}>{s.id}</span>
            <div>
              <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, fontWeight: 500, color: '#FFFFFF' }}>{s.user}</div>
              <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 12, fontWeight: 600, color: '#1D9E75', marginTop: 1 }}>{s.mrr}/mês</div>
            </div>
            <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, fontWeight: 600, color: planColor(s.plan), background: planBg(s.plan), border: `1px solid ${planBorder(s.plan)}`, borderRadius: 9999, padding: '2px 9px', width: 'fit-content' }}>{s.plan}</span>
            <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, fontWeight: 600, color: ss.color, background: ss.bg, border: `1px solid ${ss.border}`, borderRadius: 9999, padding: '2px 9px', width: 'fit-content' }}>{ss.label}</span>
            <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, color: s.next === '—' ? '#6B7280' : '#9CA3AF' }}>{s.next}</span>
            <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, color: '#6B7280' }}>{s.card}</span>
          </div>
        );
      })}
    </div>
  </div>
);

Object.assign(window, { AdminUsers, AdminSubs });
