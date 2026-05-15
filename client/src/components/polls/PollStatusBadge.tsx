import React from 'react';
import { Badge } from '../ui/Badge';

interface PollStatusBadgeProps {
  status: 'ACTIVE' | 'EXPIRED' | 'CLOSED';
  isPublished?: boolean;
}

export const PollStatusBadge: React.FC<PollStatusBadgeProps> = ({ status, isPublished }) => {
  const variantMap = {
    ACTIVE: 'success' as const,
    EXPIRED: 'warning' as const,
    CLOSED: 'danger' as const,
  };

  return (
    <div className="flex items-center gap-2">
      <Badge variant={variantMap[status]}>{status}</Badge>
      {isPublished && <Badge variant="info">Published</Badge>}
    </div>
  );
};
