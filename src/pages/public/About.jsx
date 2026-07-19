
import { Landmark, Users, Leaf } from 'lucide-react';

export const About = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '60px' }}>
      <section style={{ textAlign: 'center', padding: '40px 0' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '16px' }}>About PulpChain</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', maxWidth: '800px', margin: '0 auto' }}>
          PulpChain is a dedicated sustainability logistics network helping schools turn waste paper into school resources.
        </p>
      </section>

      <section className="grid-cols-2">
        <div style={{ display: 'flex', flexDirection: 'column', justifyCenter: 'center', gap: '20px' }}>
          <h2 style={{ fontSize: '2rem' }}>Solving the Paper Recycling Loop</h2>
          <p style={{ color: 'var(--text-muted)' }}>
            Each year, educational facilities discard tons of recyclable materials—exam books, worksheets, cardboard packaging, and envelopes. Most of this goes straight to municipal waste streams.
          </p>
          <p style={{ color: 'var(--text-muted)' }}>
            PulpChain solves this with structured collections, direct relationships with paper processing mills, and clear rewards. We return the value of paper recycling to where it belongs: the educational community.
          </p>
        </div>
        <div style={{
          backgroundColor: 'var(--surface)',
          border: '1px solid var(--surface-border)',
          borderRadius: 'var(--radius-lg)',
          padding: '32px',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px'
        }}>
          <h3 style={{ fontSize: '1.4rem' }}>Our Core Pillars</h3>
          <div style={{ display: 'flex', gap: '16px' }}>
            <Leaf style={{ color: 'var(--primary)', flexShrink: 0 }} size={24} />
            <div>
              <strong>Ecological Responsibility</strong>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>Keep paper out of landfills, preserving trees and reducing emissions.</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <Landmark style={{ color: 'var(--primary)', flexShrink: 0 }} size={24} />
            <div>
              <strong>School Funding Support</strong>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>Provide transparent financial incentives to boost school development plans.</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <Users style={{ color: 'var(--primary)', flexShrink: 0 }} size={24} />
            <div>
              <strong>Community Inclusion</strong>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>Involve students, parents, and teachers directly in local recycling drives.</p>
            </div>
          </div>
        </div>
      </section>

      <section style={{
        textAlign: 'center',
        padding: '60px 40px',
        backgroundColor: 'var(--primary-light)',
        border: '1px solid var(--primary)',
        borderRadius: 'var(--radius-lg)'
      }}>
        <h2 style={{ color: 'var(--primary)', marginBottom: '16px' }}>Join the Loop Today</h2>
        <p style={{ color: 'var(--text-main)', maxWidth: '600px', margin: '0 auto 24px auto', fontSize: '1.1rem' }}>
          Explore our pricing or sign up your school today to schedule your first waste collection.
        </p>
      </section>
    </div>
  );
};
