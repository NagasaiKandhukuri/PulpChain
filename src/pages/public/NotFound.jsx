import { Link } from 'react-router-dom';
import { MapPinOff } from 'lucide-react';

export const NotFound = () => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '60vh',
      textAlign: 'center',
      padding: '40px 20px'
    }}>
      <div style={{
        backgroundColor: 'var(--surface)',
        padding: '32px',
        borderRadius: '50%',
        marginBottom: '24px',
        boxShadow: 'var(--shadow-sm)',
        color: 'var(--primary)'
      }}>
        <MapPinOff size={64} />
      </div>

      <h1 style={{ fontSize: '3rem', marginBottom: '16px', color: 'var(--text-main)', fontFamily: 'var(--font-display)' }}>
        404
      </h1>

      <h2 style={{ fontSize: '1.5rem', marginBottom: '16px', color: 'var(--text-main)' }}>
        Page Not Found
      </h2>

      <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '500px', marginBottom: '32px' }}>
        The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
      </p>

      <Link to="/" className="btn btn-primary" style={{ padding: '12px 32px', fontSize: '1.1rem' }}>
        Return Home
      </Link>
    </div>
  );
};
