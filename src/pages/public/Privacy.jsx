import { Shield } from 'lucide-react';

export const Privacy = () => {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-emerald-50 px-8 py-10 border-b border-emerald-100">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-emerald-100 p-3 rounded-xl text-emerald-600">
              <Shield className="w-8 h-8" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900">Privacy Policy</h1>
          </div>
          <p className="text-emerald-800 font-medium">Last updated: July 2026</p>
        </div>

        <div className="px-8 py-10 prose prose-slate max-w-none">
          <h3>1. Information Collected</h3>
          <p>
            We collect information you provide directly to us when you register for an account, request a pickup, place an order, or communicate with us. This includes your name, organization details, and operational addresses.
          </p>

          <h3>2. Authentication Data</h3>
          <p>
            To secure your account, we process authentication data including email addresses and securely hashed passwords. We utilize industry-standard authentication providers to ensure your credentials remain safe.
          </p>

          <h3>3. Contact Information</h3>
          <p>
            Your contact information (phone numbers, emails, addresses) is used exclusively for coordinating logistics, sending transaction receipts, and providing customer support.
          </p>

          <h3>4. Transaction History</h3>
          <p>
            We maintain records of your material pickups, sales orders, financial transactions, and generated receipts. This data is necessary for accounting, compliance, and providing you with historical analytics.
          </p>

          <h3>5. Storage</h3>
          <p>
            Your data is stored in secure, encrypted cloud databases. We implement strict access controls ensuring that only authorized personnel and systems can access sensitive operational data.
          </p>

          <h3>6. Security</h3>
          <p>
            We employ organizational and technical security measures designed to protect your personal information against unauthorized access, destruction, or alteration. All data transmissions are secured using HTTPS/TLS.
          </p>

          <h3>7. Third-Party Services</h3>
          <p>
            We may share necessary logistical data with verified third-party transportation partners strictly for the purpose of executing requested material pickups and deliveries. We do not sell your personal data to advertisers.
          </p>

          <h3>8. Cookies</h3>
          <p>
            Our platform uses essential cookies required for maintaining your session state and authentication securely. We do not use aggressive tracking cookies for third-party advertising.
          </p>

          <h3>9. Contact</h3>
          <p>
            If you have questions about this Privacy Policy or wish to request the deletion of your account data, please contact our privacy compliance team at privacy@pulpchain.in.
          </p>
        </div>
      </div>
    </div>
  );
};
