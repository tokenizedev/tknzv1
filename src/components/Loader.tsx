import { Code } from 'lucide-react';
import React from 'react';

interface LoaderProps {
    isSidebar?: boolean;
}

export const Loader: React.FC<LoaderProps> = ({ isSidebar = false }) => {
    return (
        <div className={`${isSidebar ? 'w-full h-full ' : 'w-[400px] h-[600px] '}flex items-center justify-center bg-cyber-black`}>
        {/* Cypherpunk loader */}
        <div className="relative">
          <div className="w-12 h-12 border-2 border-cyber-purple rounded-full animate-spin relative">
            <div className="absolute top-0 left-0 w-3 h-3 bg-cyber-purple rounded-full animate-pulse-fast"></div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Code className="w-6 h-6 text-cyber-green animate-pulse" />
          </div>
          <div className="absolute -bottom-6 w-full text-center text-cyber-green text-xs animate-pulse font-terminal">
            INITIALIZING
          </div>
        </div>
      </div>
    )
}