import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { useAuthStore } from '../../store/authStore';
import { pollsApi } from '../../api/polls.api';
import { PollCard } from '../../components/polls/PollCard';
import { PollCardSkeleton } from '../../components/ui/Skeleton';
import { Button } from '../../components/ui/Button';
import { Plus, BarChart3, Clock, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const DashboardPage: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  
  const { data, isLoading, error } = useQuery({
    queryKey: ['my-polls'],
    queryFn: () => pollsApi.getMyPolls(),
  });

  const polls = data?.data?.polls || [];
  const activePolls = polls.filter(p => p.status === 'ACTIVE').length;
  const totalResponses = polls.reduce((acc, p) => acc + (p._count?.responses || 0), 0);

  return (
    <PageWrapper>
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="space-y-2">
            <p className="label">Overview</p>
            <h1 className="font-display text-5xl text-charcoal">
              Good morning, <span className="text-crimson italic">{user?.name.split(' ')[0]}.</span>
            </h1>
          </div>
          <Link to="/polls/create">
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" /> New Poll
            </Button>
          </Link>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="card flex items-center gap-6">
            <div className="w-12 h-12 bg-charcoal/5 flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-charcoal" />
            </div>
            <div>
              <p className="label">Total Polls</p>
              <p className="text-2xl font-display text-charcoal">{polls.length}</p>
            </div>
          </div>
          <div className="card flex items-center gap-6">
            <div className="w-12 h-12 bg-crimson/5 flex items-center justify-center">
              <Clock className="w-6 h-6 text-crimson" />
            </div>
            <div>
              <p className="label">Active</p>
              <p className="text-2xl font-display text-charcoal">{activePolls}</p>
            </div>
          </div>
          <div className="card flex items-center gap-6">
            <div className="w-12 h-12 bg-green-50 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="label">Total Responses</p>
              <p className="text-2xl font-display text-charcoal">{totalResponses}</p>
            </div>
          </div>
        </div>

        {/* My Polls List */}
        <div className="space-y-8">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <h2 className="font-display text-2xl text-charcoal">My Polls</h2>
            <p className="text-[10px] uppercase tracking-widest text-muted font-bold">
              {polls.length} Total
            </p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <PollCardSkeleton />
              <PollCardSkeleton />
              <PollCardSkeleton />
              <PollCardSkeleton />
            </div>
          ) : error ? (
            <div className="card text-center py-20 text-red-600 uppercase tracking-widest text-xs font-bold">
              Failed to load polls. Please try again.
            </div>
          ) : polls.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {polls.map((poll) => (
                <PollCard key={poll.id} poll={poll} />
              ))}
            </div>
          ) : (
            <div className="card text-center py-24 space-y-6">
              <div className="w-20 h-20 bg-border/50 mx-auto flex items-center justify-center rotate-45">
                <Plus className="w-8 h-8 text-muted -rotate-45" />
              </div>
              <div className="space-y-2">
                <h3 className="font-display text-2xl text-charcoal">Silence is empty.</h3>
                <p className="text-muted text-sm">You haven't created any polls yet.</p>
              </div>
              <Link to="/polls/create" className="inline-block">
                <Button variant="secondary">Begin your first poll →</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </PageWrapper>
  );
};

export default DashboardPage;
