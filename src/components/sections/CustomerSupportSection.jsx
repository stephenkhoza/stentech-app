import React from 'react';
import './CustomerSupportSection.css'; // Assuming you have a CSS file for styling

const CustomerSupportSection = () => {
  const supportServices = [
    {
      image: "/images/Cellphone-Repair-Centre.webp",
      alt: "Find your nearest store",
      title: "Locate a Store",
      description: "Find a service center nearby for assistance with your devices.",
      buttonText: "Find a Store",
      buttonLink: "/contact.html"
    },
    {
      image: "/images/track_device.jpeg",
      alt: "Track your repair",
      title: "Repair Tracking",
      description: "Stay updated on the progress of your repair with ease.",
      buttonText: "Track Repair",
      buttonLink: "/pages/track-my-repair.html"
    },
    {
      image: "/images/Call centre.webp",
      alt: "Call centre",
      title: "Contact Our Team",
      description: "Get instant support by speaking to our friendly agents.",
      buttonText: "Call Now",
      buttonLink: "tel:0726413662"
    }
  ];

  return (
    <div className="custom-container my-5 py-5 bg-light">
      <h2 className="text-center mb-4">Customer Support Services</h2>
      <div className="row justify-content-center">
        {supportServices.map((service, index) => (
          <div key={index} className="col-md-3 col-sm-5 mb-3">
            <div className="card mx-auto">
              <img src={service.image} alt={service.alt} />
              <h5>{service.title}</h5>
              <p>{service.description}</p>
              <a href={service.buttonLink} className="btn">
                {service.buttonText}
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CustomerSupportSection;