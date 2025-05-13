// pages/api/accounts/users.js
import { withPermission } from '../../../middleware/auth';
import { accountManager } from '../../../lib/auth';

// Handler for GET requests
async function getUsers(req, res) {
    const { accountId } = req.query;

    // Verify the user belongs to the requested account
    if (req.user.accountId !== parseInt(accountId)) {
        return res.status(403).json({ error: 'You do not have permission to access this account' });
    }

    try {
        const users = await accountManager.getAccountUsers(accountId);
        res.status(200).json({ users });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ error: 'An error occurred while retrieving users' });
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
    switch (req.method) {
        case 'GET':
            return getUsers(req, res);
        case 'POST':
            return createUser(req, res);
        case 'PUT':
            return updateUser(req, res);
        default:
            return res.status(405).json({ error: 'Method not allowed' });
    }
}

// Export with permission middleware (requires 'read' permission)
export default withPermission(handler, 'read');