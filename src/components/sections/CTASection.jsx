import React from 'react';
import './CTASection.css';

const CTASection = () => {
  return (
    <section 
      className="cta"
      style={{
        backgroundImage: `
          linear-gradient(135deg, #2ca19c 0%, #238f89 100%), 
          url('/assets/grain-pattern.svg')
        `,
        backgroundRepeat: 'repeat',
        backgroundSize: 'auto',
      }}
    >
      <div className="container">
        <h2>Ready to Fix Your Device?</h2>
        <p>
          Contact us today for a free diagnostic assessment and quote. Our team is ready to provide you with fast and reliable repair services.
        </p>
        <div className="cta-buttons">
          <a href="https://stentech.co.za/book-a-repair" className="btn">
            Book a Repair
          </a>
          <a href="https://stentech.co.za/contact" className="btn btn-outline">
            Contact Us
          </a>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
