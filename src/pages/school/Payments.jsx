import React from 'react';
import { schoolService } from '../../services/school';

import { useAuth } from '../../contexts/AuthContext';
import { formatINR } from '../../utils/format';
import { PiggyBank, Receipt, Download } from 'lucide-react';
import { generatePurchaseReceiptPDF } from '../../services/purchaseReceiptGenerator';

export const SchoolPayments = () => {
  const { user } = useAuth();
  const [payments, setPayments] = React.useState([]);

  React.useEffect(() => {
    if (user?.id) {
      schoolService.getPayments(user.id)
        .then(data => setPayments(data))
        .catch(console.error);
    }
  }, [user?.id]);

  // Summary calculations
  const totalEarned = payments
    .filter(p => p.status === 'paid')
    .reduce((sum, p) => sum + p.amount, 0);

  const totalPending = payments
    .filter(p => p.status === 'pending')
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div>
        <h1 style={{ fontSize: '2.2rem' }}>Payments Ledger</h1>
        <p style={{ color: 'var(--text-muted)' }}>Review payouts and completed recycling incentives in INR (₹).</p>
      </div>

      {/* Summary Payout Cards */}
      <div className="grid-cols-2">
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ padding: '16px', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', borderRadius: 'var(--radius-lg)' }}>
            <PiggyBank size={32} />
          </div>
          <div>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>TOTAL DISBURSED</span>
            <h2 style={{ fontSize: '2rem', lineHeight: 1.1, marginTop: '4px', color: 'var(--primary)' }}>{formatINR(totalEarned)}</h2>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ padding: '16px', backgroundColor: '#fffbeb', color: '#d97706', borderRadius: 'var(--radius-lg)' }}>
            <ClockIcon size={32} />
          </div>
          <div>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>PENDING PAYOUTS</span>
            <h2 style={{ fontSize: '2rem', lineHeight: 1.1, marginTop: '4px', color: '#d97706' }}>{formatINR(totalPending)}</h2>
          </div>
        </div>
      </div>

      {payments.length === 0 ? (
        <div className="empty-state">
          <Receipt size={48} />
          <h3 className="empty-state-title">No payment records yet</h3>
          <p style={{ maxWidth: '400px', margin: '8px auto' }}>
            Data will appear after operations begin. Payout records are created automatically when pickups are completed.
          </p>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Payment ID</th>
                <th>Pickup ID</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Disbursed Date</th>
                <th>Transaction Reference</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p.id}>
                  <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{p.id}</td>
                  <td style={{ fontFamily: 'monospace' }}>{p.pickupId}</td>
                  <td style={{ fontWeight: 700 }}>{formatINR(p.amount)}</td>
                  <td>
                    <span className={`badge badge-${p.status}`}>
                      {p.status}
                    </span>
                  </td>
                  <td>{p.paymentDate ? new Date(p.paymentDate).toLocaleDateString() : '--'}</td>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.9rem' }}>{p.transactionReference || '--'}</td>
                  <td>
                    {p.status === 'paid' ? (
                      <button
                        onClick={async () => {
                          try {
                            const pickups = await schoolService.getPickups(user.id);
                            const pickup = pickups.find(pk => pk.id === p.pickupId);
                            if (pickup) {
                              generatePurchaseReceiptPDF(pickup);
                            } else {
                              alert("Pickup details not found.");
                            }
                          } catch(e) {
                            console.error(e);
                            alert("Failed to fetch pickup details.");
                          }
                        }}
                        className="btn btn-primary btn-sm"
                        style={{ display: 'inline-flex', gap: '4px' }}
                      >
                        <Download size={12} /> Receipt
                      </button>
                    ) : (
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>--</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const ClockIcon = ({ size }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
);
