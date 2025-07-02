import React, { useState } from 'react';
import './TrackRepair.css';

const TrackRepair = () => {
  const [showStatus, setShowStatus] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // You can add API logic here to fetch real tracking info
    setShowStatus(true);
  };

  return (
    <>
      {/* Page Banner */}
      <section className="page-banner">
        <div className="container text-center">
          <h1>Track Your Repair</h1>
          <p className="lead">Stay updated on the status of your device repair</p>
        </div>
      </section>

      {/* Tracking Section */}
      <section className="tracking-section">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-6 col-md-8">
              <div className="tracking-form">
                <h3 className="text-center">Enter Your Repair Details</h3>
                <form id="repair-tracking-form" onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label htmlFor="tracking-number" className="form-label">Repair Tracking Number</label>
                    <input
                      type="text"
                      className="form-control"
                      id="tracking-number"
                      placeholder="e.g., STR-12345"
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="customer-email" className="form-label">Email Address</label>
                    <input
                      type="email"
                      className="form-control"
                      id="customer-email"
                      placeholder="Enter the email used during booking"
                      required
                    />
                  </div>
                  <div className="text-center">
                    <button type="submit" className="btn btn-primary">Track My Repair</button>
                  </div>
                </form>
              </div>

              {/* Repair Status */}
              {showStatus && (
                <div className="tracking-status" id="tracking-result">
                  <h3 className="text-center mb-4">Repair Status</h3>
                  <div className="device-info mb-4">
                    <div className="card">
                      <div className="card-body">
                        <h4>Device Information</h4>
                        <div className="row">
                          <div className="col-md-6">
                            <p><strong>Device:</strong> iPhone 13 Pro</p>
                            <p><strong>Issue:</strong> Screen Replacement</p>
                          </div>
                          <div className="col-md-6">
                            <p><strong>Tracking Number:</strong> STR-12345</p>
                            <p><strong>Estimated Completion:</strong> March 16, 2025</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="tracking-timeline">
                    {[
                      { title: 'Received', desc: 'Your device has been received by our technicians', date: 'March 14, 2025 - 10:23 AM', active: true },
                      { title: 'Diagnostic', desc: 'Initial diagnosis completed, repair plan confirmed', date: 'March 14, 2025 - 2:15 PM', active: true },
                      { title: 'In Repair', desc: 'Device is being repaired', date: 'March 15, 2025 - 9:45 AM', active: true },
                      { title: 'Quality Check', desc: 'Final testing to ensure quality repair', date: 'Pending', active: false },
                      { title: 'Ready for Pickup', desc: 'Your device is ready for pickup', date: 'Pending', active: false },
                    ].map((step, i) => (
                      <div className={`timeline-item ${step.active ? 'active' : 'pending'}`} key={i}>
                        <div className="timeline-content">
                          <h4>{step.title}</h4>
                          <p>{step.desc}</p>
                          <span className="timeline-date">{step.date}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section remains unchanged */}
      {/* ... your FAQ Section code here ... */}
    </>
  );
};

export default TrackRepair;
