import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { industryService } from '../../services/industry';
import { adminService } from '../../services/admin';
import { authService } from '../../services/auth';
import { useAuth } from '../../contexts/AuthContext';
import { formatINR } from '../../components/Layout';
import { ShoppingCart, AlertTriangle, ShieldCheck } from 'lucide-react';

export const RequestOrder = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const rates = adminService.getRates();
  const inventory = adminService.getInventory();

  const [paperType, setPaperType] = React.useState('mixedPaper');
  const [quantity, setQuantity] = React.useState('');
  const [deliveryAddress, setDeliveryAddress] = React.useState('');
  const [deliveryDate, setDeliveryDate] = React.useState('');
  const [notes, setNotes] = React.useState('');
  const [error, setError] = React.useState(null);

  // Auto populate school's business address if needed
  // Auto populate school's business address if needed
  React.useEffect(() => {
    const loadAddress = async () => {
      try {
        const industriesData = await adminService.getIndustries();
        const industries = Array.isArray(industriesData) ? industriesData : [];
        const ind = industries.find(i => i.id === user?.id);
        if (ind) {
          setDeliveryAddress(ind.address || '');
        }
      } catch (err) {
        console.error('Failed to load address:', err);
      }
    };
    if (user?.id) loadAddress();
  }, [user?.id]);

  const ratesConfigured = rates && 
                         rates.mixedPaperSell !== null && 
                         rates.cardboardSell !== null && 
                         rates.whitePaperSell !== null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const qty = parseFloat(quantity);
    if (isNaN(qty) || qty <= 0) {
      setError('Please enter a valid quantity.');
      return;
    }

    try {
      await industryService.requestOrder(
        user.id,
        paperType,
        qty,
        deliveryAddress,
        deliveryDate,
        notes
      );
      navigate('/industry/orders');
    } catch (err) {
      setError(err.message);
    }
  };

  if (!ratesConfigured) {
    return (
      <div style={{ maxWidth: '600px', margin: '40px auto' }} className="card">
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', padding: '20px' }}>
          <AlertTriangle size={48} style={{ color: 'var(--warning)' }} />
          <h2>Order System Offline</h2>
          <p style={{ color: 'var(--text-muted)' }}>
            Selling rate parameters have not been finalized by the operations team. Standard ordering is temporarily locked.
          </p>
          <Link to="/industry/dashboard" className="btn btn-secondary" style={{ marginTop: '12px' }}>Return to Dashboard</Link>
        </div>
      </div>
    );
  }

  // Get current selected item's stock levels & prices for display helper
  const selectedStock = inventory[`${paperType}Kg`] || 0;
  const selectedPrice = rates[`${paperType}Sell`] || 0;

  return (
    <div style={{ maxWidth: '540px', margin: '40px auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1 style={{ fontSize: '2.2rem' }}>Request Paper Materials</h1>
        <p style={{ color: 'var(--text-muted)' }}>Verify platform warehouse stock levels before submitting.</p>
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

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="paperType">Paper Category</label>
            <select
              id="paperType"
              className="form-control form-select"
              value={paperType}
              onChange={(e) => setPaperType(e.target.value)}
              required
            >
              <option value="mixedPaper">Mixed Paper (Rate: {formatINR(rates.mixedPaperSell)}/kg)</option>
              <option value="cardboard">Cardboard (Rate: {formatINR(rates.cardboardSell)}/kg)</option>
              <option value="whitePaper">White Paper (Rate: {formatINR(rates.whitePaperSell)}/kg)</option>
            </select>
          </div>

          <div style={{ padding: '12px', backgroundColor: 'var(--background)', borderRadius: 'var(--radius-md)', fontSize: '0.85rem' }}>
            Available Stock Level: <strong>{selectedStock} kg</strong> <br />
            Selling Unit Price: <strong style={{ color: 'var(--primary)' }}>{formatINR(selectedPrice)} / kg</strong>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="quantity">Required Quantity (kg)</label>
            <input
              type="number"
              id="quantity"
              className="form-control"
              placeholder="E.g., 250"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
            />
            {rates.moq !== null && (
              <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                * Minimum Order Quantity (MOQ): <strong>{rates.moq} kg</strong>
              </span>
            )}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="deliveryAddress">Delivery Address</label>
            <input
              type="text"
              id="deliveryAddress"
              className="form-control"
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="deliveryDate">Required Delivery Date</label>
            <input
              type="date"
              id="deliveryDate"
              className="form-control"
              value={deliveryDate}
              onChange={(e) => setDeliveryDate(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="notes">Additional Shipping Notes (Optional)</label>
            <textarea
              id="notes"
              className="form-control"
              rows="3"
              placeholder="Any dispatch instructions..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              style={{ resize: 'vertical' }}
            />
          </div>

          <div style={{ padding: '12px', backgroundColor: 'var(--primary-light)', borderRadius: 'var(--radius-md)', fontSize: '0.9rem', fontWeight: 600 }}>
            Estimated Order Value:{' '}
            <span style={{ color: 'var(--primary)' }}>
              {formatINR((parseFloat(quantity) || 0) * selectedPrice)}
            </span>
          </div>

          <button type="submit" className="btn btn-primary btn-full">
            Submit Order Request <ShoppingCart size={16} />
          </button>
        </form>
      </div>
    </div>
  );
};
export default RequestOrder;
