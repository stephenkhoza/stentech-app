import React from 'react';
import './PeaceOfMindSection.css'; // Import the CSS file for styling

const PeaceOfMindSection = () => {
  const features = [
    {
      icon: "/images/shipment.png",
      iconAlt: "shipment",
      title: "Send your product to StenTech",
      description: "Online or over the phone, we'll arrange shipment for your product to an StenTech Repair Center — all on your schedule and without an appointment. This service is available for all products.",
      linkText: "Book a Repair",
      linkUrl: "book-repair"
    },
    {
      icon: "/images/broken-phone.png",
      iconAlt: "service-option",
      iconWidth: "70",
      title: "Service options",
      description: "Learn about your service options, get an estimate for battery service or screen repair, and more.",
      linkText: "Find out more",
      linkUrl: "https://www.stentech.co.za/LaptopRepair"
    },
    {
      icon: "/images/repair.png",
      iconAlt: "start-repair",
      title: "Start a repair",
      description: "Tell us what's going on with your Phone and we'll find the right support options for you.",
      linkText: "Get started with a repair",
      linkUrl: "https://www.stentech.co.za/CellphoneRepair"
    }
  ];

  return (
    <div className="custom-container " id="featured-3">
      <h2 className="pb-2 border-bottom">For your peace of mind</h2>
      <div className="row g-4 row-cols-1 row-cols-lg-3">
        {features.map((feature, index) => (
          <div key={index} className="feature col">
            <div className="feature-icon d-inline-flex align-items-center justify-content-center bg-gradient fs-2">
              <img 
                src={feature.icon} 
                alt={feature.iconAlt}
                width={feature.iconWidth || undefined}
              />
            </div>
            <h3 className="fs-2 text-body-emphasis">{feature.title}</h3>
            <p>{feature.description}</p>
            <a href={feature.linkUrl} className="icon-link">
              {feature.linkText}
              <img 
                width="15" 
                height="15" 
                src="https://img.icons8.com/ios-glyphs/30/2ca19c/chevron-right.png" 
                alt="chevron-right" 
              />
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PeaceOfMindSection;