import React, { useEffect, useState } from 'react';
import { Terminal, CheckCircle, Zap, Database, Shield } from 'lucide-react';
import { TerminalLoader } from './TerminalLoader';

interface TokenCreationProgressProps {
  progress: number;
  onComplete?: (success: boolean) => void;
}

// Add a typewriter effect to display terminal messages
const TypewriterText: React.FC<{ text: string, delay?: number, className?: string }> = ({ 
  text, 
  delay = 40,
  className = "" 
}) => {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  
  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayText(prevText => prevText + text[currentIndex]);
        setCurrentIndex(prevIndex => prevIndex + 1);
      }, delay);
      
      return () => clearTimeout(timeout);
    }
  }, [currentIndex, delay, text]);
  
  useEffect(() => {
    // Reset when text changes
    setDisplayText('');
    setCurrentIndex(0);
  }, [text]);
  
  return (
    <span className={className}>
      {displayText}
      <span className="terminal-cursor text-cyber-green/80">_</span>
    </span>
  );
};

export const TokenCreationProgress: React.FC<TokenCreationProgressProps> = ({ 
  progress,
  onComplete
}) => {
  const [logMessages, setLogMessages] = useState<string[]>([]);
  const [showSecurityMsg, setShowSecurityMsg] = useState(false);
  
  // Determine the current stage based on progress
  const getCurrentStage = () => {
    if (progress < 30) return "Initializing transaction...";
    if (progress < 60) return "Generating token metadata...";
    if (progress < 90) return "Sending to blockchain...";
    return "Finalizing creation...";
  };
  
  // Add simulated log entries
  useEffect(() => {
    const messages = [
      { threshold: 5, message: "> Initializing TKNZ protocol..." },
      { threshold: 15, message: "> Generating keypair..." },
      { threshold: 25, message: "> Preparing transaction parameters..." },
      { threshold: 35, message: "> Constructing metadata URI..." },
      { threshold: 45, message: "> Uploading token assets..." },
      { threshold: 55, message: "> Asset hash verified..." },
      { threshold: 65, message: "> Connecting to Solana network..." },
      { threshold: 70, message: "> Building transaction..." },
      { threshold: 80, message: "> Signing transaction..." },
      { threshold: 85, message: "> Broadcasting to validators..." },
      { threshold: 95, message: "> Transaction confirmed..." }
    ];
    
    const interval = setInterval(() => {
      messages.forEach(msg => {
        if (progress >= msg.threshold && !logMessages.includes(msg.message)) {
          setLogMessages(prev => [...prev, msg.message]);
        }
      });
      
      // Show security message for a brief moment
      if (progress > 50 && progress < 55 && !showSecurityMsg) {
        setShowSecurityMsg(true);
        setTimeout(() => setShowSecurityMsg(false), 3000);
      }
    }, 300);
    
    return () => clearInterval(interval);
  }, [progress, logMessages, showSecurityMsg]);

  return (
    <div className="h-full flex flex-col items-center justify-center">
      <div className="w-full max-w-md p-6 bg-cyber-black/80 border border-cyber-green/30 rounded-md shadow-terminal relative terminal-fade-in overflow-hidden">
        {/* Terminal scanline effect */}
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <div className="absolute inset-0 bg-gradient-to-b from-cyber-green/5 to-transparent bg-[length:100%_3px] terminal-scanline"></div>
        </div>
        
        {/* Glitch corner effects */}
        <div className="absolute top-0 left-0 w-[10px] h-[10px] border-t border-l border-cyber-green/50"></div>
        <div className="absolute top-0 right-0 w-[10px] h-[10px] border-t border-r border-cyber-green/50"></div>
        <div className="absolute bottom-0 left-0 w-[10px] h-[10px] border-b border-l border-cyber-green/50"></div>
        <div className="absolute bottom-0 right-0 w-[10px] h-[10px] border-b border-r border-cyber-green/50"></div>
        
        {/* Security indicator overlay - appears briefly */}
        {showSecurityMsg && (
          <div className="absolute inset-x-0 top-3 flex justify-center terminal-fade-in z-10">
            <div className="bg-cyber-black/90 border border-cyber-green px-3 py-1 rounded-sm flex items-center">
              <Shield className="w-3 h-3 text-cyber-green mr-2" />
              <span className="text-cyber-green text-xs font-terminal">Secure Transaction Verified</span>
            </div>
          </div>
        )}
        
        <div className="text-center mb-6 relative">
          <h3 className="font-terminal text-xl text-cyber-green mb-2 flex items-center justify-center">
            <Zap className="w-5 h-5 mr-2 text-cyber-green terminal-pulse" />
            TOKENIZING
            <Zap className="w-5 h-5 ml-2 text-cyber-green terminal-pulse" />
          </h3>
          <p className="text-sm text-cyber-green/70 font-terminal">Creating your token on the blockchain...</p>
        </div>
        
        <div className="space-y-5">
          {/* Using the existing TerminalLoader component */}
          <TerminalLoader text={getCurrentStage()} progress={progress} />
          
          {/* Terminal log output */}
          <div className="border border-cyber-green/30 rounded bg-cyber-black/70 p-3 font-terminal text-xs text-cyber-green h-[120px] overflow-y-auto relative terminal-bg">
            {logMessages.map((msg, i) => (
              <div key={i} className={`mb-1 ${i === logMessages.length - 1 ? 'terminal-fade-in' : ''}`}>
                {i === logMessages.length - 1 ? (
                  <TypewriterText text={msg} />
                ) : (
                  <span>{msg}</span>
                )}
              </div>
            ))}
            {progress >= 95 && (
              <div className="terminal-fade-in flex items-center text-cyber-purple mt-2">
                <CheckCircle className="w-3 h-3 mr-1" />
                <TypewriterText text="> Token creation successful!" className="text-cyber-purple" />
              </div>
            )}
          </div>
          
          <div className="font-terminal text-sm text-cyber-green mt-4 flex items-center justify-between">
            <div className="flex items-center">
              <Terminal className="w-4 h-4 text-cyber-green mr-2 terminal-pulse" />
              <Database className="w-3 h-3 text-cyber-green/60" />
            </div>
            <div className="flex items-center">
              <span className="text-xs text-cyber-green/70 mr-2">v1.{Math.floor(progress)}</span>
              <Shield className="w-3 h-3 text-cyber-green/60" />
            </div>
          </div>

          <div className="border border-cyber-green/20 rounded p-3 bg-cyber-black/50 transition-all duration-500" style={{
            boxShadow: progress > 90 ? '0 0 10px rgba(0, 255, 65, 0.2)' : 'none'
          }}>
            <p className="font-terminal text-xs text-cyber-purple">
              {/* Show different explanatory texts based on progress */}
              {progress < 30 && "Preparing secure transaction for the Solana blockchain..."}
              {progress >= 30 && progress < 60 && "Building cryptographically signed metadata for your token..."}
              {progress >= 60 && progress < 90 && "Broadcasting transaction to the Solana network..."}
              {progress >= 90 && (
                <span className="flex items-center">
                  <CheckCircle className="w-3 h-3 mr-2 terminal-pulse" />
                  <span>Transaction confirmed! Your token is now live on-chain.</span>
                </span>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TokenCreationProgress; 