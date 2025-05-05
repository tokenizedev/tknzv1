
import React from 'react';

export const TerminalLoader: React.FC<{ text: string; progress: number }> = ({ text, progress }) => {
    return (
      <div className="w-full space-y-1">
        <div className="flex items-center justify-between mb-1">
          <span className="font-terminal text-xs text-cyber-green">{text}</span>
          <span className="font-terminal text-xs text-cyber-green">{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-cyber-dark border border-cyber-green/30 h-2 overflow-hidden">
          <div 
            className="h-full bg-cyber-green transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <div className="font-terminal text-xs text-cyber-green/60 font-mono">
          {Array.from({ length: Math.floor(progress / 10) }).map((_, i) => (
            <span key={i} className="opacity-70">█</span>
          ))}
          <span className="animate-terminal-cursor">_</span>
        </div>
      </div>
    );
  };