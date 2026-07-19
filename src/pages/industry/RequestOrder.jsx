import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { industryService } from '../../services/industry';
import { adminService } from '../../services/admin';

import { useAuth } from '../../contexts/AuthContext';
import { formatINR } from '../../utils/format';
import { ShoppingCart, AlertTriangle } from 'lucide-react';
import { FINANCE_CONFIG } from '../../lib/constants';

export const RequestOrder = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [rates, setRates] = React.useState(null);
  const [inventory, setInventory] = React.useState({ mixedPaperKg: 0, cardboardKg: 0, whitePaperKg: 0 });
  const [paperType, setPaperType] = React.useState('mixedPaper');
  const [quantity, setQuantity] = React.useState('');
  const [deliveryAddress, setDeliveryAddress] = React.useState('');
  const [deliveryDate, setDeliveryDate] = React.useState('');
  const [notes, setNotes] = React.useState('');
  const [error, setError] = React.useState(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Auto populate school's business address if needed
  // Auto populate school's business address if needed
  React.useEffect(() => {
    const loadAddress = async () => {
      try {
        const [industriesData, ratesData, inventoryData] = await Promise.all([
          adminService.getIndustries().catch(() => []),
          adminService.getRates().catch(() => null),
          adminService.getInventory().catch(() => ({ mixedPaperKg: 0, cardboardKg: 0, whitePaperKg: 0 }))
        ]);
        const industries = Array.isArray(industriesData) ? industriesData : [];
        const ind = industries.find(i => i.id === user?.id);
        if (ind) {
          setDeliveryAddress(ind.address || '');
        }
        setRates(ratesData);
        setInventory(inventoryData);
      } catch (err) {
        console.error('Failed to load data:', err);
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
    if (isSubmitting) return;
    setError(null);
    setIsSubmitting(true);

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
      setIsSubmitting(false);
    }
  };

  if (!ratesConfigured) {
    return (
      <div style={{ maxWidth: '600px', margin: '40px auto' }} className="card">
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', padding: '20px' }}>
          <AlertTriangle size={48} style={{ color: 'var(--warning)' }} />
          <h2>{rates ? "Order System Offline" : "Loading Configuration..."}</h2>
          <p style={{ color: 'var(--text-muted)' }}>
            {rates ? "Selling rate parameters have not been finalized by the operations team. Standard ordering is temporarily locked." : "Loading rates configuration from server..."}
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
              min={rates.moq || 1}
              step="1"
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

          <div style={{ padding: '12px', backgroundColor: 'var(--primary-light)', borderRadius: 'var(--radius-md)', fontSize: '0.9rem' }}>
            {(() => {
              const baseAmount = (parseFloat(quantity) || 0) * selectedPrice;
              const gstAmount = baseAmount * (FINANCE_CONFIG.GST_RATE / 100);
              const totalPayable = baseAmount + gstAmount;

              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                    <span>Base Amount:</span>
                    <span>{formatINR(baseAmount)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                    <span>GST ({FINANCE_CONFIG.GST_RATE}%):</span>
                    <span>{formatINR(gstAmount)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600, borderTop: '1px solid rgba(0,0,0,0.1)', paddingTop: '8px', marginTop: '4px' }}>
                    <span>Total Payable:</span>
                    <span style={{ color: 'var(--primary)' }}>{formatINR(totalPayable)}</span>
                  </div>
                </div>
              );
            })()}
          </div>

          <button type="submit" className="btn btn-primary btn-full" disabled={isSubmitting}>
            {isSubmitting ? 'Processing...' : <>Submit Order Request <ShoppingCart size={16} /></>}
          </button>
        </form>
      </div>
    </div>
  );
};
export default RequestOrder;
