// pages/api/accounts/users.js
import { withAuth } from '../../../middleware/auth';

// Handler for GET requests
async function getUsers(req, res) {
    try {
        console.log('GET /api/account/users - Request received', { 
            query: req.query,
            user: req.user ? { 
                id: req.user.id,
                accountId: req.user.accountId,
                email: req.user.email
            } : 'No user in request'
        });
        
        // Extract accountId from query or from authenticated user
        let accountId = req.query.accountId;
        
        // If no accountId in query but user is authenticated, use their accountId
        if (!accountId && req.user && req.user.accountId) {
            accountId = req.user.accountId;
            console.log('Using accountId from authenticated user:', accountId);
        }
        
        // Check if accountId is available
        if (!accountId) {
            console.log('GET /api/account/users - No accountId provided or available');
            return res.status(200).json({ users: [] }); // Return empty array instead of error
        }

        // Direct database query for users
        const { query } = require('../../../lib/db');
        console.log('Executing database query for users with accountId:', accountId);
        
        try {
            const result = await query(
                `SELECT u.user_id, u.email, u.first_name, u.last_name, u.is_account_admin, u.is_active, 
                 r.role_id, r.role_name 
                 FROM users u 
                 LEFT JOIN roles r ON u.role_id = r.role_id 
                 WHERE u.account_id = $1
                 ORDER BY u.last_name, u.first_name`,
                [accountId]
            );
            
            console.log('User query results', { 
                rowCount: result.rowCount,
                firstUser: result.rows.length > 0 ? {
                    user_id: result.rows[0].user_id,
                    email: result.rows[0].email
                } : 'No users found'
            });
            
            // Send successful response even if no users found (empty array)
            return res.status(200).json({ users: result.rows });
        } catch (dbError) {
            console.error('Database error in users API:', dbError);
            
            // Return empty array on DB error to avoid breaking the frontend
            return res.status(200).json({ 
                users: [],
                message: 'Error querying database, returning empty result'
            });
        }
    } catch (error) {
        console.error('GET /api/account/users - Error:', error);
        
        // Return empty array on any error to avoid breaking the frontend
        return res.status(200).json({ 
            users: [],
            message: 'Error in user retrieval, returning empty result'
        });
    }
}

// Handler for POST requests (create a new user)
async function createUser(req, res) {
    const { accountId } = req.query;

    // Verify the user belongs to the requested account and is an admin
    if (req.user.accountId !== parseInt(accountId) || !req.user.isAdmin) {
        return res.status(403).json({ error: 'You do not have permission to create users for this account' });
    }

    const { firstName, lastName, email, password, roleId, isAccountAdmin } = req.body;

    // Validate inputs
    if (!firstName || !lastName || !email || !password || !roleId) {
        return res.status(400).json({ error: 'All required fields must be provided' });
    }

    try {
        const result = await accountManager.createUser(
            accountId,
            {
                firstName,
                lastName,
                email,
                password,
                roleId,
                isAccountAdmin: !!isAccountAdmin
            },
            req.user.id
        );

        if (!result.success) {
            return res.status(400).json({ error: result.error });
        }

        res.status(201).json({
            success: true,
            message: 'User created successfully',
            userId: result.user.user_id
        });
    } catch (error) {
        console.error('Create user error:', error);

        // Check for duplicate email error
        if (error.message && error.message.includes('duplicate key')) {
            return res.status(400).json({ error: 'Email already in use' });
        }

        res.status(500).json({ error: 'An error occurred while creating the user' });
    }
}

// Handler for PUT requests (update a user)
async function updateUser(req, res) {
    const { accountId, userId } = req.query;

    // Verify the user belongs to the requested account
    if (req.user.accountId !== parseInt(accountId)) {
        return res.status(403).json({ error: 'You do not have permission to update users for this account' });
    }

    // Only account admins can update other users
    if (req.user.id !== parseInt(userId) && !req.user.isAdmin) {
        return res.status(403).json({ error: 'You do not have permission to update this user' });
    }

    // Non-admins can't make themselves admins
    if (req.body.isAccountAdmin === true && !req.user.isAdmin) {
        return res.status(403).json({ error: 'You do not have permission to grant admin privileges' });
    }

    try {
        const result = await accountManager.updateUser(userId, req.body);

        if (!result.success) {
            return res.status(400).json({ error: result.error });
        }

        res.status(200).json({
            success: true,
            message: 'User updated successfully',
            user: {
                id: result.user.user_id,
                email: result.user.email,
                firstName: result.user.first_name,
                lastName: result.user.last_name,
                roleId: result.user.role_id,
                isAccountAdmin: result.user.is_account_admin,
                isActive: result.user.is_active
            }
        });
    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({ error: 'An error occurred while updating the user' });
    }
}

// Main handler function
async function handler(req, res) {
    // Route based on HTTP method
    console.log(`API request: ${req.method} /api/account/users`);
    
    if (req.method === 'GET') {
        return getUsers(req, res);
    } else {
        return res.status(405).json({ 
            error: 'Method not allowed', 
            message: 'Only GET requests are currently supported'
        });
    }
}

// Export with standard auth middleware (no specific permissions required)
export default withAuth(handler);