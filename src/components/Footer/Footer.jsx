import React from "react";
import { 
  FaFacebook as Facebook, 
  FaInstagram as Instagram,
  FaYoutube as Youtube, 
  FaLinkedin as Linkedin,
  FaWhatsapp,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaClock
} from 'react-icons/fa';
import "./Footer.css";

const Footer = () => {
  return (
    <footer>
      <section className="top">
        <ul className="footer-columns">
          <li>
            <img src="/images/footer_logo.png" alt="StenTech Logo" width={120} height={40}/>
            <div className="footer-intro">
              <p>No matter the issue, we've got a solution</p>
            </div>
            <div className="social-icons footer-social">
              <a
                href="https://www.facebook.com/profile.php?id=100066367132737"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
              >
                <Facebook />
              </a>
              <a
                href="https://www.instagram.com/stentech_1?igsh=MW9rNWRpNTR2MTgwaQ=="
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
              >
                <Instagram />
              </a>
              <a
                href="https://www.youtube.com/@StenTech-channel"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
              >
                <Youtube />
              </a>
              <a
                href="https://www.linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
              >
                <Linkedin />
              </a>
            </div>
          </li>

          <li>
            <h3>Quick Links</h3>
            <ul>
              <li><a href="/">Home</a></li>
              <li><a href="/aboutUs">About Us</a></li>
              <li><a href="/shop">Shop</a></li>
              <li><a href="/track-repair">Track Your Repair</a></li>
              <li><a href="/contact">Contact Us</a></li>
            </ul>
          </li>

          <li>
            <h3>Repair Services</h3>
            <ul>
              <li><a href="/iDeviceRepairs">iPhone & iPad Repair</a></li>
              <li><a href="/CellphoneRepair">Smartphone Repair</a></li>
              <li><a href="/LaptopRepair">Laptop Repair</a></li>
              <li><a href="/computer-repair">Computer Repair</a></li>
            </ul>
          </li>

          <li>
            <h3>Get In Touch</h3>
            <ul>
              <li>
                <a href="tel:+27735270565">
                  <FaPhone className="icon-color" /> +27 73 527 0565
                </a>
              </li>
              <li>
                <a href="mailto:info@stentech.co.za">
                  <FaEnvelope className="icon-color" /> info@stentech.co.za
                </a>
              </li>
              <li>
                <a
                  href="https://maps.app.goo.gl/RJBV7MQ1A1A2MGaE6"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FaMapMarkerAlt className="icon-color" /> 2 Aubrey Matlakala St, Pretoria, 0152
                </a>
              </li>
              <li>
                <span>
                  <FaClock className="icon-color" /> Mon - Fri: 8:00 - 17:00
                </span>
              </li>
            </ul>
          </li>
        </ul>
      </section>

      <section className="bottom">
        <div>
          <span>
            &copy; {new Date().getFullYear()} Sten Technologies. All rights reserved. | Developed and Powered by{" "}
            <a href="https://www.dev.stentech.co.za/" target="_blank" rel="noopener noreferrer">
              StenTech (Pty) Ltd
            </a>.
          </span>
          <span className="footer-links">
            <a href="/privacy-policy">Privacy Policy</a> |{" "}
            <a href="/terms-of-service">Terms of Service</a>
          </span>
        </div>
      </section>
    </footer>
  );
};

export default Footer;