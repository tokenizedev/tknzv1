import React, { useState } from 'react';
import { ChevronDown, Link } from 'lucide-react';
import { useStore } from '../store';

interface ExchangeSelectorProps {
  defaultExchange?: string;
  options?: string[];
  onSelect?: (exchange: string) => void;
}

export const ExchangeSelector: React.FC<ExchangeSelectorProps> = ({
  defaultExchange = 'pump.fun',
  options = [defaultExchange, 'birdeye', 'solscan', 'GMGN'],
  onSelect
}) => {
  const [isOpen, setIsOpen] = useState(false);
  // Pull current selection from the store
  const selected = useStore(state => state.selectedExchange);
  const setSelectedExchange = useStore(state => state.setSelectedExchange);
  
  const handleSelect = async (option: string) => {
    // Update in store
    await setSelectedExchange(option);
    setIsOpen(false);
    if (onSelect) onSelect(option);
  };
  
  return (
    <div className="border border-cyber-green/30 rounded-sm overflow-visible">
      <div className="p-4 bg-gradient-to-r from-cyber-black to-cyber-black/80">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Link className="w-5 h-5 mr-3 text-cyber-green" />
            <h2 className="text-cyber-green font-terminal">Default Exchange</h2>
          </div>
          
          <div className="relative">
            <button 
              onClick={() => setIsOpen(!isOpen)} 
              className="flex items-center justify-between bg-cyber-black border border-cyber-green/50 rounded-sm px-3 py-1 min-w-32 text-sm text-cyber-green font-terminal hover:bg-cyber-green/10 transition-colors"
            >
              {selected}
              <ChevronDown size={16} className="ml-2" />
            </button>
            
            {isOpen && (
              <div className="absolute right-0 mt-1 w-full bg-cyber-black border border-cyber-green/30 rounded-sm z-10 shadow-lg shadow-cyber-green/10 overflow-y-auto max-h-40">
                {options.map((option) => (
                  <div 
                    key={option}
                    className="px-3 py-2 text-cyber-green hover:bg-cyber-green/10 cursor-pointer text-sm font-terminal"
                    onClick={() => handleSelect(option)}
                  >
                    {option}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <p className="text-cyber-green/70 text-sm mt-1 ml-8">Select preferred trading platform</p>
      </div>
    </div>
  );
};