import stripe from "../config/stripe.js";
import { PLANS } from "../config/plan.js";
import User from "../model/user.model.js";

const frontendBaseUrl = (process.env.FRONTEND_URL || "http://localhost:5173").replace(/\/+$/, "");

export const billing = async (req, res) => {
    try {
        const { planType } = req.body;
        const userId = req.user?._id?.toString();
        const plan = PLANS[planType];

        if (!userId) {
            return res.status(401).json({ message: "User not authenticated" });
        }

        if (!plan || plan.price === 0) {
            return res.status(400).json({ error: "Invalid paid plan" });
        }

        const session = await stripe.checkout.sessions.create({
            mode: "payment",
            payment_method_types: ["card"],
            line_items: [
                {
                    price_data: {
                        currency: "inr",
                        product_data: {
                            name: `Genweb.ai ${planType.toUpperCase()} Plan`,
                        },
                        unit_amount: plan.price * 100,
                    },
                    quantity: 1,
                },
            ],
            client_reference_id: userId,
            metadata: {
                userId,
                credits: String(plan.credits),
                plan: String(plan.plan),
                metaId: String(plan.plan),
            },
            success_url: `${frontendBaseUrl}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${frontendBaseUrl}/pricing`,
        });

        return res.status(200).json({ sessionUrl: session.url });
    } catch (error) {
        return res.status(500).json({ message: `billing error ${error.message}` });
    }
};

export const confirmPayment = async (req, res) => {
    try {
        const { sessionId } = req.body;
        const userId = req.user?._id?.toString();

        if (!userId) {
            return res.status(401).json({ message: "User not authenticated" });
        }

        if (!sessionId) {
            return res.status(400).json({ message: "Missing Stripe session id" });
        }

        const session = await stripe.checkout.sessions.retrieve(sessionId);

        if (!session || session.payment_status !== "paid") {
            return res.status(400).json({ message: "Payment is not complete yet" });
        }

        const creditsToAdd = Number(session.metadata?.credits ?? 0);
        const planName = session.metadata?.plan || session.metadata?.metaId || "free";
        const sessionUserId = session.metadata?.userId || session.client_reference_id;

        if (!sessionUserId || sessionUserId !== userId) {
            return res.status(400).json({ message: "This payment session does not belong to the current user" });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (user.lastPurchasedSessionId === sessionId) {
            return res.status(200).json({ message: "Credits already applied", user });
        }

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            {
                $inc: { credits: creditsToAdd },
                $set: { plan: planName, lastPurchasedSessionId: sessionId },
            },
            { new: true }
        );

        return res.status(200).json({ message: "Credits applied", user: updatedUser });
    } catch (error) {
        console.error("confirmPayment error:", error);
        return res.status(500).json({ message: `confirm payment error: ${error.message}` });
    }
};
