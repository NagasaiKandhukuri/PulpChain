import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../../services/auth';
import { ShieldAlert, Building, ArrowRight } from 'lucide-react';

export const RegisterIndustry = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = React.useState({
    companyName: '',
    contactPerson: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    gstNumber: '',
    address: '',
    industryType: 'mill', // 'mill' | 'broker' | 'exporter'
    monthlyRequirementKg: '',
    agreeTerms: false
  });
  const [preferredTypes, setPreferredTypes] = React.useState({
    mixedPaper: false,
    whitePaper: false,
    cardboard: false
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

  const handleCheckboxChange = (e) => {
    setPreferredTypes({
      ...preferredTypes,
      [e.target.id]: e.target.checked
    });
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
      setError('You must agree to the Terms & Conditions.');
      setIsSubmitting(false);
      return;
    }

    // Capture selected preferred types
    const types = Object.keys(preferredTypes).filter(k => preferredTypes[k]);

    try {
      await authService.registerIndustry({
        companyName: formData.companyName,
        contactPerson: formData.contactPerson,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        gstNumber: formData.gstNumber,
        address: formData.address,
        industryType: formData.industryType,
        monthlyRequirementKg: formData.monthlyRequirementKg,
        preferredTypes: types
      });
      navigate('/industry/login', {
        state: {
          message: 'Registration submitted successfully. Please wait for administrator approval.'
        }
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '560px', margin: '40px auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
        <div style={{ padding: '12px', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', borderRadius: 'var(--radius-lg)' }}>
          <Building size={32} />
        </div>
        <h1 style={{ fontSize: '2rem' }}>Industry Partner Sign Up</h1>
        <p style={{ color: 'var(--text-muted)' }}>Onboard your paper mill or sorting facility onto the PulpChain network.</p>
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
                <label className="form-label" htmlFor="companyName">Company / Mill Name</label>
                <input
                  type="text"
                  id="companyName"
                  className="form-control"
                  placeholder="E.g., Everest Kraft Mills Pvt Ltd"
                  value={formData.companyName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="grid-cols-2" style={{ gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="gstNumber">GST Number</label>
                  <input
                    type="text"
                    id="gstNumber"
                    className="form-control"
                    placeholder="22AAAAA0000A1Z5"
                    value={formData.gstNumber}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="industryType">Industry Type</label>
                  <select
                    id="industryType"
                    className="form-control form-select"
                    value={formData.industryType}
                    onChange={handleChange}
                    required
                  >
                    <option value="mill">Paper Mill</option>
                    <option value="broker">Raw Scrap Broker</option>
                    <option value="exporter">Export Handler</option>
                  </select>
                </div>
              </div>

              <div className="grid-cols-2" style={{ gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="contactPerson">Contact Person</label>
                  <input
                    type="text"
                    id="contactPerson"
                    className="form-control"
                    placeholder="Procurement Officer Name"
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
                    placeholder="10-digit mobile"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="email">Official Business Email</label>
                <input
                  type="email"
                  id="email"
                  className="form-control"
                  placeholder="E.g., buy@everestpulp.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
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
                    required
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
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="address">Delivery / Billing Address</label>
                <input
                  type="text"
                  id="address"
                  className="form-control"
                  placeholder="Plot 45, Industrial Sector B, Pune"
                  value={formData.address}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="monthlyRequirementKg">Monthly Requirement (kg)</label>
                <input
                  type="number"
                  id="monthlyRequirementKg"
                  className="form-control"
                  placeholder="E.g., 5000"
                  value={formData.monthlyRequirementKg}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: '8px' }}>
                <span className="form-label">Preferred Material Types</span>
                <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginTop: '8px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input type="checkbox" id="whitePaper" checked={preferredTypes.whitePaper} onChange={handleCheckboxChange} />
                    White Paper
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input type="checkbox" id="cardboard" checked={preferredTypes.cardboard} onChange={handleCheckboxChange} />
                    Cardboard
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input type="checkbox" id="mixedPaper" checked={preferredTypes.mixedPaper} onChange={handleCheckboxChange} />
                    Mixed Paper
                  </label>
                </div>
              </div>

              <div className="form-group" style={{ marginTop: '12px' }}>
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer', fontSize: '0.9rem' }}>
                  <input
                    type="checkbox"
                    id="agreeTerms"
                    checked={formData.agreeTerms}
                    onChange={handleChange}
                    style={{ marginTop: '4px' }}
                    required
                  />
                  <span>I agree to the PulpChain Terms & Conditions of commercial logistics operations.</span>
                </label>
              </div>

              <button type="submit" className="btn btn-primary btn-full" style={{ marginTop: '8px' }} disabled={isSubmitting}>
                {isSubmitting ? 'Registering...' : <>Register Industrial Mill <ArrowRight size={16} /></>}
              </button>
            </form>

      </div>

      <div style={{ textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
        Already registered?{' '}
        <Link to="/industry/login" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>
          Industry Login here
        </Link>
      </div>
    </div>
  );
};
export default RegisterIndustry;
