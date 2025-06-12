import React, { useState, useEffect } from 'react';
import { X, Info, Save } from 'lucide-react';
import { useStore } from '../store';

interface CurveConfigPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

// Default values for the bonding curve configuration
const DEFAULT_CONFIG = {
  poolFees: {
    baseFee: 50, // 0.5% in basis points
    dynamicFee: 100, // 1% in basis points
  },
  collectFeeMode: 0, // Quote only
  activationType: 1, // Timestamp based
  activationValue: Math.floor(Date.now() / 1000) + 60, // 1 minute from now
  migrationQuoteThreshold: 10_000_000, // 10M quote tokens
  partnerLpPercentage: 20, // 20%
  creatorLpPercentage: 80, // 80%
  partnerLockedLpPercentage: 50, // 50% of partner LP locked
  creatorLockedLpPercentage: 50, // 50% of creator LP locked
  migrationFeeOption: 1, // 0.30%
};

const CurveConfigPanel: React.FC<CurveConfigPanelProps> = ({ isOpen, onClose }) => {
  const { curveConfigOverrides, setCurveConfigOverrides } = useStore();
  const [localConfig, setLocalConfig] = useState<Record<string, any>>(DEFAULT_CONFIG);

  useEffect(() => {
    if (isOpen) {
      // Merge defaults with any existing overrides
      setLocalConfig({
        ...DEFAULT_CONFIG,
        ...(curveConfigOverrides || {}),
        poolFees: {
          ...DEFAULT_CONFIG.poolFees,
          ...(curveConfigOverrides?.poolFees || {}),
        },
      });
    }
  }, [isOpen, curveConfigOverrides]);

  const handleChange = (key: string, value: any) => {
    if (key.includes('.')) {
      const [parent, child] = key.split('.');
      setLocalConfig(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent] || {}),
          [child]: value,
        },
      }));
    } else {
      setLocalConfig(prev => ({ ...prev, [key]: value }));
    }
  };

  const handleSave = () => {
    setCurveConfigOverrides(localConfig);
    onClose();
  };

  const handleReset = () => {
    setLocalConfig(DEFAULT_CONFIG);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4 font-terminal animate-fadeIn">
      <div 
        className="bg-cyber-dark border border-cyber-green/50 rounded-sm max-w-lg w-full max-h-[90vh] overflow-hidden shadow-lg shadow-cyber-green/20 animate-fadeInUp"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between bg-black/60 p-4 border-b border-cyber-green/30">
          <h2 className="text-lg font-terminal text-cyber-green uppercase tracking-wide flex items-center">
            <span className="mr-2">⚙️</span>
            Bonding Curve Config
          </h2>
          <button
            onClick={onClose}
            className="text-cyber-pink hover:text-cyber-pink/80 transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-140px)] p-4 space-y-4">
          {/* Fees Section */}
          <div className="space-y-3">
            <h3 className="text-sm font-terminal text-cyber-purple uppercase tracking-wide flex items-center">
              <span className="mr-2">💰</span>
              Fee Configuration
            </h3>
            
            <div className="space-y-2">
              <label className="block text-xs font-terminal text-cyber-green">
                Base Fee (bps)
                <span className="text-cyber-green/60 ml-2">Default: 50 (0.5%)</span>
              </label>
              <input 
                type="number" 
                className="input-field font-terminal text-sm" 
                value={localConfig.poolFees?.baseFee || ''}
                onChange={e => handleChange('poolFees.baseFee', Number(e.target.value))}
                placeholder="50"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-terminal text-cyber-green">
                Dynamic Fee (bps)
                <span className="text-cyber-green/60 ml-2">Default: 100 (1%)</span>
              </label>
              <input 
                type="number" 
                className="input-field font-terminal text-sm" 
                value={localConfig.poolFees?.dynamicFee || ''}
                onChange={e => handleChange('poolFees.dynamicFee', Number(e.target.value))}
                placeholder="100"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-terminal text-cyber-green">
                Fee Collection Mode
              </label>
              <select 
                className="input-field font-terminal text-sm cursor-pointer" 
                value={localConfig.collectFeeMode ?? 0}
                onChange={e => handleChange('collectFeeMode', Number(e.target.value))}
              >
                <option value={0}>Quote Token Only</option>
                <option value={1}>Both Base & Quote Tokens</option>
              </select>
            </div>
          </div>

          {/* Activation Section */}
          <div className="space-y-3 pt-3 border-t border-cyber-green/20">
            <h3 className="text-sm font-terminal text-cyber-purple uppercase tracking-wide flex items-center">
              <span className="mr-2">⏰</span>
              Activation Settings
            </h3>
            
            <div className="space-y-2">
              <label className="block text-xs font-terminal text-cyber-green">
                Activation Type
              </label>
              <select 
                className="input-field font-terminal text-sm cursor-pointer" 
                value={localConfig.activationType ?? 1}
                onChange={e => handleChange('activationType', Number(e.target.value))}
              >
                <option value={0}>Slot Based</option>
                <option value={1}>Timestamp Based</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-terminal text-cyber-green">
                Activation Value
                <span className="text-cyber-green/60 ml-2">
                  {localConfig.activationType === 1 ? '(Unix timestamp)' : '(Slot number)'}
                </span>
              </label>
              <input 
                type="number" 
                className="input-field font-terminal text-sm" 
                value={localConfig.activationValue || ''}
                onChange={e => handleChange('activationValue', Number(e.target.value))}
                placeholder={localConfig.activationType === 1 ? 'Unix timestamp' : 'Slot number'}
              />
            </div>
          </div>

          {/* Migration Section */}
          <div className="space-y-3 pt-3 border-t border-cyber-green/20">
            <h3 className="text-sm font-terminal text-cyber-purple uppercase tracking-wide flex items-center">
              <span className="mr-2">🚀</span>
              Migration Settings
            </h3>
            
            <div className="space-y-2">
              <label className="block text-xs font-terminal text-cyber-green">
                Migration Quote Threshold
                <span className="text-cyber-green/60 ml-2">Default: 10M tokens</span>
              </label>
              <input 
                type="number" 
                className="input-field font-terminal text-sm" 
                value={localConfig.migrationQuoteThreshold || ''}
                onChange={e => handleChange('migrationQuoteThreshold', Number(e.target.value))}
                placeholder="10000000"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-terminal text-cyber-green">
                Migration Fee Tier
              </label>
              <select 
                className="input-field font-terminal text-sm cursor-pointer" 
                value={localConfig.migrationFeeOption ?? 1}
                onChange={e => handleChange('migrationFeeOption', Number(e.target.value))}
              >
                <option value={0}>0.25%</option>
                <option value={1}>0.30%</option>
                <option value={2}>1.00%</option>
                <option value={3}>2.00%</option>
              </select>
            </div>
          </div>

          {/* LP Distribution Section */}
          <div className="space-y-3 pt-3 border-t border-cyber-green/20">
            <h3 className="text-sm font-terminal text-cyber-purple uppercase tracking-wide flex items-center">
              <span className="mr-2">💎</span>
              LP Distribution
            </h3>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="block text-xs font-terminal text-cyber-green">
                  Partner LP %
                </label>
                <input 
                  type="number" 
                  className="input-field font-terminal text-sm" 
                  value={localConfig.partnerLpPercentage || ''}
                  onChange={e => handleChange('partnerLpPercentage', Number(e.target.value))}
                  placeholder="20"
                  min="0"
                  max="100"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-terminal text-cyber-green">
                  Creator LP %
                </label>
                <input 
                  type="number" 
                  className="input-field font-terminal text-sm" 
                  value={localConfig.creatorLpPercentage || ''}
                  onChange={e => handleChange('creatorLpPercentage', Number(e.target.value))}
                  placeholder="80"
                  min="0"
                  max="100"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="block text-xs font-terminal text-cyber-green">
                  Partner Locked LP %
                </label>
                <input 
                  type="number" 
                  className="input-field font-terminal text-sm" 
                  value={localConfig.partnerLockedLpPercentage || ''}
                  onChange={e => handleChange('partnerLockedLpPercentage', Number(e.target.value))}
                  placeholder="50"
                  min="0"
                  max="100"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-terminal text-cyber-green">
                  Creator Locked LP %
                </label>
                <input 
                  type="number" 
                  className="input-field font-terminal text-sm" 
                  value={localConfig.creatorLockedLpPercentage || ''}
                  onChange={e => handleChange('creatorLockedLpPercentage', Number(e.target.value))}
                  placeholder="50"
                  min="0"
                  max="100"
                />
              </div>
            </div>
          </div>

          {/* Info Box */}
          <div className="terminal-window p-3 flex items-start space-x-2 bg-cyber-dark/50">
            <Info className="w-4 h-4 flex-shrink-0 mt-0.5 text-cyber-purple" />
            <div className="text-xs font-terminal text-cyber-purple/80">
              <p>These settings control how your token's bonding curve behaves.</p>
              <p className="mt-1">LP percentages must total 100% for proper distribution.</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between bg-black/60 p-4 border-t border-cyber-green/30">
          <button
            onClick={handleReset}
            className="text-cyber-pink hover:text-cyber-pink/80 font-terminal text-sm uppercase transition-colors"
          >
            Reset to Defaults
          </button>
          
          <div className="flex space-x-2">
            <button
              onClick={onClose}
              className="bg-black border border-cyber-green/50 hover:bg-cyber-green/10 text-cyber-green px-4 py-2 font-terminal text-sm uppercase transition-all duration-200 rounded-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="bg-cyber-green text-black hover:bg-cyber-green/90 px-4 py-2 font-terminal text-sm uppercase transition-all duration-200 rounded-sm flex items-center space-x-2 shadow-md shadow-cyber-green/20"
            >
              <Save className="w-4 h-4" />
              <span>Save Config</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CurveConfigPanel;