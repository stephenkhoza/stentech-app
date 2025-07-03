import React from 'react';
import './CTASection.css'; // Assuming you have a CSS file for styling

const CTASection = () => {
  return (
    <section className="cta">
      <div className="container">
        <h2>Ready to Fix Your Device?</h2>
        <p>
          Contact us today for a free diagnostic assessment and quote. Our team is ready to provide you with fast and reliable repair services.
        </p>
        <div className="cta-buttons">
          <a 
            href="https://docs.google.com/forms/d/e/1FAIpQLSdsOTbPuNbKK3AkitfuCc8YzpRAWlNDPWYcjhmwI6UxY3yQXA/viewform" 
            className="btn"
          >
            Book a Repair
          </a>
          <a href="/contact.html" className="btn btn-outline">
            Contact Us
          </a>
        </div>
      </div>
    </section>
  );
};

export default CTASection;