// routes/contact.js
const express = require('express');
const router = express.Router();
const Joi = require('joi');
const { sendConfirmationEmail } = require('../utils/mailer'); // Use your existing mailer

const contactSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  phone: Joi.string().min(8).max(20).required(),
  subject: Joi.string().valid('general', 'repair', 'quote', 'feedback', 'other').default('general'),
  message: Joi.string().min(10).max(2000).required(),
  consent: Joi.boolean().valid(true).required()
});

// Add both routes to handle with and without trailing slash
router.post('/', handleContactSubmission);
router.post('/contact', handleContactSubmission);

async function handleContactSubmission(req, res) {
  console.log('Contact form submission received:', req.body);
  
  const { error, value } = contactSchema.validate(req.body);
  if (error) {
    console.log('Validation error:', error.details[0].message);
    return res.status(400).json({ 
      success: false, 
      error: error.details[0].message 
    });
  }

  try {
    // Store in database if needed
    // const { repairDbPool } = require('../db');
    // await repairDbPool.query(
    //   'INSERT INTO contact_submissions (name, email, phone, subject, message, created_at) VALUES ($1, $2, $3, $4, $5, NOW())',
    //   [value.name, value.email, value.phone, value.subject, value.message]
    // );

    // Send email notification using your existing mailer utility
    try {
      const notificationEmail = process.env.NOTIFICATION_EMAIL || process.env.EMAIL_USER;
      
      if (notificationEmail) {
        await sendConfirmationEmail(
          notificationEmail,
          `New Contact Form Submission: ${value.subject}`,
          `
            <h3>New Contact Form Submission</h3>
            <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 10px 0;">
              <p><strong>Name:</strong> ${value.name}</p>
              <p><strong>Email:</strong> ${value.email}</p>
              <p><strong>Phone:</strong> ${value.phone}</p>
              <p><strong>Subject:</strong> ${value.subject}</p>
              <p><strong>Message:</strong></p>
              <div style="background: white; padding: 10px; border-radius: 3px; margin: 5px 0;">
                ${value.message.replace(/\n/g, '<br>')}
              </div>
              <p><strong>Submitted:</strong> ${new Date().toLocaleString()}</p>
            </div>
          `
        );
        console.log('Contact notification email sent successfully');

        // Optional: Send confirmation email to the customer
        await sendConfirmationEmail(
          value.email,
          'Thank you for contacting Stentech Repairs',
          `
            <h2>Hi ${value.name},</h2>
            <p>Thank you for reaching out to us. We've received your message and will get back to you as soon as possible.</p>
            
            <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0;">
              <h3>Your Message Details:</h3>
              <p><strong>Subject:</strong> ${value.subject}</p>
              <p><strong>Message:</strong></p>
              <div style="background: white; padding: 10px; border-radius: 3px; margin: 5px 0;">
                ${value.message.replace(/\n/g, '<br>')}
              </div>
            </div>
            
            <p>Our typical response time is within 24 hours during business days.</p>
            <p>If this is urgent, please call us at: <strong>${process.env.BUSINESS_PHONE || '0735270565'}</strong></p>
            
            <p>Best regards,<br><strong>Stentech Repairs Team</strong></p>
          `
        );
        console.log('Customer confirmation email sent successfully');
      } else {
        console.log('No notification email configured, skipping email notification');
      }
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      // Don't fail the entire request if email fails
    }

    // Send success response
    console.log('Contact form processed successfully');
    return res.status(201).json({ 
      success: true, 
      message: "Thank you for your message! We've received it and will get back to you soon." 
    });
    
  } catch (err) {
    console.error('Error processing contact form:', err);
    return res.status(500).json({ 
      success: false, 
      error: 'Failed to process your message. Please try again later.' 
    });
  }
}

module.exports = router;