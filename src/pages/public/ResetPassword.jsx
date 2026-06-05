import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';

export const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (event == "PASSWORD_RECOVERY") {
        setMessage("Please enter your new password below.");
      }
    });
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
      setMessage("Password updated successfully! Redirecting...");
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '60px auto' }}>
      <h2 style={{ textAlign: 'center' }}>Set New Password</h2>
      <div className="card" style={{ marginTop: '20px' }}>
        {message && <div style={{ color: 'green', marginBottom: '10px', fontSize: '0.9rem' }}>{message}</div>}
        {error && <div style={{ color: 'red', marginBottom: '10px', fontSize: '0.9rem' }}>{error}</div>}
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div className="form-group">
            <label className="form-label">New Password</label>
            <input 
              type="password" 
              className="form-control"
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
          </div>
          <button type="submit" className="btn btn-primary btn-full" disabled={isSubmitting}>
            {isSubmitting ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
};
