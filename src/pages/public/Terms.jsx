import { FileText } from 'lucide-react';

export const Terms = () => {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-emerald-50 px-8 py-10 border-b border-emerald-100">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-emerald-100 p-3 rounded-xl text-emerald-600">
              <FileText className="w-8 h-8" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900">Terms & Conditions</h1>
          </div>
          <p className="text-emerald-800 font-medium">Last updated: July 2026</p>
        </div>

        <div className="px-8 py-10 prose prose-slate max-w-none">
          <h3>1. Introduction</h3>
          <p>
            Welcome to PulpChain. These Terms and Conditions govern your use of our platform and services. By accessing or using PulpChain, you agree to be bound by these terms.
          </p>

          <h3>2. Platform Purpose</h3>
          <p>
            PulpChain is a digital marketplace and logistics platform designed to connect educational institutions (Schools) with paper recycling businesses (Industries). We facilitate the collection, weighing, and transaction of recyclable paper materials.
          </p>

          <h3>3. School Responsibilities</h3>
          <p>
            Schools agree to provide accurate information regarding the type and estimated volume of paper available for pickup. Schools must ensure the materials are free from hazardous contaminants and accessible to our logistics partners during scheduled times.
          </p>

          <h3>4. Industry Responsibilities</h3>
          <p>
            Industries participating on the PulpChain marketplace agree to honor the financial terms of purchased inventory. Industries must maintain valid licenses and permits required for processing recycled materials in their respective jurisdictions.
          </p>

          <h3>5. Pickup Policy</h3>
          <p>
            PulpChain schedules pickups based on logistical availability. While we strive to meet requested dates, exact timing is subject to change. Final material weights are determined exclusively by PulpChain's certified scales at the time of collection.
          </p>

          <h3>6. Payments</h3>
          <p>
            Payments to Schools are calculated based on the verified weight of materials and the prevailing rate at the time of pickup. Payments are disbursed according to the standard processing timeline. Invoices for Industries must be settled within the agreed contract terms.
          </p>

          <h3>7. User Accounts</h3>
          <p>
            Users are responsible for maintaining the confidentiality of their account credentials. You must immediately notify PulpChain of any unauthorized use of your account. We reserve the right to suspend accounts that violate these terms.
          </p>

          <h3>8. Prohibited Activities</h3>
          <p>
            Users may not manipulate weight scales, submit fraudulent pickup requests, attempt to bypass the platform for direct transactions, or use the platform for any illegal purpose.
          </p>

          <h3>9. Limitation of Liability</h3>
          <p>
            PulpChain provides its services "as is". We shall not be liable for any indirect, incidental, special, or consequential damages arising from the use of our platform or logistical services.
          </p>

          <h3>10. Contact Information</h3>
          <p>
            For any questions regarding these Terms & Conditions, please contact our legal team at legal@pulpchain.in or through our standard contact forms.
          </p>
        </div>
      </div>
    </div>
  );
};
