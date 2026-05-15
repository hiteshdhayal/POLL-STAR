import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import * as analyticsService from './analytics.service';

export const getAnalytics = asyncHandler(async (req: Request, res: Response) => {
  const analytics = await analyticsService.getAnalytics(req.params.pollId, req.user!.id);
  res.json({ success: true, analytics });
});
