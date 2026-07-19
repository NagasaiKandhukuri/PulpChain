import { Link, useNavigate } from 'react-router-dom';
import { Building2, Factory, ArrowRight } from 'lucide-react';

export const RegisterChoice = () => {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: '80vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '40px 24px'
    }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h2 style={{
          fontSize: '2.5rem',
          fontFamily: 'var(--font-display)',
          color: 'var(--text-main)',
          marginBottom: '12px'
        }}>
          Create Your Account
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>
          Choose how you want to join PulpChain.
        </p>
      </div>

      <div className="card" style={{ maxWidth: '600px', width: '100%', padding: '40px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

          <button
            onClick={() => navigate('/register-school')}
            className="card"
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '32px 24px',
              cursor: 'pointer',
              textAlign: 'left',
              textDecoration: 'none',
              gap: '24px',
              width: '100%',
              background: 'linear-gradient(135deg, var(--primary-solid-bg) 0%, transparent 100%)',
              border: '1px solid var(--primary-light)'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.borderColor = 'var(--primary)';
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = 'var(--shadow-glow)';
              e.currentTarget.querySelector('.arrow-icon').style.opacity = '1';
              e.currentTarget.querySelector('.arrow-icon').style.transform = 'translateX(0)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.borderColor = 'var(--primary-light)';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'var(--shadow-card)';
              e.currentTarget.querySelector('.arrow-icon').style.opacity = '0';
              e.currentTarget.querySelector('.arrow-icon').style.transform = 'translateX(-10px)';
            }}
          >
            <div style={{
              flexShrink: 0,
              backgroundColor: 'var(--primary-light)',
              padding: '16px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--primary)'
            }}>
              <Building2 size={32} />
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{
                fontSize: '1.3rem',
                color: 'var(--text-main)',
                display: 'flex',
                alignItems: 'center',
                margin: '0 0 8px 0'
              }}>
                Register as School
                <ArrowRight
                  className="arrow-icon"
                  size={20}
                  style={{
                    marginLeft: '12px',
                    opacity: 0,
                    transform: 'translateX(-10px)',
                    transition: 'all 0.3s ease',
                    color: 'var(--primary)'
                  }}
                />
              </h3>
              <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.5 }}>
                Educational institutions selling recyclable paper.
              </p>
            </div>
          </button>

          <button
            onClick={() => navigate('/register-industry')}
            className="card"
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '32px 24px',
              cursor: 'pointer',
              textAlign: 'left',
              textDecoration: 'none',
              gap: '24px',
              width: '100%',
              background: 'linear-gradient(135deg, var(--surface-hover) 0%, transparent 100%)'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.borderColor = 'var(--primary)';
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = 'var(--shadow-glow)';
              e.currentTarget.querySelector('.arrow-icon').style.opacity = '1';
              e.currentTarget.querySelector('.arrow-icon').style.transform = 'translateX(0)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.borderColor = 'var(--glass-border)';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'var(--shadow-card)';
              e.currentTarget.querySelector('.arrow-icon').style.opacity = '0';
              e.currentTarget.querySelector('.arrow-icon').style.transform = 'translateX(-10px)';
            }}
          >
            <div style={{
              flexShrink: 0,
              backgroundColor: 'var(--primary-light)',
              padding: '16px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--primary)'
            }}>
              <Factory size={32} />
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{
                fontSize: '1.3rem',
                color: 'var(--text-main)',
                display: 'flex',
                alignItems: 'center',
                margin: '0 0 8px 0'
              }}>
                Register as Industry
                <ArrowRight
                  className="arrow-icon"
                  size={20}
                  style={{
                    marginLeft: '12px',
                    opacity: 0,
                    transform: 'translateX(-10px)',
                    transition: 'all 0.3s ease',
                    color: 'var(--primary)'
                  }}
                />
              </h3>
              <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.5 }}>
                Businesses purchasing recycled paper.
              </p>
            </div>
          </button>

        </div>

        <div style={{
          marginTop: '32px',
          paddingTop: '24px',
          borderTop: '1px solid var(--surface-border)',
          textAlign: 'center'
        }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
