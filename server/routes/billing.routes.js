import express from 'express';

import isAuth from '../middlewares/isAuth.js';
import { billing, confirmPayment } from '../controllers/billing.controllers.js';

const billingRouter = express.Router();

billingRouter.post('/', isAuth, billing);
billingRouter.post('/confirm-payment', isAuth, confirmPayment);

export default billingRouter;