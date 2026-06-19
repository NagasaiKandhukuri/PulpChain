import React from 'react';
import { adminService } from '../../services/admin';
import { formatINR } from '../../components/Layout';
import { ShieldCheck, ShieldAlert, Ban, FileText, Check, X } from 'lucide-react';

export const ManageIndustries = () => {
  const [activeTab, setActiveTab] = React.useState('registrations'); // 'registrations' | 'contracts'
  const [industries, setIndustries] = React.useState([]);
  const [contracts, setContracts] = React.useState([]);

  const loadData = async () => {
    const inds = await adminService.getIndustries();
    setIndustries(inds);
    const ctrs = await adminService.getContracts();
    setContracts(ctrs);
  };

  React.useEffect(() => {
    loadData();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await adminService.updateIndustryStatus(id, newStatus);
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleContractStatusChange = async (id, status) => {
    try {
      await adminService.updateContractStatus(id, status);
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '2.2rem' }}>Industry Partners & Contracts</h1>
          <p style={{ color: 'var(--text-muted)' }}>Manage mill registrations and recurring monthly supply agreements.</p>
        </div>

        {/* Tab Controls */}
        <div style={{ display: 'flex', gap: '8px', backgroundColor: 'var(--surface-border)', padding: '4px', borderRadius: 'var(--radius-md)' }}>
          <button
            onClick={() => setActiveTab('registrations')}
            className={`btn btn-sm ${activeTab === 'registrations' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ border: 'none', boxShadow: 'none' }}
          >
            Registrations
          </button>
          <button
            onClick={() => setActiveTab('contracts')}
            className={`btn btn-sm ${activeTab === 'contracts' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ border: 'none', boxShadow: 'none' }}
          >
            Supply Contracts
          </button>
        </div>
      </div>

      {activeTab === 'registrations' ? (
        // --- REGISTRATIONS HUB ---
        <div className="card">
          <h3 style={{ fontSize: '1.25rem', marginBottom: '20px' }}>Mill Registration Requests</h3>
          {industries.length === 0 ? (
            <div className="empty-state">
              <ShieldAlert size={48} />
              <h3 className="empty-state-title">No industrial signups yet</h3>
              <p style={{ maxWidth: '400px', margin: '8px auto' }}>
                Profiles submitted through /register-industry will display here for onboarding reviews.
              </p>
            </div>
          ) : (
            <div className="table-container" style={{ margin: 0 }}>
              <table>
                <thead>
                  <tr>
                    <th>Company Details</th>
                    <th>GST & Type</th>
                    <th>Coordinator Contact</th>
                    <th>Monthly Target</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {industries.map((ind) => (
                    <tr key={ind.id}>
                      <td>
                        <strong>{ind.companyName}</strong>
                        <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Address: {ind.address}</span>
                      </td>
                      <td>
                        <span style={{ display: 'block', textTransform: 'uppercase', fontWeight: 600 }}>{ind.gstNumber}</span>
                        <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>Type: {ind.industryType}</span>
                      </td>
                      <td>
                        <span style={{ display: 'block' }}>{ind.contactPerson}</span>
                        <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)' }}>{ind.phone}</span>
                        <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)' }}>{ind.email}</span>
                      </td>
                      <td>{ind.monthlyRequirementKg} kg</td>
                      <td>
                        <span className={`badge badge-${ind.status}`}>
                          {ind.status}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          {ind.status === 'pending' && (
                            <>
                              <button onClick={() => handleStatusChange(ind.id, 'approved')} className="btn btn-primary btn-sm">
                                Approve
                              </button>
                              <button onClick={() => handleStatusChange(ind.id, 'rejected')} className="btn btn-danger btn-sm">
                                Reject
                              </button>
                            </>
                          )}
                          {ind.status === 'approved' && (
                            <button onClick={() => handleStatusChange(ind.id, 'disabled')} className="btn btn-secondary btn-sm" style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }}>
                              <Ban size={14} /> Disable
                            </button>
                          )}
                          {ind.status === 'disabled' && (
                            <button onClick={() => handleStatusChange(ind.id, 'approved')} className="btn btn-primary btn-sm">
                              Re-enable
                            </button>
                          )}
                          {ind.status === 'rejected' && (
                            <button onClick={() => handleStatusChange(ind.id, 'approved')} className="btn btn-primary btn-sm">
                              Approve Profile
                            </button>
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
      ) : (
        // --- RECURRING CONTRACTS HUB ---
        <div className="card">
          <h3 style={{ fontSize: '1.25rem', marginBottom: '20px' }}>Supply Agreement Applications</h3>
          {contracts.length === 0 ? (
            <div className="empty-state">
              <FileText size={48} />
              <h3 className="empty-state-title">No contract applications</h3>
              <p style={{ maxWidth: '400px', margin: '8px auto' }}>
                Recurring supply contracts requested by approved mills will display here for review and negotiation.
              </p>
            </div>
          ) : (
            <div className="table-container" style={{ margin: 0 }}>
              <table>
                <thead>
                  <tr>
                    <th>Mill Buyer</th>
                    <th>Requested Material</th>
                    <th>Volume / Month</th>
                    <th>Terms</th>
                    <th>Target Rate</th>
                    <th>Request Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {contracts.map((c) => (
                    <tr key={c.id}>
                      <td><strong>{c.industryName}</strong></td>
                      <td style={{ textTransform: 'capitalize' }}>
                        {c.paperType === 'mixedPaper' ? 'Mixed Paper' : c.paperType === 'cardboard' ? 'Cardboard' : 'White Paper'}
                      </td>
                      <td>{c.monthlyVolumeKg} kg</td>
                      <td>{c.contractDurationMonths} Mos</td>
                      <td style={{ fontWeight: 600 }}>{formatINR(c.expectedRate)}</td>
                      <td>{new Date(c.requestDate).toLocaleDateString()}</td>
                      <td>
                        <span className={`badge badge-${c.status}`}>
                          {c.status}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          {c.status === 'pending' && (
                            <>
                              <button onClick={() => handleContractStatusChange(c.id, 'approved')} className="btn btn-primary btn-sm">
                                <Check size={14} /> Approve
                              </button>
                              <button onClick={() => handleContractStatusChange(c.id, 'rejected')} className="btn btn-danger btn-sm">
                                <X size={14} /> Reject
                              </button>
                            </>
                          )}
                          {c.status === 'approved' && (
                            <button onClick={() => handleContractStatusChange(c.id, 'terminated')} className="btn btn-secondary btn-sm" style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }}>
                              Terminate
                            </button>
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
      )}
    </div>
  );
};
export default ManageIndustries;
