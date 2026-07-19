import React from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';

export const Contact = () => {
  const [submitted, setSubmitted] = React.useState(false);
  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
      <section style={{ textAlign: 'center', padding: '20px 0' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '12px' }}>Contact Operations Support</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto' }}>
          Have questions about pickup schedules, school eligibility, or rates? Get in touch.
        </p>
      </section>

      <section className="grid-cols-2" style={{ gap: '40px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <h2 style={{ fontSize: '1.8rem' }}>Get in Touch</h2>
          <p style={{ color: 'var(--text-muted)' }}>
            Our operations team is available Monday through Friday, 9:00 AM to 6:00 PM to support collection scheduling and coordinate logistics.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '12px' }}>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <div style={{ padding: '12px', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', borderRadius: 'var(--radius-md)' }}>
                <Phone size={20} />
              </div>
              <div>
                <strong style={{ display: 'block' }}>Operations Hotline</strong>
                <span style={{ color: 'var(--text-muted)' }}>+91 9508303814</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <div style={{ padding: '12px', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', borderRadius: 'var(--radius-md)' }}>
                <Mail size={20} />
              </div>
              <div>
                <strong style={{ display: 'block' }}>Support Email</strong>
                <span style={{ color: 'var(--text-muted)' }}>mayankrajdto@gmail.com</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <div style={{ padding: '12px', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', borderRadius: 'var(--radius-md)' }}>
                <MapPin size={20} />
              </div>
              <div>
                <strong style={{ display: 'block' }}>Recycling Logistics Center</strong>
                <span style={{ color: 'var(--text-muted)' }}>Mayank Raj (Team PulpChain)</span>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          {submitted ? (
            <div style={{ textAlign: 'center', padding: '40px 0', display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyCenter: 'center', fontSize: '1.5rem', fontWeight: 'bold' }}>✓</div>
              <h3>Message Sent!</h3>
              <p style={{ color: 'var(--text-muted)' }}>Our logistics team will contact you at your registered email shortly.</p>
              <button onClick={() => setSubmitted(false)} className="btn btn-secondary btn-sm" style={{ marginTop: '12px' }}>Send another message</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="contact-name">Full Name</label>
                <input type="text" id="contact-name" className="form-control" placeholder="E.g., Dr. Ravi Kumar" required />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="contact-email">Email Address</label>
                <input type="email" id="contact-email" className="form-control" placeholder="E.g., rkumar@school.edu" required />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="contact-message">Message / Enquiry</label>
                <textarea id="contact-message" className="form-control" rows="4" placeholder="How can our operations team assist your school?" required style={{ resize: 'vertical' }}></textarea>
              </div>
              <button type="submit" className="btn btn-primary btn-full">
                Send Message <Send size={16} />
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
};
