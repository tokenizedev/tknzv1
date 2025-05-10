import React from 'react';
import { FaExchangeAlt } from 'react-icons/fa';

interface SwitchButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

export const SwitchButton: React.FC<SwitchButtonProps> = ({
  onClick,
  disabled = false,
}) => {
  return (
    <div className="flex justify-center -my-3 z-10">
      <button
        onClick={onClick}
        disabled={disabled}
        className={`w-8 h-8 rounded-full flex items-center justify-center
                   shadow-neon-green border bg-cyber-black transition-all
                   ${disabled 
                     ? 'border-cyber-green/20 text-cyber-green/20 cursor-not-allowed' 
                     : 'border-cyber-green/40 text-cyber-green hover:border-cyber-green hover:text-white'
                   }`}
      >
        <FaExchangeAlt className={`transform rotate-90 ${disabled ? '' : 'group-hover:rotate-180 transition-transform duration-300'}`} />
      </button>
    </div>
  );
}; 