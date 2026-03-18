import nodemailer from 'nodemailer';

/**
 * Send a 6-digit OTP verification email to a new user.
 * The transporter is created fresh on each call so it always
 * picks up SMTP_EMAIL / SMTP_PASSWORD AFTER dotenv has loaded.
 */
export async function sendVerificationEmail(
    to: string,
    otp: string,
    name: string,
): Promise<void> {
    // Create transporter here (not at module level) so env vars are ready
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.SMTP_EMAIL,
            pass: process.env.SMTP_PASSWORD,
        },
        connectionTimeout: 10000,  // fail fast if Gmail unreachable (10s)
        socketTimeout: 10000,
    });

    const mailOptions = {
        from: `"SKI Infra" <${process.env.SMTP_EMAIL}>`,
        to,
        subject: `${otp} is your SKI Infra verification code`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; background: #f9fafb; border-radius: 12px; overflow: hidden;">
                <div style="background: #1a3c5e; padding: 28px 32px;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 22px; letter-spacing: 0.5px;">SKI Infra</h1>
                    <p style="color: #93c5fd; margin: 4px 0 0; font-size: 13px;">Shree Khandelwal Infrastructure</p>
                </div>
                <div style="padding: 32px;">
                    <p style="color: #374151; font-size: 16px; margin: 0 0 12px;">Hi <strong>${name}</strong>,</p>
                    <p style="color: #6b7280; font-size: 14px; margin: 0 0 24px;">
                        Welcome to SKI Infra! Please use the verification code below to confirm your email address. 
                        This code is valid for <strong>10 minutes</strong>.
                    </p>
                    <div style="background: #f3f4f6; border: 2px dashed #d1d5db; border-radius: 8px; padding: 20px; text-align: center; margin: 0 0 24px;">
                        <span style="font-size: 40px; font-weight: 800; letter-spacing: 12px; color: #1a3c5e;">${otp}</span>
                    </div>
                    <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                        If you did not create an account, please ignore this email.<br/>
                        Do not share this code with anyone — SKI Infra staff will never ask for it.
                    </p>
                </div>
                <div style="background: #f3f4f6; padding: 16px 32px; border-top: 1px solid #e5e7eb;">
                    <p style="color: #9ca3af; font-size: 11px; margin: 0; text-align: center;">
                        © ${new Date().getFullYear()} Shree Khandelwal Infrastructure. All rights reserved.
                    </p>
                </div>
            </div>
        `,
    };

    await transporter.sendMail(mailOptions);
}

/**
 * Send a 6-digit OTP for password reset.
 */
export async function sendPasswordResetEmail(
    to: string,
    otp: string,
    name: string,
): Promise<void> {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.SMTP_EMAIL,
            pass: process.env.SMTP_PASSWORD,
        },
        connectionTimeout: 10000,
        socketTimeout: 10000,
    });

    const mailOptions = {
        from: `"SKI Infra Security" <${process.env.SMTP_EMAIL}>`,
        to,
        subject: `Password Reset Request - ${otp}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; background: #f9fafb; border-radius: 12px; overflow: hidden; border: 1px solid #e5e7eb;">
                <div style="background: #1a3c5e; padding: 28px 32px; border-bottom: 4px solid #ef4444;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 22px; letter-spacing: 0.5px;">SKI Infra</h1>
                    <p style="color: #93c5fd; margin: 4px 0 0; font-size: 13px;">Security Alert: Password Reset</p>
                </div>
                <div style="padding: 32px;">
                    <p style="color: #374151; font-size: 16px; margin: 0 0 12px;">Hi <strong>${name}</strong>,</p>
                    <p style="color: #6b7280; font-size: 14px; margin: 0 0 24px;">
                        We received a request to reset the password for your SKI Infra account. Please use the verification code below to set up a new password. 
                        This code is valid for <strong>10 minutes</strong>.
                    </p>
                    <div style="background: #fef2f2; border: 2px dashed #fca5a5; border-radius: 8px; padding: 20px; text-align: center; margin: 0 0 24px;">
                        <span style="font-size: 40px; font-weight: 800; letter-spacing: 12px; color: #ef4444;">${otp}</span>
                    </div>
                    <p style="color: #ef4444; font-size: 13px; margin: 0 0 16px; font-weight: bold;">
                        If you did not request this password reset, please ignore this email. Your password will remain unchanged.
                    </p>
                    <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                        Do not share this code with anyone — SKI Infra staff will never ask for it.
                    </p>
                </div>
                <div style="background: #f3f4f6; padding: 16px 32px; border-top: 1px solid #e5e7eb;">
                    <p style="color: #9ca3af; font-size: 11px; margin: 0; text-align: center;">
                        © ${new Date().getFullYear()} Shree Khandelwal Infrastructure. All rights reserved.
                    </p>
                </div>
            </div>
        `,
    };

    await transporter.sendMail(mailOptions);
}
