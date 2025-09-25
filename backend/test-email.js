import dotenv from 'dotenv';
dotenv.config();
import emailService from './services/emailService.js';

/**
 * Test script for email service
 * Run with: node test-email.js
 */
async function testEmailService() {
  console.log(`SMTP_USER: ${process.env.SMTP_USER}`);
  console.log(`SMTP_PASS exists: ${Boolean(process.env.SMTP_PASS)}`);
  console.log('Testing Email Service...\n');

  try {
    // Test password reset email
    console.log('1. Testing password reset email...');
    const resetResult = await emailService.sendPasswordResetEmail(
      'briecoder@gmail.com',
      'test-token-123',
      'John Doe'
    );
    console.log('Password reset email:', resetResult ? '✅ Sent' : '❌ Failed');

    // Test welcome email
    console.log('\n2. Testing welcome email...');
    const welcomeResult = await emailService.sendWelcomeEmail(
      'briecoder@gmail.com',
      'Jane Doe'
    );
    console.log('Welcome email:', welcomeResult ? '✅ Sent' : '❌ Failed');

    // Test MFA setup email
    console.log('\n3. Testing MFA setup email...');
    const mfaResult = await emailService.sendMFASetupEmail(
      'briecoder@gmail.com',
      'Bob Smith'
    );
    console.log('MFA setup email:', mfaResult ? '✅ Sent' : '❌ Failed');

    // Test security alert email
    console.log('\n4. Testing security alert email...');
    const alertResult = await emailService.sendSecurityAlertEmail(
      'briecoder@gmail.com',
      'Alice Johnson',
      'Suspicious Login Attempt',
      {
        ip: '192.168.1.100',
        timestamp: new Date().toISOString(),
        location: 'Unknown'
      }
    );
    console.log('Security alert email:', alertResult ? '✅ Sent' : '❌ Failed');

    console.log('\n✅ Email service test completed successfully!');
    console.log('\nNote: Check your email inbox for the test emails.');
    console.log('If emails are not received, check your SMTP configuration.');

  } catch (error) {
    console.error('❌ Email service test failed:', error.message);
    console.error('\nTroubleshooting:');
    console.error('1. Check your .env file has correct SMTP settings');
    console.error('2. Verify SMTP credentials are correct');
    console.error('3. Ensure network access to SMTP server');
    console.error('4. Check firewall settings');
  }
}

// Run the test
testEmailService();
