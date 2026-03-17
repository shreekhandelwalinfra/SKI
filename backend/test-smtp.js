/**
 * Quick SMTP test script — run with:
 *   node test-smtp.js
 */
const nodemailer = require('nodemailer');
require('dotenv').config();

const EMAIL = process.env.SMTP_EMAIL;
const PASS = process.env.SMTP_PASSWORD;

console.log('Testing SMTP with:');
console.log('  SMTP_EMAIL   =', EMAIL);
console.log('  SMTP_PASSWORD=', PASS ? `${PASS.slice(0, 4)}...${PASS.slice(-4)}` : '(not set)');
console.log('');

if (!EMAIL || !PASS) {
    console.error('ERROR: SMTP_EMAIL or SMTP_PASSWORD is missing in .env');
    process.exit(1);
}

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: EMAIL, pass: PASS },
});

transporter.verify((error, success) => {
    if (error) {
        console.error('SMTP VERIFICATION FAILED:');
        console.error('  Code   :', error.code);
        console.error('  Message:', error.message);
        if (error.response) console.error('  Server :', error.response);
    } else {
        console.log('SMTP connected successfully! Sending test email...');
        transporter.sendMail({
            from: `"SKI Infra Test" <${EMAIL}>`,
            to: EMAIL,
            subject: 'SKI Infra SMTP Test',
            text: 'SMTP is working correctly!',
        }, (err, info) => {
            if (err) {
                console.error('SEND FAILED:', err.message);
            } else {
                console.log('Email sent! Message ID:', info.messageId);
            }
        });
    }
});
