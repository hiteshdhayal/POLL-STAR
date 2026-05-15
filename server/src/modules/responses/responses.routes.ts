import { Router } from 'express';
import * as responsesController from './responses.controller';
import { authenticate, optionalAuth } from '../../middleware/auth.middleware';

const router = Router();

router.post('/:shareToken', optionalAuth, responsesController.submitResponse);
router.get('/:shareToken/mine', authenticate, responsesController.checkIfAlreadyResponded);

export default router;
