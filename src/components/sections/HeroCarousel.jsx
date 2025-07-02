import React from 'react';

import './HeroCarousel.css';

const HeroCarousel = () => {
  const slides = [
    {
      id: 1,
       title: 'StenTech',
      subtitle: 'Professional repair services for all your devices - smartphones, tablets, laptops & computers.',
      btnText: 'Book a Repair',
      btnLink: 'book-repair',
      align: 'text-start',
      bg: '/images/bg.webp',
    },
    {
      id: 2,
      title: 'Fast & Reliable Service',
      subtitle: 'Quality repairs with genuine parts and a focus on efficiency and reliability.',
      btnText: 'Get a Quote',
      btnLink: '/book-repair',
      align: 'text-center',
      bg: '/images/apple-products-img.webp',
    },
    {
      id: 3,
      title: 'Trusted By Many',
      subtitle: 'Join our satisfied customers and experience our exceptional service firsthand.',
      btnText: 'See What Our Customers Say',
      btnLink: '/testimonials',
      align: 'text-end',
      bg: '/images/Cellphone-Repair-Centre.webp',
    },
  ];

  return (
    <div
      id="myCarousel"
      className="carousel slide carousel-fade"
      data-bs-ride="carousel"
      data-bs-interval="5000"
    >
      <div className="carousel-indicators">
        {slides.map((_, i) => (
          <button
            key={i}
            type="button"
            data-bs-target="#myCarousel"
            data-bs-slide-to={i}
            className={i === 0 ? 'active' : ''}
            aria-label={`Slide ${i + 1}`}
            aria-current={i === 0 ? 'true' : undefined}
          ></button>
        ))}
      </div>

      <div className="carousel-inner">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`carousel-item ${index === 0 ? 'active' : ''}`}
            style={{
              backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url(${slide.bg})`,
            }}
          >
            <div className="container">
              <div className={`carousel-caption ${slide.align}`}>
                <h1>{slide.title}</h1>
                <p>{slide.subtitle}</p>
                <a href={slide.btnLink} className="btn" target="_blank" rel="noopener noreferrer">
                  {slide.btnText}
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button className="carousel-control-prev" type="button" data-bs-target="#myCarousel" data-bs-slide="prev">
        <span className="carousel-control-prev-icon" aria-hidden="true"></span>
        <span className="visually-hidden">Previous</span>
      </button>

      <button className="carousel-control-next" type="button" data-bs-target="#myCarousel" data-bs-slide="next">
        <span className="carousel-control-next-icon" aria-hidden="true"></span>
        <span className="visually-hidden">Next</span>
      </button>
    </div>
  );
};

export default HeroCarousel;
