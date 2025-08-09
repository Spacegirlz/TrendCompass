const nodemailer = require('nodemailer');

async function sendEmail(recipientEmail, recipientName, pdfBuffer, csvData) {
    try {
        console.log(`Sending email to ${recipientEmail}...`);
        
        // Use configured email address
        const senderEmail = 'piet@virtualsatchel.com';
        
        // Check if email credentials are configured
        if (!process.env.GMAIL_PASS) {
            console.log('Email password not configured, skipping email send');
            console.log('PDF and CSV generated successfully - would be attached to email');
            return { messageId: 'test-message-id', status: 'skipped - no credentials' };
        }
        
        // Create transporter
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            auth: {
                user: senderEmail,
                pass: process.env.GMAIL_PASS
            },
            tls: {
                rejectUnauthorized: false
            }
        });
        
        const mailOptions = {
            from: `"Viral Trends" <${senderEmail}>`,
            to: recipientEmail,
            subject: `🏆 Your Viral Trends Strategy Playbook is Ready, ${recipientName}!`,
            html: `
                <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #f8f5f0;">
                    <!-- Header -->
                    <div style="background: linear-gradient(135deg, #0f0f10, #1b1b1d); color: #d4af37; padding: 40px 30px; text-align: center; border-radius: 0 0 14px 14px;">
                        <h1 style="margin: 0; font-size: 28px; font-weight: 700; letter-spacing: 0.5px;">Viral Trends</h1>
                        <p style="margin: 8px 0 0; color: #f1e8cf; font-size: 16px;">Your Premium Content Playbook</p>
                    </div>
                    
                    <!-- Content -->
                    <div style="padding: 40px 30px; background: white; margin: 20px 0;">
                        <h2 style="color: #c9a33a; margin: 0 0 20px; font-size: 24px;">Hello ${recipientName},</h2>
                        
                        <p style="color: #333; line-height: 1.6; margin-bottom: 20px;">
                            Your personalized <strong>Viral Trends Strategy Playbook</strong> has been generated and is ready for implementation!
                        </p>
                        
                        <div style="background: #f8f5f0; padding: 25px; border-radius: 12px; margin: 25px 0; border-left: 4px solid #d4af37;">
                            <h3 style="color: #c9a33a; margin: 0 0 15px; font-size: 18px;">📋 What's Included:</h3>
                            <ul style="color: #555; margin: 0; padding-left: 20px;">
                                <li>10+ Viral Content Ideas with Public & Private Tracks</li>
                                <li>Platform-Specific Heat Map Analysis</li>
                                <li>Ready-to-Use Hooks and Hashtags</li>
                                <li>7-Day Content Rotation Plan</li>
                                <li>Optimized Posting Times for Your Timezone</li>
                                <li>CSV File for Easy Import to Scheduling Tools</li>
                            </ul>
                        </div>
                        
                        <div style="background: #fff; border: 2px solid #d4af37; border-radius: 12px; padding: 20px; margin: 25px 0;">
                            <p style="color: #c9a33a; font-weight: 600; margin: 0 0 10px;">🚀 Implementation Tips:</p>
                            <p style="color: #555; margin: 0; line-height: 1.6;">
                                Start with the <strong>Public Track</strong> content for maximum reach and engagement. 
                                Use the <strong>Private Track</strong> strategies for your premium audience and member communities.
                                Follow the posting schedule for optimal results!
                            </p>
                        </div>
                        
                        <p style="color: #333; line-height: 1.6; margin: 20px 0;">
                            Questions or need support? Simply reply to this email and our team will assist you within 24 hours.
                        </p>
                        
                        <p style="color: #333; line-height: 1.6; margin: 20px 0;">
                            Here's to your viral success! 🎯
                        </p>
                        
                        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
                            <p style="color: #999; font-size: 14px; margin: 0;">
                                Best regards,<br>
                                <strong style="color: #c9a33a;">The TrendCompass Viral Strategy Team</strong>
                            </p>
                        </div>
                    </div>
                    
                    <!-- Footer -->
                    <div style="background: #f0f0f0; padding: 20px 30px; text-align: center; color: #666; font-size: 12px; border-radius: 14px 14px 0 0;">
                        <p style="margin: 0;">© 2025 TrendCompass Viral Strategy Generator. Premium content solutions for elite creators.</p>
                    </div>
                </div>
            `,
            attachments: [
                {
                    filename: `${recipientName}_TrendCompass_Viral_Strategy_Playbook.pdf`,
                    content: pdfBuffer,
                    contentType: 'application/pdf'
                },
                {
                    filename: `${recipientName}_TrendCompass_Content_Hooks_and_Hashtags.csv`,
                    content: csvData,
                    contentType: 'text/csv'
                }
            ]
        };
        
        const result = await transporter.sendMail(mailOptions);
        console.log('Email sent successfully:', result.messageId);
        
        return result;
        
    } catch (error) {
        console.error('Email sending error:', error);
        
        if (error.code === 'EAUTH') {
            throw new Error('Email authentication failed. Please check email configuration.');
        } else if (error.code === 'ENOTFOUND') {
            throw new Error('Email service unavailable. Please try again later.');
        } else {
            throw new Error(`Email delivery failed: ${error.message}`);
        }
    }
}

module.exports = {
    sendEmail
};
