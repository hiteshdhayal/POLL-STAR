import { Router } from 'express';
import * as pollsController from './polls.controller';
import { authenticate, optionalAuth } from '../../middleware/auth.middleware';

const router = Router();

router.post('/', authenticate, pollsController.createPoll);
router.get('/mine', authenticate, pollsController.getMyPolls);
router.get('/:shareToken/public', optionalAuth, pollsController.getPollByShareToken);
router.put('/:id', authenticate, pollsController.updatePoll);
router.delete('/:id', authenticate, pollsController.deletePoll);
router.post('/:id/publish', authenticate, pollsController.publishPoll);

export default router;
