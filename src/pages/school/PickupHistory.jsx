import React from 'react';
import { schoolService } from '../../services/school';
import { authService } from '../../services/auth';
import { useAuth } from '../../contexts/AuthContext';
import { formatINR } from '../../components/Layout';
import { Calendar, Trash2, ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';

export const SchoolPickups = () => {
  const { user } = useAuth();
  const [pickups, setPickups] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (user?.id) {
      schoolService.getPickups(user.id)
        .then(data => setPickups(Array.isArray(data) ? data.reverse() : []))
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [user?.id]);

  if (loading) return <div>Loading history...</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '2.2rem' }}>Pickup Requests History</h1>
          <p style={{ color: 'var(--text-muted)' }}>Track state transitions of your recycling requests.</p>
        </div>
        <Link to="/school/request" className="btn btn-primary">
          Request Pickup
        </Link>
      </div>

      {pickups.length === 0 ? (
        <div className="empty-state">
          <Calendar size={48} />
          <h3 className="empty-state-title">No pickup requests yet</h3>
          <p style={{ maxWidth: '400px', margin: '8px 0 20px 0' }}>
            All paper pickups requested by your school will appear here. Start your first drive!
          </p>
          <Link to="/school/request" className="btn btn-secondary">Request Pickup Now</Link>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Req ID</th>
                <th>Requested Date</th>
                <th>Material</th>
                <th>Est. Weight</th>
                <th>Actual Weight</th>
                <th>Scheduled Date</th>
                <th>Payout</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {pickups.map((p) => (
                <tr key={p.id}>
                  <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{p.id}</td>
                  <td>{new Date(p.requestDate).toLocaleDateString()}</td>
                  <td style={{ textTransform: 'capitalize' }}>
                    {p.paperType === 'mixedPaper' ? 'Mixed Paper' : p.paperType === 'cardboard' ? 'Cardboard' : 'White Paper'}
                  </td>
                  <td>{p.estimatedWeight} kg</td>
                  <td>{p.actualWeight ? `${p.actualWeight} kg` : '--'}</td>
                  <td>{p.scheduledDate ? new Date(p.scheduledDate).toLocaleDateString() : '--'}</td>
                  <td style={{ fontWeight: 600, color: p.amount ? 'var(--primary)' : 'inherit' }}>
                    {p.amount ? formatINR(p.amount) : '--'}
                  </td>
                  <td>
                    <span className={`badge badge-${p.status}`}>
                      {p.status}
                    </span>
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
export default SchoolPickups;
