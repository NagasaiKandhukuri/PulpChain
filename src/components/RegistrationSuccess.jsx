import { CheckCircle } from 'lucide-react';


export const RegistrationSuccess = ({ message }) => {
  return (
    <div className="registration-success-card animate-fade-in-up" style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '16px',
      backgroundColor: 'var(--surface-sunken)',
      border: '1px solid var(--primary-light)',
      padding: '32px 24px',
      borderRadius: 'var(--radius-lg)',
      marginBottom: '32px',
      textAlign: 'center',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '4px',
        background: 'var(--gradient-primary)'
      }} />
      <div className="success-icon-wrapper animate-pop-in" style={{
        width: '64px',
        height: '64px',
        borderRadius: '50%',
        backgroundColor: 'var(--primary-light)',
        color: 'var(--primary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '8px'
      }}>
        <CheckCircle size={32} />
      </div>
      <h3 style={{ fontSize: '1.25rem', color: 'var(--text-main)', margin: 0 }}>Registration Successful!</h3>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', margin: 0, lineHeight: 1.5 }}>
        {message}
      </p>
    </div>
  );
};
