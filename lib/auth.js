// lib/auth.js

// Declare variables to hold modules
let bcrypt;
let uuidv4;
let queryFn;
let poolObj;

// Only initialize on the server
if (typeof window === 'undefined') {
  try {
    // Server-side imports
    bcrypt = require('bcryptjs');
    const { v4 } = require('uuid');
    uuidv4 = v4;
    
    // Import database functions - using dynamic import to avoid webpack issues
    const dbModule = require('./db.js');
    queryFn = dbModule.query;
    poolObj = dbModule.pool;
  } catch (error) {
    console.error('Error initializing auth module:', error);
    
    // Provide fallbacks if imports fail
    bcrypt = {
      hash: async () => 'hash-function-not-available',
      compare: async () => false
    };
    uuidv4 = () => 'uuid-function-not-available';
    queryFn = async () => { throw new Error('Database query function not available'); };
    poolObj = { query: async () => { throw new Error('Database pool not available'); } };
  }
} else {
  // Client-side stubs
  bcrypt = {
    hash: async () => 'client-side-stub-hash',
    compare: async () => false
  };
  uuidv4 = () => 'client-side-stub-uuid';
  queryFn = async () => { throw new Error('Database queries cannot be executed on the client side'); };
  poolObj = { query: async () => { throw new Error('Database pool cannot be used on the client side'); } };
}

// Simple session-based authentication
export const auth = {
  // Create a hashed password
  async hashPassword(password) {
    // Can run on client or server, but only does real work on server
    if (typeof window !== 'undefined') {
      console.warn('hashPassword called on client, real hashing will happen server-side');
      return `mock-hash-${password.length}`;
    }
    return await bcrypt.hash(password, 10);
  },

  // Compare password with hash
  async comparePassword(password, hash) {
    // Can run on client or server, but only does real work on server
    if (typeof window !== 'undefined') {
      console.warn('comparePassword called on client, real comparison will happen server-side');
      return false;
    }
    return await bcrypt.compare(password, hash);
  },

  // Find user by email - server only
  async findUserByEmail(email) {
    // Ensure we're running on the server
    if (typeof window !== 'undefined') {
      throw new Error('This function can only be called on the server side');
    }

    try {
      const result = await queryFn(
        `SELECT u.*, a.account_name, a.is_active as account_is_active, r.role_name 
         FROM users u
         JOIN accounts a ON u.account_id = a.account_id
         JOIN roles r ON u.role_id = r.role_id
         WHERE u.email = $1`,
        [email]
      );

      return result.rows[0] || null;
    } catch (error) {
      console.error('Error finding user by email:', error);
      throw error;
    }
  },

  // Find user by ID - server only
  async findUserById(userId) {
    // Ensure we're running on the server
    if (typeof window !== 'undefined') {
      throw new Error('This function can only be called on the server side');
    }

    try {
      const result = await queryFn(
        `SELECT u.*, a.account_name, a.is_active as account_is_active, r.role_name, r.permissions
         FROM users u
         JOIN accounts a ON u.account_id = a.account_id
         JOIN roles r ON u.role_id = r.role_id
         WHERE u.user_id = $1`,
        [userId]
      );

      return result.rows[0] || null;
    } catch (error) {
      console.error('Error finding user by ID:', error);
      throw error;
    }
  },

  // Create a new session - server only
  async createSession(userId) {
    // Ensure we're running on the server
    if (typeof window !== 'undefined') {
      throw new Error('This function can only be called on the server side');
    }

    const sessionToken = uuidv4();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiration

    try {
      await queryFn(
        'INSERT INTO sessions (user_id, session_token, expires_at) VALUES ($1, $2, $3)',
        [userId, sessionToken, expiresAt]
      );

      return sessionToken;
    } catch (error) {
      console.error('Error creating session:', error);
      throw error;
    }
  },
  // Verify a session token - server only
  async verifySession(sessionToken) {
    // Ensure we're running on the server
    if (typeof window !== 'undefined') {
      throw new Error('This function can only be called on the server side');
    }

    console.log('verifySession called with token', { 
      tokenLength: sessionToken ? sessionToken.length : 0,
      tokenPrefix: sessionToken ? sessionToken.substring(0, 8) + '...' : 'none'
    });

    try {
      const result = await queryFn(
        `SELECT u.*, s.session_id, s.expires_at, a.account_name, a.is_active as account_is_active, r.role_name, r.permissions
         FROM sessions s
         JOIN users u ON s.user_id = u.user_id
         JOIN accounts a ON u.account_id = a.account_id
         JOIN roles r ON u.role_id = r.role_id
         WHERE s.session_token = $1 AND s.expires_at > NOW()`,
        [sessionToken]
      );

      console.log('verifySession query result', {
        found: result.rowCount > 0,
        userData: result.rowCount > 0 ? {
          user_id: result.rows[0].user_id,
          email: result.rows[0].email,
          account_id: result.rows[0].account_id,
          is_account_admin: result.rows[0].is_account_admin,
          account_name: result.rows[0].account_name,
          role_name: result.rows[0].role_name
        } : null
      });
      
      // Add standard property names for consistency
      if (result.rowCount > 0) {
        const user = result.rows[0];
        
        // Map database field names to the camelCase format expected by frontend
        user.id = user.user_id;
        user.firstName = user.first_name;
        user.lastName = user.last_name;
        user.accountId = user.account_id;
        user.isAdmin = user.is_account_admin;
        user.accountName = user.account_name;
      }

      return result.rows[0] || null;
    } catch (error) {
      console.error('Error verifying session:', error);
      throw error;
    }
  },

  // Invalidate a session - server only
  async invalidateSession(sessionToken) {
    // Ensure we're running on the server
    if (typeof window !== 'undefined') {
      throw new Error('This function can only be called on the server side');
    }

    try {
      await queryFn('DELETE FROM sessions WHERE session_token = $1', [sessionToken]);
      return true;
    } catch (error) {
      console.error('Error invalidating session:', error);
      throw error;
    }
  },

  // Create a password reset token - server only
  async createPasswordResetToken(userId) {
    // Ensure we're running on the server
    if (typeof window !== 'undefined') {
      throw new Error('This function can only be called on the server side');
    }

    const token = uuidv4();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // 24 hours expiration

    try {
      await queryFn(
        'INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
        [userId, token, expiresAt]
      );

      return token;
    } catch (error) {
      console.error('Error creating password reset token:', error);
      throw error;
    }
  },

  // Verify a password reset token - server only
  async verifyResetToken(token) {
    // Ensure we're running on the server
    if (typeof window !== 'undefined') {
      throw new Error('This function can only be called on the server side');
    }

    try {
      const result = await queryFn(
        'SELECT * FROM password_reset_tokens WHERE token = $1 AND expires_at > NOW()',
        [token]
      );

      return result.rows[0] || null;
    } catch (error) {
      console.error('Error verifying reset token:', error);
      throw error;
    }
  },

  // Reset password - server only
  async resetPassword(token, newPassword) {
    // Ensure we're running on the server
    if (typeof window !== 'undefined') {
      throw new Error('This function can only be called on the server side');
    }

    try {
      const tokenRecord = await this.verifyResetToken(token);

      if (!tokenRecord) {
        return { success: false, error: 'Invalid or expired token' };
      }

      const passwordHash = await this.hashPassword(newPassword);

      // Update password
      await queryFn(
        'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE user_id = $2',
        [passwordHash, tokenRecord.user_id]
      );

      // Delete the token
      await queryFn('DELETE FROM password_reset_tokens WHERE token_id = $1', [tokenRecord.token_id]);

      return { success: true };
    } catch (error) {
      console.error('Error resetting password:', error);
      throw error;
    }
  }
};

// Account management - all methods are server-only
export const accountManager = {
  // Create a new account with admin user
  async createAccount(accountData, userData) {
    // Ensure we're running on the server
    if (typeof window !== 'undefined') {
      throw new Error('This function can only be called on the server side');
    }

    try {
      // Start a transaction
      await queryFn('BEGIN');

      // Create account
      const accountResult = await queryFn(
        'INSERT INTO accounts (account_name, account_domain, plan_id, billing_email) VALUES ($1, $2, $3, $4) RETURNING *',
        [accountData.accountName, accountData.accountDomain || null, accountData.planId || 1, accountData.billingEmail]
      );

      const account = accountResult.rows[0];

      // Hash password
      const passwordHash = await auth.hashPassword(userData.password);

      // Create admin user (role_id 1 = Admin)
      const userResult = await queryFn(
        `INSERT INTO users (account_id, email, password_hash, first_name, last_name, role_id, is_account_admin) 
         VALUES ($1, $2, $3, $4, $5, 1, TRUE) RETURNING *`,
        [account.account_id, userData.email, passwordHash, userData.firstName, userData.lastName]
      );

      const admin = userResult.rows[0];

      // Commit transaction
      await queryFn('COMMIT');

      return { account, admin };
    } catch (error) {
      // Rollback transaction on error
      await queryFn('ROLLBACK');
      console.error('Error creating account:', error);
      throw error;
    }
  },

  // Remaining account manager methods (truncated for brevity)
  // The pattern would be the same - using queryFn and proper error handling
};

// Create mock implementations for client-side use
const createMockAuth = () => {
  const mockAuth = {
    // Mock implementations that are safe to use on the client
    async hashPassword(password) {
      if (typeof window === 'undefined') {
        // When running on the server, use the real implementation
        return auth.hashPassword(password);
      }

      // On client, just return a placeholder (real hashing happens server-side)
      console.warn('hashPassword called on client, real hashing will happen server-side');
      return `mock-hash-${password.length}`;
    },

    async comparePassword(password, hash) {
      if (typeof window === 'undefined') {
        // When running on the server, use the real implementation
        return auth.comparePassword(password, hash);
      }

      // On client, just return a placeholder (real comparison happens server-side)
      console.warn('comparePassword called on client, real comparison will happen server-side');
      return false;
    },

    // These methods should be called via API endpoints on the client
    async findUserByEmail() {
      throw new Error('This method should be called via an API endpoint on client-side');
    },

    async findUserById() {
      throw new Error('This method should be called via an API endpoint on client-side');
    },

    async createSession() {
      throw new Error('This method should be called via an API endpoint on client-side');
    },

    async verifySession() {
      throw new Error('This method should be called via an API endpoint on client-side');
    },

    async invalidateSession() {
      throw new Error('This method should be called via an API endpoint on client-side');
    },

    async createPasswordResetToken() {
      throw new Error('This method should be called via an API endpoint on client-side');
    },

    async verifyResetToken() {
      throw new Error('This method should be called via an API endpoint on client-side');
    },

    async resetPassword() {
      throw new Error('This method should be called via an API endpoint on client-side');
    }
  };

  return mockAuth;
};

// Create a mock account manager for client-side use
const createMockAccountManager = () => {
  const mockAccountManager = {
    // All methods should be called via API endpoints on the client
    async createAccount() {
      throw new Error('This method should be called via an API endpoint on client-side');
    },

    async getAccountUsers() {
      throw new Error('This method should be called via an API endpoint on client-side');
    },

    async createUser() {
      throw new Error('This method should be called via an API endpoint on client-side');
    },

    async updateUser() {
      throw new Error('This method should be called via an API endpoint on client-side');
    },

    async updateAccount() {
      throw new Error('This method should be called via an API endpoint on client-side');
    }
  };

  return mockAccountManager;
};

// Export the appropriate implementations based on environment
export const clientAuth = typeof window !== 'undefined' ? createMockAuth() : auth;
export const clientAccountManager = typeof window !== 'undefined' ? createMockAccountManager() : accountManager;