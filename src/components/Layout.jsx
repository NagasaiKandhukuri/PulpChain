import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../services/auth';
import { Recycle, LogOut, Menu, X, Landmark, Shield, Building, LayoutGrid } from 'lucide-react';

// Format helper for Indian Rupees
export const formatINR = (num) => {
  if (num === null || num === undefined) return '₹0.00';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2
  }).format(num);
};

export const Layout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = authService.getCurrentUser();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const handleLogout = () => {
    authService.logout();
    setMobileMenuOpen(false);
    if (user?.role === 'admin') {
      navigate('/admin/login');
    } else if (user?.role === 'industry') {
      navigate('/industry/login');
    } else {
      navigate('/login');
    }
  };

  // Determine current navbar type
  const isAdminPath = location.pathname.startsWith('/admin') && location.pathname !== '/admin/login';
  const isSchoolPath = location.pathname.startsWith('/school');
  const isIndustryPath = location.pathname.startsWith('/industry') && location.pathname !== '/industry/login';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Navigation Header */}
      <header style={{
        backgroundColor: 'var(--surface)',
        borderBottom: '1px solid var(--surface-border)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 24px',
          height: '72px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <Link to="/" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            textDecoration: 'none'
          }}>
            <div style={{
              background: 'var(--primary-light)',
              color: 'var(--primary)',
              padding: '8px',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Recycle size={24} />
            </div>
            <div>
              <span style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 800,
                fontSize: '1.4rem',
                color: 'var(--text-main)',
                letterSpacing: '-0.02em',
                display: 'block',
                lineHeight: 1
              }}>PulpChain</span>
              <span style={{
                fontSize: '0.7rem',
                color: 'var(--text-muted)',
                fontWeight: 600,
                letterSpacing: '0.05em'
              }}>CONVERT WASTE PAPER INTO VALUE</span>
            </div>
          </Link>

          {/* Desktop Nav Items */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', justifyContent: 'flex-end' }} className="desktop-only">
            {isAdminPath ? (
              // Admin Navigation
              <>
                <Link className={`btn btn-secondary btn-sm ${location.pathname === '/admin/dashboard' ? 'btn-primary' : ''}`} to="/admin/dashboard">
                  <Shield size={16} /> Dashboard
                </Link>
                <Link className={`btn btn-secondary btn-sm ${location.pathname === '/admin/schools' ? 'btn-primary' : ''}`} to="/admin/schools">Schools</Link>
                <Link className={`btn btn-secondary btn-sm ${location.pathname === '/admin/industries' ? 'btn-primary' : ''}`} to="/admin/industries">Industries</Link>
                <Link className={`btn btn-secondary btn-sm ${location.pathname === '/admin/pickups' ? 'btn-primary' : ''}`} to="/admin/pickups">Pickups</Link>
                <Link className={`btn btn-secondary btn-sm ${location.pathname === '/admin/orders' ? 'btn-primary' : ''}`} to="/admin/orders">Orders</Link>
                <Link className={`btn btn-secondary btn-sm ${location.pathname === '/admin/inventory' ? 'btn-primary' : ''}`} to="/admin/inventory">Inventory</Link>
                <Link className={`btn btn-secondary btn-sm ${location.pathname === '/admin/rates' ? 'btn-primary' : ''}`} to="/admin/rates">Rates</Link>
                <Link className={`btn btn-secondary btn-sm ${location.pathname === '/admin/sales' ? 'btn-primary' : ''}`} to="/admin/sales">Sales</Link>
                <Link className={`btn btn-secondary btn-sm ${location.pathname === '/admin/documents' ? 'btn-primary' : ''}`} to="/admin/documents">Documents</Link>
                <Link className={`btn btn-secondary btn-sm ${location.pathname === '/admin/finance' ? 'btn-primary' : ''}`} to="/admin/finance">Finance</Link>
                <button onClick={handleLogout} className="btn btn-secondary btn-sm" style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }}>
                  <LogOut size={16} /> Logout
                </button>
              </>
            ) : isSchoolPath ? (
              // School Navigation
              <>
                <Link className={`btn btn-secondary btn-sm ${location.pathname === '/school/dashboard' ? 'btn-primary' : ''}`} to="/school/dashboard">
                  <Landmark size={16} /> Dashboard
                </Link>
                <Link className={`btn btn-secondary btn-sm ${location.pathname === '/school/request' ? 'btn-primary' : ''}`} to="/school/request">Request Pickup</Link>
                <Link className={`btn btn-secondary btn-sm ${location.pathname === '/school/pickups' ? 'btn-primary' : ''}`} to="/school/pickups">Pickups</Link>
                <Link className={`btn btn-secondary btn-sm ${location.pathname === '/school/payments' ? 'btn-primary' : ''}`} to="/school/payments">Payments</Link>
                <button onClick={handleLogout} className="btn btn-secondary btn-sm" style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }}>
                  <LogOut size={16} /> Logout
                </button>
              </>
            ) : isIndustryPath ? (
              // Industry Navigation
              <>
                <Link className={`btn btn-secondary btn-sm ${location.pathname === '/industry/dashboard' ? 'btn-primary' : ''}`} to="/industry/dashboard">
                  <Building size={16} /> Dashboard
                </Link>
                <Link className={`btn btn-secondary btn-sm ${location.pathname === '/industry/request-order' ? 'btn-primary' : ''}`} to="/industry/request-order">Request Materials</Link>
                <Link className={`btn btn-secondary btn-sm ${location.pathname === '/industry/orders' ? 'btn-primary' : ''}`} to="/industry/orders">Orders</Link>
                <Link className={`btn btn-secondary btn-sm ${location.pathname === '/industry/invoices' ? 'btn-primary' : ''}`} to="/industry/invoices">Invoices</Link>
                <Link className={`btn btn-secondary btn-sm ${location.pathname === '/industry/payments' ? 'btn-primary' : ''}`} to="/industry/payments">Payments</Link>
                <Link className={`btn btn-secondary btn-sm ${location.pathname === '/industry/documents' ? 'btn-primary' : ''}`} to="/industry/documents">Documents</Link>
                <Link className={`btn btn-secondary btn-sm ${location.pathname === '/industry/contracts' ? 'btn-primary' : ''}`} to="/industry/contracts">Contracts</Link>
                <button onClick={handleLogout} className="btn btn-secondary btn-sm" style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }}>
                  <LogOut size={16} /> Logout
                </button>
              </>
            ) : (
              // Public Navigation
              <>
                <Link className={`btn btn-secondary btn-sm ${location.pathname === '/' ? 'btn-primary' : ''}`} to="/">Home</Link>
                <Link className={`btn btn-secondary btn-sm ${location.pathname === '/about' ? 'btn-primary' : ''}`} to="/about">About Us</Link>
                <Link className={`btn btn-secondary btn-sm ${location.pathname === '/marketplace' ? 'btn-primary' : ''}`} to="/marketplace">Marketplace</Link>
                <Link className={`btn btn-secondary btn-sm ${location.pathname === '/for-industries' ? 'btn-primary' : ''}`} to="/for-industries">For Industries</Link>
                <Link className={`btn btn-secondary btn-sm ${location.pathname === '/pricing' ? 'btn-primary' : ''}`} to="/pricing">Pricing & Rates</Link>
                <Link className={`btn btn-secondary btn-sm ${location.pathname === '/contact' ? 'btn-primary' : ''}`} to="/contact">Contact</Link>
                <div style={{ width: '1px', height: '24px', backgroundColor: 'var(--surface-border)', margin: '0 4px', alignSelf: 'center' }} />
                <Link className="btn btn-secondary btn-sm" to="/login">School Portal</Link>
                <Link className="btn btn-secondary btn-sm" to="/industry/login">Industry Portal</Link>
                <Link className="btn btn-primary btn-sm" to="/register">Register</Link>
              </>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button 
            style={{
              display: 'none',
              background: 'none',
              border: 'none',
              color: 'var(--text-main)',
              cursor: 'pointer'
            }}
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
          gap: '12px',
          padding: '24px',
          backgroundColor: 'var(--surface)',
          borderBottom: '1px solid var(--surface-border)',
          position: 'sticky',
          top: '72px',
          zIndex: 49,
          boxShadow: 'var(--shadow-md)'
        }}>
          {isAdminPath ? (
            <>
              <Link className="btn btn-secondary btn-full" to="/admin/dashboard" onClick={() => setMobileMenuOpen(false)}>Dashboard</Link>
              <Link className="btn btn-secondary btn-full" to="/admin/schools" onClick={() => setMobileMenuOpen(false)}>Schools</Link>
              <Link className="btn btn-secondary btn-full" to="/admin/industries" onClick={() => setMobileMenuOpen(false)}>Industries</Link>
              <Link className="btn btn-secondary btn-full" to="/admin/pickups" onClick={() => setMobileMenuOpen(false)}>Pickups</Link>
              <Link className="btn btn-secondary btn-full" to="/admin/orders" onClick={() => setMobileMenuOpen(false)}>Orders</Link>
              <Link className="btn btn-secondary btn-full" to="/admin/inventory" onClick={() => setMobileMenuOpen(false)}>Inventory</Link>
              <Link className="btn btn-secondary btn-full" to="/admin/rates" onClick={() => setMobileMenuOpen(false)}>Rates</Link>
              <Link className="btn btn-secondary btn-full" to="/admin/sales" onClick={() => setMobileMenuOpen(false)}>Sales</Link>
              <Link className="btn btn-secondary btn-full" to="/admin/documents" onClick={() => setMobileMenuOpen(false)}>Documents</Link>
              <Link className="btn btn-secondary btn-full" to="/admin/finance" onClick={() => setMobileMenuOpen(false)}>Finance</Link>
              <button onClick={handleLogout} className="btn btn-danger btn-full">Logout</button>
            </>
          ) : isSchoolPath ? (
            <>
              <Link className="btn btn-secondary btn-full" to="/school/dashboard" onClick={() => setMobileMenuOpen(false)}>Dashboard</Link>
              <Link className="btn btn-secondary btn-full" to="/school/request" onClick={() => setMobileMenuOpen(false)}>Request Pickup</Link>
              <Link className="btn btn-secondary btn-full" to="/school/pickups" onClick={() => setMobileMenuOpen(false)}>Pickups</Link>
              <Link className="btn btn-secondary btn-full" to="/school/payments" onClick={() => setMobileMenuOpen(false)}>Payments</Link>
              <button onClick={handleLogout} className="btn btn-danger btn-full">Logout</button>
            </>
          ) : isIndustryPath ? (
            <>
              <Link className="btn btn-secondary btn-full" to="/industry/dashboard" onClick={() => setMobileMenuOpen(false)}>Dashboard</Link>
              <Link className="btn btn-secondary btn-full" to="/industry/request-order" onClick={() => setMobileMenuOpen(false)}>Request Materials</Link>
              <Link className="btn btn-secondary btn-full" to="/industry/orders" onClick={() => setMobileMenuOpen(false)}>Orders</Link>
              <Link className="btn btn-secondary btn-full" to="/industry/invoices" onClick={() => setMobileMenuOpen(false)}>Invoices</Link>
              <Link className="btn btn-secondary btn-full" to="/industry/payments" onClick={() => setMobileMenuOpen(false)}>Payments</Link>
              <Link className="btn btn-secondary btn-full" to="/industry/documents" onClick={() => setMobileMenuOpen(false)}>Documents</Link>
              <Link className="btn btn-secondary btn-full" to="/industry/contracts" onClick={() => setMobileMenuOpen(false)}>Contracts</Link>
              <button onClick={handleLogout} className="btn btn-danger btn-full">Logout</button>
            </>
          ) : (
            <>
              <Link className="btn btn-secondary btn-full" to="/" onClick={() => setMobileMenuOpen(false)}>Home</Link>
              <Link className="btn btn-secondary btn-full" to="/about" onClick={() => setMobileMenuOpen(false)}>About Us</Link>
              <Link className="btn btn-secondary btn-full" to="/marketplace" onClick={() => setMobileMenuOpen(false)}>Marketplace</Link>
              <Link className="btn btn-secondary btn-full" to="/for-industries" onClick={() => setMobileMenuOpen(false)}>For Industries</Link>
              <Link className="btn btn-secondary btn-full" to="/pricing" onClick={() => setMobileMenuOpen(false)}>Pricing & Rates</Link>
              <Link className="btn btn-secondary btn-full" to="/contact" onClick={() => setMobileMenuOpen(false)}>Contact</Link>
              <Link className="btn btn-secondary btn-full" to="/login" onClick={() => setMobileMenuOpen(false)}>School Portal</Link>
              <Link className="btn btn-secondary btn-full" to="/industry/login" onClick={() => setMobileMenuOpen(false)}>Industry Portal</Link>
              <Link className="btn btn-primary btn-full" to="/register" onClick={() => setMobileMenuOpen(false)}>Register</Link>
            </>
          )}
        </div>
      )}

      {/* Main Content Area */}
      <main style={{ flex: 1, maxWidth: '1200px', width: '100%', margin: '0 auto', padding: '32px 24px' }}>
        {children}
      </main>

      {/* Footer */}
      <footer style={{
        backgroundColor: 'var(--surface)',
        borderTop: '1px solid var(--surface-border)',
        padding: '32px 24px',
        marginTop: 'auto',
        color: 'var(--text-muted)',
        textAlign: 'center'
      }}>
        <p style={{ fontSize: '0.9rem' }}>&copy; 2026 PulpChain. Convert waste paper into value. All rights reserved.</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '12px', fontSize: '0.8rem' }}>
          <Link to="/about" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>About Us</Link>
          <span>&middot;</span>
          <Link to="/pricing" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Rates Sheet</Link>
          <span>&middot;</span>
          <Link to="/contact" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Contact</Link>
          <span>&middot;</span>
          <Link to="/admin/login" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Admin Login</Link>
        </div>
      </footer>

      {/* Global Responsive Fix Styles */}
      <style>{`
        @media (max-width: 1000px) {
          .desktop-only { display: none !important; }
          .mobile-toggle { display: block !important; }
        }
      `}</style>
    </div>
  );
};
