import React from 'react';
import { adminService } from '../../services/admin';
import { formatINR } from '../../components/Layout';
import { ShieldCheck, Scale, Info, Save } from 'lucide-react';

export const RatesConfig = () => {
  const [rates, setRates] = React.useState({
    mixedPaper: '',
    cardboard: '',
    whitePaper: '',
    mixedPaperSell: '',
    cardboardSell: '',
    whitePaperSell: '',
    moq: ''
  });
  const [success, setSuccess] = React.useState(false);
  const [currentRates, setCurrentRates] = React.useState(null);

  const loadRates = async () => {
    try {
      const r = await adminService.getRates();
      setCurrentRates(r);
      if (r) {
        setRates({
          mixedPaper: r.mixedPaper !== null ? r.mixedPaper : '',
          cardboard: r.cardboard !== null ? r.cardboard : '',
          whitePaper: r.whitePaper !== null ? r.whitePaper : '',
          mixedPaperSell: r.mixedPaperSell !== null ? r.mixedPaperSell : '',
          cardboardSell: r.cardboardSell !== null ? r.cardboardSell : '',
          whitePaperSell: r.whitePaperSell !== null ? r.whitePaperSell : '',
          moq: r.moq !== null ? r.moq : ''
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  React.useEffect(() => {
    loadRates();
  }, []);

  const handleChange = (e) => {
    setRates({
      ...rates,
      [e.target.id]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess(false);

    try {
      await adminService.updateRates({
        mixedPaper: rates.mixedPaper === '' ? null : parseFloat(rates.mixedPaper),
        cardboard: rates.cardboard === '' ? null : parseFloat(rates.cardboard),
        whitePaper: rates.whitePaper === '' ? null : parseFloat(rates.whitePaper),
        mixedPaperSell: rates.mixedPaperSell === '' ? null : parseFloat(rates.mixedPaperSell),
        cardboardSell: rates.cardboardSell === '' ? null : parseFloat(rates.cardboardSell),
        whitePaperSell: rates.whitePaperSell === '' ? null : parseFloat(rates.whitePaperSell),
        moq: rates.moq === '' ? null : parseFloat(rates.moq)
      });
      setSuccess(true);
      await loadRates();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div>
        <h1 style={{ fontSize: '2.2rem' }}>Recycling Rates & Margins</h1>
        <p style={{ color: 'var(--text-muted)' }}>Configure purchasing rate cards for schools and commercial selling prices for industries in INR (₹).</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '32px' }} className="grid-cols-2">
        {/* Configuration Form */}
        <div className="card">
          <h3 style={{ fontSize: '1.25rem', marginBottom: '20px' }}>Update Rate Tables</h3>
          
          {success && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              backgroundColor: 'var(--primary-light)',
              color: 'var(--primary)',
              padding: '12px 16px',
              borderRadius: 'var(--radius-md)',
              marginBottom: '20px',
              fontWeight: 600
            }}>
              <ShieldCheck size={20} />
              <span>Rates updated successfully!</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ borderBottom: '1px solid var(--surface-border)', paddingBottom: '12px' }}>
              <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Scale size={18} style={{ color: 'var(--primary)' }} />
                School Procurement Purchase Rates (₹/kg)
              </h4>
            </div>

            <div className="grid-cols-3" style={{ gap: '16px' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="whitePaper">White Paper (Buy)</label>
                <input
                  type="number"
                  id="whitePaper"
                  className="form-control"
                  placeholder="E.g., 14.50"
                  step="0.01"
                  value={rates.whitePaper}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="cardboard">Cardboard (Buy)</label>
                <input
                  type="number"
                  id="cardboard"
                  className="form-control"
                  placeholder="E.g., 10.00"
                  step="0.01"
                  value={rates.cardboard}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="mixedPaper">Mixed Paper (Buy)</label>
                <input
                  type="number"
                  id="mixedPaper"
                  className="form-control"
                  placeholder="E.g., 8.00"
                  step="0.01"
                  value={rates.mixedPaper}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div style={{ borderBottom: '1px solid var(--surface-border)', paddingBottom: '12px', marginTop: '12px' }}>
              <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Info size={18} style={{ color: 'var(--info)' }} />
                Industry Marketplace Selling Rates (₹/kg)
              </h4>
            </div>

            <div className="grid-cols-3" style={{ gap: '16px' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="whitePaperSell">White Paper (Sell)</label>
                <input
                  type="number"
                  id="whitePaperSell"
                  className="form-control"
                  placeholder="E.g., 25.00"
                  step="0.01"
                  value={rates.whitePaperSell}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="cardboardSell">Cardboard (Sell)</label>
                <input
                  type="number"
                  id="cardboardSell"
                  className="form-control"
                  placeholder="E.g., 18.00"
                  step="0.01"
                  value={rates.cardboardSell}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="mixedPaperSell">Mixed Paper (Sell)</label>
                <input
                  type="number"
                  id="mixedPaperSell"
                  className="form-control"
                  placeholder="E.g., 12.00"
                  step="0.01"
                  value={rates.mixedPaperSell}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="moq">Minimum Order Quantity (kg)</label>
              <input
                type="number"
                id="moq"
                className="form-control"
                placeholder="E.g., 100"
                value={rates.moq}
                onChange={handleChange}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary btn-full" style={{ marginTop: '12px' }}>
              <Save size={16} /> Save Rate Configurations
            </button>
          </form>
        </div>

        {/* Current Active Sheet overview */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="card">
            <h3 style={{ fontSize: '1.25rem', marginBottom: '16px' }}>Active Rates Ledger</h3>
            {currentRates && currentRates.mixedPaper !== null ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid var(--surface-border)', fontSize: '0.95rem' }}>
                  <span>White Paper (Buy / Sell)</span>
                  <strong>{formatINR(currentRates.whitePaper)} / {formatINR(currentRates.whitePaperSell)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid var(--surface-border)', fontSize: '0.95rem' }}>
                  <span>Cardboard (Buy / Sell)</span>
                  <strong>{formatINR(currentRates.cardboard)} / {formatINR(currentRates.cardboardSell)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid var(--surface-border)', fontSize: '0.95rem' }}>
                  <span>Mixed Paper (Buy / Sell)</span>
                  <strong>{formatINR(currentRates.mixedPaper)} / {formatINR(currentRates.mixedPaperSell)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid var(--surface-border)', fontSize: '0.95rem' }}>
                  <span>MOQ Requirement</span>
                  <strong>{currentRates.moq} kg</strong>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                  Last Updated:{' '}
                  {currentRates.lastUpdated ? new Date(currentRates.lastUpdated).toLocaleString() : 'N/A'}
                </div>
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                No active rate configuration. Set values on the form to enable schools and industries to transact.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default RatesConfig;
