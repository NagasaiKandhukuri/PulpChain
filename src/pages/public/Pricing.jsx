import React from 'react';
import { adminService } from '../../services/admin';
import { formatINR } from '../../components/Layout';
import { ShieldAlert, Info, Scale, ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Pricing = () => {
  const [rates, setRates] = React.useState(null);

  React.useEffect(() => {
    adminService.getRates().then(setRates).catch(console.error);
  }, []);

  // Determine if rates are configured
  const isConfigured = rates && 
                       rates.mixedPaper !== null && 
                       rates.cardboard !== null && 
                       rates.whitePaper !== null &&
                       rates.mixedPaperSell !== null &&
                       rates.cardboardSell !== null &&
                       rates.whitePaperSell !== null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
      <section style={{ textAlign: 'center', padding: '20px 0' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '12px' }}>Platform Rates Sheet</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto' }}>
          Standardized procurement buying rates and marketplace selling rates in INR (₹).
        </p>
      </section>

      {!isConfigured ? (
        <div className="empty-state" style={{ maxWidth: '600px', margin: '0 auto' }}>
          <ShieldAlert size={48} style={{ color: 'var(--warning)' }} />
          <h3 className="empty-state-title">Rates are being configured</h3>
          <p style={{ maxWidth: '400px', margin: '8px auto 20px auto' }}>
            Our pricing operations team is currently configuring PulpChain's standard buying and selling rates. Please check back shortly.
          </p>
          <Link to="/contact" className="btn btn-secondary">Contact Operations Support</Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
          {/* Main rate display grids */}
          <div className="grid-cols-2">
            {/* Buying rates */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid var(--surface-border)', paddingBottom: '12px' }}>
                <Scale size={24} style={{ color: 'var(--primary)' }} />
                <h3 style={{ fontSize: '1.3rem' }}>School Purchase Rates (Buy)</h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--surface-border)', paddingBottom: '12px' }}>
                  <span>White Paper</span>
                  <strong style={{ fontSize: '1.25rem', color: 'var(--primary)' }}>{formatINR(rates.whitePaper)} / kg</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--surface-border)', paddingBottom: '12px' }}>
                  <span>Cardboard</span>
                  <strong style={{ fontSize: '1.25rem', color: 'var(--primary)' }}>{formatINR(rates.cardboard)} / kg</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Mixed Paper</span>
                  <strong style={{ fontSize: '1.25rem', color: 'var(--primary)' }}>{formatINR(rates.mixedPaper)} / kg</strong>
                </div>
              </div>
            </div>

            {/* Selling rates */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid var(--surface-border)', paddingBottom: '12px' }}>
                <ShoppingCart size={24} style={{ color: 'var(--info)' }} />
                <h3 style={{ fontSize: '1.3rem' }}>Industry Selling Rates (Sell)</h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--surface-border)', paddingBottom: '12px' }}>
                  <span>White Paper</span>
                  <strong style={{ fontSize: '1.25rem', color: 'var(--info)' }}>{formatINR(rates.whitePaperSell)} / kg</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--surface-border)', paddingBottom: '12px' }}>
                  <span>Cardboard</span>
                  <strong style={{ fontSize: '1.25rem', color: 'var(--info)' }}>{formatINR(rates.cardboardSell)} / kg</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Mixed Paper</span>
                  <strong style={{ fontSize: '1.25rem', color: 'var(--info)' }}>{formatINR(rates.mixedPaperSell)} / kg</strong>
                </div>
              </div>
            </div>
          </div>

          <div style={{
            backgroundColor: 'var(--surface)',
            border: '1px solid var(--surface-border)',
            borderRadius: 'var(--radius-lg)',
            padding: '24px',
            textAlign: 'center',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px'
          }}>
            <span>Minimum Order MOQ: <strong>{rates.moq || 0} kg</strong></span>
            <span>Last Updated: {rates.lastUpdated ? new Date(rates.lastUpdated).toLocaleString() : 'N/A'}</span>
          </div>
        </div>
      )}
    </div>
  );
};
export default Pricing;
