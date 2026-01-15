import { Router } from 'express';
import {
  getCurrentSubscription,
  getPlans,
  upgradeSubscription,
  cancelSubscription,
  getSubscriptionHistory,
} from '../controllers/subscription.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', getCurrentSubscription);
router.get('/plans', getPlans);
router.post('/upgrade', upgradeSubscription);
router.post('/cancel', cancelSubscription);
router.get('/history', getSubscriptionHistory);

export default router;
