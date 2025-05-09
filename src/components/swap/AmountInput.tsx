import React from 'react';

interface AmountInputProps {
  value: string;
  onChange: (value: string) => void;
  fiatValue?: string;
  onMaxClick?: () => void;
  disabled?: boolean;
}

export const AmountInput: React.FC<AmountInputProps> = ({
  value,
  onChange,
  fiatValue,
  onMaxClick,
  disabled = false,
}) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Allow only numbers and decimals
    const newValue = e.target.value;
    if (newValue === '' || /^[0-9]*\.?[0-9]*$/.test(newValue)) {
      onChange(newValue);
    }
  };

  return (
    <div className="relative w-full">
      <div className="flex items-center justify-between">
        <input
          type="text"
          className="w-full bg-transparent text-white text-2xl font-terminal 
                    border-none focus:outline-none focus:ring-0 placeholder-cyber-green/30"
          placeholder="0.0"
          value={value}
          onChange={handleInputChange}
          disabled={disabled}
        />
        {onMaxClick && (
          <button
            onClick={onMaxClick}
            className="absolute right-0 px-2 py-1 text-xs font-terminal bg-cyber-green/10 
                      text-cyber-green rounded-md hover:bg-cyber-green/20 transition-all
                      border border-cyber-green/30"
          >
            MAX
          </button>
        )}
      </div>
      {fiatValue && (
        <div className="text-cyber-green/50 text-sm font-mono mt-1">
          ≈ ${fiatValue}
        </div>
      )}
    </div>
  );
}; 