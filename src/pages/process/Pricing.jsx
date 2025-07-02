// src/pages/Pricing.js
import React from 'react';
import  './Pricing.css'// Create and move your styles there or use CSS-in-JS

const Pricing = () => {
  return (
    <div className="content">
      <div
        className="service-description"
        style={{ position: 'relative', textAlign: 'center' }}
      >
        <h2 className="gradient-text">Repair Pricing</h2>
        <p>
          We provide top-notch repair services for a variety of electronic devices. Our pricing is transparent,
          competitive, and designed to give you the best value for your money. Whether you have an iPhone, Samsung,
          Huawei, or any other brand, we've got you covered. Select your device brand below to view specific pricing
          details.
        </p>
      </div>

      <p style={{ textAlign: 'center', marginTop: 20 }}>
        <span
          style={{
            fontSize: '20px',
            fontFamily: 'Roboto, sans-serif',
            fontWeight: 400,
          }}
        >
          To view our repair <strong className="gradient-text">pricing</strong>, please select your brand below:
        </span>
      </p>

      <div className="image-card-rail">
        <div className="image-card-slide">
          {[
            { src: '/images/repairs-apple-icon.webp', href: '/iphonePricing.html', label: 'Apple' },
            { src: '/images/repairs-samsung-icon.webp', href: '/samsungPricing.html', label: 'Samsung' },
            { src: '/images/repairs-huawei-icon.webp', href: '/HauweiPricing.html', label: 'Huawei' },
            { src: '/images/repairs-hisense-icon.webp', href: '#', label: 'Hisense' },
            { src: '/images/repairs-vivo-icon.webp', href: '#', label: 'Vivo' },
            { src: '/images/repairs-xiaomi-icon.webp', href: '#', label: 'Xiaomi' },
            { src: '/images/repairs-oppo-icon.webp', href: '#', label: 'Oppo' },
            { src: '/images/repairs-nokia-icon.webp', href: '#', label: 'Nokia' },
            { src: '/images/repairs-honor-icon.webp', href: '#', label: 'Honor' },
          ].map((brand, index) => (
            <div className="image-card" key={index}>
              <img src={brand.src} alt={`View ${brand.label} pricing`} title={`View ${brand.label} pricing`} />
              <a href={brand.href}>View {brand.label} pricing</a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Pricing;
