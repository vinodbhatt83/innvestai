// pages/api/auth/session.js
import { auth } from '../../../lib/auth.js';

export default async function handler(req, res) {
  // Only accept GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get session token from cookies
    const sessionToken = req.cookies.session_token;
    
    if (!sessionToken) {
      return res.status(200).json({ isAuthenticated: false });
    }
    
    // Verify session
    const session = await auth.verifySession(sessionToken);
    
    if (!session) {
      return res.status(200).json({ isAuthenticated: false });
    }
    
    // Check if user is active
    if (!session.is_active || !session.account_is_active) {
      return res.status(200).json({ isAuthenticated: false });
    }
    
    // Return user data
    res.status(200).json({
      isAuthenticated: true,
      user: {
        id: session.user_id,
        email: session.email,
        firstName: session.first_name,
        lastName: session.last_name,
        accountId: session.account_id,
        accountName: session.account_name,
        role: session.role_name,
        isAdmin: session.is_account_admin,
        permissions: session.permissions
      }
    });
  } catch (error) {
    console.error('Session error:', error);
    res.status(500).json({ error: 'An error occurred while retrieving session' });
  }
}