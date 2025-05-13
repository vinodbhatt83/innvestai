// pages/api/auth/forgot-password.js
import { auth } from '../../../lib/auth';
import { query } from '../../../lib/db';
import { sendMail } from '../../../lib/email'; // You would need to implement this

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        // Find user by email
        const user = await auth.findUserByEmail(email);

        // If no user found, still return success to avoid email enumeration
        if (!user) {
            return res.status(200).json({ success: true, message: 'If your email is registered, you will receive a password reset link' });
        }

        // Generate reset token
        const resetToken = auth.generateResetToken();
        const resetTokenExpires = new Date();
        resetTokenExpires.setHours(resetTokenExpires.getHours() + 1); // Token valid for 1 hour

        // Save reset token and expiry to database
        await query(
            'UPDATE users SET reset_token = $1, reset_token_expires = $2 WHERE user_id = $3',
            [resetToken, resetTokenExpires, user.user_id]
        );

        // Send email with reset link
        const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`;

        try {
            await sendMail({
                to: email,
                subject: 'Reset Your Password',
                html: `
          <p>Hello ${user.first_name || 'there'},</p>
          <p>You requested a password reset for your InnVestAI account.</p>
          <p>Click the link below to reset your password. This link is valid for 1 hour:</p>
          <p><a href="${resetLink}">${resetLink}</a></p>
          <p>If you didn't request this, please ignore this email.</p>
        `
            });
        } catch (emailError) {
            console.error('Error sending password reset email:', emailError);
            // Continue without failing the request
        }

        res.status(200).json({ success: true, message: 'If your email is registered, you will receive a password reset link' });
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ error: 'An error occurred while processing your request' });
    }
}