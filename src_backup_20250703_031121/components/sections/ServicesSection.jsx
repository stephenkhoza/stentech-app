import React from 'react';
import './ServicesSection.css'; // Import the CSS file

const ServicesSection = () => {
  const services = [
    {
      id: 1,
      title: "Cellphone Repairs",
      description: "We repair all major smartphone brands including Samsung, Huawei, Xiaomi, and others. Our services include screen replacements, battery replacements, charging port repairs, water damage recovery, and software troubleshooting.",
      image: "/images/cellphone repairs.webp",
      link: "/CellphoneRepair.html",
      reverse: false,
      loading: "lazy"
    },
    {
      id: 2,
      title: "iPhone & iPad Repairs",
      description: "Expert repairs for all Apple devices including iPhones, iPads, and Apple Watches. We fix cracked screens, replace batteries, resolve charging issues, and provide comprehensive diagnostics using genuine Apple parts.",
      image: "/images/iphone-repairs.webp",
      link: "/iDeviceRepairs.html",
      reverse: true,
      loading: "eager"
    },
    {
      id: 3,
      title: "Laptop Repairs",
      description: "Comprehensive laptop repair services for all brands including Apple, Dell, HP, Lenovo, and Asus. We handle screen replacements, keyboard repairs, battery replacements, hardware upgrades, and virus removal. Fast turnaround times guaranteed.",
      image: "/images/laptop-repairs.webp",
      link: "/LaptopRepair.html",
      reverse: false,
      loading: "lazy"
    },
    {
      id: 4,
      title: "Computer Repairs",
      description: "Professional desktop computer repair and maintenance services. We offer hardware troubleshooting, component upgrades, OS installations, data recovery, and custom PC builds. Our technicians can resolve even the most complex computer issues.",
      image: "/images/computer-repairs.webp",
      link: "/computer-repair.html",
      reverse: true,
      loading: "lazy"
    }
  ];

  return (
    <div className="services-container">
      <div className="services-wrapper">
        {services.map((service, index) => (
          <div 
            key={service.id}
            className={`service-item ${service.reverse ? 'reverse' : ''} animate-fade-up`}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            {/* Image Section */}
            <div className="service-image-container">
              <img
                src={service.image}
                alt={service.title}
                className="service-image"
                loading={service.loading}
                width={600}
                height={400}
              />
            </div>

            {/* Content Section */}
            <div className="service-content">
              <h3 className="service-title">
                <a
                  href={service.link}
                  className="service-title-link"
                >
                  {service.title}
                </a>
              </h3>
              
              <p className="service-description">
                {service.description}
              </p>
              
              <a
                href={service.link}
                className="service-btn"
              >
                Learn More
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ServicesSection;