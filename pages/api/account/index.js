// pages/api/account/index.js
import { accountManager } from '../../../lib/auth';
import { withAuth } from '../../../lib/middleware';

async function handler(req, res) {
    const { method } = req;
    const { user } = req;

    switch (method) {
        case 'GET':
            try {
                // Only account admins can view account details
                if (!user.is_account_admin) {
                    return res.status(403).json({ error: 'Unauthorized' });
                }

                // Get account details
                const accountDetails = await accountManager.getAccountDetails(user.account_id);

                if (!accountDetails) {
                    return res.status(404).json({ error: 'Account not found' });
                }

                return res.status(200).json(accountDetails);
            } catch (error) {
                console.error('Error fetching account:', error);
                return res.status(500).json({ error: 'Failed to fetch account details' });
            }

        case 'PUT':
            try {
                // Only account admins can update account details
                if (!user.is_account_admin) {
                    return res.status(403).json({ error: 'Unauthorized' });
                }

                const { accountName, accountDomain, billingEmail, billingAddress } = req.body;

                // Build update object
                const updateData = {};

                if (accountName) updateData.accountName = accountName;
                if (accountDomain !== undefined) updateData.accountDomain = accountDomain;
                if (billingEmail) updateData.billingEmail = billingEmail;
                if (billingAddress !== undefined) updateData.billingAddress = billingAddress;

                // Update account
                const updatedAccount = await accountManager.updateAccount(user.account_id, updateData);

                return res.status(200).json(updatedAccount);
            } catch (error) {
                console.error('Error updating account:', error);
                return res.status(500).json({ error: 'Failed to update account' });
            }

        default:
            res.setHeader('Allow', ['GET', 'PUT']);
            res.status(405).end(`Method ${method} Not Allowed`);
    }
}

export default withAuth(handler);