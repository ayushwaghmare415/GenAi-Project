import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import cookieParser from "cookie-parser";
import authRouter from "./routes/auth.routes.js";
import userRouter from "./routes/user.routes.js";
import websiteRouter from "./routes/website.routes.js";
import billingRouter from "./routes/billing.routes.js";
import { stripeWebhook } from './controllers/stripeWebhook.controller.js';
import cors from "cors";
dotenv.config();



const app = express();
const port = process.env.PORT || 8000;

app.post('/api/stripe/webhook', express.raw({ type: 'application/json' }), stripeWebhook);
app.use(express.json());

app.use(cookieParser());

app.use(cors({
    origin: ["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}))
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/websites", websiteRouter);
app.use("/api/billing", billingRouter);

connectDB();

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});