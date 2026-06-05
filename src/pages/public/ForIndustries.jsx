import React from 'react';
import { Link } from 'react-router-dom';
import { Truck, Scale, ShieldCheck, FileText, ArrowRight } from 'lucide-react';

export const ForIndustries = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '60px' }}>
      {/* Hero */}
      <section style={{ textAlign: 'center', padding: '40px 0', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
        <h1 style={{ fontSize: '3rem', maxWidth: '800px' }}>
          Sustainable Paper Supply <br />
          <span style={{ color: 'var(--primary)' }}>For Commercial Paper Mills</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', maxWidth: '600px' }}>
          PulpChain provides industrial buyers with steady, sorted cargo streams of Cardboard, White Paper, and Mixed Paper directly from educational networks.
        </p>
        <div style={{ display: 'flex', gap: '16px', marginTop: '12px' }}>
          <Link to="/register-industry" className="btn btn-primary">
            Register as Industry Buyer <ArrowRight size={18} />
          </Link>
          <Link to="/marketplace" className="btn btn-secondary">
            Browse Stock Levels
          </Link>
        </div>
      </section>

      {/* Feature stats */}
      <section className="grid-cols-3">
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <Scale size={32} style={{ color: 'var(--primary)' }} />
          <h3>Guaranteed Weights</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>We employ verified industrial scaling metrics for all handoffs, ensuring no cargo loss or estimation margins.</p>
        </div>

        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <Truck size={32} style={{ color: 'var(--primary)' }} />
          <h3>Logistics Pipeline</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Our dedicated logistics trucks manage dispatching, routing, and doorstep delivery directly to your milling yards.</p>
        </div>

        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <ShieldCheck size={32} style={{ color: 'var(--primary)' }} />
          <h3>Audit & Compliance</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Get GST-compliant commercial invoices, ledger exports, and detailed sustainability metrics automatically.</p>
        </div>
      </section>

      {/* Supply agreements details */}
      <section style={{
        backgroundColor: 'var(--surface)',
        border: '1px solid var(--surface-border)',
        borderRadius: 'var(--radius-lg)',
        padding: '40px',
        display: 'grid',
        gridTemplateColumns: '1.1fr 0.9fr',
        gap: '40px',
        alignItems: 'center'
      }} className="grid-cols-2">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h2>Recurring Monthly Agreements</h2>
          <p style={{ color: 'var(--text-muted)' }}>
            Need a reliable supply index to back your weekly paper mills production quotas? Lock in recurring monthly supply contracts.
          </p>
          <p style={{ color: 'var(--text-muted)' }}>
            Through our portal, you can request custom agreements defining expected monthly volumes (in kg) and negotiate target rates. Once approved, our logistics team allocates stock to satisfy your agreement first.
          </p>
          <Link to="/register-industry" className="btn btn-primary btn-sm" style={{ width: 'fit-content', marginTop: '8px' }}>
            Request Recurring Contract
          </Link>
        </div>
        <div style={{
          backgroundColor: 'var(--primary-light)',
          border: '1.5px solid var(--primary)',
          borderRadius: 'var(--radius-lg)',
          padding: '32px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          <h4>Onboarding Requirements</h4>
          <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.9rem', color: 'var(--text-main)' }}>
            <li>Registered business profile with valid **GST Number**.</li>
            <li>Commitment to the platform's Minimum Order Quantity (MOQ).</li>
            <li>Adherence to standard commercial payment terms upon receipt.</li>
          </ul>
        </div>
      </section>
    </div>
  );
};
