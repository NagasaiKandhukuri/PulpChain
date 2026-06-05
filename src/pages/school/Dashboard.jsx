import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { schoolService } from '../../services/school';
import { supabase } from '../../lib/supabase';
import { adminService } from '../../services/admin';
import { authService } from '../../services/auth';
import { useAuth } from '../../contexts/AuthContext';
import { formatINR } from '../../components/Layout';
import { Scale, Milestone, PiggyBank, Calendar, Clock, AlertTriangle, ShieldCheck, ArrowUpRight } from 'lucide-react';

export const SchoolDashboard = () => {
  const { user } = useAuth();
  const rates = adminService.getRates();
  const [school, setSchool] = useState(null);

  useEffect(() => {
    if (user?.id) {
      supabase.from('schools')
        .select('name, status')
        .eq('id', user.id)
        .single()
        .then(({ data }) => {
          if (data) setSchool(data);
        });
    }
  }, [user?.id]);

  const metrics = schoolService.getDashboardData(user.id);

  // Check if rates are configured
  const ratesConfigured = rates && 
                           rates.mixedPaper !== null && 
                           rates.cardboard !== null && 
                           rates.whitePaper !== null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Welcome Banner */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <h1 style={{ fontSize: '2.2rem' }}>Welcome, {school?.name}!</h1>
          <p style={{ color: 'var(--text-muted)' }}>Here is your school's recycling dashboard.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Status:</span>
          {school?.status === 'approved' ? (
            <span className="badge badge-approved" style={{ gap: '4px' }}>
              <ShieldCheck size={14} /> Active / Approved
            </span>
          ) : (
            <span className="badge badge-pending">
              {school?.status}
            </span>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid-cols-3">
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ padding: '16px', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', borderRadius: 'var(--radius-lg)' }}>
            <Milestone size={32} />
          </div>
          <div>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>TOTAL PICKUPS</span>
            <h2 style={{ fontSize: '2rem', lineHeight: 1.1, marginTop: '4px' }}>{metrics.totalPickups}</h2>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ padding: '16px', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', borderRadius: 'var(--radius-lg)' }}>
            <PiggyBank size={32} />
          </div>
          <div>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>TOTAL EARNED (INR)</span>
            <h2 style={{ fontSize: '2rem', lineHeight: 1.1, marginTop: '4px' }}>{formatINR(metrics.totalEarnings)}</h2>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ padding: '16px', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', borderRadius: 'var(--radius-lg)' }}>
            <Scale size={32} />
          </div>
          <div>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>TOTAL RECYCLED (KG)</span>
            <h2 style={{ fontSize: '2rem', lineHeight: 1.1, marginTop: '4px' }}>{metrics.totalWeightCompleted} kg</h2>
          </div>
        </div>
      </div>

      {/* Center Layout: Rates and Recent Pickups */}
      <div style={{ display: 'grid', gridTemplateColumns: '0.8fr 1.2fr', gap: '32px' }} className="grid-cols-2">
        {/* Dynamic Buying Rates */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 style={{ fontSize: '1.25rem' }}>Active Buying Rates</h3>
          {!ratesConfigured ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '24px 0', textAlign: 'center' }}>
              <AlertTriangle size={28} style={{ color: 'var(--warning)' }} />
              <strong>Rates are being configured</strong>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Admin has not finalized active rate cards yet.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--surface-border)', paddingBottom: '12px' }}>
                <span>White Paper</span>
                <strong style={{ color: 'var(--primary)' }}>{formatINR(rates.whitePaper)} / kg</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--surface-border)', paddingBottom: '12px' }}>
                <span>Cardboard</span>
                <strong style={{ color: 'var(--primary)' }}>{formatINR(rates.cardboard)} / kg</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--surface-border)', paddingBottom: '12px' }}>
                <span>Mixed Paper</span>
                <strong style={{ color: 'var(--primary)' }}>{formatINR(rates.mixedPaper)} / kg</strong>
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', gap: '4px', alignItems: 'center' }}>
                <Clock size={12} /> Last updated: {new Date(rates.lastUpdated).toLocaleDateString()}
              </div>
            </div>
          )}
          <Link to="/school/request" className="btn btn-primary btn-sm" style={{ marginTop: 'auto' }}>
            Request New Pickup
          </Link>
        </div>

        {/* Recent Pickups list */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.25rem' }}>Recent Pickup Requests</h3>
            <Link to="/school/pickups" style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
              View All <ArrowUpRight size={14} />
            </Link>
          </div>

          {metrics.recentPickups.length === 0 ? (
            <div className="empty-state" style={{ padding: '32px' }}>
              <Calendar size={36} />
              <h4 className="empty-state-title" style={{ fontSize: '1rem' }}>No pickup requests yet</h4>
              <p style={{ fontSize: '0.8rem', margin: '4px 0 12px 0' }}>Data will appear after operations begin.</p>
              <Link to="/school/request" className="btn btn-secondary btn-sm">Request first pickup</Link>
            </div>
          ) : (
            <div className="table-container" style={{ margin: 0 }}>
              <table>
                <thead>
                  <tr>
                    <th>Requested</th>
                    <th>Material</th>
                    <th>Est. Weight</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {metrics.recentPickups.map((p) => (
                    <tr key={p.id}>
                      <td>{new Date(p.requestDate).toLocaleDateString()}</td>
                      <td style={{ textTransform: 'capitalize' }}>
                        {p.paperType === 'mixedPaper' ? 'Mixed Paper' : p.paperType === 'cardboard' ? 'Cardboard' : 'White Paper'}
                      </td>
                      <td>{p.estimatedWeight} kg</td>
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
      </div>
    </div>
  );
};
