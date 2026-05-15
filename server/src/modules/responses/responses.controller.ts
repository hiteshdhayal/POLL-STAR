import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { submitResponseSchema } from './responses.validators';
import * as responsesService from './responses.service';

export const submitResponse = asyncHandler(async (req: Request, res: Response) => {
  const data = submitResponseSchema.parse(req.body);
  const { shareToken } = req.params;
  const userId = req.user?.id;
  const ipAddress = req.ip || req.socket.remoteAddress;

  const result = await responsesService.submitResponse(shareToken, data, userId, ipAddress);
  res.status(201).json({ success: true, response: result });
});

export const checkIfAlreadyResponded = asyncHandler(async (req: Request, res: Response) => {
  const { shareToken } = req.params;
  const userId = req.user!.id;
  const result = await responsesService.checkIfAlreadyResponded(shareToken, userId);
  res.json({ success: true, ...result });
});
