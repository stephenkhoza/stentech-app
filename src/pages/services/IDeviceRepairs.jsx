import React from 'react';
import './IDeviceRepairs.css'; // Import the CSS file for styling

const IDeviceRepairs = () => {
  const devices = [
    {
      id: "SG001",
      name: "Mac",
      image: "/images/mac.jpg",
      alt: "Mac Device",
      link: "/pages/Services/apple-repair-price.html"
    },
    {
      id: "SG003",
      name: "iPhone",
      image: "/images/iphone.webp",
      alt: "iPhone Device",
      link: "/iphonePricing.html"
    },
    {
      id: "SG004",
      name: "iPad",
      image: "/images/ipad.webp",
      alt: "iPad Device",
      link: "/pages/Services/ipad-price.html"
    },
    {
      id: "SG008",
      name: "Apple Watch",
      image: "/images/apple_watch.jpg",
      alt: "Apple Watch Device",
      link: "/pages/Services/apple-watch-price.html"
    }
  ];

  return (
    <div className="text-center core-layout">
      <main className="core-layout__viewport">
        <div className="product-selector">
          <div className="content-area">
            <h1 tabIndex="-1" className="product-selector-heading">
              <span>What do you need help with?</span>
            </h1>
            <div className="device-list">
              <h2 className="device-heading">
                <span>Select your iDevice</span>
              </h2>
              <ul
                className="row-alternative"
                id="allproducts"
                data-testid="all-products-list"
              >
                {devices.map((device) => (
                  <li key={device.id} className="form-selector">
                    <a 
                      href={device.link} 
                      className="unsigned-more-product-card device-link"
                      aria-label={`Select ${device.name}`}
                      id={device.id}
                    >
                      <div className="details-container">
                        <div className="form-selector-left-col">
                          <img
                            alt={device.alt}
                            className="device-image"
                            role="presentation"
                            src={device.image}
                            width="42"
                            height="42"
                          />
                          <span className="form-selector-title product-form-selector-title">
                            {device.name}
                          </span>
                        </div>
                      </div>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default IDeviceRepairs;
