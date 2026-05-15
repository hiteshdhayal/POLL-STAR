import React from 'react';
import type { AnalyticsQuestion } from '../../types';
import { ResponseBarChart } from './ResponseBarChart';

interface QuestionBreakdownProps {
  questions: AnalyticsQuestion[];
}

export const QuestionBreakdown: React.FC<QuestionBreakdownProps> = ({ questions }) => {
  return (
    <div className="space-y-12">
      {questions.map((question, index) => (
        <div key={question.id} className="card border border-border">
          <div className="flex items-start justify-between mb-8">
            <div>
              <p className="label mb-2">Question {index + 1}</p>
              <h3 className="font-display text-2xl text-charcoal">{question.text}</h3>
              <p className="text-xs text-muted mt-2">
                {question.totalAnswers} total answers · {question.isRequired ? 'Required' : 'Optional'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <ResponseBarChart options={question.options} totalAnswers={question.totalAnswers} />
            </div>
            
            <div className="order-1 lg:order-2 space-y-4">
              <p className="label">Results Breakdown</p>
              <div className="space-y-3">
                {question.options.map((option) => (
                  <div key={option.id} className="space-y-1">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-charcoal">{option.text}</span>
                      <span className="text-muted">{option.count} ({option.percentage}%)</span>
                    </div>
                    <div className="w-full h-1.5 bg-border overflow-hidden">
                      <div 
                        className="h-full bg-crimson transition-all duration-1000 ease-out"
                        style={{ width: `${option.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
