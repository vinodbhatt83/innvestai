// pages/api/users/change-password.js
import { auth, userManager } from '../../../lib/auth';
import { withAuth } from '../../../middleware/auth';

async function handler(req, res) {
    const { method } = req;
    const { user } = req;

    if (method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).end(`Method ${method} Not Allowed`);
    }

    try {
        const { currentPassword, newPassword, userId } = req.body;

        // Validate required fields
        if (!newPassword) {
            return res.status(400).json({ error: 'New password is required' });
        }

        // If userId is provided, this is an admin changing another user's password
        if (userId) {
            // Check if user is an account admin
            if (!user.is_account_admin) {
                return res.status(403).json({ error: 'Unauthorized' });
            }

            // Check if target user is in the same account
            const targetUser = await auth.findUserById(userId);

            if (!targetUser || targetUser.account_id !== user.account_id) {
                return res.status(404).json({ error: 'User not found' });
            }

            // Change password
            const success = await userManager.changePassword(userId, newPassword);

            if (!success) {
                return res.status(500).json({ error: 'Failed to change password' });
            }

            return res.status(200).json({ success: true, message: 'Password changed successfully' });
        } else {
            // User changing their own password

            // Require current password
            if (!currentPassword) {
                return res.status(400).json({ error: 'Current password is required' });
            }

            // Verify current password
            const userDetails = await auth.findUserById(user.user_id);
            const passwordValid = await auth.comparePassword(currentPassword, userDetails.password_hash);

            if (!passwordValid) {
                return res.status(400).json({ error: 'Current password is incorrect' });
            }

            // Change password
            const success = await userManager.changePassword(user.user_id, newPassword);

            if (!success) {
                return res.status(500).json({ error: 'Failed to change password' });
            }

            return res.status(200).json({ success: true, message: 'Password changed successfully' });
        }
    } catch (error) {
        console.error('Error changing password:', error);
        return res.status(500).json({ error: 'Failed to change password' });
    }
}

export default withAuth(handler);