import React from 'react';
import './SupplyStoreSection.css'; // Import the CSS file for styling

const SupplyStoreSection = () => {
  return (
    <div className="row align-items-center">
      <div className="col-md-12 text-center">
        <h3 className="section-title">
          Components and Equipment{' '}
          <a href="/shop.html" className="store-link">
            <span className="text-inf">Store</span>
          </a>
        </h3>
        <p className="sub-heading">
          Discover our range of accessories and replacement parts. We provide high-quality products designed to meet your needs.
        </p>
        <span className="line mx-auto"></span>
      </div>
    </div>
  );
};

export default SupplyStoreSection;