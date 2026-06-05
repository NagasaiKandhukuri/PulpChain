import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { schoolService } from '../../services/school';
import { adminService } from '../../services/admin';
import { authService } from '../../services/auth';
import { useAuth } from '../../contexts/AuthContext';
import { Calendar, AlertTriangle, ShieldCheck } from 'lucide-react';
import { formatINR } from '../../components/Layout';

export const RequestPickup = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [rates, setRates] = React.useState(null);

  React.useEffect(() => {
    adminService.getRates().then(setRates).catch(console.error);
  }, []);

  const [paperType, setPaperType] = React.useState('mixedPaper');
  const [estimatedWeight, setEstimatedWeight] = React.useState('');
  const [error, setError] = React.useState(null);

  // Validate configuration status
  const ratesConfigured = rates && 
                           rates.mixedPaper !== null && 
                           rates.cardboard !== null && 
                           rates.whitePaper !== null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const weight = parseFloat(estimatedWeight);
    if (isNaN(weight) || weight <= 0) {
      setError('Please enter a valid estimated weight.');
      return;
    }

    // Check MOQ restriction
    if (rates && rates.moq !== null && weight < rates.moq) {
      setError(`Minimum Order Quantity (MOQ) requirement is ${rates.moq} kg. Your request must meet or exceed this quantity.`);
      return;
    }

    try {
      await schoolService.requestPickup(user.id, paperType, weight);
      navigate('/school/pickups');
    } catch (err) {
      setError(err.message);
    }
  };

  if (!ratesConfigured) {
    return (
      <div style={{ maxWidth: '600px', margin: '40px auto' }} className="card">
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', padding: '20px' }}>
          <AlertTriangle size={48} style={{ color: 'var(--warning)' }} />
          <h2>{rates ? "Pickup System Temporarily Locked" : "Loading Configuration..."}</h2>
          <p style={{ color: 'var(--text-muted)' }}>
            {rates ? "The logistics team has not finalized rates for this period. Pickup requests will be unlocked once rates are configured." : "Loading rates configuration from server..."}
          </p>
          <Link to="/school/dashboard" className="btn btn-secondary" style={{ marginTop: '12px' }}>Return to Dashboard</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '540px', margin: '40px auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1 style={{ fontSize: '2.2rem' }}>Request Paper Pickup</h1>
        <p style={{ color: 'var(--text-muted)' }}>Submit estimated weight. Rates will lock once scheduled.</p>
      </div>

      <div className="card">
        {error && (
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px',
            backgroundColor: '#fee2e2',
            color: '#b91c1c',
            padding: '16px',
            borderRadius: 'var(--radius-md)',
            marginBottom: '20px',
            fontSize: '0.9rem',
            fontWeight: 500
          }}>
            <AlertTriangle size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="paperType">Paper Category</label>
            <select
              id="paperType"
              className="form-control form-select"
              value={paperType}
              onChange={(e) => setPaperType(e.target.value)}
              required
            >
              <option value="mixedPaper">Mixed Paper (Est: {formatINR(rates.mixedPaper)}/kg)</option>
              <option value="cardboard">Cardboard (Est: {formatINR(rates.cardboard)}/kg)</option>
              <option value="whitePaper">White Paper (Est: {formatINR(rates.whitePaper)}/kg)</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="estimatedWeight">Estimated Weight (kg)</label>
            <input
              type="number"
              id="estimatedWeight"
              className="form-control"
              placeholder="e.g., 150"
              value={estimatedWeight}
              onChange={(e) => setEstimatedWeight(e.target.value)}
              required
            />
            {rates.moq !== null && (
              <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                * Minimum Order Quantity (MOQ): <strong>{rates.moq} kg</strong>
              </span>
            )}
          </div>

          <button type="submit" className="btn btn-primary btn-full">
            Submit Request <Calendar size={16} />
          </button>
        </form>
      </div>
    </div>
  );
};
