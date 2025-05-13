// pages/api/auth/login.js
import cookie from 'cookie';
import { auth } from '../../../lib/auth.js';
import { query } from '../../../lib/db.js';

export default async function handler(req, res) {
  // Only accept POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, password } = req.body;

    // Validate inputs
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    try {
      // Find user by email
      const user = await auth.findUserByEmail(email);

      // Check if user exists
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Check if user is active
      if (!user.is_active) {
        return res.status(401).json({ error: 'Account is inactive. Please contact your administrator.' });
      }

      // Check if account is active
      if (!user.account_is_active) {
        return res.status(401).json({ error: 'Your organization account is inactive. Please contact support.' });
      }

      // Verify password
      const passwordValid = await auth.comparePassword(password, user.password_hash);

      if (!passwordValid) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Update last login time
      await query(
        'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE user_id = $1',
        [user.user_id]
      );

      // Create a new session
      const sessionToken = await auth.createSession(user.user_id);

      // Set session cookie
      res.setHeader('Set-Cookie', cookie.serialize('session_token', sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 7, // 1 week
        sameSite: 'strict',
        path: '/'
      }));

      // Return user info without sensitive data
      return res.status(200).json({
        user: {
          id: user.user_id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          accountId: user.account_id,
          accountName: user.account_name,
          role: user.role_name,
          isAdmin: user.is_account_admin
        },
        sessionToken // Client will store this in a cookie
      });
    } catch (dbError) {
      console.error('Database operation error during login:', dbError);
      return res.status(500).json({ error: 'A database error occurred. Please check your database configuration.' });
    }
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'An error occurred during login' });
  }
}