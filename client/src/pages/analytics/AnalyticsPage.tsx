import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { analyticsApi } from '../../api/analytics.api';
import { pollsApi } from '../../api/polls.api';
import { ParticipationStats } from '../../components/analytics/ParticipationStats';
import { QuestionBreakdown } from '../../components/analytics/QuestionBreakdown';
import { LiveBadge } from '../../components/ui/LiveBadge';
import { Button } from '../../components/ui/Button';
import { PollStatusBadge } from '../../components/polls/PollStatusBadge';
import { usePollSocket } from '../../hooks/usePollSocket';
import { ArrowLeft, Share2, Edit3, Send, Loader2 } from 'lucide-react';

const AnalyticsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [copied, setCopied] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ['analytics', id],
    queryFn: () => analyticsApi.get(id!),
    enabled: !!id,
    refetchInterval: 30000, // Fallback polling every 30s
  });

  const analytics = data?.data?.analytics;

  // Real-time updates via Socket
  const { liveData, isConnected } = usePollSocket(id!);

  useEffect(() => {
    if (liveData) {
      // Optistically update or just invalidate query
      queryClient.invalidateQueries({ queryKey: ['analytics', id] });
    }
  }, [liveData, id, queryClient]);

  const publishMutation = useMutation({
    mutationFn: () => pollsApi.publish(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['analytics', id] });
    }
  });

  const copyLink = () => {
    if (!analytics) return;
    const url = `${window.location.origin}/p/${analytics.pollId}`; // Note: Backend usually provides shareToken
    // In our simplified setup, we might need to handle the URL correctly
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <PageWrapper>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-crimson" />
        </div>
      </PageWrapper>
    );
  }

  if (error || !analytics) {
    return (
      <PageWrapper>
        <div className="max-w-4xl mx-auto px-6 py-12 text-center space-y-6">
          <h2 className="font-display text-3xl text-charcoal">Analytics not found.</h2>
          <Button variant="secondary" onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </Button>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-8 mb-16">
          <div className="space-y-6">
            <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-xs uppercase tracking-widest font-bold text-muted hover:text-charcoal transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back to Dashboard
            </button>
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-3">
                <PollStatusBadge status={analytics.pollStatus} isPublished={analytics.isPublished} />
                <LiveBadge connected={isConnected} />
              </div>
              <h1 className="font-display text-5xl text-charcoal leading-tight max-w-3xl">
                {analytics.pollTitle}
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
            <Button variant="secondary" size="sm" onClick={copyLink}>
              <Share2 className="w-4 h-4 mr-2" /> {copied ? 'Copied!' : 'Copy Link'}
            </Button>
            <Link to={`/polls/${id}/edit`}>
              <Button variant="secondary" size="sm">
                <Edit3 className="w-4 h-4 mr-2" /> Edit Poll
              </Button>
            </Link>
            {!analytics.isPublished && (
              <Button size="sm" onClick={() => publishMutation.mutate()} loading={publishMutation.isPending}>
                <Send className="w-4 h-4 mr-2" /> Publish Results
              </Button>
            )}
          </div>
        </div>

        {/* Stats Overview */}
        <ParticipationStats 
          totalResponses={analytics.totalResponses} 
          questionsCount={analytics.questions.length} 
        />

        {/* Question Details */}
        <div className="space-y-8">
          <div className="border-b border-border pb-4 flex justify-between items-end">
            <h2 className="font-display text-3xl text-charcoal italic">The breakdown.</h2>
            <p className="label">Detail View</p>
          </div>
          <QuestionBreakdown questions={analytics.questions} />
        </div>
      </div>
    </PageWrapper>
  );
};

export default AnalyticsPage;
