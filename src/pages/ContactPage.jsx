import React from "react";
import "./ContactPage.css"; // Import custom styles for the contact page

const ContactPage = () => {
  const showMessage = (text, type) => {
    const message = document.getElementById("message");
    message.textContent = text;
    message.className = "alert-msg " + type;
    message.style.display = "block";

    message.scrollIntoView({ behavior: "smooth", block: "center" });

    if (type === "success") {
      setTimeout(() => {
        message.style.display = "none";
      }, 5000);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;

    const formData = {
      name: form["your-name"].value,
      email: form["email"].value,
      phone: form["phone"].value,
      subject: form["subject"].value,
      message: form["comments"].value,
      consent: form["consent"].checked
    };

    if (!formData.name || !formData.email || !formData.phone || !formData.message || !formData.consent) {
      showMessage("Please fill in all required fields", "error");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      showMessage("Please enter a valid email address", "error");
      return;
    }

    try {

      const response = await fetch("http://localhost:5000/api/contact", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(formData),
});



      

      const data = await response.json();

      if (response.ok) {
        showMessage(data.message, "success");
        form.reset();
      } else {
        showMessage(data.error || "Failed to submit form", "error");
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      showMessage("Network error. Please try again later.", "error");
    }
  };

  return (
    <>
      <section className="mapbox content-space">
        <figure>
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3620.1062251309026!2d28.09979327635798!3d-25.51972463706975!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1ebfd9a57e00de79%3A0xe714e308725addd3!2s2%20Aubrey%20Matlakala%20St%2C%20Soshanguve%2C%20Pretoria%2C%200152!5e0!3m2!1sen!2sza!4v1710787208062!5m2!1sen!2sza"
            width="100%"
            height="350"
            loading="lazy"
            style={{ border: 0 }}
            allowFullScreen
            title="Stentech Map"
          ></iframe>
        </figure>
      </section>

      <div className="contact-area default-padding">
        <div className="container">
          <div className="contact-box row">
            <div className="col-lg-5 left-info">
              <div className="content-box">
                <h5>Get in touch</h5>
                <h2>Need tech support? We're here to help!</h2>
                <p className="mb-4">
                  Our team of expert technicians is ready to assist with any
                  device repair needs or technical questions you may have.
                </p>

                <div className="item">
                  <div className="icon"><i className="fas fa-map-marked-alt"></i></div>
                  <div className="info">
                    <h5>Visit Our Shop</h5>
                    <p>2 Aubrey Matlakala St, Soshanguve, Pretoria, Gauteng, 0152</p>
                  </div>
                </div>

                <div className="item">
                  <div className="icon"><i className="fas fa-phone"></i></div>
                  <div className="info">
                    <h5>Call Us</h5>
                    <p><a href="tel:+27735270565">+27 73 527 0565</a></p>
                  </div>
                </div>

                <div className="item">
                  <div className="icon"><i className="fas fa-envelope-open"></i></div>
                  <div className="info">
                    <h5>Email Us</h5>
                    <p>
                      <a href="mailto:info@stentech.co.za">info@stentech.co.za</a><br />
                      <a href="mailto:repairs@stentech.co.za">repairs@stentech.co.za</a>
                    </p>
                  </div>
                </div>

                <div className="item">
                  <div className="icon"><i className="far fa-clock"></i></div>
                  <div className="info">
                    <h5>Business Hours</h5>
                    <p>Monday - Saturday: 8:00 AM - 5:00 PM<br />Sunday: Closed</p>
                  </div>
                </div>

                <div className="social-connect mt-4">
                  <h5>Connect With Us</h5>
                  <div className="social-icons">
                    <a href="https://www.facebook.com/profile.php?id=100066367132737" target="_blank" rel="noreferrer" aria-label="Facebook" className="me-2">
                      <i className="fab fa-facebook-f"></i>
                    </a>
                    <a href="https://www.instagram.com/stentech_1?igsh=MW9rNWRpNTR2MTgwaQ==" target="_blank" rel="noreferrer" aria-label="Instagram" className="me-2">
                      <i className="fab fa-instagram"></i>
                    </a>
                    <a href="https://www.youtube.com/@StenTech-channel" target="_blank" rel="noreferrer" aria-label="YouTube" className="me-2">
                      <i className="fab fa-whatsapp"></i>
                    </a>
                    <a href="https://www.linkedin.com" target="_blank" rel="noreferrer" aria-label="LinkedIn">
                      <i className="fab fa-linkedin-in"></i>
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-7">
              <div className="content">
                <div className="contact-form-wrapper">
                  <h3>Send Us a Message</h3>
                  <p className="mb-4">
                    Fill out the form below and we'll get back to you as soon as possible.
                  </p>

                  <form onSubmit={handleSubmit} className="contact-form" id="contactForm">
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label htmlFor="name">Your Name</label>
                        <input type="text" name="your-name" className="form-control" placeholder="Enter your name" required />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label htmlFor="email">Email Address</label>
                        <input type="email" name="email" className="form-control" placeholder="Enter your email" required />
                      </div>
                    </div>

                    <div className="mb-3">
                      <label htmlFor="phone">Phone Number</label>
                      <input type="tel" name="phone" className="form-control" placeholder="Enter your phone number" required />
                    </div>

                    <div className="mb-3">
                      <label htmlFor="subject">Subject</label>
                      <select name="subject" className="form-control">
                        <option value="general">General Inquiry</option>
                        <option value="repair">Repair Service</option>
                        <option value="quote">Request a Quote</option>
                        <option value="feedback">Feedback</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div className="mb-4">
                      <label htmlFor="comments">Your Message</label>
                      <textarea name="comments" rows="5" className="form-control" placeholder="Please describe what you need..." required></textarea>
                    </div>

                    <div className="form-check mb-4">
                      <input type="checkbox" name="consent" className="form-check-input" id="consent" required />
                      <label className="form-check-label" htmlFor="consent">
                        I agree to the <a href="privacy-policy.html">privacy policy</a> and consent to being contacted by Sten Technologies.
                      </label>
                    </div>

                    <div className="text-center">
                      <button type="submit" className="btn btn-primary btn-lg">Send Message</button>
                    </div>

                    <div className="alert-msg mt-4" id="message"></div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ContactPage;