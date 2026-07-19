import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../../services/admin';
import { formatINR } from '../../utils/format';
import { AlertCircle } from 'lucide-react';

export const Marketplace = () => {
  const [rates, setRates] = useState(null);
  const [inventory, setInventory] = useState({ mixedPaperKg: 0, cardboardKg: 0, whitePaperKg: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [ratesData, inventoryData] = await Promise.all([
          adminService.getRates().catch(e => { console.error('Rates error', e); return null; }),
          adminService.getInventory().catch(e => { console.error('Inventory error', e); return { mixedPaperKg: 0, cardboardKg: 0, whitePaperKg: 0 }; })
        ]);

        setRates(ratesData || {});
        setInventory(inventoryData);
      } catch (e) {
        console.error('Marketplace error:', e);
        setRates({});
        setInventory({ mixedPaperKg: 0, cardboardKg: 0, whitePaperKg: 0 });
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) return <div>Loading marketplace data...</div>;

  // Check if selling rates are configured
  const isConfigured = rates &&
                       rates.mixedPaperSell != null &&
                       rates.cardboardSell != null &&
                       rates.whitePaperSell != null;

  // Availability status helpers
  const getAvailabilityStatus = (weight) => {
    if (weight <= 0) return { label: 'Out of Stock', color: 'var(--danger)', bg: '#fee2e2' };
    if (weight <= 100) return { label: 'Limited Stock', color: 'var(--warning)', bg: '#fffbeb' };
    return { label: 'Available', color: 'var(--success)', bg: '#d1fae5' };
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
      <section style={{ textAlign: 'center', padding: '20px 0' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '12px' }}>PulpChain Live Marketplace</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto' }}>
          Browse available platform inventory and current pricing cards before placing order requests.
        </p>
      </section>



      {!isConfigured ? (
        <div className="empty-state" style={{ maxWidth: '600px', margin: '0 auto' }}>
          <AlertCircle size={48} style={{ color: 'var(--warning)' }} />
          <h3 className="empty-state-title">Marketplace Currently Offline</h3>
          <p style={{ maxWidth: '400px', margin: '8px auto 20px auto' }}>
            We are updating our seasonal sell-side pricing models. Industrial ordering will resume shortly.
          </p>
          <div style={{ display: 'flex', gap: '12px' }}>
            <Link to="/register-industry" className="btn btn-primary btn-sm">Register Interest</Link>
            <Link to="/contact" className="btn btn-secondary btn-sm">Contact Support</Link>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
          {/* Materials cards */}
          <div className="grid-cols-3">
            {[
              { name: 'White Paper', weight: inventory.whitePaperKg || 0, sellKey: 'whitePaperSell', desc: 'Premium recyclable fiber logs' },
              { name: 'Cardboard', weight: inventory.cardboardKg || 0, sellKey: 'cardboardSell', desc: 'Corrugated packaging bundles' },
              { name: 'Mixed Paper', weight: inventory.mixedPaperKg || 0, sellKey: 'mixedPaperSell', desc: 'Magazines, books & newspapers' }
            ].map((item) => {
              const availability = getAvailabilityStatus(item.weight);
              return (
                <div key={item.name} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '20px', borderTop: '4px solid var(--primary)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h3 style={{ fontSize: '1.4rem' }}>{item.name}</h3>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{item.desc}</span>
                    </div>
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, color: availability.color, backgroundColor: availability.bg, padding: '4px 8px', borderRadius: 'var(--radius-full)', textTransform: 'uppercase' }}>
                      {availability.label}
                    </span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--surface-border)', paddingBottom: '8px' }}>
                      <span>Available Stock</span>
                      <strong style={{ fontSize: '1.15rem' }}>{item.weight} kg</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--surface-border)', paddingBottom: '8px' }}>
                      <span>Selling Rate</span>
                      <strong style={{ color: 'var(--primary)', fontSize: '1.15rem' }}>{formatINR(rates[item.sellKey])} / kg</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--surface-border)', paddingBottom: '8px' }}>
                      <span>Minimum MOQ</span>
                      <strong>{rates.moq || 0} kg</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      <span>Last Updated</span>
                      <span>{rates.lastUpdated ? new Date(rates.lastUpdated).toLocaleString() : 'N/A'}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* CTA Box */}
          <div style={{
            backgroundColor: 'var(--surface)',
            border: '1px solid var(--surface-border)',
            borderRadius: 'var(--radius-lg)',
            padding: '32px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px'
          }}>
            <h3 style={{ fontSize: '1.4rem' }}>Unlock Industrial Ordering Profiles</h3>
            <p style={{ color: 'var(--text-muted)', maxWidth: '500px', fontSize: '0.95rem' }}>
              Only registered and approved industrial buyers can place order requests or negotiate supply agreements.
            </p>
            <div style={{ display: 'flex', gap: '16px' }}>
              <Link to="/register-industry" className="btn btn-primary">Register Industry</Link>
              <Link to="/industry/login" className="btn btn-secondary">Industry Log In</Link>
            </div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Rates last updated: {rates.lastUpdated ? new Date(rates.lastUpdated).toLocaleString() : 'N/A'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
export default Marketplace;
