// pages/api/account/upgrade.js
import { accountManager } from '../../../lib/auth';
import { query } from '../../../lib/db';
import { withAuth } from '../../../lib/middleware';
// Import your payment processing library here (e.g., Stripe)
// import { stripe } from '../../../lib/stripe';

async function handler(req, res) {
    const { method } = req;
    const { user } = req;

    if (method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).end(`Method ${method} Not Allowed`);
    }

    try {
        // Only account admins can upgrade the account
        if (!user.is_account_admin) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        const { planId, billingCycle, paymentMethodId } = req.body;

        // Validate required fields
        if (!planId || !billingCycle) {
            return res.status(400).json({ error: 'Plan ID and billing cycle are required' });
        }

        // Check if plan exists
        const planQuery = 'SELECT * FROM account_plans WHERE plan_id = $1';
        const planResult = await query(planQuery, [planId]);

        if (planResult.rows.length === 0) {
            return res.status(404).json({ error: 'Plan not found' });
        }

        const plan = planResult.rows[0];

        // Get current account details
        const accountDetails = await accountManager.getAccountDetails(user.account_id);

        if (!accountDetails) {
            return res.status(404).json({ error: 'Account not found' });
        }

        // Calculate price based on billing cycle
        const price = billingCycle === 'monthly' ? plan.price_monthly : plan.price_yearly;

        // In a real application, this is where you would process the payment
        // using a service like Stripe
        /*
        const paymentResult = await stripe.paymentIntents.create({
          amount: Math.round(price * 100), // Convert to cents
          currency: 'usd',
          payment_method: paymentMethodId,
          confirm: true,
          description: `${accountDetails.account_name} - ${plan.plan_name} Plan (${billingCycle})`
        });
        
        if (paymentResult.status !== 'succeeded') {
          return res.status(400).json({ error: 'Payment failed' });
        }
        */

        // Calculate subscription dates
        const subscriptionStarts = new Date();
        const subscriptionEnds = new Date();

        if (billingCycle === 'monthly') {
            subscriptionEnds.setMonth(subscriptionEnds.getMonth() + 1);
        } else {
            subscriptionEnds.setFullYear(subscriptionEnds.getFullYear() + 1);
        }

        // Update account with new plan
        const updateQuery = `
      UPDATE accounts
      SET plan_id = $1, subscription_starts = $2, subscription_ends = $3
      WHERE account_id = $4
      RETURNING *
    `;

        const updateResult = await query(updateQuery, [
            planId,
            subscriptionStarts,
            subscriptionEnds,
            user.account_id
        ]);

        // Return updated account
        return res.status(200).json({
            success: true,
            message: 'Account upgraded successfully',
            account: updateResult.rows[0]
        });
    } catch (error) {
        console.error('Error upgrading account:', error);
        return res.status(500).json({ error: 'Failed to upgrade account' });
    }
}

export default withAuth(handler);