// pages/api/auth/verify-token.js
import { auth } from '../../../lib/auth';

export default async function handler(req, res) {
    try {
        // Get token from authorization header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Authorization header missing or invalid' });
        }

        const token = authHeader.substring(7);

        // Verify token
        const decodedToken = auth.verifyToken(token);

        if (!decodedToken) {
            return res.status(401).json({ error: 'Invalid or expired token' });
        }

        // Get user details
        const user = await auth.findUserById(decodedToken.id);

        if (!user) {
            return res.status(401).json({ error: 'User not found' });
        }

        // Check if user and account are active
        if (!user.is_active) {
            return res.status(401).json({ error: 'User account is inactive' });
        }

        if (!user.account_is_active) {
            return res.status(401).json({ error: 'Organization account is inactive' });
        }

        // Return user info
        res.status(200).json({
            authenticated: true,
            user: {
                id: user.user_id,
                email: user.email,
                firstName: user.first_name,
                lastName: user.last_name,
                accountId: user.account_id,
                accountName: user.account_name,
                role: user.role_name,
                isAdmin: user.is_account_admin
            }
        });
    } catch (error) {
        console.error('Token verification error:', error);
        res.status(500).json({ error: 'An error occurred while verifying token' });
    }
}