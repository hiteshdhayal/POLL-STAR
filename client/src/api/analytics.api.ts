import { api } from './axios';
import type { AnalyticsData } from '../types';

export const analyticsApi = {
  get: (pollId: string) =>
    api.get<{ success: boolean; analytics: AnalyticsData }>(`/analytics/${pollId}`),
};
