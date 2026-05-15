import { Router } from 'express';
import * as analyticsController from './analytics.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();

router.get('/:pollId', authenticate, analyticsController.getAnalytics);

export default router;
