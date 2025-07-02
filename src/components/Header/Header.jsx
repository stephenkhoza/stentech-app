import React, { useState, useEffect } from 'react';
import './Header.css';

import { 
  FiChevronDown as ChevronDown, 
  FiPhone as Phone, 
  FiMail as Mail,
  FiMapPin as MapPin, 
  FiClock as Clock, 
  FiMenu as Menu, 
  FiX as X,
  FiUser as User,
  FiShoppingCart as ShoppingCart
} from 'react-icons/fi';
import { 
  FaFacebook as Facebook, 
  FaInstagram as Instagram,
  FaYoutube as Youtube, 
  FaLinkedin as Linkedin,
  FaWhatsapp 
} from 'react-icons/fa';
import { Link } from 'react-router-dom';

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState(null);
  const [headerScrolled, setHeaderScrolled] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleScroll = () => setHeaderScrolled(window.scrollY > 50);
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    
    handleResize(); // Check initial size
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
    setActiveSubmenu(null);
    document.body.classList.toggle('mobile-menu-open', !mobileMenuOpen);
  };

  const toggleSubmenu = (index) => {
    setActiveSubmenu(activeSubmenu === index ? null : index);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
    setActiveSubmenu(null);
    document.body.classList.remove('mobile-menu-open');
  };

  return (
    <>
      <header className={`header ${headerScrolled ? 'scrolled' : ''}`}>
        {/* Top Bar - Hidden on mobile phones (below 768px) */}
        {!isMobile && (
          <div className="top-bar">
            <div className="container mx-auto px-4 py-1">
              <div className="top-bar-content">
                <div className="top-bar-left">
                  <div className="contact-info">
                    <Phone className="w-3.5 h-3.5" />
                    <a href="tel:+27735270565" className="hover:text-teal-200">+27 73 527 0565</a>
                  </div>
                  <span className="divider">|</span>
                  <div className="contact-info">
                    <Mail className="w-3.5 h-3.5" />
                    <a href="mailto:info@stentech.co.za" className="hover:text-teal-200">info@stentech.co.za</a>
                  </div>
                  <span className="divider">|</span>
                  <div className="contact-info">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>2 Aubrey Matlakala St, Pretoria, 0152</span>
                  </div>
                  <span className="divider">|</span>
                  <div className="contact-info">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Mon - Fri: 8:00 - 17:00</span>
                  </div>
                </div>

                <div className="social-icons">
                  <a href="https://www.facebook.com/profile.php?id=100066367132737" target="_blank" rel="noreferrer" className="social-icon">
                    <Facebook className="w-4 h-4" />
                  </a>
                  <a href="https://www.instagram.com/stentech_1" target="_blank" rel="noreferrer" className="social-icon">
                    <Instagram className="w-4 h-4" />
                  </a>
                  <a href="https://www.youtube.com/@StenTech-channel" target="_blank" rel="noreferrer" className="social-icon">
                    <Youtube className="w-4 h-4" />
                  </a>
                  <a href="https://www.linkedin.com" target="_blank" rel="noreferrer" className="social-icon">
                    <Linkedin className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Navigation */}
        <div className="main-nav">
          <div className="container mx-auto px-4 py-2">
            <div className="main-nav-content">
              {/* Logo - Always visible */}
              <div className="logo-container">
                <Link to="/">
                  <img 
                    src="images/StenTech_logo.png" 
                    alt="StenTech Logo" 
                    className="logo"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.parentNode.innerHTML = '<span class="text-2xl font-bold text-teal-600">StenTech</span>';
                    }}
                  />
                </Link>
              </div>

              {/* Desktop Navigation - Hidden on mobile and tablet */}
              <nav className="desktop-nav">
                <Link to="/" className="nav-link">Home</Link>

                <div className="nav-item">
                  <button className="nav-link">
                    Services <ChevronDown className="w-4 h-4" />
                  </button>
                  <div className="dropdown">
                    <Link to="/iDeviceRepairs" className="dropdown-item">iPhone & iPad Repair</Link>
                    <Link to="/CellphoneRepair" className="dropdown-item">Smartphone & Android Repair</Link>
                    <Link to="/LaptopRepair" className="dropdown-item">Laptop Repair</Link>
                    <Link to="/ComputerRepair" className="dropdown-item">Computer Repair</Link>
                  </div>
                </div>

                <div className="nav-item">
                  <button className="nav-link">
                    Repair Process <ChevronDown className="w-4 h-4" />
                  </button>
                  <div className="dropdown">
                    <Link to="/book-repair" className="dropdown-item">Book a Repair</Link>
                    <Link to="/collectDeliver" className="dropdown-item">Collect & Deliver Service</Link>
                    <Link to="/pricing" className="dropdown-item">Repair Pricing</Link>
                    <Link to="/track-repair" className="dropdown-item">Track Your Repair</Link>
                  </div>
                </div>

                <div className="nav-item">
                  <button className="nav-link">
                    Company <ChevronDown className="w-4 h-4" />
                  </button>
                  <div className="dropdown">
                    <Link to="/about" className="dropdown-item">About StenTech</Link>
                    <Link to="/why-choose-us" className="dropdown-item">Why Choose Us</Link>
                    <Link to="/testimonials" className="dropdown-item">Customer Reviews</Link>
                    <Link to="/careers" className="dropdown-item">Careers</Link>
                  </div>
                </div>

                <Link to="/shop" className="nav-link">
                  <ShoppingCart className="w-4 h-4" /> Shop
                </Link>
                <Link to="/contact" className="nav-link">Contact</Link>
              </nav>

              {/* Header Actions */}
              <div className="header-actions">
                <a href="https://api.whatsapp.com/send?phone=+27735270565" target="_blank" rel="noreferrer" className="whatsapp-btn">
                  <FaWhatsapp className="w-4 h-4" />
                  <span className="hidden xl:inline">WhatsApp</span>
                </a>
                <Link to="/signin" className="nav-link">
                  <User className="w-4 h-4" />
                  <span className="hidden xl:inline">Sign In</span>
                </Link>
                <Link to="/book-repair" className="cta-button">Book a Repair</Link>

                {/* Mobile Menu Button - Shown on mobile and tablet */}
                <button 
                  onClick={toggleMobileMenu} 
                  className="mobile-menu-btn" 
                  aria-label="Toggle mobile menu"
                >
                  {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Menu - Shown when menu is open */}
        {mobileMenuOpen && (
          <div className="mobile-menu-container">
            <div className="container mx-auto px-4 py-4">
              <div className="mobile-nav-item">
                <Link to="/" className="mobile-nav-link" onClick={closeMobileMenu}>
                  Home
                </Link>
              </div>

              {/* Services Submenu */}
              <div className="mobile-nav-item">
                <button onClick={() => toggleSubmenu(0)} className="mobile-nav-link">
                  <span>Services</span>
                  <ChevronDown className={`w-4 h-4 chevron-icon ${activeSubmenu === 0 ? 'rotated' : ''}`} />
                </button>
                {activeSubmenu === 0 && (
                  <div className="mobile-submenu">
                    <div className="mobile-submenu-item">
                      <Link to="/iDeviceRepairs" className="mobile-submenu-link" onClick={closeMobileMenu}>
                        iPhone & iPad Repair
                      </Link>
                    </div>
                    <div className="mobile-submenu-item">
                      <Link to="/CellphoneRepair" className="mobile-submenu-link" onClick={closeMobileMenu}>
                        Smartphone & Android Repair
                      </Link>
                    </div>
                    <div className="mobile-submenu-item">
                      <Link to="/LaptopRepair" className="mobile-submenu-link" onClick={closeMobileMenu}>
                        Laptop Repair
                      </Link>
                    </div>
                    <div className="mobile-submenu-item">
                      <Link to="/ComputerRepair" className="mobile-submenu-link" onClick={closeMobileMenu}>
                        Computer Repair
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* Repair Process Submenu */}
              <div className="mobile-nav-item">
                <button onClick={() => toggleSubmenu(1)} className="mobile-nav-link">
                  <span>Repair Process</span>
                  <ChevronDown className={`w-4 h-4 chevron-icon ${activeSubmenu === 1 ? 'rotated' : ''}`} />
                </button>
                {activeSubmenu === 1 && (
                  <div className="mobile-submenu">
                    <div className="mobile-submenu-item">
                      <Link to="/book-repair" className="mobile-submenu-link" onClick={closeMobileMenu}>
                        Book a Repair
                      </Link>
                    </div>
                    <div className="mobile-submenu-item">
                      <Link to="/collectDeliver" className="mobile-submenu-link" onClick={closeMobileMenu}>
                        Collect & Deliver Service
                      </Link>
                    </div>
                    <div className="mobile-submenu-item">
                      <Link to="/pricing" className="mobile-submenu-link" onClick={closeMobileMenu}>
                        Repair Pricing
                      </Link>
                    </div>
                    <div className="mobile-submenu-item">
                      <Link to="/track-repair" className="mobile-submenu-link" onClick={closeMobileMenu}>
                        Track Your Repair
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* Company Submenu */}
              <div className="mobile-nav-item">
                <button onClick={() => toggleSubmenu(2)} className="mobile-nav-link">
                  <span>Company</span>
                  <ChevronDown className={`w-4 h-4 chevron-icon ${activeSubmenu === 2 ? 'rotated' : ''}`} />
                </button>
                {activeSubmenu === 2 && (
                  <div className="mobile-submenu">
                    <div className="mobile-submenu-item">
                      <Link to="/about" className="mobile-submenu-link" onClick={closeMobileMenu}>
                        About StenTech
                      </Link>
                    </div>
                    <div className="mobile-submenu-item">
                      <Link to="/why-choose-us" className="mobile-submenu-link" onClick={closeMobileMenu}>
                        Why Choose Us
                      </Link>
                    </div>
                    <div className="mobile-submenu-item">
                      <Link to="/testimonials" className="mobile-submenu-link" onClick={closeMobileMenu}>
                        Customer Reviews
                      </Link>
                    </div>
                    <div className="mobile-submenu-item">
                      <Link to="/careers" className="mobile-submenu-link" onClick={closeMobileMenu}>
                        Careers
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              <div className="mobile-nav-item">
                <Link to="/contact" className="mobile-nav-link" onClick={closeMobileMenu}>
                  Contact
                </Link>
              </div>

              <div className="mobile-nav-item">
                <Link to="/shop" className="mobile-nav-link" onClick={closeMobileMenu}>
                  <ShoppingCart className="w-4 h-4" />
                  <span>Shop</span>
                </Link>
              </div>

              <div className="mobile-nav-item">
                <Link to="/signin" className="mobile-nav-link" onClick={closeMobileMenu}>
                  <User className="w-4 h-4" />
                  <span>Sign In</span>
                </Link>
              </div>

              {/* Mobile Action Buttons */}
              <div className="mobile-actions">
                <a 
                  href="https://api.whatsapp.com/send?phone=+27735270565" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="whatsapp-btn mobile-action-btn" 
                  onClick={closeMobileMenu}
                >
                  <FaWhatsapp className="w-4 h-4" />
                  <span>WhatsApp</span>
                </a>
                <Link 
                  to="/book-repair" 
                  className="cta-button mobile-action-btn" 
                  onClick={closeMobileMenu}
                >
                  Book a Repair
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>
      
      {/* Header Spacer */}
      <div className="header-spacer"></div>
    </>
  );
};

export default Header;