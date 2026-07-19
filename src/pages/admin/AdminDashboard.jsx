import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../../services/admin';
import { financeService } from '../../services/finance';
import { formatINR } from '../../utils/format';
import { CheckSquare, Square, PlusCircle, Users, Truck } from 'lucide-react';

export const AdminDashboard = () => {
  const [pickups, setPickups] = useState([]);
  const [schools, setSchools] = useState([]);
  const [summary, setSummary] = useState(null);
  const [status, setStatus] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [schoolsData, pickupsData, summaryData, statusData] = await Promise.all([
          adminService.getSchools().catch(e => { console.error('Schools error', e); return []; }),
          adminService.getPickups().catch(e => { console.error('Pickups error', e); return []; }),
          financeService.getFinancialSummary().catch(e => { console.error('Finance error', e); return null; }),
          adminService.getOnboardingStatus().catch(e => { console.error('Status error', e); return {}; })
        ]);
        setSchools(Array.isArray(schoolsData) ? schoolsData : []);
        setPickups(Array.isArray(pickupsData) ? pickupsData : []);
        setSummary(summaryData || {});
        setStatus(statusData || {});
      } catch (e) {
        console.error('Dashboard error:', e);
        setSchools([]);
        setPickups([]);
        setSummary({});
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);


  const safePickups = Array.isArray(pickups) ? pickups : [];
  const safeSchools = Array.isArray(schools) ? schools : [];

  const activePickupsCount = safePickups.filter(p => p && !['completed', 'paid', 'cancelled'].includes(p.status)).length;
  const pendingRegistrationsCount = safeSchools.filter(s => s && s.status === 'pending').length;

  if (loading) return <div>Loading dashboard data...</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div>
        <h1 style={{ fontSize: '2.2rem' }}>Operations Control Center</h1>
        <p style={{ color: 'var(--text-muted)' }}>Admin oversight, logistics, and dynamic pricing metrics.</p>
      </div>

      {/* Onboarding Checklist Box */}
      {!status.ready && (
        <div style={{
          backgroundColor: 'var(--primary-light)',
          border: '1.5px solid var(--primary)',
          borderRadius: 'var(--radius-lg)',
          padding: '28px',
          boxShadow: 'var(--shadow-glow)',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          <div>
            <h3 style={{ color: 'var(--primary)', fontSize: '1.25rem' }}>First Launch Onboarding Checklist</h3>
            <p style={{ color: 'var(--text-main)', fontSize: '0.9rem', marginTop: '4px' }}>Complete these configuration steps to ready the platform for operation.</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {status.ratesSet ? (
                <CheckSquare style={{ color: 'var(--primary)' }} size={20} />
              ) : (
                <Square style={{ color: 'var(--text-muted)' }} size={20} />
              )}
              <Link to="/admin/rates" style={{ textDecoration: 'none', color: 'var(--text-main)', fontWeight: 600 }}>
                Set buying & selling rates {status.ratesSet && '(Done)'}
              </Link>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {status.registrationsReviewed ? (
                <CheckSquare style={{ color: 'var(--primary)' }} size={20} />
              ) : (
                <Square style={{ color: 'var(--text-muted)' }} size={20} />
              )}
              <Link to="/admin/schools" style={{ textDecoration: 'none', color: 'var(--text-main)', fontWeight: 600 }}>
                Review pending registrations ({status.pendingCount} pending) {status.registrationsReviewed && '(Done)'}
              </Link>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {status.ready ? (
                <CheckSquare style={{ color: 'var(--primary)' }} size={20} />
              ) : (
                <Square style={{ color: 'var(--text-muted)' }} size={20} />
              )}
              <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Platform ready to operate</span>
            </div>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid-cols-4">
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>ACTIVE SCHOOLS</span>
          <h2 style={{ fontSize: '2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Users style={{ color: 'var(--primary)' }} size={24} />
            {schools.filter(s => s.status === 'approved').length}
          </h2>
          {pendingRegistrationsCount > 0 && (
            <span style={{ fontSize: '0.75rem', color: 'var(--warning)', fontWeight: 600 }}>
              {pendingRegistrationsCount} pending review
            </span>
          )}
        </div>

        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>ACTIVE LOGISTICS</span>
          <h2 style={{ fontSize: '2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Truck style={{ color: 'var(--primary)' }} size={24} />
            {activePickupsCount}
          </h2>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>pickups in transit</span>
        </div>

        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>NET REVENUE</span>
          <h2 style={{ fontSize: '1.8rem', display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--success)' }}>
            {formatINR(summary?.revenue || 0)}
          </h2>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>from commercial sales</span>
        </div>

        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>TOTAL PAYOUTS</span>
          <h2 style={{ fontSize: '1.8rem', display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--danger)' }}>
            {formatINR(summary?.expenses || 0)}
          </h2>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>paid to schools</span>
        </div>
      </div>

      {/* Main Quick Links */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }} className="card">
        <h3 style={{ fontSize: '1.25rem' }}>Logistics Navigation Controls</h3>
        <div className="grid-cols-3">
          <Link to="/admin/schools" className="btn btn-secondary" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
            <Users size={32} style={{ color: 'var(--primary)' }} />
            <span>Manage Schools Approval</span>
          </Link>
          <Link to="/admin/pickups" className="btn btn-secondary" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
            <Truck size={32} style={{ color: 'var(--primary)' }} />
            <span>Manage Pickup Lifecycles</span>
          </Link>
          <Link to="/admin/sales" className="btn btn-secondary" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
            <PlusCircle size={32} style={{ color: 'var(--primary)' }} />
            <span>Log Commercial Sales</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
