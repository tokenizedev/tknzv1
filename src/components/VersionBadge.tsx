import React, { useState, useEffect } from 'react';

interface VersionBadgeProps {
  className?: string;
}

export const VersionBadge: React.FC<VersionBadgeProps> = ({ className = '' }) => {
  const version = import.meta.env.VITE_APP_VERSION || '0.0.0';
  const [glitch, setGlitch] = useState(false);
  
  // Occasional random glitch effect
  useEffect(() => {
    const glitchInterval = setInterval(() => {
      if (Math.random() > 0.7) {
        setGlitch(true);
        setTimeout(() => setGlitch(false), 150);
      }
    }, 3000);
    
    return () => clearInterval(glitchInterval);
  }, []);
  
  return (
    <div className={`absolute top-3.5 right-4 z-10 ${className}`}>
      <div className={`border border-cyber-green/80 bg-cyber-black rounded-sm px-2.5 py-0.5 flex items-center gap-1.5 
                     shadow-[0_0_8px_rgba(0,255,65,0.3)] hover:shadow-[0_0_12px_rgba(0,255,65,0.5)] 
                     overflow-hidden transition-all duration-300 ${glitch ? 'translate-x-[1px]' : ''}`}>
        {/* Binary background effect */}
        <div className="absolute inset-0 opacity-10 pointer-events-none select-none">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="absolute" style={{ 
              left: `${i * 50}%`, 
              top: 0, 
              fontSize: '7px',
              fontFamily: 'monospace',
              color: 'rgba(0, 255, 65, 0.8)' 
            }}>
              {Math.random() > 0.5 ? '01' : '10'}
            </div>
          ))}
        </div>
        
        {/* Pulsing status indicator */}
        <div className="relative">
          <div className="w-2 h-2 rounded-full bg-cyber-green/90 pulse-slow"></div>
          <div className="absolute top-0 left-0 w-2 h-2 rounded-full bg-cyber-green animate-ping opacity-30"></div>
        </div>
        
        {/* Version display with terminal effect */}
        <div className="relative">
          <span className={`text-xs font-terminal text-cyber-green font-bold ${glitch ? 'text-cyber-purple' : ''}`}>
            v{version}
          </span>
          
          {/* Highlight scanline effect */}
          <div className="absolute left-0 top-[40%] w-full h-[1px] bg-cyber-green/30 pointer-events-none"></div>
        </div>
        
        {/* Right border highlight */}
        <div className="absolute right-0 top-0 h-full w-[1px] bg-gradient-to-b from-cyber-green/10 via-cyber-green/80 to-cyber-green/10"></div>
      </div>
    </div>
  );
}; 