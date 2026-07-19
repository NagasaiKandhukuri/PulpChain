import React from 'react';
import { industryService } from '../../services/industry';

import { useAuth } from '../../contexts/AuthContext';
import { formatINR } from '../../utils/format';
import { Box } from 'lucide-react';
import { Link } from 'react-router-dom';

export const OrderHistory = () => {
  const { user } = useAuth();
  const [orders, setOrders] = React.useState([]);
  const [filter, setFilter] = React.useState('all');
  const [loading, setLoading] = React.useState(true);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await industryService.getOrders(user.id);
      setOrders(data.reverse());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    loadOrders();
  }, []);

  const filteredOrders = orders.filter(o => {
    if (filter === 'all') return true;
    return o.status === filter;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '2.2rem' }}>Order History Ledger</h1>
          <p style={{ color: 'var(--text-muted)' }}>Track scheduling, dispatch status, and shipping logs of purchased cargo.</p>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {['all', 'requested', 'approved', 'allocated', 'dispatched', 'delivered', 'completed', 'cancelled'].map(st => (
            <button
              key={st}
              onClick={() => setFilter(st)}
              className={`btn btn-sm ${filter === st ? 'btn-primary' : 'btn-secondary'}`}
              style={{ textTransform: 'capitalize' }}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="empty-state">
          <Box size={48} />
          <h3 className="empty-state-title">No orders found</h3>
          <p style={{ maxWidth: '400px', margin: '8px auto 20px auto' }}>
            Material orders requested by your company matching status "{filter}" will show up here.
          </p>
          <Link to="/industry/request-order" className="btn btn-secondary">Request Materials</Link>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Request Date</th>
                <th>Category</th>
                <th>Quantity</th>
                <th>Rate</th>
                <th>Total Value</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((o) => (
                <tr key={o.id}>
                  <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{o.id}</td>
                  <td>{new Date(o.orderDate).toLocaleDateString()}</td>
                  <td style={{ textTransform: 'capitalize' }}>
                    {o.paperType === 'mixedPaper' ? 'Mixed Paper' : o.paperType === 'cardboard' ? 'Cardboard' : 'White Paper'}
                  </td>
                  <td>{o.quantity} kg</td>
                  <td>{formatINR(o.rate)}</td>
                  <td style={{ fontWeight: 700 }}>{formatINR(o.finalAmount)}</td>
                  <td>
                    <span className={`badge badge-${o.status}`}>
                      {o.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '12px', textAlign: 'right' }}>
            * All displayed values are inclusive of 18% GST.
          </p>
        </div>
      )}
    </div>
  );
};
export default OrderHistory;
