import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Link } from 'react-router-dom';
import { ShieldCheck, AlertCircle } from 'lucide-react';

export const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [linkExpired, setLinkExpired] = useState(false);

  useEffect(() => {
    // Supabase passes errors via the URL hash fragment on redirect
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const hashError = hashParams.get('error_description');

    if (hashError) {
      setLinkExpired(true);
      setError("Reset link expired or invalid.");
      return;
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event) => {
      if (event === "PASSWORD_RECOVERY") {
        setMessage("Please enter your new password below.");
      }
    });

    return () => {
      if (subscription) subscription.unsubscribe();
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setError('');
    setMessage('');
    setIsSubmitting(true);

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setError(error.message);
      setIsSubmitting(false);
    } else {
      setSuccess(true);
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '60px auto' }}>
      <h2 style={{ textAlign: 'center' }}>Set New Password</h2>

      <div className="card" style={{ marginTop: '20px' }}>
        {success ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
              <ShieldCheck size={48} style={{ color: 'var(--primary)' }} />
            </div>
            <div style={{ color: 'var(--text-main)', marginBottom: '24px', fontSize: '1.1rem', fontWeight: 600 }}>
              Password successfully changed.
            </div>
            <Link to="/login" className="btn btn-primary btn-full" style={{ display: 'inline-block' }}>
              Return to Login
            </Link>
          </div>
        ) : linkExpired ? (
          <div style={{ textAlign: 'center', padding: '10px 0' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
              <AlertCircle size={40} style={{ color: 'var(--danger)' }} />
            </div>
            <div style={{ color: 'var(--danger)', marginBottom: '10px', fontSize: '1.05rem', fontWeight: 600 }}>
              Reset link expired.
            </div>
            <p style={{ color: 'var(--text-muted)', marginBottom: '24px', fontSize: '0.95rem' }}>
              For security reasons, password reset links expire after 24 hours or after being used.
            </p>
            <Link to="/forgot-password" className="btn btn-secondary btn-full" style={{ display: 'inline-block' }}>
              Request another reset email
            </Link>
          </div>
        ) : (
          <>
            {message && <div style={{ color: 'var(--primary)', marginBottom: '15px', fontSize: '0.95rem', textAlign: 'center' }}>{message}</div>}
            {error && <div style={{ color: 'var(--danger)', marginBottom: '15px', fontSize: '0.95rem', textAlign: 'center' }}>{error}</div>}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div className="form-group">
                <label className="form-label">New Password</label>
                <input
                  type="password"
                  className="form-control"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
              <button type="submit" className="btn btn-primary btn-full" disabled={isSubmitting}>
                {isSubmitting ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};
