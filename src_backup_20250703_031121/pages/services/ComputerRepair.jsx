import React, { useState, useEffect } from 'react';
import './ComputerRepair.css'; // Import the CSS file for styles


const ComputerRepair = () => {
  const [activeAccordion, setActiveAccordion] = useState('collapseOne');

  useEffect(() => {
    // Simulate AOS animation effect with CSS transitions
    const elements = document.querySelectorAll('[data-aos]');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('aos-animate');
        }
      });
    });

    elements.forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const toggleAccordion = (targetId) => {
    setActiveAccordion(activeAccordion === targetId ? '' : targetId);
  };

  const services = [
    {
      id: 1,
      image: "/images/hardware-repair.avif",
      title: "Hardware Troubleshooting",
      description: "We diagnose and repair all hardware issues including motherboard failures, power problems, and component replacements.",
      price: "From R350",
      delay: "100"
    },
    {
      id: 2,
      image: "/images/virus-removal.avif",
      title: "Virus & Malware Removal",
      description: "Complete system scan and removal of viruses, malware, spyware and other malicious software affecting your computer.",
      price: "From R250",
      delay: "200"
    },
    {
      id: 3,
      image: "/images/data-recovery.avif",
      title: "Data Recovery",
      description: "Recovery of lost or corrupted data from damaged hard drives, accidental deletions, or system crashes.",
      price: "From R450",
      delay: "300"
    },
    {
      id: 4,
      image: "/images/system-upgrade.avif",
      title: "System Upgrades",
      description: "Improve your computer's performance with RAM upgrades, SSD installation, graphics card upgrades, and CPU replacements.",
      price: "From R300",
      delay: "100"
    },
    {
      id: 5,
      image: "/images/os-installation.jpg",
      title: "OS Installation & Setup",
      description: "Clean installation and setup of Windows, macOS, or Linux operating systems with all necessary drivers and updates.",
      price: "From R400",
      delay: "200"
    },
    {
      id: 6,
      image: "/images/network-setup.jpg",
      title: "Network Setup & Troubleshooting",
      description: "Configuration and troubleshooting of wired and wireless networks, routers, and internet connectivity issues.",
      price: "From R350",
      delay: "300"
    }
  ];

  const processSteps = [
    {
      icon: "fas fa-clipboard-check",
      title: "Diagnostic",
      description: "We perform a thorough assessment of your computer to identify all issues affecting performance.",
      delay: "100"
    },
    {
      icon: "fas fa-tools",
      title: "Repair",
      description: "Our expert technicians fix the identified problems using quality parts and professional tools.",
      delay: "200"
    },
    {
      icon: "fas fa-laptop-code",
      title: "Testing",
      description: "We thoroughly test all repaired systems to ensure everything works perfectly.",
      delay: "300"
    },
    {
      icon: "fas fa-check-circle",
      title: "Delivery",
      description: "We return your fully functional computer with a warranty on our repair work.",
      delay: "400"
    }
  ];

  const benefits = [
    {
      icon: "fas fa-certificate",
      title: "Certified Technicians",
      description: "Our repair team consists of highly trained and certified technicians with years of experience."
    },
    {
      icon: "fas fa-shield-alt",
      title: "90-Day Warranty",
      description: "All our repairs come with a 90-day warranty for your peace of mind."
    },
    {
      icon: "fas fa-bolt",
      title: "Quick Turnaround",
      description: "Most repairs are completed within 24-48 hours so you can get back to work quickly."
    },
    {
      icon: "fas fa-hand-holding-usd",
      title: "Competitive Pricing",
      description: "We offer fair and transparent pricing with no hidden fees or charges."
    }
  ];

  const faqItems = [
    {
      id: "collapseOne",
      question: "How long will my computer repair take?",
      answer: "Most standard repairs are completed within 24-48 hours. However, complex issues or parts that need to be ordered may take longer. We'll provide you with an estimated timeframe after diagnosing your computer."
    },
    {
      id: "collapseTwo",
      question: "Do you offer data backup services?",
      answer: "Yes, we offer data backup services. Before performing any repairs that might risk data loss, we can back up your important files to ensure they remain safe. We can also help set up regular backup solutions to prevent future data loss."
    },
    {
      id: "collapseThree",
      question: "What if my computer can't be repaired?",
      answer: "If your computer cannot be repaired or if repairs would cost more than a replacement, we'll let you know. In such cases, we can help recommend suitable replacement options within your budget and assist with data transfer from your old device."
    },
    {
      id: "collapseFour",
      question: "Do you offer on-site repairs?",
      answer: "Yes, we offer on-site repairs for businesses and home users in Soshanguve and surrounding areas. There's a small callout fee, but this can be more convenient for computer setups that are difficult to transport or for urgent business needs."
    },
    {
      id: "collapseFive",
      question: "What warranty do you offer on repairs?",
      answer: "All our repairs come with a 90-day warranty. If the same issue recurs within this period, we'll fix it at no additional cost. Replacement parts may have their own manufacturer's warranty."
    }
  ];

  return (
    <div className="bg-white min-h-screen">
      <style jsx>{`
        .page-banner {
          background: linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)),
                      url('https://images.unsplash.com/photo-1518717758536-85ae29035b6d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80');
          background-size: cover;
          background-position: center;
          height: 300px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          text-align: center;
        }

        @media (max-width: 767px) {
          .page-banner {
            height: 200px;
          }
        }

        .service-card {
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
          transition: all 0.3s ease;
          height: 100%;
          background-color: white;
        }

        .service-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 15px 30px rgba(0, 0, 0, 0.12);
        }

        .service-card img {
          width: 100%;
          height: 200px;
          object-fit: cover;
          border-bottom: 1px solid #eee;
        }

        .process-icon {
          width: 80px;
          height: 80px;
          line-height: 80px;
          font-size: 32px;
          background-color: #2ca19c;
          color: white;
          border-radius: 50%;
          margin: 0 auto 20px;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .process-item:hover .process-icon {
          transform: scale(1.1);
          box-shadow: 0 5px 15px rgba(44, 161, 156, 0.3);
        }

        .benefit-icon {
          min-width: 50px;
          height: 50px;
          background-color: #2ca19c;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          margin-right: 20px;
        }

        .accordion-item {
          border: none;
          margin-bottom: 15px;
          box-shadow: 0 3px 10px rgba(0, 0, 0, 0.05);
          border-radius: 8px;
          overflow: hidden;
        }

        .accordion-button {
          padding: 20px;
          font-weight: 600;
          color: #333;
          background-color: white;
          border: none;
          width: 100%;
          text-align: left;
          cursor: pointer;
        }

        .accordion-button.active {
          color: white;
          background-color: #2ca19c;
        }

        .accordion-body {
          padding: 20px;
          background-color: #f9f9f9;
        }

        .cta-box {
          background-color: #2ca19c;
          border-radius: 10px;
          padding: 40px;
          color: white;
          text-align: center;
          margin-top: 60px;
          margin-bottom: 60px;
        }

        @media (max-width: 767px) {
          .cta-box {
            padding: 30px 20px;
          }
        }

        [data-aos] {
          opacity: 0;
          transform: translateY(30px);
          transition: all 0.6s ease;
        }

        [data-aos].aos-animate {
          opacity: 1;
          transform: translateY(0);
        }

        .btn-primary {
          background-color: #2ca19c;
          border-color: #2ca19c;
          color: white;
          padding: 10px 20px;
          border-radius: 5px;
          text-decoration: none;
          display: inline-block;
          transition: all 0.3s ease;
        }

        .btn-primary:hover {
          background-color: #238a85;
          border-color: #238a85;
        }
      `}</style>

      {/* Page Banner */}
      <section className="page-banner">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-shadow">
            Professional Computer Repair Services
          </h1>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Our Computer Repair Services
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We provide comprehensive repair solutions for all types of computer issues
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <div
                key={service.id}
                className="service-card"
                data-aos="fade-up"
                data-aos-delay={service.delay}
              >
                <img
                  src={service.image}
                  alt={service.title}
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1563206767-5b18f218e8de?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
                  }}
                />
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">
                    {service.title}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {service.description}
                  </p>
                  <div className="text-lg font-semibold text-teal-600 mb-4">
                    {service.price}
                  </div>
                  <a
                    href="https://docs.google.com/forms/d/e/1FAIpQLSdsOTbPuNbKK3AkitfuCc8YzpRAWlNDPWYcjhmwI6UxY3yQXA/viewform"
                    className="btn-primary"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Book Now
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Our Computer Repair Process
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We follow a structured approach to ensure quality repairs and excellent service
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {processSteps.map((step, index) => (
              <div
                key={index}
                className="process-item text-center p-8 transition-all duration-300"
                data-aos="fade-up"
                data-aos-delay={step.delay}
              >
                <div className="process-icon">
                  <i className={step.icon}></i>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">
                  {step.title}
                </h3>
                <p className="text-gray-600">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div data-aos="fade-right">
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-800 mb-4">
                  Why Choose StenTech for Computer Repairs?
                </h2>
                <p className="text-gray-600">
                  We provide reliable, affordable, and professional computer repair services 
                  in Soshanguve and surrounding areas.
                </p>
              </div>

              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-start mb-6">
                  <div className="benefit-icon">
                    <i className={benefit.icon}></i>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800 mb-2">
                      {benefit.title}
                    </h4>
                    <p className="text-gray-600 text-sm">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div data-aos="fade-left">
              <img
                src="https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                alt="Computer Repair Technician"
                className="w-full h-auto rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Find answers to commonly asked questions about our computer repair services
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            {faqItems.map((item, index) => (
              <div key={index} className="accordion-item">
                <button
                  className={`accordion-button ${activeAccordion === item.id ? 'active' : ''}`}
                  onClick={() => toggleAccordion(item.id)}
                >
                  {item.question}
                  <i className={`fas fa-chevron-${activeAccordion === item.id ? 'up' : 'down'} ml-auto`}></i>
                </button>
                {activeAccordion === item.id && (
                  <div className="accordion-body">
                    {item.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4">
        <div className="cta-box">
          <h2 className="text-3xl font-bold mb-4">
            Need Professional Computer Repair?
          </h2>
          <p className="text-lg mb-6 max-w-3xl mx-auto">
            Don't let computer problems slow you down. Our expert technicians are ready to 
            diagnose and fix your computer issues quickly and affordably.
          </p>
          <a
            href="https://docs.google.com/forms/d/e/1FAIpQLSdsOTbPuNbKK3AkitfuCc8YzpRAWlNDPWYcjhmwI6UxY3yQXA/viewform"
            className="bg-white text-teal-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-300 inline-block"
            target="_blank"
            rel="noopener noreferrer"
          >
            Book Your Repair Today
          </a>
        </div>
      </section>

      {/* Font Awesome CDN for icons */}
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css"
        integrity="sha512-z3gLpd7yknf1YoNbCzqRKc4qyor8gaKU1qmn+CShxbuBusANI9QpRohGBreCFkKxLhei6S9CQXFEbbKuqLg0DA=="
        crossOrigin="anonymous"
        referrerPolicy="no-referrer"
      />
    </div>
  );
};

export default ComputerRepair;