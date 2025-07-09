// Email functionality disabled for simplified deployment
// This is a no-op function that logs email attempts without sending

const sendEmail = async (options) => {
  // Log email attempt for debugging purposes
  console.log('📧 Email sending disabled - would have sent:', {
    to: options.email,
    subject: options.subject,
    timestamp: new Date().toISOString()
  });

  // Return success without actually sending email
  return Promise.resolve({
    success: true,
    message: 'Email functionality disabled'
  });
};

module.exports = sendEmail;
