import { z } from 'zod';
import { prisma } from '../../config/prisma';
import { AppError } from '../../utils/AppError';
import { getIO } from '../../config/socket';
import { createPollSchema, updatePollSchema } from './polls.validators';

type CreatePollData = z.infer<typeof createPollSchema>;
type UpdatePollData = z.infer<typeof updatePollSchema>;

export const createPoll = async (creatorId: string, data: CreatePollData) => {
  const poll = await prisma.$transaction(async (tx) => {
    const newPoll = await tx.poll.create({
      data: {
        title: data.title,
        description: data.description,
        creatorId,
        isAnonymous: data.isAnonymous,
        expiresAt: new Date(data.expiresAt),
        questions: {
          create: data.questions.map((q) => ({
            text: q.text,
            isRequired: q.isRequired,
            order: q.order,
            options: {
              create: q.options.map((o) => ({
                text: o.text,
                order: o.order,
              })),
            },
          })),
        },
      },
      include: {
        questions: {
          include: { options: { orderBy: { order: 'asc' } } },
          orderBy: { order: 'asc' },
        },
      },
    });
    return newPoll;
  });

  return poll;
};

export const getPollByShareToken = async (shareToken: string) => {
  const poll = await prisma.poll.findUnique({
    where: { shareToken },
    include: {
      questions: {
        include: {
          options: {
            include: { _count: { select: { answers: true } } },
            orderBy: { order: 'asc' },
          },
        },
        orderBy: { order: 'asc' },
      },
      _count: { select: { responses: true } },
    },
  });

  if (!poll) throw new AppError('Poll not found', 404);

  // Auto-expire
  if (poll.expiresAt < new Date() && poll.status === 'ACTIVE') {
    await prisma.poll.update({
      where: { id: poll.id },
      data: { status: 'EXPIRED' },
    });
    poll.status = 'EXPIRED';
  }

  return poll;
};

export const getMyPolls = async (creatorId: string) => {
  const polls = await prisma.poll.findMany({
    where: { creatorId },
    include: {
      _count: { select: { responses: true } },
      questions: {
        select: { id: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  // Auto-expire any that have passed
  const now = new Date();
  const toExpire = polls.filter((p) => p.expiresAt < now && p.status === 'ACTIVE').map((p) => p.id);
  if (toExpire.length > 0) {
    await prisma.poll.updateMany({
      where: { id: { in: toExpire } },
      data: { status: 'EXPIRED' },
    });
    polls.forEach((p) => {
      if (toExpire.includes(p.id)) p.status = 'EXPIRED';
    });
  }

  return polls;
};

export const updatePoll = async (pollId: string, creatorId: string, data: UpdatePollData) => {
  const poll = await prisma.poll.findUnique({ where: { id: pollId } });
  if (!poll) throw new AppError('Poll not found', 404);
  if (poll.creatorId !== creatorId) throw new AppError('Forbidden', 403);

  if (data.questions) {
    // Replace all questions and options in a transaction
    await prisma.$transaction(async (tx) => {
      // Delete existing questions (cascades to options/answers)
      await tx.question.deleteMany({ where: { pollId } });

      await tx.poll.update({
        where: { id: pollId },
        data: {
          title: data.title,
          description: data.description,
          isAnonymous: data.isAnonymous,
          expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined,
          questions: {
            create: data.questions!.map((q) => ({
              text: q.text,
              isRequired: q.isRequired,
              order: q.order,
              options: {
                create: q.options!.map((o) => ({
                  text: o.text,
                  order: o.order,
                })),
              },
            })),
          },
        },
      });
    });
  } else {
    await prisma.poll.update({
      where: { id: pollId },
      data: {
        title: data.title,
        description: data.description,
        isAnonymous: data.isAnonymous,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined,
      },
    });
  }

  return prisma.poll.findUnique({
    where: { id: pollId },
    include: {
      questions: {
        include: { options: { orderBy: { order: 'asc' } } },
        orderBy: { order: 'asc' },
      },
    },
  });
};

export const deletePoll = async (pollId: string, creatorId: string) => {
  const poll = await prisma.poll.findUnique({ where: { id: pollId } });
  if (!poll) throw new AppError('Poll not found', 404);
  if (poll.creatorId !== creatorId) throw new AppError('Forbidden', 403);

  await prisma.poll.delete({ where: { id: pollId } });
  return { message: 'Poll deleted' };
};

export const publishPoll = async (pollId: string, creatorId: string) => {
  const poll = await prisma.poll.findUnique({ where: { id: pollId } });
  if (!poll) throw new AppError('Poll not found', 404);
  if (poll.creatorId !== creatorId) throw new AppError('Forbidden', 403);

  const updated = await prisma.poll.update({
    where: { id: pollId },
    data: { isPublished: true },
  });

  try {
    const io = getIO();
    io.to(`poll:${pollId}`).emit('poll:published', { pollId });
  } catch {
    // Socket not critical
  }

  return updated;
};
