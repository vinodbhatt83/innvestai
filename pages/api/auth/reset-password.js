// pages/api / auth / reset - password.js
import { auth } from '../../../lib/auth';
import { query } from '../../../lib/db';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { token, password } = req.body;

        if (!token || !password) {
            return res.status(400).json({ error: 'Token and password are required' });
        }

        // Find user with the reset token
        const userQuery = `
      SELECT * FROM users 
      WHERE reset_token = $1 AND reset_token_expires > CURRENT_TIMESTAMP
    `;

        const userResult = await query(userQuery, [token]);

        if (userResult.rows.length === 0) {
            return res.status(400).json({ error: 'Invalid or expired token' });
        }

        const user = userResult.rows[0];

        // Update password and clear reset token
        const passwordHash = await auth.hashPassword(password);

        await query(
            'UPDATE users SET password_hash = $1, reset_token = NULL, reset_token_expires = NULL WHERE user_id = $2',
            [passwordHash, user.user_id]
        );

        res.status(200).json({ success: true, message: 'Password reset successful' });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ error: 'An error occurred while resetting your password' });
    }
}