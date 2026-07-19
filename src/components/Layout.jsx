import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../services/auth';
import { useAuth } from '../contexts/AuthContext';
import {
  LogOut, Menu, X,
  LayoutDashboard, Truck, Wallet, Package, FileText,
  ShoppingCart, CreditCard, FolderOpen, Handshake,
  Users, Factory, ClipboardList, Box, BarChart3, DollarSign, Settings
} from 'lucide-react';

export const LogoImage = ({ size = 24 }) => (
  <div style={{
    width: size,
    height: size,
    overflow: 'hidden',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  }}>
    <img
      src="/assets/logo.jpg"
      alt="PulpChain Logo"
      style={{
        width: '140%',
        height: '140%',
        objectFit: 'contain',
        transform: 'translateY(-10%)'
      }}
    />
  </div>
);

// Navigation configs per role
const SCHOOL_NAV = [
  { path: '/school/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/school/request', label: 'Request Pickup', icon: Truck },
  { path: '/school/pickups', label: 'Pickups', icon: ClipboardList },
  { path: '/school/payments', label: 'Earnings', icon: Wallet },
];

const INDUSTRY_NAV = [
  { path: '/industry/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/industry/request-order', label: 'Request Materials', icon: ShoppingCart },
  { path: '/industry/orders', label: 'Orders', icon: Package },
  { path: '/industry/invoices', label: 'Invoices', icon: FileText },
  { path: '/industry/payments', label: 'Payments', icon: CreditCard },
  { path: '/industry/documents', label: 'Documents', icon: FolderOpen },
  { path: '/industry/contracts', label: 'Contracts', icon: Handshake },
];

const ADMIN_NAV = [
  { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/admin/schools', label: 'Schools', icon: Users },
  { path: '/admin/industries', label: 'Industries', icon: Factory },
  { path: '/admin/pickups', label: 'Pickups', icon: Truck },
  { path: '/admin/orders', label: 'Orders', icon: Package },
  { path: '/admin/inventory', label: 'Inventory', icon: Box },
  { path: '/admin/rates', label: 'Rates', icon: BarChart3 },
  { path: '/admin/sales', label: 'Sales', icon: DollarSign },
  { path: '/admin/documents', label: 'Documents', icon: FileText },
  { path: '/admin/finance', label: 'Finance', icon: Settings },
];

const PUBLIC_NAV = [
  { path: '/', label: 'Home' },
  { path: '/about', label: 'About Us' },
  { path: '/marketplace', label: 'Marketplace' },
  { path: '/for-industries', label: 'For Industries' },
  { path: '/pricing', label: 'Pricing & Rates' },
  { path: '/contact', label: 'Contact' },
];


// Sidebar Component
const Sidebar = ({ navItems, roleLabel, onLogout, mobileOpen, onMobileClose }) => {
  const location = useLocation();

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={`mobile-sidebar-overlay ${mobileOpen ? 'open' : ''}`}
        onClick={onMobileClose}
      />

      <aside className={`app-sidebar ${mobileOpen ? 'open' : ''}`}>
        {/* Logo */}
        <Link to="/" className="sidebar-logo" onClick={onMobileClose}>
          <div className="sidebar-logo-icon">
            <LogoImage size={24} />
          </div>
          <div>
            <span className="sidebar-logo-text">PulpChain</span>
          </div>
        </Link>
        <div className="sidebar-tagline">Extracting Value from Every Sheet</div>

        {/* User Badge */}
        <div className="sidebar-user">
          <div className="sidebar-user-icon">
            {roleLabel.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="sidebar-user-name">{roleLabel} Portal</div>
            <div className="sidebar-user-role">{roleLabel}</div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`sidebar-nav-link ${isActive ? 'active' : ''}`}
                onClick={onMobileClose}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer: Logout */}
        <div className="sidebar-footer">
          <button onClick={onLogout} className="sidebar-logout-btn">
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

// Footer Component
const Footer = () => (
  <footer className="app-footer" style={{ padding: '40px 24px', textAlign: 'center', marginTop: 'auto' }}>
    <p style={{ color: 'var(--text-muted)' }}>&copy; 2026 PulpChain Industrial Logistics. All rights reserved.</p>
    <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '16px', flexWrap: 'wrap' }}>
      <Link to="/about">About</Link>
      <span style={{ color: 'var(--surface-border)' }}>&middot;</span>
      <Link to="/pricing">Rates</Link>
      <span style={{ color: 'var(--surface-border)' }}>&middot;</span>
      <Link to="/faq">FAQ</Link>
      <span style={{ color: 'var(--surface-border)' }}>&middot;</span>
      <Link to="/contact">Contact</Link>
      <span style={{ color: 'var(--surface-border)' }}>&middot;</span>
      <Link to="/terms">Terms</Link>
      <span style={{ color: 'var(--surface-border)' }}>&middot;</span>
      <Link to="/privacy">Privacy</Link>
      <span style={{ color: 'var(--surface-border)' }}>&middot;</span>
      <Link to="/admin/login">Admin</Link>
    </div>
  </footer>
);

export const Layout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    authService.logout();
    setMobileMenuOpen(false);
    if (user?.user_metadata?.role === 'admin') {
      navigate('/admin/login');
    } else if (user?.user_metadata?.role === 'industry') {
      navigate('/industry/login');
    } else {
      navigate('/login');
    }
  };

  // Determine layout type
  const isAdminPath = location.pathname.startsWith('/admin') && location.pathname !== '/admin/login';
  const isSchoolPath = location.pathname.startsWith('/school');
  const isIndustryPath = location.pathname.startsWith('/industry') && location.pathname !== '/industry/login';
  const isAuthenticated = isAdminPath || isSchoolPath || isIndustryPath;

  // ── SIDEBAR LAYOUT (Authenticated) ──
  if (isAuthenticated) {
    let navItems = SCHOOL_NAV;
    let roleLabel = 'School';
    if (isIndustryPath) { navItems = INDUSTRY_NAV; roleLabel = 'Industry'; }
    if (isAdminPath) { navItems = ADMIN_NAV; roleLabel = 'Admin'; }

    return (
      <div className="app-layout">
        <Sidebar
          navItems={navItems}
          roleLabel={roleLabel}
          onLogout={handleLogout}
          mobileOpen={mobileMenuOpen}
          onMobileClose={() => setMobileMenuOpen(false)}
        />

        <div className="app-main">
          {/* Mobile header for sidebar toggle */}
          <header className="public-header" style={{ display: 'none' }}>
            <div className="public-header-inner">
              <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
                <div className="sidebar-logo-icon"><LogoImage size={20} /></div>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.2rem', color: 'var(--primary)' }}>PulpChain</span>
              </Link>
              <button
                className="mobile-toggle"
                style={{ background: 'none', border: 'none', color: 'var(--text-main)', cursor: 'pointer', padding: '8px' }}
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </header>

          {/* Mobile-only visible header */}
          <div style={{ display: 'none', padding: '12px 16px', borderBottom: '1px solid var(--surface-border)', alignItems: 'center', justifyContent: 'space-between', background: 'var(--glass-bg)' }} className="mobile-sidebar-header">
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
              <div className="sidebar-logo-icon"><LogoImage size={18} /></div>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.1rem', color: 'var(--primary)' }}>PulpChain</span>
            </Link>
            <button
              className="mobile-toggle"
              style={{ background: 'none', border: 'none', color: 'var(--text-main)', cursor: 'pointer', padding: '8px' }}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          <main className="app-main-content">
            {children}
          </main>
          <Footer />
        </div>

        <style>{`
          @media (max-width: 900px) {
            .mobile-sidebar-header { display: flex !important; }
          }
        `}</style>
      </div>
    );
  }

  // ── TOP NAVBAR LAYOUT (Public Pages) ──
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <header className="public-header" style={{ padding: '16px 24px', borderBottom: '1px solid var(--surface-border)', background: 'var(--glass-bg)', backdropFilter: 'blur(var(--glass-blur))', position: 'sticky', top: 0, zIndex: 100 }}>
        <div className="public-header-inner" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', maxWidth: '1200px', margin: '0 auto' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
            <div style={{
              background: 'var(--primary-light)',
              color: 'var(--primary)',
              padding: '6px',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <LogoImage size={32} />
            </div>
            <div>
              <span style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 800,
                fontSize: '1.4rem',
                color: 'var(--primary)',
                letterSpacing: '-0.02em',
                display: 'block',
                lineHeight: 1
              }}>PulpChain</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'nowrap', overflowX: 'auto' }} className="desktop-only">
            {PUBLIC_NAV.filter(item => item.path !== '/').map((item) => (
              <Link
                key={item.path}
                className={`btn btn-sm ${location.pathname === item.path ? 'btn-primary' : 'btn-ghost'}`}
                to={item.path}
              >
                {item.label}
              </Link>
            ))}
            <div style={{ width: '1px', height: '24px', backgroundColor: 'var(--surface-border)', margin: '0 8px', alignSelf: 'center' }} />
            <Link className="btn btn-secondary btn-sm" to="/login">School Portal</Link>
            <Link className="btn btn-secondary btn-sm" to="/industry/login">Industry Portal</Link>
            <Link className="btn btn-primary btn-sm" to="/register">Register</Link>
          </nav>

          {/* Mobile toggle */}
          <button
            style={{ background: 'none', border: 'none', color: 'var(--text-main)', cursor: 'pointer', padding: '8px', display: 'none' }}
            className="mobile-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          padding: '20px',
          backgroundColor: 'var(--surface-solid)',
          borderBottom: '1px solid var(--surface-border)',
          position: 'sticky',
          top: 'var(--header-height)',
          zIndex: 49,
          boxShadow: 'var(--shadow-md)'
        }}>
          {PUBLIC_NAV.map((item) => (
            <Link key={item.path} className="btn btn-secondary btn-full" to={item.path} onClick={() => setMobileMenuOpen(false)}>
              {item.label}
            </Link>
          ))}
          <div style={{ margin: '8px 0', borderTop: '1px solid var(--surface-border)' }} />
          <Link className="btn btn-secondary btn-full" to="/login" onClick={() => setMobileMenuOpen(false)}>School Portal</Link>
          <Link className="btn btn-secondary btn-full" to="/industry/login" onClick={() => setMobileMenuOpen(false)}>Industry Portal</Link>
          <Link className="btn btn-primary btn-full" to="/register" onClick={() => setMobileMenuOpen(false)}>Register</Link>
        </div>
      )}

      {/* Main Content */}
      <main style={{ flex: 1, maxWidth: '1200px', width: '100%', margin: '0 auto', padding: '32px 24px' }}>
        {children}
      </main>

      <Footer />
    </div>
  );
};
