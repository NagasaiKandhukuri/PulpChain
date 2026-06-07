import React from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../../services/admin';
import { formatINR } from '../../components/Layout';
import { Box, Play, Check, X, ShieldAlert, Award, Truck, ShieldCheck, ChevronRight, Clock } from 'lucide-react';

export const ManageOrders = () => {
  const [orders, setOrders] = React.useState([]);
  const [filter, setFilter] = React.useState('all');

  const loadOrders = async () => {
    setOrders(adminService.getOrders().reverse());
  };

  React.useEffect(() => {
    loadOrders();
  }, []);

  const handleStatusChange = async (id, nextStatus) => {
    try {
      await adminService.updateOrderStatus(id, nextStatus);
      loadOrders();
    } catch (err) {
      alert(err.message);
    }
  };

  const filteredOrders = orders.filter(o => {
    if (filter === 'all') return true;
    return o.status === filter;
  });

  // Helper to render timeline tracking
  const renderTimeline = (o) => {
    const stages = [
      { key: 'requested', label: 'Req', date: o.orderDate },
      { key: 'approved', label: 'Appr', date: o.approvedDate },
      { key: 'allocated', label: 'Alloc', date: o.allocatedDate },
      { key: 'dispatched', label: 'Disp', date: o.dispatchedDate },
      { key: 'delivered', label: 'Deliv', date: o.deliveredDate },
      { key: 'completed', label: 'Comp', date: o.completedDate }
    ];

    const currentStageIndex = stages.findIndex(s => s.key === o.status);

    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '12px', flexWrap: 'wrap' }}>
        {stages.map((stage, idx) => {
          const isDone = idx <= currentStageIndex;
          const isCurrent = stage.key === o.status;
          
          return (
            <React.Fragment key={stage.key}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '40px' }}>
                <span style={{ 
                  fontSize: '0.65rem', 
                  fontWeight: 700, 
                  color: isCurrent ? 'var(--primary)' : isDone ? 'var(--text-main)' : 'var(--text-muted)',
                  textTransform: 'uppercase'
                }}>{stage.label}</span>
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: isCurrent ? 'var(--primary)' : isDone ? 'var(--success)' : 'var(--surface-border)',
                  margin: '4px 0',
                  boxShadow: isCurrent ? '0 0 8px var(--primary)' : 'none'
                }} />
                {stage.date ? (
                  <span style={{ fontSize: '0.55rem', color: 'var(--text-muted)' }}>
                    {new Date(stage.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </span>
                ) : (
                  <span style={{ fontSize: '0.55rem', color: 'var(--text-muted)' }}>--</span>
                )}
              </div>
              {idx < stages.length - 1 && (
                <ChevronRight size={10} style={{ color: isDone ? 'var(--success)' : 'var(--surface-border)' }} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '2.2rem' }}>Industry Orders Logistics</h1>
          <p style={{ color: 'var(--text-muted)' }}>Manage mill purchase orders, allocate stocks, and complete cargo deliveries.</p>
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

      {filteredOrders.length === 0 ? (
        <div className="empty-state">
          <Box size={48} />
          <h3 className="empty-state-title">No orders found</h3>
          <p style={{ maxWidth: '400px', margin: '8px auto' }}>
            Current industry orders matching status "{filter}" will show up here.
          </p>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Order Details</th>
                <th>Material</th>
                <th>Quantity</th>
                <th>Delivery Info</th>
                <th>Order Payout</th>
                <th>Status Timeline</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((o) => (
                <tr key={o.id}>
                  <td>
                    <strong>{o.industryName}</strong>
                    <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)' }}>ID: {o.id}</span>
                    <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Date: {new Date(o.orderDate).toLocaleDateString()}</span>
                  </td>
                  <td style={{ textTransform: 'capitalize' }}>
                    {o.paperType === 'mixedPaper' ? 'Mixed Paper' : o.paperType === 'cardboard' ? 'Cardboard' : 'White Paper'}
                  </td>
                  <td>{o.quantity} kg</td>
                  <td>
                    <span style={{ display: 'block', fontSize: '0.9rem' }}>{o.deliveryAddress}</span>
                    <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Required: {new Date(o.requiredDeliveryDate).toLocaleDateString()}</span>
                  </td>
                  <td style={{ fontWeight: 700 }}>{formatINR(o.amount)}</td>
                  <td>
                    <span className={`badge badge-${o.status}`} style={{ marginBottom: '4px' }}>
                      {o.status}
                    </span>
                    {o.status !== 'cancelled' ? renderTimeline(o) : (
                      <div style={{ fontSize: '0.8rem', color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <X size={12} /> Cancelled on {o.cancelledDate ? new Date(o.cancelledDate).toLocaleDateString() : '--'}
                      </div>
                    )}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {o.status === 'requested' && (
                        <>
                          <button onClick={() => handleStatusChange(o.id, 'approved')} className="btn btn-primary btn-sm">
                            Approve Order
                          </button>
                          <button onClick={() => handleStatusChange(o.id, 'cancelled')} className="btn btn-danger btn-sm">
                            <X size={14} /> Cancel
                          </button>
                        </>
                      )}
                      {o.status === 'approved' && (
                        <>
                          <button onClick={() => handleStatusChange(o.id, 'allocated')} className="btn btn-primary btn-sm" style={{ backgroundColor: 'var(--info)', borderColor: 'var(--info)' }}>
                            <Award size={14} /> Allocate Stock
                          </button>
                          <button onClick={() => handleStatusChange(o.id, 'cancelled')} className="btn btn-danger btn-sm">
                            <X size={14} /> Cancel
                          </button>
                        </>
                      )}
                      {o.status === 'allocated' && (
                        <>
                          <button onClick={() => handleStatusChange(o.id, 'dispatched')} className="btn btn-primary btn-sm">
                            <Truck size={14} /> Dispatch Cargo
                          </button>
                          <button onClick={() => handleStatusChange(o.id, 'cancelled')} className="btn btn-danger btn-sm">
                            <X size={14} /> Cancel
                          </button>
                        </>
                      )}
                      {o.status === 'dispatched' && (
                        <>
                          <button onClick={() => handleStatusChange(o.id, 'delivered')} className="btn btn-primary btn-sm">
                            Deliver
                          </button>
                          <button onClick={() => handleStatusChange(o.id, 'cancelled')} className="btn btn-danger btn-sm">
                            <X size={14} /> Cancel
                          </button>
                        </>
                      )}
                      {o.status === 'delivered' && (
                        <>
                          <button onClick={() => handleStatusChange(o.id, 'completed')} className="btn btn-primary btn-sm" style={{ backgroundColor: 'var(--success)', borderColor: 'var(--success)' }}>
                            <Check size={14} /> Complete Order
                          </button>
                          <button onClick={() => handleStatusChange(o.id, 'cancelled')} className="btn btn-danger btn-sm">
                            <X size={14} /> Cancel
                          </button>
                        </>
                      )}
                      {o.status === 'completed' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <span style={{ fontSize: '0.85rem', color: 'var(--success)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <ShieldCheck size={14} /> Order Fulfilled
                          </span>
                          
                          {/* Invoice & Payment Operations B2B */}
                          {(() => {
                            const payments = adminService.getAllIndustryPayments();
                            const payment = payments.find(p => p.orderId === o.id);
                            
                            if (!payment) {
                              return <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No payment record</span>;
                            }
                            
                            return (
                              <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                                <Link to="/admin/documents" className="btn btn-secondary btn-sm" style={{ padding: '4px 8px', fontSize: '0.75rem' }}>
                                  Generate Invoice
                                </Link>
                                {payment.status === 'pending' ? (
                                  <button
                                    onClick={() => {
                                      const ref = prompt("Enter bank transaction reference details:");
                                      if (ref !== null) {
                                        try {
                                          adminService.markIndustryPaymentPaid(payment.id, ref);
                                          loadOrders();
                                          alert("B2B Payment marked as Paid successfully!");
                                        } catch (e) {
                                          alert(e.message);
                                        }
                                      }
                                    }}
                                    className="btn btn-primary btn-sm"
                                    style={{ padding: '4px 8px', fontSize: '0.75rem', backgroundColor: 'var(--info)', borderColor: 'var(--info)' }}
                                  >
                                    Mark Paid
                                  </button>
                                ) : (
                                  <span className="badge badge-paid" style={{ fontSize: '0.7rem', padding: '2px 6px' }}>Paid</span>
                                )}
                              </div>
                            );
                          })()}
                        </div>
                      )}
                      {o.status === 'cancelled' && (
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                          Cancelled
                        </span>
                      )}
                    </div>
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
export default ManageOrders;
