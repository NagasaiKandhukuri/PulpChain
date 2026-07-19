import React from 'react';
import { industryService } from '../../services/industry';
import { useAuth } from '../../contexts/AuthContext';
import { formatINR } from '../../utils/format';
import { Landmark, Clock } from 'lucide-react';

export const IndustryPayments = () => {
  const { user } = useAuth();
  const [payments, setPayments] = React.useState([]);
  const [summary, setSummary] = React.useState({
    totalOrders: 0,
    totalQtyPurchased: 0,
    outstandingAmount: 0,
    paidAmount: 0,
    activeContractsCount: 0
  });

  const loadPaymentsData = async () => {
    try {
      const [ordersData, paymentsData] = await Promise.all([
        industryService.getOrders(user.id).catch(() => []),
        industryService.getIndustryPayments(user.id).catch(() => [])
      ]);
      setPayments(paymentsData);
      setSummary(await industryService.getIndustryFinancialSummary(user.id, ordersData, paymentsData));
    } catch (err) {
      console.error(err);
    }
  };

  React.useEffect(() => {
    loadPaymentsData();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div>
        <h1 style={{ fontSize: '2.2rem' }}>Payments Ledger</h1>
        <p style={{ color: 'var(--text-muted)' }}>Track your financial balance sheet, pending payment clearings, and transaction references.</p>
      </div>

      {/* Financial Stats */}
      <div className="grid-cols-4">
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>TOTAL OUTSTANDING</span>
          <h2 style={{ fontSize: '1.8rem', color: 'var(--danger)' }}>
            {formatINR(summary.outstandingAmount)}
          </h2>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Pending bank wire</span>
        </div>

        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>TOTAL PAID</span>
          <h2 style={{ fontSize: '1.8rem', color: 'var(--success)' }}>
            {formatINR(summary.paidAmount)}
          </h2>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Settled order cargo</span>
        </div>

        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>PENDING PAYMENTS</span>
          <h2 style={{ fontSize: '1.8rem' }}>
            {payments.filter(p => p.status === 'pending').length}
          </h2>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Invoices awaiting clearing</span>
        </div>

        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>SETTLED TRANSACTIONS</span>
          <h2 style={{ fontSize: '1.8rem' }}>
            {payments.filter(p => p.status === 'paid').length}
          </h2>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Cleared settlements</span>
        </div>
      </div>

      {/* Bank details instruction card */}
      <div className="card" style={{ backgroundColor: 'var(--primary-light)', border: '1px solid var(--primary)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <h3 style={{ color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Landmark size={20} /> Wire Settlement Details
        </h3>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>
          Please wire pending balances to the following corporate account and email the receipt or submit the transaction reference number to your account manager.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>
          <div>Bank Name: <span style={{ color: 'var(--primary)' }}>State Bank of India</span></div>
          <div>Account Number: <span style={{ color: 'var(--primary)' }}>40291039910</span></div>
          <div>IFSC Code: <span style={{ color: 'var(--primary)' }}>SBIN0004019</span></div>
          <div>Beneficiary: <span style={{ color: 'var(--primary)' }}>PulpChain Recycling Private Limited</span></div>
        </div>
        <div style={{ marginTop: '8px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          Need payment assistance? Contact <a href="mailto:support@pulpchain.in" style={{ color: 'var(--primary)', textDecoration: 'underline' }}>support@pulpchain.in</a>
        </div>
      </div>

      {/* Payments History table */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '1.25rem' }}>Transactions Ledger</h3>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', backgroundColor: 'var(--bg-main)', padding: '4px 8px', borderRadius: '4px' }}>
            * Amount includes GST
          </span>
        </div>
        {payments.length === 0 ? (
          <div className="empty-state">
            <Clock size={48} />
            <h3 className="empty-state-title">No transactions logged</h3>
            <p style={{ maxWidth: '400px', margin: '4px auto' }}>Invoice payouts ledger logs will display here as cargo deliveries occur.</p>
          </div>
        ) : (
          <div className="table-container" style={{ margin: 0 }}>
            <table>
              <thead>
                <tr>
                  <th>Invoice No</th>
                  <th>Base Amount</th>
                  <th>GST Amount</th>
                  <th>Final Payable Amount</th>
                  <th>Status</th>
                  <th>Payment Date</th>
                  <th>Transaction Reference</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.id}>
                    <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{p.invoiceNumber}</td>
                    <td>{formatINR(p.baseAmount)}</td>
                    <td>{formatINR(p.gstAmount)}</td>
                    <td style={{ fontWeight: 700, color: 'var(--primary)' }}>{formatINR(p.amount)}</td>
                    <td>
                      <span className={`badge badge-${p.status}`}>
                        {p.status}
                      </span>
                    </td>
                    <td>{p.paymentDate ? new Date(p.paymentDate).toLocaleString() : '--'}</td>
                    <td style={{ fontFamily: 'monospace' }}>{p.transactionReference || '--'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
export default IndustryPayments;
