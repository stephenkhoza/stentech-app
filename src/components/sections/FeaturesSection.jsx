import React from 'react';
import './FeaturesSection.css'; // Assuming you have a CSS file for styling

const FeaturesSection = () => {
  const features = [
    {
      icon: "fas fa-tools fa-lg",
      title: "Expert Technicians",
      description: "Our certified repair specialists have years of experience and undergo continuous training to stay current with the latest technology.",
      delay: 100
    },
    {
      icon: "fas fa-bolt fa-lg",
      title: "Quick Turnaround", 
      description: "Most repairs are completed within 24-48 hours, minimizing the inconvenience of being without your device.",
      delay: 200
    },
    {
      icon: "fas fa-shield-alt fa-lg",
      title: "Warranty Guaranteed",
      description: "All our repairs come with a 90-day warranty, giving you peace of mind about the quality of our work.",
      delay: 300
    }
  ];

  return (
    <section className="bg-light">
      <div className="container">
        <div className="row justify-content-center text-center">
          <div className="col-lg-8">
            <h2 className="section-title ">Why Choose StenTech?</h2>
            <p className="sub-heading">
              Experience premium repair services that combine technical expertise with exceptional customer service
            </p>
          </div>
        </div>
        <div className="row">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="col-md-4 " 
              data-aos="fade-up" 
              data-aos-delay={feature.delay}
            >
              <div className="feature">
                <div className="feature-icon">
                  <i className={feature.icon}></i>
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
                <a href="/why-choose-us.html" className="icon-link">
                  Learn More <i className="fas fa-arrow-right ms-2"></i>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;