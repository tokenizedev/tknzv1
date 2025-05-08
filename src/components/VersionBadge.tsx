import React from 'react';

interface VersionBadgeProps {
  className?: string;
}

export const VersionBadge: React.FC<VersionBadgeProps> = ({ className = '' }) => {
  const version = import.meta.env.VITE_APP_VERSION || '0.0.0';
  
  return (
    <a href="https://github.com/tokenizedev/tknzv1/blob/main/CHANGELOG.md" target="_blank" rel="noopener noreferrer" className={`absolute top-3.5 right-4 z-10 ${className}`}>
      <div className="border border-cyber-green/30 bg-cyber-black rounded-sm px-2.5 py-0.5 flex items-center gap-1.5 shadow-glow-sm">
        <div className="w-2 h-2 rounded-full bg-cyber-green/70 pulse-slow"></div>
        <span className="text-xs font-terminal text-cyber-green/90 font-semibold">v{version}</span>
      </div>
    </a>
  );
}; 