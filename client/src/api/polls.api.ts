import { api } from './axios';
import type { Poll } from '../types';

export interface CreatePollPayload {
  title: string;
  description?: string;
  isAnonymous: boolean;
  expiresAt: string;
  questions: {
    text: string;
    isRequired: boolean;
    order: number;
    options: { text: string; order: number }[];
  }[];
}

export const pollsApi = {
  create: (data: CreatePollPayload) => {
    const invalid = data.questions.some(q =>
      !q.text.trim() ||
      q.options.length !== 4 ||
      q.options.some(o => !o.text.trim())
    );
    if (invalid) throw new Error('Poll has empty fields — fix before submitting');
    return api.post<{ success: boolean; poll: Poll }>('/polls', data);
  },

  getMyPolls: () =>
    api.get<{ success: boolean; polls: Poll[] }>('/polls/mine'),

  getByShareToken: (shareToken: string) =>
    api.get<{ success: boolean; poll: Poll }>(`/polls/${shareToken}/public`),

  update: (id: string, data: Partial<CreatePollPayload>) =>
    api.put<{ success: boolean; poll: Poll }>(`/polls/${id}`, data),

  delete: (id: string) =>
    api.delete<{ success: boolean; message: string }>(`/polls/${id}`),

  publish: (id: string) =>
    api.post<{ success: boolean; poll: Poll }>(`/polls/${id}/publish`),
};
