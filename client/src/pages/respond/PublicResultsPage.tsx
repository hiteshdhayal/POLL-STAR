import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { pollsApi } from '../../api/polls.api';
import { Button } from '../../components/ui/Button';
import { Loader2, AlertCircle, BarChart3 } from 'lucide-react';
import { usePollSocket } from '../../hooks/usePollSocket';

const PublicResultsPage: React.FC = () => {
  const { shareToken } = useParams<{ shareToken: string }>();

  const { data, isLoading, error } = useQuery({
    queryKey: ['public-poll-results', shareToken],
    queryFn: () => pollsApi.getByShareToken(shareToken!),
    enabled: !!shareToken,
    refetchInterval: 30000,
  });

  const poll = data?.data?.poll;

  // Real-time updates
  const { liveData } = usePollSocket(poll?.id || '');

  React.useEffect(() => {
    // If we receive a socket event, the data might be stale.
    // We could invalidate the query, but tanstack query refetchInterval handles it mostly.
    // For a public view, letting it poll is usually fine, or we can force refetch here.
  }, [liveData]);

  if (isLoading) {
    return (
      <PageWrapper noNavbar>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-crimson" />
        </div>
      </PageWrapper>
    );
  }

  if (error || !poll) {
    return (
      <PageWrapper noNavbar>
        <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center space-y-6">
          <AlertCircle className="w-16 h-16 text-muted opacity-20" />
          <div className="space-y-2">
            <h2 className="font-display text-3xl text-charcoal">Results not found.</h2>
            <p className="text-muted">The link may be broken or the poll has been deleted.</p>
          </div>
          <Link to="/">
            <Button variant="secondary">Return Home</Button>
          </Link>
        </div>
      </PageWrapper>
    );
  }

  const isExpired = poll.status === 'EXPIRED' || new Date(poll.expiresAt) < new Date();

  return (
    <PageWrapper noNavbar>
      <div className="min-h-screen bg-sand text-charcoal flex flex-col">
        <header className="px-6 py-8 border-b border-border text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-crimson/[0.02] rounded-bl-full pointer-events-none" />
          <BarChart3 className="w-8 h-8 text-crimson mx-auto mb-4" />
          <h1 className="font-display text-4xl mb-2">{poll.title}</h1>
          <p className="text-muted uppercase tracking-widest text-[10px] font-bold">
            {isExpired ? 'Final Results' : 'Live Results'} • {poll._count?.responses || 0} Responses
          </p>
        </header>

        <main className="flex-1 max-w-3xl w-full mx-auto px-6 py-12 space-y-12">
          {poll.questions.map((q: any, qIndex: number) => {
            const totalAnswers = q.options.reduce((sum: number, o: any) => sum + (o._count?.answers || 0), 0);
            
            return (
              <div key={q.id} className="space-y-6">
                <h3 className="font-display text-2xl">
                  <span className="text-muted mr-4">{qIndex + 1}.</span>
                  {q.text}
                </h3>
                
                <div className="space-y-4 pl-8">
                  {q.options.map((opt: any) => {
                    const count = opt._count?.answers || 0;
                    const percentage = totalAnswers > 0 ? Math.round((count / totalAnswers) * 100) : 0;
                    
                    return (
                      <div key={opt.id} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium text-charcoal">{opt.text}</span>
                          <span className="text-muted">{percentage}% ({count})</span>
                        </div>
                        <div className="h-2 w-full bg-border overflow-hidden">
                          <div 
                            className="h-full bg-crimson transition-all duration-1000 ease-out"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </main>

        <footer className="px-6 py-8 border-t border-border text-center space-y-6">
          {!isExpired && (
            <Link to={`/p/${shareToken}`}>
              <Button variant="secondary">Submit a Response</Button>
            </Link>
          )}
          <Link to="/" className="block">
            <span className="text-[10px] uppercase tracking-widest text-muted font-bold hover:text-charcoal transition-colors">
              Create your own poll
            </span>
          </Link>
        </footer>
      </div>
    </PageWrapper>
  );
};

export default PublicResultsPage;
