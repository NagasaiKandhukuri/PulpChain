import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../../services/auth';
import { ShieldAlert, Landmark, ArrowRight, ArrowLeft } from 'lucide-react';

export const RegisterSchool = () => {
  const navigate = useNavigate();
  const [step, setStep] = React.useState(1);
  const [formData, setFormData] = React.useState({
    name: '',
    address: '',
    contactPerson: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false
  });
  const [error, setError] = React.useState(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({
      ...formData,
      [e.target.id]: value
    });
  };

  const nextStep = () => {
    setError(null);
    if (step === 1) {
      if (!formData.name || !formData.address) {
        setError('Please fill in all school details.');
        return;
      }
    } else if (step === 2) {
      if (!formData.contactPerson || !formData.phone) {
        setError('Please fill in all contact details.');
        return;
      }
    }
    setStep(step + 1);
  };

  const prevStep = () => {
    setError(null);
    setStep(step - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setError(null);
    setIsSubmitting(true);

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      setIsSubmitting(false);
      return;
    }

    if (!formData.agreeTerms) {
      setError('You must agree to the Terms & Conditions and Privacy Policy.');
      setIsSubmitting(false);
      return;
    }

    try {
      const result = await authService.registerSchool({
        name: formData.name,
        address: formData.address,
        contactPerson: formData.contactPerson,
        email: formData.email,
        phone: formData.phone,
        password: formData.password
      });

      const message = result.emailConfirmationRequired
        ? 'Registration submitted successfully. Check your email to verify your account before logging in. You must also wait for administrator approval.'
        : 'Registration submitted successfully. You can now log in, but you must wait for administrator approval.';

      navigate('/login', {
        state: { message }
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '540px', margin: '40px auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
        <div style={{ padding: '12px', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', borderRadius: 'var(--radius-lg)' }}>
          <Landmark size={32} />
        </div>
        <h1 style={{ fontSize: '2rem' }}>Register Your School</h1>
        <p style={{ color: 'var(--text-muted)' }}>Sign up to begin collecting paper and earning payouts.</p>
      </div>

      <div className="card">
        {/* Step Indicator */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '32px' }}>
          {[1, 2, 3].map((s) => (
            <div key={s} style={{
              width: '32px',
              height: '8px',
              borderRadius: '4px',
              backgroundColor: s <= step ? 'var(--primary)' : 'var(--surface-border)',
              transition: 'all 0.3s ease'
            }} />
          ))}
        </div>

        {error && (
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px',
            backgroundColor: 'var(--danger-light)',
            color: 'var(--danger)',
            padding: '16px',
            borderRadius: 'var(--radius-md)',
            marginBottom: '20px',
            fontSize: '0.9rem',
            fontWeight: 500,
            border: '1px solid var(--danger)'
          }}>
            <ShieldAlert size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Step 1: School Info */}
          <div style={{ display: step === 1 ? 'flex' : 'none', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '8px', borderBottom: '1px solid var(--surface-border)', paddingBottom: '12px' }}>1. School Information</h3>
            <div className="form-group">
              <label className="form-label" htmlFor="name">School Name</label>
              <input
                type="text"
                id="name"
                className="form-control"
                placeholder="e.g., St. Xavier High School"
                value={formData.name}
                onChange={handleChange}
                required={step === 1}
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="address">School Address</label>
              <input
                type="text"
                id="address"
                className="form-control"
                placeholder="e.g., 12 Ring Road, Indiranagar"
                value={formData.address}
                onChange={handleChange}
                required={step === 1}
              />
            </div>
          </div>

          {/* Step 2: Contact Info */}
          <div style={{ display: step === 2 ? 'flex' : 'none', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '8px', borderBottom: '1px solid var(--surface-border)', paddingBottom: '12px' }}>2. Contact Details</h3>
            <div className="form-group">
              <label className="form-label" htmlFor="contactPerson">Contact Person</label>
              <input
                type="text"
                id="contactPerson"
                className="form-control"
                placeholder="Principal or Coordinator Name"
                value={formData.contactPerson}
                onChange={handleChange}
                required={step === 2}
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
                required={step === 2}
              />
            </div>
          </div>

          {/* Step 3: Account Setup */}
          <div style={{ display: step === 3 ? 'flex' : 'none', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '8px', borderBottom: '1px solid var(--surface-border)', paddingBottom: '12px' }}>3. Account Setup</h3>
            <div className="form-group">
              <label className="form-label" htmlFor="email">Official Email Address</label>
              <input
                type="email"
                id="email"
                className="form-control"
                placeholder="e.g., admin@stxavier.edu"
                value={formData.email}
                onChange={handleChange}
                required={step === 3}
                autoComplete="username"
              />
            </div>
            <div className="grid-cols-2" style={{ gap: '16px' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  className="form-control"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required={step === 3}
                  autoComplete="new-password"
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="confirmPassword">Confirm Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  className="form-control"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required={step === 3}
                  autoComplete="new-password"
                />
              </div>
            </div>
            <div className="form-group" style={{ marginTop: '8px', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <input
                type="checkbox"
                id="agreeTerms"
                checked={formData.agreeTerms}
                onChange={handleChange}
                style={{ marginTop: '4px' }}
                required={step === 3}
              />
              <label htmlFor="agreeTerms" style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                I agree to the{' '}
                <Link to="/terms" target="_blank" style={{ color: 'var(--primary)', textDecoration: 'underline' }}>Terms & Conditions</Link>
                {' '}and{' '}
                <Link to="/privacy" target="_blank" style={{ color: 'var(--primary)', textDecoration: 'underline' }}>Privacy Policy</Link>
              </label>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px', gap: '16px' }}>
            {step > 1 && (
              <button type="button" onClick={prevStep} className="btn btn-secondary" style={{ flex: 1 }}>
                <ArrowLeft size={16} /> Back
              </button>
            )}

            {step < 3 ? (
              <button type="button" onClick={nextStep} className="btn btn-primary" style={{ flex: 1 }}>
                Next Step <ArrowRight size={16} />
              </button>
            ) : (
              <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={isSubmitting}>
                {isSubmitting ? 'Registering...' : <>Complete Registration <ArrowRight size={16} /></>}
              </button>
            )}
          </div>
        </form>
      </div>

      <div style={{ textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
        Already have a registered account?{' '}
        <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>
          Log in here
        </Link>
      </div>
    </div>
  );
};
