import React from "react";
import "./AboutUs.css"; // Move custom CSS here

const AboutUs = () => {
  return (
    <div>
      <div id="who-we-are-hero-wp">
        <div className="content mt-5 py-5">
          <h1 style={{ color: "#cccccc", textAlign: "center" }}>
            Comprehensive Solutions for All Your Hardware and Software Needs
          </h1>
          <p style={{ color: "#cccccc", textAlign: "center" }}>
            We specialize in repairing phones, laptops, and a wide range of
            high-end tech devices for insurance companies, corporations, and
            discerning clients.
          </p>
        </div>
      </div>

      <div className="service-item">
        <div className="service-image">
          <img
            width="600"
            height="300"
            src="/images/what we do.jpg"
            alt="What we do"
            loading="lazy"
          />
        </div>

        <div className="service-description" style={{ marginLeft: "30px" }}>
          <h3 className="gradient-text">What we do</h3>
          <p>
            We specialize in fast, reliable repairs for cellphones and laptops.
            Whether it’s a cracked screen, battery issues, software
            troubleshooting, or hardware upgrades, our expert technicians handle
            it all...
          </p>
        </div>
      </div>

      <section className="text-center py-4 my-4">
        <img
          className="d-block mx-auto mb-4"
          src="/images/icons8-mission-50.png"
          alt="Mission"
          width="72"
          height="57"
        />
        <h1 className="gradient-text">Our Mission</h1>
        <div className="col-lg-6 mx-auto">
          <p className="lead mb-4">
            To deliver exceptional repair services with a focus on quality,
            efficiency, and customer satisfaction...
          </p>
        </div>
      </section>

      <section className="text-center py-4 my-4">
        <img
          className="d-block mx-auto mb-4"
          src="/images/icons8-vision-24.png"
          alt="Vision"
          width="72"
          height="57"
        />
        <h1 className="gradient-text">Our Vision</h1>
        <div className="col-lg-6 mx-auto">
          <p className="lead mb-4">
            To be the go-to repair service provider for mobile phones and
            laptops...
          </p>
        </div>
      </section>

      <h2 className="gradient-text text-center mb-4">Our Values</h2>

      <div className="container my-4">
        <div className="row row-cols-1 row-cols-md-3 g-3 justify-content-center">
          {[
            {
              img: "/images/intergrity.jpg",
              title: "Integrity",
              text: "We conduct our business with the utmost honesty and transparency.",
            },
            {
              img: "/images/customer commitment.jpg",
              title: "Customer Commitment",
              text: "We are dedicated to building lasting relationships with our clients...",
            },
            {
              img: "/images/qualityy.jpg",
              title: "Quality",
              text: "We use high-quality parts and employ skilled technicians...",
            },
          ].map((item, idx) => (
            <div className="col" key={idx}>
              <div className="card  mx-auto" style={{ width: "18rem" }}>
                <img src={item.img} className="card-img-top" alt={item.title} />
                <div className="card-body">
                  <h5 className="card-title">{item.title}</h5>
                  <p className="card-text">{item.text}</p>
                  <a href="https://www.stentech/about" className="btn custom-btn">
                    Find out more
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AboutUs;
