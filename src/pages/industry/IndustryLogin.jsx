import React from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { authService } from '../../services/auth';
import { ShieldAlert, Building, Lock } from 'lucide-react';
import { RegistrationSuccess } from '../../components/RegistrationSuccess';


export const IndustryLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await authService.loginIndustry(email, password);

      if (response && !response.success) {
        switch (response.code) {
          case 'EMAIL_NOT_VERIFIED':
            setError('Your email is not verified. Please verify your email before signing in.');
            break;
          case 'UNAUTHORIZED':
            setError('Unauthorized access. This account is not a registered industry.');
            break;
          case 'REGISTRATION_INCOMPLETE':
            navigate('/complete-registration?role=industry');
            return;
          case 'ACCOUNT_REJECTED':
            setError('Your account registration was rejected by the administrator.');
            break;
          case 'ACCOUNT_PENDING':
            setError('Your account is awaiting administrator approval.');
            break;
          default:
            setError('An unknown error occurred.');
        }
        setIsSubmitting(false);
        return;
      }

      // Success, route to industry dashboard
      navigate('/industry/dashboard');
    } catch (err) {
      console.error(err);
      setError('Invalid login credentials. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '440px', margin: '60px auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
        <div style={{ padding: '12px', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', borderRadius: 'var(--radius-lg)' }}>
          <Building size={32} />
        </div>
        <h1 style={{ fontSize: '2rem' }}>Industry Portal Login</h1>
        <p style={{ color: 'var(--text-muted)' }}>Access live stock levels, place orders, and manage contracts.</p>
      </div>

      <div className="card">
        {location.state?.message && (
          <RegistrationSuccess message={location.state.message} />
        )}

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

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="ind-email">Business Email</label>
            <input
              type="email"
              id="ind-email"
              className="form-control"
              placeholder="e.g., buy@kraftmills.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className="form-label" htmlFor="ind-password" style={{ marginBottom: 0 }}>Password</label>
              <Link to="/forgot-password" style={{ fontSize: '0.85rem', color: 'var(--primary)', textDecoration: 'none' }}>Forgot password?</Link>
            </div>
            <input
              type="password"
              id="ind-password"
              className="form-control"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary btn-full" disabled={isSubmitting}>
            {isSubmitting ? 'Logging in...' : <>Log In to Portal <Lock size={16} /></>}
          </button>
        </form>


      </div>

      <div style={{ textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
        Not registered yet?{' '}
        <Link to="/register-industry" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>
          Register company here
        </Link>
      </div>
    </div>
  );
};
export default IndustryLogin;
