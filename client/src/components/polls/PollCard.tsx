import React from 'react';
import type { Poll } from '../../types';
import { Badge } from '../ui/Badge';
import { Link, useNavigate } from 'react-router-dom';
import { BarChart2, Copy, Trash2, Share2 } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { pollsApi } from '../../api/polls.api';

interface PollCardProps {
  poll: Poll;
}

const statusBadgeVariant = (status: string) => {
  if (status === 'ACTIVE') return 'success';
  if (status === 'EXPIRED') return 'warning';
  return 'danger';
};

const formatExpiry = (expiresAt: string, status: string) => {
  if (status !== 'ACTIVE') return status;
  const diff = new Date(expiresAt).getTime() - Date.now();
  if (diff <= 0) return 'Expired';
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  if (hours > 24) return `Expires in ${Math.floor(hours / 24)}d`;
  return `Expires in ${hours}h ${minutes}m`;
};

export const PollCard: React.FC<PollCardProps> = ({ poll }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: () => pollsApi.delete(poll.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-polls'] });
    },
  });

  const copyLink = () => {
    const url = `${window.location.origin}/p/${poll.shareToken}`;
    navigator.clipboard.writeText(url);
  };

  const handleDelete = () => {
    if (window.confirm(`Delete "${poll.title}"? This cannot be undone.`)) {
      deleteMutation.mutate();
    }
  };

  return (
    <div className="card group hover:shadow-[0_8px_32px_rgba(26,26,26,0.08)] transition-all duration-300 border border-border">
      <div className="flex justify-between items-start gap-4 mb-4">
        <h3
          className="font-display text-lg text-charcoal leading-snug cursor-pointer hover:text-crimson transition-colors"
          onClick={() => navigate(`/polls/${poll.id}/analytics`)}
        >
          {poll.title}
        </h3>
        <Badge variant={statusBadgeVariant(poll.status) as 'success' | 'warning' | 'danger'}>
          {poll.status}
        </Badge>
      </div>

      <div className="flex items-center gap-6 text-xs text-muted mb-6">
        <span>{poll._count?.responses ?? 0} responses</span>
        <span>{poll.questions.length} questions</span>
        <span>{formatExpiry(poll.expiresAt, poll.status)}</span>
        {poll.isPublished && (
          <span className="text-green-600 font-semibold">● Published</span>
        )}
        {poll.isAnonymous && <span>Anonymous</span>}
      </div>

      <div className="flex items-center gap-3">
        <Link
          to={`/polls/${poll.id}/analytics`}
          className="flex items-center gap-2 text-[10px] tracking-widest uppercase font-semibold text-charcoal hover:text-crimson transition-colors"
        >
          <BarChart2 className="w-3.5 h-3.5" />
          Analytics
        </Link>
        <button
          onClick={copyLink}
          className="flex items-center gap-2 text-[10px] tracking-widest uppercase font-semibold text-charcoal hover:text-crimson transition-colors"
          title="Copy share link"
        >
          <Share2 className="w-3.5 h-3.5" />
          Copy Link
        </button>
        <button
          onClick={() => window.open(`/p/${poll.shareToken}`, '_blank')}
          className="flex items-center gap-2 text-[10px] tracking-widest uppercase font-semibold text-charcoal hover:text-crimson transition-colors"
        >
          <Copy className="w-3.5 h-3.5" />
          Preview
        </button>
        <button
          onClick={handleDelete}
          disabled={deleteMutation.isPending}
          className="ml-auto flex items-center gap-2 text-[10px] tracking-widest uppercase font-semibold text-red-400 hover:text-red-600 transition-colors disabled:opacity-50"
          title="Delete poll"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
