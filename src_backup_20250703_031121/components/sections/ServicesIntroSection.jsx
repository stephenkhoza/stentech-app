import React from 'react';
import './ServicesIntroSection.css'; // Import the CSS file

const ServicesIntroSection = () => {
  return (
    <div className="service-container">
      <div className="service-wrapper">
        <div className="service-content">
          <div className="service-inner">
            {/* Service Icon */}
            <img
              className="service-icon"
              src="/images/laptop-and-iphone.png"
              alt="Device Repair Services"
              width={120}
              height={120}
            />
            
            {/* Main Heading */}
            <h2 className="service-heading">
              Device Repair Services
            </h2>
            
            {/* Description */}
            <p className="service-description">
              Established in 2021, StenTech provides expert IT solutions, high-quality device repairs, and{' '}
              <a
                href="https://www.dev.stentech.co.za/"
                className="service-link"
              >
                web development services
              </a>
              . Our certified technicians use genuine parts to ensure your devices are returned in perfect working condition. We take pride in our quick turnaround times and reliable, professional service.
            </p>
            
            {/* Action Buttons */}
            <div className="service-buttons">
              <a
                href="/pricing"
                className="btn-primary"
              >
                View Pricing
              </a>
              <a
                href="/book-repair"
                className="btn-outline"
              >
                Book Now
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServicesIntroSection;