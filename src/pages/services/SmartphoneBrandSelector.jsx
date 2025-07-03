import React from 'react';
import './SmartphoneBrandSelector.css'; // Import the CSS file for styling

const SmartphoneBrandSelector = () => {
  const brands = [
    {
      id: 'SG001',
      name: 'iPhone',
      image: '/images/iphone.webp',
      alt: 'iPhone Device',
      link: '/iphonePricing.html'
    },
    {
      id: 'SG002',
      name: 'Huawei',
      image: '/images/Huawei.png',
      alt: 'Huawei Device',
      link: '/HauweiPricing.html'
    },
    {
      id: 'SG003',
      name: 'Samsung',
      image: '/images/samsung.jpeg',
      alt: 'Samsung Device',
      link: '/samsungPricing.html'
    },
    {
      id: 'SG004',
      name: 'Xiaomi',
      image: '/images/Xiaomi.png',
      alt: 'Xiaomi Device',
      link: '#'
    },
    {
      id: 'SG005',
      name: 'Hisense',
      image: '/images/Hisense.webp',
      alt: 'Hisense Device',
      link: '#'
    },
    {
      id: 'SG006',
      name: 'OPPO',
      image: '/images/oppo.png',
      alt: 'OPPO Device',
      link: '#'
    },
    {
      id: 'SG007',
      name: 'Honor',
      image: '/images/honor.webp',
      alt: 'Honor Device',
      link: '#'
    },
    {
      id: 'SG008',
      name: 'Tecno',
      image: '/images/tecno.jpg',
      alt: 'Tecno Device',
      link: '#'
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
                <span>Select your smartphone brand</span>
              </h2>
             <ul
  className="row-alternative"
  id="allbrands"
  data-testid="all-brands-list"
>
  {brands.map((brand) => (
    <li
      key={brand.id}
      className="form-selector"
    >
      <a 
        href={brand.link} 
        className="unsigned-more-product-card device-link"
        aria-label={`Select ${brand.name}`}
        id={brand.id}
      >
        <div className="details-container">
          <div className="form-selector-left-col">
            <img
              alt={brand.alt}
              className="device-image"
              role="presentation"
              src={brand.image}
              width="42"
              height="42"
              onError={(e) => {
                e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yNCAzNkMzMC42Mjc0IDM2IDM2IDMwLjYyNzQgMzYgMjRDMzYgMTcuMzcyNiAzMC42Mjc0IDEyIDI0IDEyQzE3LjM3MjYgMTIgMTIgMTcuMzcyNiAxMiAyNEMxMiAzMC42Mjc0IDE3LjM3MjYgMzYgMjQgMzZaIiBzdHJva2U9IiM5Q0EzQUYiIHN0cm9rZS13aWR0aD0iMiIvPgo8L3N2Zz4K';
              }}
            />
            <span className="form-selector-title product-form-selector-title">
              {brand.name}
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

export default SmartphoneBrandSelector;