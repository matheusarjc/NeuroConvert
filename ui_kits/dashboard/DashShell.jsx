// NeuroConvert Dashboard — Shell v2
// Icon-only sidebar + premium topbar (benchmark-level)

const SNAV = [
  { id: 'home',   tip: 'Dashboard',     icon: <><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></> },
  { id: 'laudos', tip: 'Laudos',        icon: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></> },
  { id: 'new',    tip: 'Nova análise',  icon: <><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></> },
  { id: 'plan',   tip: 'Plano',        icon: <><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></> },
];

const SNAV_BOTTOM = [
  { id: 'settings', tip: 'Configurações', icon: <><circle cx="12" cy="12" r="3"/><path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></> },
  { id: 'logout',   tip: 'Sair',          icon: <><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16,17 21,12 16,7"/><line x1="21" y1="12" x2="9" y2="12"/></> },
];

const NavIcon = ({ item, active, onClick }) => {
  const [hov, setHov] = React.useState(false);
  return (
    <div style={{ position: 'relative' }} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>
      <div onClick={onClick} style={{
        width: 40, height: 40, borderRadius: 10, cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: active ? 'rgba(29,158,117,0.12)' : hov ? 'rgba(255,255,255,0.05)' : 'transparent',
        border: active ? '1px solid rgba(29,158,117,0.2)' : '1px solid transparent',
        transition: 'all 150ms',
      }}>
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
          stroke={active ? '#1D9E75' : hov ? '#9CA3AF' : '#6B7280'}
          strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          {item.icon}
        </svg>
      </div>
      {hov && (
        <div style={{
          position: 'absolute', left: 52, top: '50%', transform: 'translateY(-50%)',
          background: '#1C1C1C', border: '1px solid #2A2A2A', borderRadius: 6,
          padding: '5px 10px', whiteSpace: 'nowrap', zIndex: 200,
          fontFamily: "'DM Sans',sans-serif", fontSize: 12, color: '#FFFFFF',
          boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
          pointerEvents: 'none',
        }}>{item.tip}</div>
      )}
    </div>
  );
};

const DashShell = ({ activeScreen, setScreen, children }) => {
  const [notifOpen, setNotifOpen] = React.useState(false);
  const SCREEN_LABEL = { home: 'Dashboard', laudos: 'Laudos', new: 'Nova análise', detail: 'Laudo', plan: 'Plano & cobrança', settings: 'Configurações' };

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#0A0A0A', fontFamily: "'DM Sans',sans-serif" }}>

      {/* Icon sidebar */}
      <aside style={{
        width: 60, background: '#141414', borderRight: '1px solid rgba(255,255,255,0.05)',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        padding: '16px 0', gap: 0, flexShrink: 0, zIndex: 10,
      }}>
        {/* Logo icon */}
        <div style={{ marginBottom: 20, padding: '0 0 16px', borderBottom: '1px solid rgba(255,255,255,0.06)', width: '100%', display: 'flex', justifyContent: 'center' }}>
          <svg width="28" height="28" viewBox="0 0 36 36" fill="none">
            <rect x="4" y="6" width="6" height="24" rx="3" fill="#1D9E75"/>
            <polygon points="10,6 16,6 22,30 16,30" fill="#1D9E75"/>
            <rect x="16" y="6" width="6" height="24" rx="3" fill="#1D9E75"/>
            <circle cx="28" cy="9" r="3" fill="#25C98F"/>
          </svg>
        </div>

        {/* Main nav */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1, alignItems: 'center' }}>
          {SNAV.map(item => (
            <NavIcon key={item.id} item={item}
              active={activeScreen === item.id || (activeScreen === 'detail' && item.id === 'laudos')}
              onClick={() => setScreen(item.id)}/>
          ))}
        </div>

        {/* Bottom nav */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'center', paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.05)', width: '100%', justifyContent: 'center' }}>
          {SNAV_BOTTOM.map(item => (
            <NavIcon key={item.id} item={item} active={false} onClick={() => {}}/>
          ))}
          {/* Avatar */}
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(29,158,117,0.15)', border: '1.5px solid rgba(29,158,117,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 8, cursor: 'pointer' }}>
            <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 13, fontWeight: 700, color: '#1D9E75' }}>R</span>
          </div>
        </div>
      </aside>

      {/* Main area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>

        {/* Topbar */}
        <header style={{
          height: 56, background: '#141414',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          display: 'flex', alignItems: 'center', gap: 16,
          padding: '0 20px', flexShrink: 0,
        }}>
          {/* Title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 160 }}>
            <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 15, fontWeight: 600, color: '#FFFFFF' }}>
              {SCREEN_LABEL[activeScreen] || 'Dashboard'}
            </span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2" strokeLinecap="round"><polyline points="6,9 12,15 18,9"/></svg>
          </div>

          {/* Search */}
          <div style={{ flex: 1, maxWidth: 360, position: 'relative' }}>
            <svg style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input placeholder="Buscar laudos, páginas…" style={{
              width: '100%', height: 34, padding: '0 36px 0 32px',
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 8, fontFamily: "'DM Sans',sans-serif", fontSize: 13,
              color: '#9CA3AF', outline: 'none',
            }}
              onFocus={e => { e.target.style.borderColor='rgba(29,158,117,0.4)'; e.target.style.background='rgba(29,158,117,0.05)'; }}
              onBlur={e => { e.target.style.borderColor='rgba(255,255,255,0.08)'; e.target.style.background='rgba(255,255,255,0.05)'; }}/>
          </div>

          <div style={{ flex: 1 }}/>

          {/* Notifications */}
          <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => setNotifOpen(o => !o)}>
            <div style={{ width: 34, height: 34, borderRadius: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
            </div>
            <div style={{ position: 'absolute', top: -4, right: -4, width: 18, height: 18, background: '#EF4444', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1.5px solid #141414' }}>
              <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 9, fontWeight: 700, color: '#fff' }}>3</span>
            </div>
          </div>

          {/* Date */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '0 10px', height: 34 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, color: '#9CA3AF' }}>11 mai 2026</span>
          </div>

          {/* User */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', padding: '0 8px', height: 34, borderRadius: 8, background: 'rgba(255,255,255,0.03)' }}>
            <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'rgba(29,158,117,0.15)', border: '1.5px solid rgba(29,158,117,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 11, fontWeight: 700, color: '#1D9E75' }}>R</span>
            </div>
            <div>
              <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, fontWeight: 500, color: '#FFFFFF', lineHeight: 1.2 }}>Rafael Mendes</div>
              <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 10, color: '#6B7280', lineHeight: 1.2 }}>@rafael</div>
            </div>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2" strokeLinecap="round"><polyline points="6,9 12,15 18,9"/></svg>
          </div>
        </header>

        {/* Content */}
        <main style={{ flex: 1, overflow: 'auto', padding: 20, background: '#0A0A0A' }}>
          {children}
        </main>
      </div>
    </div>
  );
};

Object.assign(window, { DashShell });
