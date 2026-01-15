import { Router } from 'express';
import {
  createPayment,
  createRecurringSubscription,
  getPayments,
  getPaymentById,
  handleWebhook,
  cancelSubscription,
  getActiveSubscription,
  getUpcomingInvoices,
} from '../controllers/payment.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/webhook', handleWebhook);

router.use(authenticate);

router.post('/create', createPayment);
router.post('/subscription/create', createRecurringSubscription);
router.post('/subscription/cancel', cancelSubscription);
router.get('/subscription/active', getActiveSubscription);
router.get('/upcoming-invoices', getUpcomingInvoices);
router.get('/', getPayments);
router.get('/:id', getPaymentById);

export default router;
