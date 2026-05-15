import React from 'react';

interface ParticipationStatsProps {
  totalResponses: number;
  participationRate?: number;
  questionsCount: number;
}

export const ParticipationStats: React.FC<ParticipationStatsProps> = ({
  totalResponses,
  participationRate = 100,
  questionsCount,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
      <div className="card">
        <p className="label mb-2">Total Responses</p>
        <h4 className="font-display text-4xl text-charcoal">{totalResponses}</h4>
      </div>
      <div className="card">
        <p className="label mb-2">Questions</p>
        <h4 className="font-display text-4xl text-charcoal">{questionsCount}</h4>
      </div>
      <div className="card">
        <p className="label mb-2">Participation Rate</p>
        <h4 className="font-display text-4xl text-crimson">{participationRate}%</h4>
      </div>
    </div>
  );
};
