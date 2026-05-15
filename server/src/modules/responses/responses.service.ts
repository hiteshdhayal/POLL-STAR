import { prisma } from '../../config/prisma';
import { AppError } from '../../utils/AppError';
import { getIO } from '../../config/socket';
import { hashIP } from '../../utils/tokens';

interface SubmitData {
  answers: { questionId: string; optionId: string }[];
  sessionId?: string;
}

export const submitResponse = async (
  shareToken: string,
  data: SubmitData,
  userId?: string,
  ipAddress?: string
) => {
  const poll = await prisma.poll.findUnique({
    where: { shareToken },
    include: {
      questions: {
        where: { isRequired: true },
        select: { id: true },
      },
    },
  });

  if (!poll) throw new AppError('Poll not found', 404);

  // Check expiry
  if (poll.expiresAt < new Date()) {
    await prisma.poll.update({ where: { id: poll.id }, data: { status: 'EXPIRED' } });
    throw new AppError('Poll has expired', 403);
  }

  // Check status
  if (poll.status === 'CLOSED') throw new AppError('Poll is closed', 403);

  // Duplicate check for authenticated users
  if (userId) {
    const existing = await prisma.response.findUnique({
      where: { pollId_userId: { pollId: poll.id, userId } },
    });
    if (existing) throw new AppError('You have already responded to this poll', 409);
  } else {
    // Anonymous duplicate check by sessionId or IP hash
    const ipHash = ipAddress ? hashIP(ipAddress) : null;
    const orConditions: { pollId: string; sessionId?: string; ipHash?: string }[] = [];

    if (data.sessionId) orConditions.push({ pollId: poll.id, sessionId: data.sessionId });
    if (ipHash) orConditions.push({ pollId: poll.id, ipHash });

    if (orConditions.length > 0) {
      const existing = await prisma.response.findFirst({
        where: { OR: orConditions },
      });
      if (existing) throw new AppError('You have already responded to this poll', 409);
    }
  }

  // Validate required questions are answered
  const requiredQuestionIds = poll.questions.map((q) => q.id);
  const answeredQuestionIds = data.answers.map((a) => a.questionId);
  const missingRequired = requiredQuestionIds.filter((id) => !answeredQuestionIds.includes(id));
  if (missingRequired.length > 0) {
    throw new AppError('Please answer all required questions', 400);
  }

  // Validate optionIds belong to their questionIds
  const questionOptionsMap = await prisma.question.findMany({
    where: { id: { in: answeredQuestionIds }, pollId: poll.id },
    include: { options: { select: { id: true } } },
  });

  for (const answer of data.answers) {
    const question = questionOptionsMap.find((q) => q.id === answer.questionId);
    if (!question) throw new AppError(`Question ${answer.questionId} not found in this poll`, 400);
    const validOption = question.options.some((o) => o.id === answer.optionId);
    if (!validOption) throw new AppError(`Invalid option for question ${answer.questionId}`, 400);
  }

  // Create response + answers in transaction
  const ipHash = ipAddress ? hashIP(ipAddress) : null;

  const response = await prisma.$transaction(async (tx) => {
    const newResponse = await tx.response.create({
      data: {
        pollId: poll.id,
        userId: userId ?? null,
        sessionId: data.sessionId ?? null,
        ipHash,
        answers: {
          create: data.answers.map((a) => ({
            questionId: a.questionId,
            optionId: a.optionId,
          })),
        },
      },
      include: { answers: true },
    });
    return newResponse;
  });

  // Emit socket update
  try {
    const io = getIO();
    const totalResponses = await prisma.response.count({ where: { pollId: poll.id } });

    // Get updated counts per option for the answered questions
    const questionUpdates = await Promise.all(
      data.answers.map(async (answer) => {
        const count = await prisma.responseAnswer.count({
          where: { questionId: answer.questionId, optionId: answer.optionId },
        });
        return { questionId: answer.questionId, optionId: answer.optionId, newCount: count };
      })
    );

    io.to(`poll:${poll.id}`).emit('response:new', { totalResponses, questionUpdates });
  } catch {
    // Socket not critical to response submission
  }

  return response;
};

export const checkIfAlreadyResponded = async (shareToken: string, userId: string) => {
  const poll = await prisma.poll.findUnique({ where: { shareToken }, select: { id: true } });
  if (!poll) throw new AppError('Poll not found', 404);

  const existing = await prisma.response.findUnique({
    where: { pollId_userId: { pollId: poll.id, userId } },
  });

  return { hasResponded: !!existing };
};
