// NeuroConvert — Landing Nav Component
// Sticky frosted-glass top navigation

const LandingNav = () => {
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      background: scrolled ? 'rgba(15,23,42,0.9)' : 'transparent',
      backdropFilter: scrolled ? 'blur(12px)' : 'none',
      borderBottom: scrolled ? '1px solid rgba(45,62,82,0.8)' : '1px solid transparent',
      transition: 'all 300ms cubic-bezier(0.16,1,0.3,1)',
      padding: '0 40px', height: '64px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <svg width="28" height="28" viewBox="0 0 36 36" fill="none">
          <rect x="4" y="6" width="6" height="24" rx="3" fill="#1D9E75"/>
          <polygon points="10,6 16,6 22,30 16,30" fill="#1D9E75"/>
          <rect x="16" y="6" width="6" height="24" rx="3" fill="#1D9E75"/>
          <circle cx="28" cy="9" r="3" fill="#25C98F"/>
          <circle cx="28" cy="9" r="5.5" fill="none" stroke="#25C98F" strokeWidth="1.5" opacity="0.4"/>
        </svg>
        <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 18, fontWeight: 700, color: '#F8FAFC', letterSpacing: '-0.3px' }}>
          Neuro<span style={{ color: '#1D9E75' }}>Convert</span>
        </span>
      </div>

      {/* Nav links */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
        {['Como funciona', 'Exemplos', 'Preços'].map(item => (
          <a key={item} href="#" style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 500, color: '#94A3B8', textDecoration: 'none', transition: 'color 150ms' }}
            onMouseEnter={e => e.target.style.color='#F8FAFC'}
            onMouseLeave={e => e.target.style.color='#94A3B8'}>{item}</a>
        ))}
      </div>

      {/* CTA */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <a href="#" style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 500, color: '#94A3B8', textDecoration: 'none' }}>Entrar</a>
        <button style={{
          height: 36, padding: '0 20px', borderRadius: 6,
          background: '#1D9E75', color: '#fff', border: 'none',
          fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 500,
          cursor: 'pointer', transition: 'background 150ms',
        }}
          onMouseEnter={e => e.target.style.background='#25C98F'}
          onMouseLeave={e => e.target.style.background='#1D9E75'}
        >Analisar gratuitamente</button>
      </div>
    </nav>
  );
};

Object.assign(window, { LandingNav });
