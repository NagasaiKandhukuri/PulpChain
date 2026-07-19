import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Building, Award, TrendingUp } from 'lucide-react';
import { formatINR } from '../../utils/format';
import { adminService } from '../../services/admin';

export const Home = () => {
  const [rates, setRates] = React.useState(null);

  React.useEffect(() => {
    adminService.getRates().then(setRates).catch(console.error);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '80px' }}>
      {/* Hero Section */}
      <section style={{
        position: 'relative',
        backgroundColor: 'var(--surface-solid)',
        border: '1px solid var(--surface-border)',
        padding: '60px',
        borderRadius: 'var(--radius-xl)',
        margin: '0 -20px',
        overflow: 'hidden'
      }} className="grid-cols-2 hero-grid">
        <div className="premium-glow-bg"></div>
        <div className="animate-fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: '24px', position: 'relative', zIndex: 10 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'var(--primary-light)',
            color: 'var(--primary)',
            padding: '6px 16px',
            borderRadius: 'var(--radius-full)',
            width: 'fit-content',
            fontSize: '0.85rem',
            fontWeight: 700,
            border: '1px solid var(--primary-glow)'
          }}>
            <Sparkles size={14} /> ENTERPRISE-GRADE CIRCULAR ECONOMY
          </div>
          <h1 style={{
            fontSize: 'clamp(2.5rem, 5vw, 4.5rem)',
            letterSpacing: '-0.03em',
            lineHeight: 1.05,
            color: 'var(--text-heading)'
          }}>
            Extracting Value <br />
            <span className="typewriter-text" style={{ color: 'var(--primary)', display: 'inline-block' }}>from Every Sheet</span>
          </h1>
          <p style={{
            fontSize: '1.2rem',
            color: 'var(--text-muted)',
            maxWidth: '540px',
            lineHeight: 1.6
          }}>
            PulpChain connects educational institutions directly with commercial paper mills. Transform operational waste into audited, premium-rate financial returns while achieving your zero-waste sustainability targets.
          </p>
          <div className="animate-fade-in-up animate-delay-200" style={{ display: 'flex', gap: '16px', marginTop: '12px' }}>
            <Link to="/register" className="btn btn-primary" style={{ padding: '14px 28px', fontSize: '1rem' }}>
              Join the Network <ArrowRight size={18} />
            </Link>
            <Link to="/pricing" className="btn btn-secondary" style={{ padding: '14px 28px', fontSize: '1rem' }}>
              View Dynamic Rates
            </Link>
          </div>
        </div>
        <div className="animate-fade-in-up animate-delay-300" style={{
          backgroundColor: 'var(--primary-light)',
          borderRadius: 'var(--radius-lg)',
          padding: '40px',
          border: '1.5px solid var(--primary)',
          boxShadow: 'var(--shadow-glow)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: '24px',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <h3 style={{ fontSize: '1.5rem', color: 'var(--primary)' }}>Today's Buying Rates</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid var(--surface-border)' }}>
              <span>White Paper</span>
              <strong style={{ color: 'var(--text-main)' }}>
                {rates && rates.whitePaper !== null ? `${formatINR(rates.whitePaper)} / kg` : 'Configuring...'}
              </strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid var(--surface-border)' }}>
              <span>Cardboard</span>
              <strong style={{ color: 'var(--text-main)' }}>
                {rates && rates.cardboard !== null ? `${formatINR(rates.cardboard)} / kg` : 'Configuring...'}
              </strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Mixed Paper</span>
              <strong style={{ color: 'var(--text-main)' }}>
                {rates && rates.mixedPaper !== null ? `${formatINR(rates.mixedPaper)} / kg` : 'Configuring...'}
              </strong>
            </div>
          </div>
          <Link to="/register" style={{
            display: 'block',
            textAlign: 'center',
            marginTop: '8px',
            color: 'var(--primary)',
            fontWeight: 700,
            textDecoration: 'none'
          }}>Sign up to lock these rates &rarr;</Link>
        </div>
      </section>

      {/* Marquee Section */}
      <div className="marquee-container animate-fade-in-up animate-delay-400">
        <div className="marquee-content">
          <span className="marquee-item">SUSTAINABLE RECYCLING</span>
          <span className="marquee-item">CIRCULAR ECONOMY</span>
          <span className="marquee-item">EMPOWERING EDUCATION</span>
          <span className="marquee-item">ZERO WASTE</span>
          <span className="marquee-item">PREMIUM RATES</span>
          <span className="marquee-item">INSTANT PAYOUTS</span>
        </div>
        <div className="marquee-content" aria-hidden="true">
          <span className="marquee-item">SUSTAINABLE RECYCLING</span>
          <span className="marquee-item">CIRCULAR ECONOMY</span>
          <span className="marquee-item">EMPOWERING EDUCATION</span>
          <span className="marquee-item">ZERO WASTE</span>
          <span className="marquee-item">PREMIUM RATES</span>
          <span className="marquee-item">INSTANT PAYOUTS</span>
        </div>
      </div>

      {/* Mission Section */}
      <section className="animate-fade-in-up" style={{
        backgroundColor: 'var(--surface)',
        borderRadius: 'var(--radius-lg)',
        padding: '60px 40px',
        border: '1px solid var(--surface-border)',
        boxShadow: 'var(--shadow-sm)',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '24px'
      }}>
        <h2 style={{ fontSize: '2.2rem', maxWidth: '600px' }}>Our Mission: Extracting Value from Every Sheet</h2>
        <p style={{ color: 'var(--text-muted)', maxWidth: '800px', fontSize: '1.1rem' }}>
          PulpChain bridges the gap between educational infrastructure and sustainability. We help schools design an operations model where every notebook, exam script, and supply box is collected, quantified, and traded responsibly. The resulting revenue flows directly back into school funding, creating a clean circular economy.
        </p>
      </section>

      {/* How It Works */}
      <section className="animate-fade-in-up animate-delay-200" style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '2.2rem' }}>Simple 3-Step Recycling Flow</h2>
          <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>From classrooms to commercial processing, we handle the heavy lifting.</p>
        </div>
        <div className="grid-cols-3">
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--primary-light)',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '1.25rem'
            }}>1</div>
            <h3>Request Pickup</h3>
            <p style={{ color: 'var(--text-muted)' }}>Schools request pickups through the online portal for Cardboard, Mixed, or White Paper.</p>
          </div>
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--primary-light)',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '1.25rem'
            }}>2</div>
            <h3>We Pick Up & Weigh</h3>
            <p style={{ color: 'var(--text-muted)' }}>Our operations team processes approvals, schedules logistics, weighs the batch, and confirms metrics.</p>
          </div>
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--primary-light)',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '1.25rem'
            }}>3</div>
            <h3>Instant Payouts</h3>
            <p style={{ color: 'var(--text-muted)' }}>The payout is computed instantly using the dynamic rates and deposited straight into the school's account.</p>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="animate-fade-in-up animate-delay-300" style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '2.2rem' }}>Why Schools Choose PulpChain</h2>
          <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>The premium standard in school recycling services.</p>
        </div>
        <div className="grid-cols-3">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <Building style={{ color: 'var(--primary)' }} size={32} />
            <h3>Complete Transparency</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Track the lifecycle from the initial request to the final receipt, weights, rates, and reference IDs.</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <Award style={{ color: 'var(--primary)' }} size={32} />
            <h3>Premium Payouts</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>We operate direct pipelines to major processing mills, guaranteeing the absolute best market rates for schools.</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <TrendingUp style={{ color: 'var(--primary)' }} size={32} />
            <h3>Detailed Audits & Reports</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Access detailed environmental impact sheets, financial statements, and past transaction histories.</p>
          </div>
        </div>
      </section>

      {/* Call to Actions */}
      <section className="animate-fade-in-up animate-delay-400" style={{
        background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%)',
        color: 'var(--text-inverse)',
        borderRadius: 'var(--radius-lg)',
        padding: '60px 40px',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '24px',
        boxShadow: 'var(--shadow-md)'
      }}>
        <h2 style={{ color: 'var(--text-inverse)', fontSize: '2.2rem' }}>Ready to clean up and earn?</h2>
        <p style={{ color: 'var(--text-inverse)', opacity: 0.9, maxWidth: '600px', fontSize: '1.1rem' }}>
          Registration is free and takes less than 5 minutes. Let's make your school a leader in community sustainability.
        </p>
        <div style={{ display: 'flex', gap: '16px' }}>
          <Link to="/register" className="btn btn-inverse-solid">
            Register Your School
          </Link>
          <Link to="/login" className="btn btn-inverse-outline">
            School Log In
          </Link>
        </div>
      </section>
    </div>
  );
};
