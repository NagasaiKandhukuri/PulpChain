import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authService } from '../../services/auth';
import { ShieldAlert, Building, Landmark, ArrowRight } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export const CompleteRegistration = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const role = searchParams.get('role');

  const [formData, setFormData] = useState({
    name: '',
    address: '',
    contactPerson: '',
    phone: '',
    gstNumber: ''
  });

  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (role !== 'school' && role !== 'industry') {
      navigate('/login', { replace: true, state: { error: 'Invalid registration flow.' } });
    }
  }, [role, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setError(null);
    setIsSubmitting(true);

    try {
      await authService.completeOAuthRegistration(role, formData);
      await supabase.auth.signOut();

      const loginPath = role === 'industry' ? '/industry/login' : '/login';
      navigate(loginPath, {
        replace: true,
        state: {
          error: 'Your account is awaiting administrator approval.'
        }
      });
    } catch (err) {
      setError(err.message);
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '540px', margin: '40px auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
        <div style={{ padding: '12px', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', borderRadius: 'var(--radius-lg)' }}>
          {role === 'industry' ? <Building size={32} /> : <Landmark size={32} />}
        </div>
        <h1 style={{ fontSize: '2rem' }}>Complete Registration</h1>
        <p style={{ color: 'var(--text-muted)' }}>We just need a few more details to set up your {role === 'industry' ? 'company' : 'school'} profile.</p>
      </div>

      <div className="card">
        {error && (
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px',
            backgroundColor: '#fee2e2',
            color: '#b91c1c',
            padding: '16px',
            borderRadius: 'var(--radius-md)',
            marginBottom: '20px',
            fontSize: '0.9rem',
            fontWeight: 500
          }}>
            <ShieldAlert size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="name">{role === 'industry' ? 'Industry Name' : 'School Name'}</label>
            <input
              type="text"
              id="name"
              className="form-control"
              placeholder={role === 'industry' ? "e.g., Kraft Mills Ltd." : "e.g., St. Xavier High School"}
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="address">Address</label>
            <input
              type="text"
              id="address"
              className="form-control"
              placeholder="Full address"
              value={formData.address}
              onChange={handleChange}
              required
            />
          </div>

          <div className="grid-cols-2" style={{ gap: '16px' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="contactPerson">Contact Person</label>
              <input
                type="text"
                id="contactPerson"
                className="form-control"
                placeholder="Full Name"
                value={formData.contactPerson}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="phone">Phone Number</label>
              <input
                type="tel"
                id="phone"
                className="form-control"
                placeholder="e.g., 9876543210"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {role === 'industry' && (
            <div className="form-group">
              <label className="form-label" htmlFor="gstNumber">GST Number</label>
              <input
                type="text"
                id="gstNumber"
                className="form-control"
                placeholder="e.g., 29ABCDE1234F1Z5"
                value={formData.gstNumber}
                onChange={handleChange}
                required
              />
            </div>
          )}

          <button type="submit" className="btn btn-primary btn-full" style={{ marginTop: '8px' }} disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : <>Submit Details <ArrowRight size={16} /></>}
          </button>
        </form>
      </div>
    </div>
  );
};
