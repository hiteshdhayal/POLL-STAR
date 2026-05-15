import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { pollsApi } from '../../api/polls.api';
import { PollCard } from '../../components/polls/PollCard';
import { PollCardSkeleton } from '../../components/ui/Skeleton';
import { ArrowLeft, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MyPollsPage: React.FC = () => {
  const navigate = useNavigate();
  const { data, isLoading } = useQuery({
    queryKey: ['my-polls'],
    queryFn: () => pollsApi.getMyPolls(),
  });

  const polls = data?.data?.polls || [];

  return (
    <PageWrapper>
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex items-center gap-4 mb-12">
          <button onClick={() => navigate('/dashboard')} className="text-muted hover:text-charcoal transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-display text-4xl text-charcoal">All My Polls</h1>
        </div>

        <div className="space-y-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input 
              type="text"
              placeholder="Search polls..."
              className="w-full bg-card-bg border border-border pl-12 pr-6 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-crimson/30 focus:border-crimson transition-all"
            />
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <PollCardSkeleton />
              <PollCardSkeleton />
            </div>
          ) : polls.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {polls.map((poll) => (
                <PollCard key={poll.id} poll={poll} />
              ))}
            </div>
          ) : (
            <div className="card text-center py-20 uppercase tracking-widest text-xs font-bold text-muted">
              No polls found.
            </div>
          )}
        </div>
      </div>
    </PageWrapper>
  );
};

export default MyPollsPage;
