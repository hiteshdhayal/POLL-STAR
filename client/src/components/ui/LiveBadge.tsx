import React from 'react';

interface LiveBadgeProps {
  connected?: boolean;
}

export const LiveBadge: React.FC<LiveBadgeProps> = ({ connected = true }) => {
  return (
    <span className="inline-flex items-center gap-2 text-[10px] uppercase tracking-widest font-semibold text-charcoal">
      <span
        className={`inline-block w-2 h-2 rounded-full ${
          connected ? 'bg-crimson live-dot' : 'bg-muted'
        }`}
      />
      {connected ? 'LIVE · 生放送' : 'OFFLINE'}
    </span>
  );
};
