import React from 'react';
import { adminService } from '../../services/admin';
import { formatINR } from '../../components/Layout';
import { Calendar, CheckCircle2, ChevronRight, Play, Check, X, AlertTriangle, CreditCard, Download } from 'lucide-react';
import { generatePurchaseReceiptPDF } from '../../services/purchaseReceiptGenerator';

export const PickupsList = () => {
  const [pickups, setPickups] = React.useState([]);
  const [payments, setPayments] = React.useState([]);
  const [rates, setRates] = React.useState(null);
  const [activeTab, setActiveTab] = React.useState('logistics'); // 'logistics' | 'payments'
  
  // Dialog States
  const [selectedPickup, setSelectedPickup] = React.useState(null);
  const [scheduledDate, setScheduledDate] = React.useState('');
  
  const [actualWeight, setActualWeight] = React.useState('');
  const [completionPaperType, setCompletionPaperType] = React.useState('mixedPaper');
  const [completionRate, setCompletionRate] = React.useState('');
  
  const [transactionRef, setTransactionRef] = React.useState('');
  const [selectedPayment, setSelectedPayment] = React.useState(null);

  const scheduleDialogRef = React.useRef(null);
  const completeDialogRef = React.useRef(null);
  const paymentDialogRef = React.useRef(null);

  const loadData = async () => {
    try {
      const [pickupsData, ratesData] = await Promise.all([
        adminService.getPickups(),
        adminService.getRates()
      ]);
      setPickups(Array.isArray(pickupsData) ? pickupsData : []);
      setPayments(adminService.getPayments().reverse());
      setRates(ratesData);
    } catch (err) {
      console.error('Failed to load data:', err);
    }
  };

  React.useEffect(() => {
    loadData();
  }, []);

  const handleStatusTransition = async (id, nextStatus, extra = {}) => {
    try {
      await adminService.updatePickupStatus(id, nextStatus, extra);
      await loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  // Open Schedule Dialog
  const openScheduleDialog = (pickup) => {
    setSelectedPickup(pickup);
    setScheduledDate('');
    scheduleDialogRef.current?.showModal();
  };

  const submitSchedule = (e) => {
    e.preventDefault();
    handleStatusTransition(selectedPickup.id, 'scheduled', { scheduledDate });
    scheduleDialogRef.current?.close();
  };

  // Open Complete Dialog
  const openCompleteDialog = (pickup) => {
    setSelectedPickup(pickup);
    setActualWeight(pickup.estimatedWeight);
    setCompletionPaperType(pickup.paperType);
    
    // Auto populate rate from configured rates if possible
    let currentRate = 0;
    if (rates) {
      currentRate = rates[pickup.paperType] || 0;
    }
    setCompletionRate(currentRate);
    
    completeDialogRef.current?.showModal();
  };

  // Update complete rate when type is changed in completion dialog
  React.useEffect(() => {
    if (rates && completionPaperType) {
      setCompletionRate(rates[completionPaperType] || 0);
    }
  }, [completionPaperType, rates]);

  const submitCompletion = (e) => {
    e.preventDefault();
    const weight = parseFloat(actualWeight);
    const rateVal = parseFloat(completionRate);
    
    if (isNaN(weight) || weight <= 0) {
      alert('Please enter a valid weight.');
      return;
    }
    if (isNaN(rateVal) || rateVal < 0) {
      alert('Please enter a valid rate.');
      return;
    }

    handleStatusTransition(selectedPickup.id, 'completed', {
      actualWeight: weight,
      paperType: completionPaperType,
      rate: rateVal
    });
    completeDialogRef.current?.close();
  };

  // Open Payment Dialog
  const openPaymentDialog = (payment) => {
    setSelectedPayment(payment);
    setTransactionRef('');
    paymentDialogRef.current?.showModal();
  };

  const submitPaymentProcessing = async (e) => {
    e.preventDefault();
    try {
      await adminService.processPayment(selectedPayment.id, transactionRef);
      paymentDialogRef.current?.close();
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '2.2rem' }}>Recycling Logistics & Payments</h1>
          <p style={{ color: 'var(--text-muted)' }}>Manage pickup workflows, process payments, and view logs.</p>
        </div>

        {/* Tab Controls */}
        <div style={{ display: 'flex', gap: '8px', backgroundColor: 'var(--surface-border)', padding: '4px', borderRadius: 'var(--radius-md)' }}>
          <button
            onClick={() => setActiveTab('logistics')}
            className={`btn btn-sm ${activeTab === 'logistics' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ border: 'none', boxShadow: 'none' }}
          >
            Active Pickups
          </button>
          <button
            onClick={() => setActiveTab('payments')}
            className={`btn btn-sm ${activeTab === 'payments' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ border: 'none', boxShadow: 'none' }}
          >
            Pending Payments
          </button>
        </div>
      </div>

      {activeTab === 'logistics' ? (
        // --- LOGISTICS TABLE ---
        pickups.length === 0 ? (
          <div className="empty-state">
            <Calendar size={48} />
            <h3 className="empty-state-title">No pickup requests yet</h3>
            <p style={{ maxWidth: '400px', margin: '8px auto' }}>
              Pickup requests submitted by schools will show here. Transition requests along the operations lifecycle.
            </p>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>School Name</th>
                  <th>Request Date</th>
                  <th>Material</th>
                  <th>Weight (Est / Act)</th>
                  <th>Scheduled Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pickups.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <strong>{p.schoolName}</strong>
                      <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)' }}>ID: {p.id}</span>
                    </td>
                    <td>{new Date(p.requestDate).toLocaleDateString()}</td>
                    <td style={{ textTransform: 'capitalize' }}>
                      {p.paperType === 'mixedPaper' ? 'Mixed Paper' : p.paperType === 'cardboard' ? 'Cardboard' : 'White Paper'}
                    </td>
                    <td>
                      {p.estimatedWeight} kg / <strong>{p.actualWeight ? `${p.actualWeight} kg` : '--'}</strong>
                    </td>
                    <td>{p.scheduledDate ? new Date(p.scheduledDate).toLocaleDateString() : '--'}</td>
                    <td>
                      <span className={`badge badge-${p.status}`}>
                        {p.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {p.status === 'pending' && (
                          <>
                            <button onClick={() => handleStatusTransition(p.id, 'approved')} className="btn btn-primary btn-sm">
                              Approve
                            </button>
                            <button onClick={() => handleStatusTransition(p.id, 'cancelled')} className="btn btn-danger btn-sm">
                              <X size={14} /> Cancel
                            </button>
                          </>
                        )}
                        {p.status === 'approved' && (
                          <>
                            <button onClick={() => openScheduleDialog(p)} className="btn btn-primary btn-sm">
                              <Calendar size={14} /> Schedule
                            </button>
                            <button onClick={() => handleStatusTransition(p.id, 'cancelled')} className="btn btn-danger btn-sm">
                              <X size={14} /> Cancel
                            </button>
                          </>
                        )}
                        {p.status === 'scheduled' && (
                          <>
                            <button onClick={() => handleStatusTransition(p.id, 'in-progress')} className="btn btn-primary btn-sm">
                              <Play size={14} /> In Progress
                            </button>
                            <button onClick={() => handleStatusTransition(p.id, 'cancelled')} className="btn btn-danger btn-sm">
                              <X size={14} /> Cancel
                            </button>
                          </>
                        )}
                        {p.status === 'in-progress' && (
                          <button onClick={() => openCompleteDialog(p)} className="btn btn-primary btn-sm">
                            <Check size={14} /> Complete Pickup
                          </button>
                        )}
                        {p.status === 'completed' && (
                          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <CheckCircle2 size={14} style={{ color: 'var(--success)' }} /> Payment Generated
                          </span>
                        )}
                        {p.status === 'paid' && (
                          <span style={{ fontSize: '0.85rem', color: 'var(--success)', fontWeight: 600 }}>
                            Disbursed
                          </span>
                        )}
                        {p.status === 'cancelled' && (
                          <span style={{ fontSize: '0.85rem', color: 'var(--danger)' }}>
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
        )
      ) : (
        // --- PAYMENTS TABLE ---
        payments.length === 0 ? (
          <div className="empty-state">
            <CreditCard size={48} />
            <h3 className="empty-state-title">No payment records yet</h3>
            <p style={{ maxWidth: '400px', margin: '8px auto' }}>
              Completed pickups automatically generate payment records. Disburse funds and record references here.
            </p>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Payment ID</th>
                  <th>School Name</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Payment Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((pm) => (
                  <tr key={pm.id}>
                    <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{pm.id}</td>
                    <td>{pm.schoolName}</td>
                    <td style={{ fontWeight: 700 }}>{formatINR(pm.amount)}</td>
                    <td>
                      <span className={`badge badge-${pm.status}`}>
                        {pm.status}
                      </span>
                    </td>
                    <td>{pm.paymentDate ? new Date(pm.paymentDate).toLocaleDateString() : '--'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        {pm.status === 'pending' ? (
                          <button onClick={() => openPaymentDialog(pm)} className="btn btn-primary btn-sm">
                            <Check size={14} /> Process Disbursal
                          </button>
                        ) : (
                          <>
                            <span style={{ fontSize: '0.85rem', color: 'var(--success)', fontWeight: 600 }}>
                              Paid (Ref: {pm.transactionReference})
                            </span>
                            <button
                              onClick={() => {
                                const pickup = pickups.find(pk => pk.id === pm.pickupId);
                                if (pickup) {
                                  generatePurchaseReceiptPDF(pickup);
                                } else {
                                  alert("Pickup details not found.");
                                }
                              }}
                              className="btn btn-secondary btn-sm"
                              style={{ display: 'inline-flex', gap: '4px' }}
                            >
                              <Download size={12} /> Receipt
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}

      {/* --- NATIVE DIALOGS --- */}

      {/* 1. Schedule Pickup Dialog */}
      <dialog ref={scheduleDialogRef}>
        <div className="modal-content">
          <h3 style={{ fontSize: '1.4rem', marginBottom: '16px' }}>Schedule Collection Trip</h3>
          <form onSubmit={submitSchedule} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="scheduledDate">Scheduled Date</label>
              <input
                type="date"
                id="scheduledDate"
                className="form-control"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                required
              />
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }}>
              <button type="button" onClick={() => scheduleDialogRef.current?.close()} className="btn btn-secondary">
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Save Schedule
              </button>
            </div>
          </form>
        </div>
      </dialog>

      {/* 2. Complete Pickup Dialog */}
      <dialog ref={completeDialogRef}>
        <div className="modal-content" style={{ maxWidth: '550px' }}>
          <h3 style={{ fontSize: '1.4rem', marginBottom: '16px' }}>Complete Recycling Pickup</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '20px' }}>
            Input verified actual scale weights and confirm buying rates to compute school payouts.
          </p>
          <form onSubmit={submitCompletion} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="actualWeight">Actual Scale Weight (kg)</label>
              <input
                type="number"
                id="actualWeight"
                className="form-control"
                placeholder="Scale reading in kg"
                value={actualWeight}
                onChange={(e) => setActualWeight(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="completionPaperType">Final Paper Category</label>
              <select
                id="completionPaperType"
                className="form-control form-select"
                value={completionPaperType}
                onChange={(e) => setCompletionPaperType(e.target.value)}
                required
              >
                <option value="mixedPaper">Mixed Paper</option>
                <option value="cardboard">Cardboard</option>
                <option value="whitePaper">White Paper</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="completionRate">Final Buying Rate (₹/kg)</label>
              <input
                type="number"
                id="completionRate"
                className="form-control"
                placeholder="Rate per kg"
                value={completionRate}
                onChange={(e) => setCompletionRate(e.target.value)}
                step="0.01"
                required
              />
            </div>

            <div style={{ padding: '12px', backgroundColor: 'var(--primary-light)', borderRadius: 'var(--radius-md)', fontSize: '0.9rem', fontWeight: 600 }}>
              Estimated Payout:{' '}
              <span style={{ color: 'var(--primary)' }}>
                {formatINR((parseFloat(actualWeight) || 0) * (parseFloat(completionRate) || 0))}
              </span>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '12px' }}>
              <button type="button" onClick={() => completeDialogRef.current?.close()} className="btn btn-secondary">
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Finalize & Generate Payout
              </button>
            </div>
          </form>
        </div>
      </dialog>

      {/* 3. Disburse Payment Dialog */}
      <dialog ref={paymentDialogRef}>
        <div className="modal-content">
          <h3 style={{ fontSize: '1.4rem', marginBottom: '16px' }}>Process Disbursement</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '16px' }}>
            Amount:{' '}
            <strong style={{ color: 'var(--text-main)' }}>
              {selectedPayment ? formatINR(selectedPayment.amount) : '₹0'}
            </strong>
          </p>
          <form onSubmit={submitPaymentProcessing} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="transactionRef">Bank Reference / TXN ID</label>
              <input
                type="text"
                id="transactionRef"
                className="form-control"
                placeholder="E.g., UTR1029304958"
                value={transactionRef}
                onChange={(e) => setTransactionRef(e.target.value)}
                required
              />
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }}>
              <button type="button" onClick={() => paymentDialogRef.current?.close()} className="btn btn-secondary">
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Confirm Disbursal
              </button>
            </div>
          </form>
        </div>
      </dialog>

    </div>
  );
};
