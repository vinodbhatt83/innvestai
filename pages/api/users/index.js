// pages/api/users/index.js
import { auth, userManager } from '../../../lib/auth';
import { withAuth } from '../../../lib/middleware';

async function handler(req, res) {
    const { method } = req;
    const { user } = req;

    switch (method) {
        case 'GET':
            try {
                // Check permission - only account admins can list users
                if (!user.is_account_admin) {
                    return res.status(403).json({ error: 'Unauthorized' });
                }

                // Get users for the account
                const users = await userManager.getUsersByAccount(user.account_id);

                return res.status(200).json(users);
            } catch (error) {
                console.error('Error fetching users:', error);
                return res.status(500).json({ error: 'Failed to fetch users' });
            }

        case 'POST':
            try {
                // Check permission - only account admins can create users
                if (!user.is_account_admin) {
                    return res.status(403).json({ error: 'Unauthorized' });
                }

                const { email, firstName, lastName, password, roleId, isAccountAdmin } = req.body;

                // Validate required fields
                if (!email || !password || !roleId) {
                    return res.status(400).json({ error: 'Email, password, and role are required' });
                }

                // Check if account has reached user limit
                const hasReachedLimit = await accountManager.hasReachedUserLimit(user.account_id);

                if (hasReachedLimit) {
                    return res.status(403).json({
                        error: 'Account has reached the maximum number of users allowed by your plan',
                        isLimitReached: true
                    });
                }

                // Create new user
                const newUser = await userManager.createUser({
                    email,
                    password,
                    firstName: firstName || '',
                    lastName: lastName || '',
                    accountId: user.account_id,
                    roleId,
                    isAccountAdmin: isAccountAdmin || false
                });

                // Return user without sensitive information
                const userResponse = {
                    userId: newUser.user_id,
                    email: newUser.email,
                    firstName: newUser.first_name,
                    lastName: newUser.last_name,
                    roleId: newUser.role_id,
                    isAccountAdmin: newUser.is_account_admin,
                    isActive: newUser.is_active
                };

                return res.status(201).json(userResponse);
            } catch (error) {
                console.error('Error creating user:', error);

                // Check for duplicate email error
                if (error.message && error.message.includes('duplicate key')) {
                    return res.status(400).json({ error: 'Email already in use' });
                }

                return res.status(500).json({ error: 'Failed to create user' });
            }

        default:
            res.setHeader('Allow', ['GET', 'POST']);
            res.status(405).end(`Method ${method} Not Allowed`);
    }
}

export default withAuth(handler);