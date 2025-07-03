import React, { useState, useEffect } from 'react';
import './CollectAndDeliver.css';

const CollectAndDeliver = () => {
  const [trackingInput, setTrackingInput] = useState('');

  useEffect(() => {
    const handleScroll = () => {
      const elements = document.querySelectorAll('.fade-in-element');
      elements.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        const elementBottom = element.getBoundingClientRect().bottom;
        if (elementTop < window.innerHeight && elementBottom > 0) {
          element.classList.add('animate-fade-in');
        }
      });
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Trigger on initial load
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const trackRepair = () => {
    if (trackingInput.trim()) {
      alert(`Tracking repair for ID: ${trackingInput}`);
    } else {
      alert('Please enter a tracking ID');
    }
  };

  const stepData = [
    {
      icon: '📋',
      number: 'STEP 1',
      title: 'Book a Collection',
      description:
        "Complete our online booking form with your device details and collection address. We'll contact you to confirm the collection time and provide a quote for the repair.",
      note: 'Usually within 1–2 business hours',
    },
    {
      icon: '🚛',
      number: 'STEP 2',
      title: 'We Collect Your Device',
      description:
        'Our technician will arrive at your location to collect your device. We follow strict safety protocols and provide a receipt for your device.',
      note: 'Same-day or next-day collection available',
    },
    {
      icon: '🔧',
      number: 'STEP 3',
      title: 'Expert Repair',
      description:
        "Our certified technicians diagnose and repair your device in our state-of-the-art facility. We'll keep you updated throughout the repair process.",
      note: 'Most repairs completed within 24–48 hours',
    },
    {
      icon: '🚚',
      number: 'STEP 4',
      title: 'We Deliver Your Device',
      description:
        "Once your device is repaired, we'll deliver it back to your doorstep. Our technician will demonstrate that the issue has been resolved.",
      note: 'All repairs come with a 90-day warranty',
    },
  ];

  return (
    <div className="font-sans leading-relaxed text-gray-800 w-full">
      {/* Hero Section */}
      <section className="hero-gradient text-white pt-32 px-4 pb-20 fade-in-element">
  <div className="hero-content text-center flex flex-col items-center justify-center max-w-3xl mx-auto">
    <h1 className="text-3xl sm:text-5xl font-bold mb-6 leading-snug">
      <span>Collected.</span> <span>Repaired.</span> <span>Delivered.</span>
    </h1>
    <p className="text-base sm:text-lg mb-6 max-w-xl">
      We'll pick up your device from your doorstep, repair it professionally,
      and deliver it back to you. No hassle, no waiting – just premium service.
    </p>
    <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center">
      <a
        href="https://stentech.co.za/book-a-repair"
        target="_blank"
        rel="noopener noreferrer"
        className="cta-button py-3 px-4 text-base font-semibold sm:w-auto text-center"
      >
        Book a Collection
      </a>
      <a
        href="tel:+27735270565"
        className="bg-transparent hover:bg-white/10 text-white font-semibold py-3 px-4 text-base border-2 border-white transition-colors sm:w-auto text-center"
      >
        Call Us Now
      </a>
    </div>
    <div className="info-banner mt-6 text-sm w-full max-w-xs text-center">
      ℹ️ Need to schedule a device repair?{' '}
      <a href="https://stentech.co.za/book-a-repair" target="_blank" className="text-green-300 underline" rel="noreferrer">
        Click here
      </a>{' '}
      →
    </div>
  </div>
</section>


   <section className="py-24 px-4 bg-slate-50">
  <div className="max-w-6xl mx-auto">
    <h2 className="text-center text-4xl font-bold mb-16 text-gray-800 section-title fade-in-element">
      How It Works
    </h2>

    <div className="grid grid-cols-2 gap-8">
      {stepData.map((step, index) => (
        <div
          key={index}
          className="step-card fade-in-element"
          style={{ transitionDelay: `${index * 100}ms` }}
        >
          <div className="step-icon">{step.icon}</div>
          <div className="text-blue-500 font-bold text-sm mb-3 uppercase tracking-wider">
            {step.number}
          </div>
          <h3 className="text-2xl font-bold mb-4 text-gray-800">{step.title}</h3>
          <p className="text-gray-600 mb-5">{step.description}</p>
          <div className="text-green-500 font-semibold text-sm">{step.note}</div>
        </div>
      ))}
    </div>
  </div>
</section>



      {/* Track Section */}
      <section className="track-section py-16 px-4 text-white text-center">
        <h2 className="text-3xl font-bold mb-6 fade-in-element">Track Your Repair</h2>
        <div className="max-w-md mx-auto  gap-4 fade-in-element">
          
          <input
            type="text"
            className="track-input mb-4"
            placeholder="Enter Repair Tracking ID"
            value={trackingInput}
            onChange={(e) => setTrackingInput(e.target.value)}
          />
          <button onClick={trackRepair} className="track-button">
            Track Repair Status
          </button>
          <p className="mt-4 text-gray-300 text-sm">
            Need help? Call{' '}
            <a href="tel:+27735270565" className="text-green-300">
              073 527 0565
            </a>
          </p>
        </div>
      </section>
    </div>
  );
};

export default CollectAndDeliver;
