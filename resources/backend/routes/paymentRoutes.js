import express from 'express';
const router = express.Router();
import { createCheckoutSession, getKey, getPendingPayment, verifyPayment } from '../controllers/paymentController.js';
import { protectedRoute } from '../middleware/productMiddleware.js';

router.post('/createcheckout', protectedRoute, createCheckoutSession);
router.post('/verifypayment', protectedRoute, verifyPayment);
router.get('/getkey', protectedRoute, getKey);
router.get('/pending/:razorpayOrderId', protectedRoute, getPendingPayment);

export default router;
