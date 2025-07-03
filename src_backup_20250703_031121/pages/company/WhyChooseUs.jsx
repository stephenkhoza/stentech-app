import React from "react";
import "./WhyChooseUs.css"; // Create this file with the styles below

const reasons = [
  {
    icon: "/images/icon1.png",
    title: "Expert Technicians",
    text: "Our team consists of highly skilled and certified technicians who have years of experience in repairing cellphones and laptops.",
  },
  {
    icon: "/images/icon2.png",
    title: "Quick Turnaround",
    text: "We understand the importance of your devices, which is why we offer fast and efficient repair services to minimize downtime.",
  },
  {
    icon: "/images/icon3.png",
    title: "Quality Parts",
    text: "We use only high-quality, genuine parts to ensure the longevity and performance of your devices.",
  },
  {
    icon: "/images/icon4.png",
    title: "Affordable Prices",
    text: "Our repair services are competitively priced to provide you with the best value for your money.",
  },
  {
    icon: "/images/icon5.png",
    title: "Customer Satisfaction",
    text: "We prioritize customer satisfaction and strive to provide exceptional service and support.",
  },
  {
    icon: "/images/icon6.png",
    title: "Warranty",
    text: "We offer a warranty on all our repairs to give you peace of mind and confidence in our services.",
  },
];

const testimonials = [
  `"The service was fast and reliable. My phone looks brand new! Highly recommend." - Jane D.`,
  `"Excellent customer service and fair prices. They fixed my device in no time." - John S.`,
  `"Professional and friendly staff. I'm very satisfied with the repair." - Lisa M.`,
];

const WhyChooseUs = () => {
  return (
    <div className="content-space container">
      <h2 className="section-title">Top Reasons to Choose Our Services</h2>
      <div className="reasons">
        {reasons.map((reason, index) => (
          <div className="reason" key={index}>
            <img src={reason.icon} alt={reason.title} />
            <h3>{reason.title}</h3>
            <p>{reason.text}</p>
          </div>
        ))}
      </div>

      <div className="container my-4">
        <h2 className="section-title text-center">What Our Customers Say</h2>
        <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 g-3 justify-content-center mt-4">
          {testimonials.map((quote, i) => (
            <div className="col" key={i}>
              <div className="card mx-auto" style={{ width: "18rem", textAlign: "center" }}>
                <div className="card-body">
                  <p className="card-text">{quote}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WhyChooseUs;
