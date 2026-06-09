import React from 'react';

interface Props {
  status: 'online' | 'offline' | 'busy' | 'away' | 'isTyping';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function OnlinePresenceIndicator({ status, size = 'md', className = '' }: Props) {
  const getStatusColor = () => {
    switch (status) {
      case 'online':
      case 'isTyping':
        return 'bg-green-500';
      case 'busy':
        return 'bg-red-500';
      case 'away':
        return 'bg-amber-500';
      case 'offline':
      default:
        return 'bg-slate-300 dark:bg-slate-600';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'w-2 h-2';
      case 'lg':
        return 'w-4 h-4';
      case 'md':
      default:
        return 'w-3 h-3';
    }
  };

  return (
    <div 
      className={`rounded-full ${getStatusColor()} ${getSizeClasses()} ${className}`} 
      title={status}
    />
  );
}
