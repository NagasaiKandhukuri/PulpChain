import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Recycle, Award, TrendingUp, Sparkles, Building, Landmark } from 'lucide-react';
import { formatINR } from '../../components/Layout';
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
        display: 'grid',
        gridTemplateColumns: '1.2fr 0.8fr',
        alignItems: 'center',
        gap: '40px',
        padding: '40px 0',
        minHeight: '70vh'
      }} className="grid-cols-2">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
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
            fontWeight: 700
          }}>
            <Sparkles size={14} /> NEW ERA OF SCHOOL RECYCLING
          </div>
          <h1 style={{
            fontSize: 'clamp(2.5rem, 5vw, 4rem)',
            letterSpacing: '-0.03em',
            lineHeight: 1.1
          }}>
            Convert Waste Paper <br />
            <span style={{ color: 'var(--primary)' }}>Into Real Value</span>
          </h1>
          <p style={{
            fontSize: '1.15rem',
            color: 'var(--text-muted)',
            maxWidth: '540px'
          }}>
            PulpChain empowers educational institutions to set up systematic paper collection. Trade cardboard, office paper, and mixed paper for funds to support school development.
          </p>
          <div style={{ display: 'flex', gap: '16px', marginTop: '12px' }}>
            <Link to="/register" className="btn btn-primary">
              Register Your School <ArrowRight size={18} />
            </Link>
            <Link to="/pricing" className="btn btn-secondary">
              View Dynamic Rates
            </Link>
          </div>
        </div>
        <div style={{
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
            marginTop: '12px',
            textAlign: 'center',
            fontSize: '0.9rem',
            color: 'var(--primary)',
            fontWeight: 700,
            textDecoration: 'none'
          }}>Sign up to lock these rates &rarr;</Link>
        </div>
      </section>

      {/* Mission Section */}
      <section style={{
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
        <h2 style={{ fontSize: '2.2rem', maxWidth: '600px' }}>Our Mission: Convert Waste Paper Into Value</h2>
        <p style={{ color: 'var(--text-muted)', maxWidth: '800px', fontSize: '1.1rem' }}>
          PulpChain bridges the gap between educational infrastructure and sustainability. We help schools design an operations model where every notebook, exam script, and supply box is collected, quantified, and traded responsibly. The resulting revenue flows directly back into school funding, creating a clean circular economy.
        </p>
      </section>

      {/* How It Works */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
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
      <section style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
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
      <section style={{
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
          <Link to="/register" className="btn btn-secondary" style={{ backgroundColor: 'var(--text-inverse)', color: 'var(--primary)', borderColor: 'var(--text-inverse)' }}>
            Register Your School
          </Link>
          <Link to="/login" className="btn btn-secondary" style={{ background: 'transparent', color: 'var(--text-inverse)', borderColor: 'var(--text-inverse)' }}>
            School Log In
          </Link>
        </div>
      </section>
    </div>
  );
};
