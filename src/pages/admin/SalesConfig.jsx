import React from 'react';
import { financeService } from '../../services/finance';
import { formatINR } from '../../utils/format';
import { DollarSign, PlusCircle, Receipt } from 'lucide-react';
import { Link } from 'react-router-dom';

export const SalesConfig = () => {
  const [sales, setSales] = React.useState([]);
  const [formData, setFormData] = React.useState({
    buyerName: '',
    paperType: 'mixedPaper',
    quantity: '',
    saleRate: ''
  });
  const [success, setSuccess] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const loadSales = async () => {
    try {
      const data = await financeService.getSales();
      setSales(data.reverse());
    } catch (err) {
      console.error(err);
    }
  };

  React.useEffect(() => {
    loadSales();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setSuccess(false);
    setIsSubmitting(true);

    const qty = parseFloat(formData.quantity);
    const rate = parseFloat(formData.saleRate);

    if (isNaN(qty) || qty <= 0) {
      alert('Please enter a valid quantity.');
      setIsSubmitting(false);
      return;
    }
    if (isNaN(rate) || rate <= 0) {
      alert('Please enter a valid sale rate.');
      setIsSubmitting(false);
      return;
    }

    try {
      await financeService.recordSale({
        buyerName: formData.buyerName,
        paperType: formData.paperType,
        quantity: qty,
        saleRate: rate
      });
      setSuccess(true);
      setFormData({
        buyerName: '',
        paperType: 'mixedPaper',
        quantity: '',
        saleRate: ''
      });
      loadSales();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '2.2rem' }}>Commercial Sales Ledger</h1>
          <p style={{ color: 'var(--text-muted)' }}>Log processed paper sales to external mills and track revenues.</p>
        </div>
        <Link to="/admin/documents" className="btn btn-secondary btn-sm">
          <Receipt size={16} /> View Documents Hub
        </Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '0.8fr 1.2fr', gap: '32px' }} className="grid-cols-2">
        {/* Record Sale Form */}
        <div className="card" style={{ height: 'fit-content' }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '20px' }}>Log New Sale</h3>

          {success && (
            <div style={{
              backgroundColor: 'var(--primary-light)',
              color: 'var(--primary)',
              padding: '12px 16px',
              borderRadius: 'var(--radius-md)',
              marginBottom: '20px',
              fontWeight: 600
            }}>
              Commercial sale recorded successfully!
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="buyerName">Buyer / Mill Name</label>
              <input
                type="text"
                id="buyerName"
                className="form-control"
                placeholder="E.g., Deccan Pulp Mills Ltd."
                value={formData.buyerName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="paperType">Paper Type</label>
              <select
                id="paperType"
                className="form-control form-select"
                value={formData.paperType}
                onChange={handleChange}
                required
              >
                <option value="mixedPaper">Mixed Paper</option>
                <option value="cardboard">Cardboard</option>
                <option value="whitePaper">White Paper</option>
                <option value="general">General / Unsorted</option>
              </select>
            </div>

            <div className="grid-cols-2" style={{ gap: '16px' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="quantity">Quantity Sold (kg)</label>
                <input
                  type="number"
                  id="quantity"
                  className="form-control"
                  placeholder="E.g., 200"
                  value={formData.quantity}
                  onChange={handleChange}
                  required
                  min="0.01"
                  step="0.01"
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="saleRate">Sale Rate (₹/kg)</label>
                <input
                  type="number"
                  id="saleRate"
                  className="form-control"
                  placeholder="E.g., 22.00"
                  step="0.01"
                  value={formData.saleRate}
                  onChange={handleChange}
                  required
                  min="0.01"
                />
              </div>
            </div>

            <div style={{ padding: '12px', backgroundColor: 'var(--primary-light)', borderRadius: 'var(--radius-md)', fontSize: '0.9rem', fontWeight: 600 }}>
              Calculated Revenue:{' '}
              <span style={{ color: 'var(--primary)' }}>
                {formatINR((parseFloat(formData.quantity) || 0) * (parseFloat(formData.saleRate) || 0))}
              </span>
            </div>

            <button type="submit" className="btn btn-primary btn-full" style={{ marginTop: '12px' }} disabled={isSubmitting}>
              {isSubmitting ? 'Processing...' : <><PlusCircle size={16} /> Record Commercial Sale</>}
            </button>
          </form>
        </div>

        {/* Sales Ledger History List */}
        <div className="card">
          <h3 style={{ fontSize: '1.25rem', marginBottom: '20px' }}>Commercial Sales History</h3>
          {sales.length === 0 ? (
            <div className="empty-state" style={{ padding: '32px' }}>
              <DollarSign size={36} />
              <h4 className="empty-state-title" style={{ fontSize: '1rem' }}>No commercial sales logged yet</h4>
              <p style={{ fontSize: '0.8rem', margin: '4px 0 12px 0' }}>Data will appear after operations begin.</p>
            </div>
          ) : (
            <div className="table-container" style={{ margin: 0 }}>
              <table>
                <thead>
                  <tr>
                    <th>Invoice No</th>
                    <th>Buyer</th>
                    <th>Material</th>
                    <th>Qty (kg)</th>
                    <th>Total Value</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {sales.map((s) => (
                    <tr key={s.id}>
                      <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{s.invoiceNumber}</td>
                      <td>{s.buyerName}</td>
                      <td style={{ textTransform: 'capitalize' }}>
                        {s.paperType === 'mixedPaper' ? 'Mixed Paper' : s.paperType === 'cardboard' ? 'Cardboard' : s.paperType === 'whitePaper' ? 'White Paper' : 'General'}
                      </td>
                      <td>{s.quantity} kg</td>
                      <td style={{ fontWeight: 700, color: 'var(--success)' }}>{formatINR(s.totalRevenue)}</td>
                      <td>{new Date(s.saleDate).toLocaleDateString()}</td>
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
