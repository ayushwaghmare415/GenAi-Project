import stripe from '../config/stripe.js';
import User from '../model/user.model.js';

const getCheckoutSessionFromEvent = async (event) => {
    if (event.type === 'checkout.session.completed') {
        return event.data.object;
    }

    if (event.type === 'payment_intent.succeeded') {
        const paymentIntent = event.data.object;
        const sessions = await stripe.checkout.sessions.list({
            payment_intent: paymentIntent.id,
            limit: 1,
        });

        return sessions.data?.[0] || null;
    }

    return null;
};

export const stripeWebhook = async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET?.trim();

    try {
        if (!webhookSecret) {
            console.error('Stripe webhook secret is missing. Set STRIPE_WEBHOOK_SECRET in server/.env.');
            return res.status(500).json({ received: false, message: 'Stripe webhook secret is not configured.' });
        }

        const event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
        const session = await getCheckoutSessionFromEvent(event);

        if (!session) {
            return res.json({ received: true, ignored: true });
        }

        const userId = session.metadata?.userId;
        const creditsToAdd = Number(session.metadata?.credits ?? 0);
        const planName = session.metadata?.plan || session.metadata?.metaId || 'free';

        if (!userId) {
            console.error('Stripe checkout session is missing userId metadata', { eventType: event.type, sessionId: session.id });
            return res.status(400).json({ received: false, message: 'Missing userId in Stripe metadata' });
        }

        await User.findByIdAndUpdate(
            userId,
            {
                $inc: { credits: creditsToAdd },
                $set: { plan: planName },
            },
            { new: true }
        );

        console.log('Stripe credits updated', {
            eventType: event.type,
            userId,
            creditsToAdd,
            planName,
        });

        return res.json({ received: true });
    } catch (err) {
        console.error('Stripe webhook error:', err);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }
};