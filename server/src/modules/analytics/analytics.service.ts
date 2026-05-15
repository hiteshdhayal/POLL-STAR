import { prisma } from '../../config/prisma';
import { AppError } from '../../utils/AppError';

export const getAnalytics = async (pollId: string, creatorId: string) => {
  const poll = await prisma.poll.findUnique({ where: { id: pollId } });
  if (!poll) throw new AppError('Poll not found', 404);
  if (poll.creatorId !== creatorId) throw new AppError('Forbidden', 403);

  const totalResponses = await prisma.response.count({ where: { pollId } });

  const questionStats = await prisma.question.findMany({
    where: { pollId },
    include: {
      options: {
        include: {
          _count: { select: { answers: true } },
        },
        orderBy: { order: 'asc' },
      },
      _count: { select: { answers: true } },
    },
    orderBy: { order: 'asc' },
  });

  const questions = questionStats.map((q) => {
    const totalAnswers = q._count.answers;
    const options = q.options.map((o) => ({
      id: o.id,
      text: o.text,
      count: o._count.answers,
      percentage: totalAnswers > 0 ? Math.round((o._count.answers / totalAnswers) * 100) : 0,
    }));
    return {
      id: q.id,
      text: q.text,
      isRequired: q.isRequired,
      totalAnswers,
      options,
    };
  });

  return {
    pollId,
    pollTitle: poll.title,
    pollStatus: poll.status,
    isPublished: poll.isPublished,
    totalResponses,
    questions,
  };
};
