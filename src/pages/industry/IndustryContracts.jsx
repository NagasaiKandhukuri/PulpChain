import React from 'react';
import { industryService } from '../../services/industry';
import {  } from '../../services/auth';
import { useAuth } from '../../contexts/AuthContext';
import { formatINR } from '../../utils/format';
import { FileText, PlusCircle } from 'lucide-react';

export const IndustryContracts = () => {
  const { user } = useAuth();
  const [contracts, setContracts] = React.useState([]);

  // Form fields
  const [paperType, setPaperType] = React.useState('mixedPaper');
  const [monthlyVolume, setMonthlyVolume] = React.useState('');
  const [duration, setDuration] = React.useState('12');
  const [expectedRate, setExpectedRate] = React.useState('');
  const [success, setSuccess] = React.useState(false);

  const loadContracts = async () => {
    setContracts(industryService.getContracts(user.id).reverse());
  };

  React.useEffect(() => {
    loadContracts();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess(false);

    const vol = parseFloat(monthlyVolume);
    const rate = parseFloat(expectedRate);

    if (isNaN(vol) || vol <= 0) {
      alert('Please enter a valid monthly quantity.');
      return;
    }
    if (isNaN(rate) || rate <= 0) {
      alert('Please enter a valid rate.');
      return;
    }

    try {
      await industryService.requestContract(
        user.id,
        paperType,
        vol,
        parseInt(duration),
        rate
      );
      setSuccess(true);
      setMonthlyVolume('');
      setExpectedRate('');
      loadContracts();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div>
        <h1 style={{ fontSize: '2.2rem' }}>Supply Agreements & Contracts</h1>
        <p style={{ color: 'var(--text-muted)' }}>Secure recurring monthly scrap supplies directly from PulpChain collection centers.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '0.8fr 1.2fr', gap: '32px' }} className="grid-cols-2">
        {/* Request Contract Form */}
        <div className="card" style={{ height: 'fit-content' }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '20px' }}>Request New Agreement</h3>

          {success && (
            <div style={{
              backgroundColor: 'var(--primary-light)',
              color: 'var(--primary)',
              padding: '12px 16px',
              borderRadius: 'var(--radius-md)',
              marginBottom: '20px',
              fontWeight: 600
            }}>
              Supply contract agreement submitted!
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="paperType">Paper Type</label>
              <select
                id="paperType"
                className="form-control form-select"
                value={paperType}
                onChange={(e) => setPaperType(e.target.value)}
                required
              >
                <option value="mixedPaper">Mixed Paper</option>
                <option value="cardboard">Cardboard</option>
                <option value="whitePaper">White Paper</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="monthlyVolume">Monthly Volume (kg)</label>
              <input
                type="number"
                id="monthlyVolume"
                className="form-control"
                placeholder="E.g., 2000"
                value={monthlyVolume}
                onChange={(e) => setMonthlyVolume(e.target.value)}
                required
              />
            </div>

            <div className="grid-cols-2" style={{ gap: '16px' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="duration">Contract Duration</label>
                <select
                  id="duration"
                  className="form-control form-select"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  required
                >
                  <option value="3">3 Months</option>
                  <option value="6">6 Months</option>
                  <option value="12">12 Months</option>
                  <option value="24">24 Months</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="expectedRate">Negotiated Rate (₹/kg)</label>
                <input
                  type="number"
                  id="expectedRate"
                  className="form-control"
                  placeholder="E.g., 20.00"
                  step="0.01"
                  value={expectedRate}
                  onChange={(e) => setExpectedRate(e.target.value)}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-full" style={{ marginTop: '8px' }}>
              <PlusCircle size={16} /> Request Supply Agreement
            </button>
          </form>
        </div>

        {/* Existing Contracts ledger */}
        <div className="card">
          <h3 style={{ fontSize: '1.25rem', marginBottom: '20px' }}>Active & Pending Agreements</h3>
          {contracts.length === 0 ? (
            <div className="empty-state" style={{ padding: '32px' }}>
              <FileText size={36} />
              <h4 className="empty-state-title" style={{ fontSize: '1rem' }}>No contract requests yet</h4>
              <p style={{ fontSize: '0.8rem', margin: '4px 0 12px 0' }}>Data will appear after operations begin.</p>
            </div>
          ) : (
            <div className="table-container" style={{ margin: 0 }}>
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Material</th>
                    <th>Vol / Month</th>
                    <th>Terms</th>
                    <th>Target Rate</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {contracts.map((c) => (
                    <tr key={c.id}>
                      <td>{new Date(c.requestDate).toLocaleDateString()}</td>
                      <td style={{ textTransform: 'capitalize' }}>
                        {c.paperType === 'mixedPaper' ? 'Mixed Paper' : c.paperType === 'cardboard' ? 'Cardboard' : 'White Paper'}
                      </td>
                      <td>{c.monthlyVolumeKg} kg</td>
                      <td>{c.contractDurationMonths} Mos</td>
                      <td style={{ fontWeight: 600 }}>{formatINR(c.expectedRate)}</td>
                      <td>
                        <span className={`badge badge-${c.status}`}>
                          {c.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default IndustryContracts;
