import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { createPollSchema, updatePollSchema } from './polls.validators';
import * as pollsService from './polls.service';

export const createPoll = asyncHandler(async (req: Request, res: Response) => {
  const data = createPollSchema.parse(req.body);
  const poll = await pollsService.createPoll(req.user!.id, data);
  res.status(201).json({ success: true, poll });
});

export const getMyPolls = asyncHandler(async (req: Request, res: Response) => {
  const polls = await pollsService.getMyPolls(req.user!.id);
  res.json({ success: true, polls });
});

export const getPollByShareToken = asyncHandler(async (req: Request, res: Response) => {
  const poll = await pollsService.getPollByShareToken(req.params.shareToken);
  res.json({ success: true, poll });
});

export const updatePoll = asyncHandler(async (req: Request, res: Response) => {
  const data = updatePollSchema.parse(req.body);
  const poll = await pollsService.updatePoll(req.params.id, req.user!.id, data);
  res.json({ success: true, poll });
});

export const deletePoll = asyncHandler(async (req: Request, res: Response) => {
  const result = await pollsService.deletePoll(req.params.id, req.user!.id);
  res.json({ success: true, ...result });
});

export const publishPoll = asyncHandler(async (req: Request, res: Response) => {
  const poll = await pollsService.publishPoll(req.params.id, req.user!.id);
  res.json({ success: true, poll });
});
