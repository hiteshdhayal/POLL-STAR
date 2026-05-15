import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { pollsApi } from '../../api/polls.api';
import { responsesApi } from '../../api/responses.api';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Loader2, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

const RespondPage: React.FC = () => {
  const { shareToken } = useParams<{ shareToken: string }>();
  const user = useAuthStore(state => state.user);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data, isLoading, error: fetchError } = useQuery({
    queryKey: ['public-poll', shareToken],
    queryFn: () => pollsApi.getByShareToken(shareToken!),
    enabled: !!shareToken,
  });

  const poll = data?.data?.poll;

  const submitMutation = useMutation({
    mutationFn: (payload: { answers: { questionId: string; optionId: string }[] }) => 
      responsesApi.submit(shareToken!, payload),
    onSuccess: () => {
      setIsSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Failed to submit response.');
    }
  });

  const handleSelect = (questionId: string, optionId: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: optionId }));
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!poll) return;

    const formattedAnswers = Object.entries(answers).map(([questionId, optionId]) => ({
      questionId,
      optionId
    }));

    // Basic validation
    const requiredUnanswered = poll.questions
      .filter(q => q.isRequired && !answers[q.id])
      .map(q => q.text);

    if (requiredUnanswered.length > 0) {
      setError('Please answer all required questions.');
      return;
    }

    submitMutation.mutate({ answers: formattedAnswers });
  };

  if (isLoading) {
    return (
      <PageWrapper noNavbar>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-crimson" />
        </div>
      </PageWrapper>
    );
  }

  if (fetchError || !poll) {
    return (
      <PageWrapper noNavbar>
        <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center space-y-6">
          <AlertCircle className="w-16 h-16 text-muted opacity-20" />
          <div className="space-y-2">
            <h2 className="font-display text-3xl text-charcoal">Poll not found.</h2>
            <p className="text-muted">The link may be broken or the poll has been deleted.</p>
          </div>
          <Link to="/">
            <Button variant="secondary">Return Home</Button>
          </Link>
        </div>
      </PageWrapper>
    );
  }

  if (isSubmitted) {
    return (
      <PageWrapper noNavbar>
        <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
          <div className="max-w-md w-full space-y-8 animate-fade-up">
            <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto" />
            <div className="space-y-2">
              <h2 className="font-display text-4xl text-charcoal italic">Thank you for your voice.</h2>
              <p className="text-muted leading-relaxed">
                Your response has been recorded successfully.
              </p>
            </div>
            {poll.isPublished && (
              <div className="pt-8">
                <Link to={`/p/${shareToken}/results`}>
                  <Button variant="primary">View Live Results</Button>
                </Link>
              </div>
            )}
            <div className="pt-4 text-[10px] uppercase tracking-widest text-muted font-bold">
              Powered by PollStar
            </div>
          </div>
        </div>
      </PageWrapper>
    );
  }

  const isExpired = poll.status === 'EXPIRED' || new Date(poll.expiresAt) < new Date();

  if (isExpired) {
    return (
      <PageWrapper noNavbar>
        <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center space-y-8">
          <Clock className="w-16 h-16 text-crimson opacity-20" />
          <div className="space-y-2">
            <h2 className="font-display text-4xl text-charcoal">This poll has expired.</h2>
            <p className="text-muted">Participation is no longer available for this discussion.</p>
          </div>
          {poll.isPublished && (
            <Link to={`/p/${shareToken}/results`}>
              <Button>View Final Results</Button>
            </Link>
          )}
          <Link to="/" className="block">
            <Button variant="ghost">Return Home</Button>
          </Link>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper noNavbar>
      <div className="min-h-screen py-20 px-6">
        <div className="max-w-2xl mx-auto space-y-16">
          {/* Header */}
          <div className="text-center space-y-6 animate-fade-up">
            <Link to="/" className="inline-flex flex-col items-center leading-none mb-8 opacity-50 hover:opacity-100 transition-opacity">
              <span className="font-display text-lg font-bold text-charcoal tracking-tight">POLL—STAR</span>
              <span className="text-[8px] tracking-[0.3em] text-muted uppercase">投票 · HOSHI</span>
            </Link>
            
            <div className="space-y-4">
              <div className="flex justify-center gap-2">
                <Badge variant="default">{poll.isAnonymous ? 'Anonymous' : 'Identified'}</Badge>
                {poll.questions.some(q => q.isRequired) && <Badge variant="info">Required Fields</Badge>}
              </div>
              <h1 className="font-display text-4xl md:text-5xl text-charcoal leading-tight">
                {poll.title}
              </h1>
              {poll.description && (
                <p className="text-muted text-lg max-w-lg mx-auto italic">
                  "{poll.description}"
                </p>
              )}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-12 animate-fade-up animation-delay-200">
            {error && (
              <div className="p-4 bg-red-50 border border-red-100 text-red-600 text-xs uppercase tracking-widest font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4" /> {error}
              </div>
            )}

            <div className="space-y-16">
              {poll.questions.map((question, qIdx) => (
                <div key={question.id} className="space-y-8">
                  <div className="space-y-3">
                    <p className="label">Question {qIdx + 1} {question.isRequired && <span className="text-crimson">*</span>}</p>
                    <h3 className="font-display text-2xl text-charcoal">{question.text}</h3>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    {question.options.map((option) => {
                      const isSelected = answers[question.id] === option.id;
                      return (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() => handleSelect(question.id, option.id)}
                          className={`
                            group flex items-center justify-between p-6 text-left border transition-all duration-200
                            ${isSelected 
                              ? 'bg-crimson/5 border-crimson shadow-[0_8px_24px_rgba(196,30,58,0.08)]' 
                              : 'bg-card-bg border-border hover:border-charcoal/30'
                            }
                          `}
                        >
                          <span className={`text-sm font-medium transition-colors ${isSelected ? 'text-crimson' : 'text-charcoal'}`}>
                            {option.text}
                          </span>
                          <div className={`
                            w-5 h-5 rounded-full border flex items-center justify-center transition-all
                            ${isSelected ? 'border-crimson bg-crimson' : 'border-border group-hover:border-charcoal'}
                          `}>
                            {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Progress & Submit */}
            <div className="pt-12 space-y-8 border-t border-border">
              <div className="flex justify-between items-center text-[10px] uppercase tracking-widest font-bold text-muted">
                <span>{Object.keys(answers).length} of {poll.questions.length} answered</span>
                <div className="flex gap-1">
                  {poll.questions.map((q, i) => (
                    <div 
                      key={i} 
                      className={`w-2 h-2 rounded-full transition-all ${answers[q.id] ? 'bg-crimson' : 'bg-border'}`} 
                    />
                  ))}
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full py-5 text-sm" 
                loading={submitMutation.isPending}
                disabled={Object.keys(answers).length === 0}
              >
                Submit Response →
              </Button>
            </div>
          </form>
        </div>
      </div>
    </PageWrapper>
  );
};

export default RespondPage;
