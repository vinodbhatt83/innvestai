// pages/api/users/[id].js
import { auth, userManager } from '../../../lib/auth';
import { withAuth } from '../../../lib/middleware';

async function handler(req, res) {
    const { method, query: { id } } = req;
    const { user } = req;

    // Parse user ID
    const userId = parseInt(id);

    if (isNaN(userId)) {
        return res.status(400).json({ error: 'Invalid user ID' });
    }

    // Check permission - users can only access their own data unless they are account admins
    const isOwnProfile = userId === user.user_id;
    const canManageUsers = user.is_account_admin;

    if (!isOwnProfile && !canManageUsers) {
        return res.status(403).json({ error: 'Unauthorized' });
    }

    // Check if user belongs to the same account
    if (!isOwnProfile) {
        const targetUser = await auth.findUserById(userId);

        if (!targetUser || targetUser.account_id !== user.account_id) {
            return res.status(404).json({ error: 'User not found' });
        }
    }

    switch (method) {
        case 'GET':
            try {
                // Get user details
                const userDetails = await auth.findUserById(userId);

                if (!userDetails) {
                    return res.status(404).json({ error: 'User not found' });
                }

                // Return user without sensitive information
                const userResponse = {
                    userId: userDetails.user_id,
                    email: userDetails.email,
                    firstName: userDetails.first_name,
                    lastName: userDetails.last_name,
                    roleId: userDetails.role_id,
                    roleName: userDetails.role_name,
                    isAccountAdmin: userDetails.is_account_admin,
                    isActive: userDetails.is_active,
                    lastLogin: userDetails.last_login
                };

                return res.status(200).json(userResponse);
            } catch (error) {
                console.error('Error fetching user:', error);
                return res.status(500).json({ error: 'Failed to fetch user' });
            }

        case 'PUT':
            try {
                // Extract fields to update
                const { email, firstName, lastName, roleId, isAccountAdmin, isActive } = req.body;

                // Build update object
                const updateData = {};

                if (email) updateData.email = email;
                if (firstName !== undefined) updateData.firstName = firstName;
                if (lastName !== undefined) updateData.lastName = lastName;

                // Only account admins can update these fields
                if (canManageUsers) {
                    if (roleId !== undefined) updateData.roleId = roleId;
                    if (isAccountAdmin !== undefined) updateData.isAccountAdmin = isAccountAdmin;
                    if (isActive !== undefined) updateData.isActive = isActive;
                }

                // Update user
                const updatedUser = await userManager.updateUser(userId, updateData);

                // Return updated user without sensitive information
                const userResponse = {
                    userId: updatedUser.user_id,
                    email: updatedUser.email,
                    firstName: updatedUser.first_name,
                    lastName: updatedUser.last_name,
                    roleId: updatedUser.role_id,
                    isAccountAdmin: updatedUser.is_account_admin,
                    isActive: updatedUser.is_active
                };

                return res.status(200).json(userResponse);
            } catch (error) {
                console.error('Error updating user:', error);

                // Check for duplicate email error
                if (error.message && error.message.includes('duplicate key')) {
                    return res.status(400).json({ error: 'Email already in use' });
                }

                return res.status(500).json({ error: 'Failed to update user' });
            }

        case 'DELETE':
            try {
                // Only account admins can delete users
                if (!canManageUsers) {
                    return res.status(403).json({ error: 'Unauthorized' });
                }

                // Users cannot delete themselves
                if (isOwnProfile) {
                    return res.status(400).json({ error: 'Cannot delete your own account' });
                }

                // Delete user
                const success = await userManager.deleteUser(userId);

                if (!success) {
                    return res.status(500).json({ error: 'Failed to delete user' });
                }

                return res.status(200).json({ success: true, message: 'User deleted successfully' });
            } catch (error) {
                console.error('Error deleting user:', error);
                return res.status(500).json({ error: 'Failed to delete user' });
            }

        default:
            res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
            res.status(405).end(`Method ${method} Not Allowed`);
    }
}

export default withAuth(handler);