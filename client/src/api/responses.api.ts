import { api } from './axios';

export interface SubmitResponsePayload {
  answers: { questionId: string; optionId: string }[];
  sessionId?: string;
}

export const responsesApi = {
  submit: (shareToken: string, data: SubmitResponsePayload) =>
    api.post<{ success: boolean }>(`/responses/${shareToken}`, data),

  checkMine: (shareToken: string) =>
    api.get<{ success: boolean; hasResponded: boolean }>(`/responses/${shareToken}/mine`),
};
