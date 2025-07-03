import React from 'react';
import './LaptopRepair.css'; // Import the CSS file for styling

const LaptopRepair = () => {
  const laptopBrands = [
    {
      id: "SG001",
      name: "Acer",
      image: "/images/Acer laptop.jpeg",
      alt: "Acer Laptop",
      link: "/pages/Services/accer-repair-price.html"
    },
    {
      id: "SG002",
      name: "Dell",
      image: "/images/Dell Laptop.jpg",
      alt: "Dell Laptop",
      link: "/pages/Services/dell-repair-price.html"
    },
    {
      id: "SG003",
      name: "Asus",
      image: "/images/Asus Laptop.jpg",
      alt: "Asus Laptop",
      link: "/pages/Services/asus-repair-price.html"
    },
    {
      id: "SG004",
      name: "HP",
      image: "/images/hp laptop.jpeg",
      alt: "HP Laptop",
      link: "/pages/Services/hp-repair-price.html"
    },
    {
      id: "SG005",
      name: "Lenovo",
      image: "/images/Lenovo Laptop.png",
      alt: "Lenovo Laptop",
      link: "/pages/Services/lenovo-repair-price.html"
    },
    {
      id: "SG006",
      name: "Microsoft",
      image: "/images/microsoft Laptop.webp",
      alt: "Microsoft Laptop",
      link: "/pages/Services/microsoft-repair-price.html"
    },
    {
      id: "SG_MSI",
      name: "MSI",
      image: "/images/msi laptop.png",
      alt: "MSI Laptop",
      link: "/pages/Services/msi-repair-price.html"
    },
    {
      id: "SG_Apple",
      name: "Apple",
      image: "/images/apple_Laptop.webp",
      alt: "Apple Laptop",
      link: "/pages/Services/apple-repair-price.html"
    },
    {
      id: "SG007",
      name: "Razer",
      image: "/images/Razer Laptop.png",
      alt: "Razer Laptop",
      link: "/pages/Services/raizer-repair-price.html"
    },
    {
      id: "SG_Samsung",
      name: "Samsung",
      image: "/images/Samsung-Logo-1024x576.png",
      alt: "Samsung",
      link: "/pages/Services/samsung-repair-price.html"
    },
    {
      id: "SG_Huawei",
      name: "Huawei",
      image: "/images/Huawei-Logo.png",
      alt: "Huawei",
      link: "/pages/Services/huawei-repair-price.html"
    },
    {
      id: "SG_Alienware",
      name: "Alienware",
      image: "/images/Alienware laptop.jpeg",
      alt: "Alienware",
      link: "/pages/Services/alienware-repair-price.html"
    }
  ];

  const styles = {
    // Core Layout
    coreLayout: {
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      paddingTop: '2rem',
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#f4f4f4'
    },
    coreLayoutViewport: {
      flex: 1,
      padding: '2rem 0',
      maxWidth: '1200px',
      margin: '0 auto',
      width: '100%'
    },
    productSelector: {
      padding: '0 20px'
    },
    contentArea: {
      background: '#ffffff',
      borderRadius: '20px',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
      padding: '3rem 2rem',
      margin: '2rem 0'
    },
    
    // Headings
    productSelectorHeading: {
      fontSize: '3rem',
      fontWeight: '700',
      color: '#2c3e50',
      marginBottom: '2.5rem',
      lineHeight: '1.2',
      textAlign: 'center'
    },
    headingSpan: {
      background: 'linear-gradient(135deg, #2ca19c 0%, #238f89 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text'
    },
    deviceHeading: {
      fontSize: '1.5rem',
      fontWeight: '600',
      color: '#495057',
      marginBottom: '2rem',
      textAlign: 'center'
    },
    
    // Grid Layout
    deviceList: {
      marginTop: '2rem'
    },
    gridContainer: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '1.5rem',
      listStyle: 'none',
      padding: '0',
      margin: '0'
    },
    
    // Card Styling
    deviceCard: {
      background: '#ffffff',
      border: '2px solid #e9ecef',
      borderRadius: '16px',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
      overflow: 'hidden',
      textDecoration: 'none',
      color: 'inherit',
      display: 'block'
    },
    detailsContainer: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-start',
      padding: '2rem 1.5rem'
    },
    leftCol: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      gap: '1rem'
    },
    deviceImage: {
      width: '48px',
      height: '48px',
      objectFit: 'contain',
      transition: 'transform 0.3s ease',
      filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1))'
    },
    deviceTitle: {
      fontSize: '1rem',
      fontWeight: '600',
      color: '#2c3e50',
      textAlign: 'left',
      margin: '0',
      transition: 'color 0.3s ease'
    }
  };

  // Hover effects through event handlers
  const handleMouseEnter = (e) => {
    const card = e.currentTarget;
    const image = card.querySelector('.device-image');
    const title = card.querySelector('.device-title');
    
    card.style.borderColor = '#2ca19c';
    card.style.transform = 'translateY(-4px)';
    card.style.boxShadow = '0 8px 25px rgba(44, 161, 156, 0.15)';
    
    if (image) image.style.transform = 'scale(1.1)';
    if (title) title.style.color = '#2ca19c';
  };

  const handleMouseLeave = (e) => {
    const card = e.currentTarget;
    const image = card.querySelector('.device-image');
    const title = card.querySelector('.device-title');
    
    card.style.borderColor = '#e9ecef';
    card.style.transform = 'translateY(0)';
    card.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.05)';
    
    if (image) image.style.transform = 'scale(1)';
    if (title) title.style.color = '#2c3e50';
  };

  return (
    <div style={styles.coreLayout}>
      <main style={styles.coreLayoutViewport}>
        <div style={styles.productSelector}>
          <div style={styles.contentArea}>
            <h1 tabIndex="-1" style={styles.productSelectorHeading}>
              <span style={styles.headingSpan}>What do you need help with?</span>
            </h1>
            <div style={styles.deviceList}>
              <h2 style={styles.deviceHeading}>
                <span>Select Your Laptop Brand</span>
              </h2>
              <ul
  style={styles.gridContainer}
  data-testid="all-products-list"
>
  {laptopBrands.map((brand) => (
    <li key={brand.id}>
      <a
        href={brand.link}
        style={styles.deviceCard}
        aria-label={`Select ${brand.name}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onFocus={(e) => {
          e.currentTarget.style.outline = '3px solid rgba(44, 161, 156, 0.3)';
          e.currentTarget.style.outlineOffset = '2px';
        }}
        onBlur={(e) => {
          e.currentTarget.style.outline = 'none';
        }}
      >
        <div style={styles.detailsContainer}>
          <div style={styles.leftCol}>
            <img
              alt={brand.alt}
              className="device-image"
              role="presentation"
              src={brand.image}
              style={styles.deviceImage}
              width="48"
              height="48"
            />
            <span className="device-title" style={styles.deviceTitle}>
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
      
      <style jsx>{`
        @media (max-width: 991.98px) {
          .core-layout .content-area {
            padding: 2rem 1.5rem !important;
            margin: 1rem 0 !important;
            
          }
          .core-layout h1 {
            font-size: 2.5rem !important;
          }
          .grid-container {
            grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)) !important;
          }
        }

        @media (max-width: 767.98px) {
          .core-layout h1 {
            font-size: 2rem !important;
            margin-bottom: 2rem !important;
          }
          .core-layout h2 {
            font-size: 1.25rem !important;
            margin-bottom: 1.5rem !important;
          }
          .core-layout .content-area {
            padding: 1.5rem 1rem !important;
            border-radius: 15px !important;
          }
          .core-layout .details-container {
            padding: 1.5rem 1rem !important;
          }
          .core-layout .device-image {
            width: 40px !important;
            height: 40px !important;
          }
          .core-layout .device-title {
            font-size: 0.9rem !important;
          }
          .grid-container {
            grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)) !important;
          }
        }

        @media (max-width: 575.98px) {
          .core-layout {
            padding-top: 1rem !important;
          }
          .core-layout .product-selector {
            padding: 0 10px !important;
          }
          .core-layout h1 {
            font-size: 1.75rem !important;
          }
          .core-layout .content-area {
            padding: 1.25rem 0.75rem !important;
            margin: 0.5rem 0 !important;
          }
          .core-layout .details-container {
            padding: 1.25rem 0.75rem !important;
          }
          .core-layout .device-image {
            width: 36px !important;
            height: 36px !important;
          }
          .core-layout .device-title {
            font-size: 0.85rem !important;
          }
          .grid-container {
            grid-template-columns: 1fr !important;
            gap: 20px !important;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .core-layout * {
            transition: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default LaptopRepair;