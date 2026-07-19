import { HelpCircle } from 'lucide-react';

export const FAQ = () => {
  const faqs = [
    {
      question: "What is PulpChain?",
      answer: "PulpChain is a B2B circular economy network that connects educational institutions with recycling industries. We facilitate the collection, processing, and recycling of waste paper into valuable materials."
    },
    {
      question: "Who can register on the platform?",
      answer: "We currently support two types of accounts: Schools (educational institutions that generate waste paper) and Industries (manufacturing businesses that purchase recycled raw materials)."
    },
    {
      question: "How do pickups work for schools?",
      answer: "Schools can request a pickup through their dashboard. Our logistics team will arrive at the scheduled time, weigh the material on-site using calibrated scales, and initiate the payment process based on the exact weight."
    },
    {
      question: "When are payments made to schools?",
      answer: "Payments are processed digitally immediately after the pickup is completed and the weight is verified. The funds are typically settled into the registered bank account within 24-48 business hours."
    },
    {
      question: "How is the paper weighed?",
      answer: "Our logistics team uses industrial-grade, calibrated digital scales during the pickup. Both parties verify the weight before the transaction is finalized on the platform."
    },
    {
      question: "How do industries place orders?",
      answer: "Registered industries can view available warehouse inventory and current pricing on their dashboard. They can submit an order request specifying the material type, quantity, and delivery date. Once approved, an invoice is generated."
    },
    {
      question: "What types of paper do you accept?",
      answer: "We primarily accept and process Mixed Paper, Cardboard (Corrugated), and White Paper. Each category is segregated and priced differently based on market rates."
    }
  ];

  return (
    <div style={{ maxWidth: '800px', margin: '40px auto', display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px', color: 'var(--primary)' }}>
          <HelpCircle size={48} />
        </div>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '16px' }}>Frequently Asked Questions</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>
          Everything you need to know about the PulpChain platform and how it works.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {faqs.map((faq, index) => (
          <div key={index} className="card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '12px', color: 'var(--text-main)' }}>
              {faq.question}
            </h3>
            <p style={{ color: 'var(--text-muted)', lineHeight: '1.6' }}>
              {faq.answer}
            </p>
          </div>
        ))}
      </div>

      <div className="card" style={{ textAlign: 'center', backgroundColor: 'var(--primary-light)', border: '1px solid var(--primary)', marginTop: '24px' }}>
        <h3 style={{ marginBottom: '12px', color: 'var(--primary)' }}>Still have questions?</h3>
        <p style={{ marginBottom: '20px', color: 'var(--text-main)' }}>
          Our support team is here to help with any specific inquiries you might have.
        </p>
        <a href="/contact" className="btn btn-primary" style={{ display: 'inline-flex' }}>
          Contact Support
        </a>
      </div>
    </div>
  );
};
