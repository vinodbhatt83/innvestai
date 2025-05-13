// pages/api/auth/register.js
import { accountManager } from '../../../lib/auth.js';

export default async function handler(req, res) {
  // Only accept POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { accountName, accountDomain, firstName, lastName, email, password } = req.body;

    // Validate inputs
    if (!accountName || !firstName || !lastName || !email || !password) {
      return res.status(400).json({ error: 'All required fields must be provided' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Validate password strength (at least 8 characters)
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long' });
    }

    // Create account and admin user
    const result = await accountManager.createAccount(
      {
        accountName,
        accountDomain,
        billingEmail: email
      },
      {
        firstName,
        lastName,
        email,
        password
      }
    );

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      accountId: result.account.account_id
    });
  } catch (error) {
    console.error('Registration error:', error);

    // Check for duplicate email error
    if (error.message && error.message.includes('duplicate key')) {
      return res.status(400).json({ error: 'Email already in use' });
    }

    res.status(500).json({ error: 'An error occurred during registration' });
  }
}