import React from 'react';
import { adminService } from '../../services/admin';
import { ShieldCheck, ShieldAlert, Ban, UserCheck } from 'lucide-react';

export const SchoolsList = () => {
  const [schools, setSchools] = React.useState([]);
  const [filter, setFilter] = React.useState('all');

  const loadSchools = async () => {
    setSchools(await adminService.getSchools());
  };

  React.useEffect(() => {
    loadSchools();
  }, []);

  const handleAction = async (id, newStatus) => {
    try {
      await adminService.updateSchoolStatus(id, newStatus);
      loadSchools();
    } catch (err) {
      alert(err.message);
    }
  };

  const filteredSchools = schools.filter(s => {
    if (filter === 'all') return true;
    return s.status === filter;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '2.2rem' }}>School Registrations Ledger</h1>
          <p style={{ color: 'var(--text-muted)' }}>Review registrations, approve logins, or revoke access controls.</p>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '8px' }}>
          {['all', 'pending', 'approved', 'rejected', 'disabled'].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`btn btn-sm ${filter === s ? 'btn-primary' : 'btn-secondary'}`}
              style={{ textTransform: 'capitalize' }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {filteredSchools.length === 0 ? (
        <div className="empty-state">
          <ShieldAlert size={48} />
          <h3 className="empty-state-title">No registered schools yet</h3>
          <p style={{ maxWidth: '400px', margin: '8px auto' }}>
            Data will appear after operations begin. Schools self-registering through the public form will display here.
          </p>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>School Name</th>
                <th>Contact Details</th>
                <th>Address</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSchools.map((s) => (
                <tr key={s.id}>
                  <td>
                    <strong style={{ display: 'block', fontSize: '1rem' }}>{s.name}</strong>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>ID: {s.id}</span>
                  </td>
                  <td>
                    <span style={{ display: 'block' }}>{s.contactPerson}</span>
                    <span style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)' }}>{s.email}</span>
                    <span style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)' }}>{s.phone}</span>
                  </td>
                  <td>{s.address}</td>
                  <td>
                    <span className={`badge badge-${s.status}`}>
                      {s.status}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {s.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleAction(s.id, 'approved')}
                            className="btn btn-primary btn-sm"
                            style={{ padding: '6px 12px' }}
                          >
                            <ShieldCheck size={14} /> Approve
                          </button>
                          <button
                            onClick={() => handleAction(s.id, 'rejected')}
                            className="btn btn-danger btn-sm"
                            style={{ padding: '6px 12px' }}
                          >
                            <ShieldAlert size={14} /> Reject
                          </button>
                        </>
                      )}
                      {s.status === 'approved' && (
                        <button
                          onClick={() => handleAction(s.id, 'disabled')}
                          className="btn btn-secondary btn-sm"
                          style={{ color: 'var(--danger)', borderColor: 'var(--danger)', padding: '6px 12px' }}
                        >
                          <Ban size={14} /> Disable
                        </button>
                      )}
                      {s.status === 'disabled' && (
                        <button
                          onClick={() => handleAction(s.id, 'approved')}
                          className="btn btn-primary btn-sm"
                          style={{ padding: '6px 12px' }}
                        >
                          <UserCheck size={14} /> Re-enable
                        </button>
                      )}
                      {s.status === 'rejected' && (
                        <button
                          onClick={() => handleAction(s.id, 'approved')}
                          className="btn btn-primary btn-sm"
                          style={{ padding: '6px 12px' }}
                        >
                          Approve Registration
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
  );
};
