import React, { useState, useEffect } from 'react';
import './StatsSection.css'; // Import the CSS file

const StatsSection = () => {
  const [isVisible, setIsVisible] = useState(false);

  const stats = [
    {
      number: '3000+',
      label: 'Repairs Completed',
      delay: 100
    },
    {
      number: '98%',
      label: 'Customer Satisfaction',
      delay: 200
    },
    {
      number: '5+',
      label: 'Years Experience',
      delay: 300
    },
    {
      number: '24/7',
      label: 'Technical Support',
      delay: 400
    }
  ];

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <section className="stats-section">
      <div className="stats-container">
        <div className="stats-grid">
          {stats.map((stat, index) => (
            <div 
              key={index}
              className={`stat-item ${
                isVisible ? 'animate-fade-in' : 'hidden'
              }`}
              style={{ animationDelay: `${stat.delay}ms` }}
            >
              <div className="stat-number">
                {stat.number}
              </div>
              <div className="stat-label">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;