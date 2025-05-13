// pages/api/auth/logout.js
import cookie from 'cookie';
import { auth } from '../../../lib/auth';

export default async function handler(req, res) {
    // Only accept POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Get session token from cookies
        const sessionToken = req.cookies.session_token;

        if (sessionToken) {
            // Invalidate the session in the database
            await auth.invalidateSession(sessionToken);
        }

        // Clear the session cookie
        res.setHeader('Set-Cookie', cookie.serialize('session_token', '', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            expires: new Date(0),
            sameSite: 'strict',
            path: '/'
        }));

        res.status(200).json({ success: true });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ error: 'An error occurred during logout' });
    }
}