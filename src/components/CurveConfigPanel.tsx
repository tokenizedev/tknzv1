import React, { useState, useEffect } from 'react';
import { X, Info, Settings, TrendingUp, Percent, Clock, Shield, Coins, GitBranch } from 'lucide-react';
import { useStore } from '../store';

interface CurveConfigPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const CurveConfigPanel: React.FC<CurveConfigPanelProps> = ({ isOpen, onClose }) => {
  const { curveConfigOverrides, setCurveConfigOverrides } = useStore();
  const [localConfig, setLocalConfig] = useState<Record<string, any>>({});
  const [activeTab, setActiveTab] = useState<'fees' | 'migration' | 'vesting' | 'advanced'>('fees');

  useEffect(() => {
    if (isOpen) {
      setLocalConfig(curveConfigOverrides || {});
    }
  }, [isOpen, curveConfigOverrides]);

  // Helper to handle nested object updates
  const handleChange = (path: string, value: any) => {
    setLocalConfig(prev => {
      const next = { ...prev };
      const parts = path.split('.');
      let cursor: any = next;
      
      for (let i = 0; i < parts.length - 1; i++) {
        const p = parts[i];
        if (cursor[p] == null || typeof cursor[p] !== 'object') {
          cursor[p] = {};
        }
        cursor = cursor[p];
      }
      
      cursor[parts[parts.length - 1]] = value;
      return next;
    });
  };

  const getValue = (path: string, defaultValue: any = '') => {
    const parts = path.split('.');
    let cursor: any = localConfig;
    
    for (let i = 0; i < parts.length; i++) {
      if (cursor == null || typeof cursor !== 'object') return defaultValue;
      cursor = cursor[parts[i]];
    }
    
    return cursor ?? defaultValue;
  };

  const handleSave = () => {
    setCurveConfigOverrides(localConfig);
    onClose();
  };

  const handleReset = () => {
    setLocalConfig({});
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex justify-end">
      <div className="w-full max-w-md bg-cyber-dark border-l border-cyber-green/30 h-full overflow-hidden flex flex-col animate-slideInRight">
        {/* Header */}
        <div className="bg-black/50 border-b border-cyber-green/30 p-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Settings className="w-5 h-5 text-cyber-green" />
            <h2 className="text-lg font-terminal text-cyber-green uppercase">Bonding Curve Config</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-cyber-green/10 rounded transition-colors"
          >
            <X className="w-5 h-5 text-cyber-green" />
          </button>
        </div>

        {/* Info Banner */}
        <div className="bg-cyber-green/10 border-y border-cyber-green/30 p-3 flex items-start space-x-2">
          <Info className="w-4 h-4 text-cyber-green flex-shrink-0 mt-0.5" />
          <p className="text-xs font-terminal text-cyber-green">
            Default configuration mimics Pump.fun's bonding curve. Modify settings at your own risk.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-cyber-green/30">
          {[
            { id: 'fees', label: 'Fees', icon: Percent },
            { id: 'migration', label: 'Migration', icon: TrendingUp },
            { id: 'vesting', label: 'Vesting', icon: Clock },
            { id: 'advanced', label: 'Advanced', icon: Shield }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 py-3 px-2 font-terminal text-xs uppercase flex items-center justify-center space-x-1 transition-all ${
                activeTab === tab.id
                  ? 'bg-cyber-green/20 text-cyber-green border-b-2 border-cyber-green'
                  : 'text-cyber-green/60 hover:bg-cyber-green/10'
              }`}
            >
              <tab.icon className="w-3 h-3" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Fees Tab */}
          {activeTab === 'fees' && (
            <>
              <div className="space-y-3">
                <h3 className="text-sm font-terminal text-cyber-purple uppercase flex items-center space-x-2">
                  <Coins className="w-4 h-4" />
                  <span>Trading Fees</span>
                </h3>
                
                <div className="space-y-3 bg-black/30 p-3 rounded border border-cyber-green/20">
                  <div>
                    <label className="block text-xs font-terminal text-cyber-green mb-1">
                      Base Fee (basis points)
                    </label>
                    <input
                      type="number"
                      className="w-full bg-black border border-cyber-green/30 rounded px-3 py-2 text-white font-terminal text-sm focus:border-cyber-green focus:outline-none"
                      value={getValue('poolFees.baseFee.cliffFeeNumerator', 30)}
                      onChange={e => handleChange('poolFees.baseFee.cliffFeeNumerator', Number(e.target.value))}
                      placeholder="30"
                    />
                    <p className="text-xs text-cyber-green/60 mt-1">Default: 30 bps (0.30%)</p>
                  </div>

                  <div>
                    <label className="block text-xs font-terminal text-cyber-green mb-1">
                      Dynamic Fee (basis points)
                    </label>
                    <input
                      type="number"
                      className="w-full bg-black border border-cyber-green/30 rounded px-3 py-2 text-white font-terminal text-sm focus:border-cyber-green focus:outline-none"
                      value={getValue('poolFees.dynamicFee', 0)}
                      onChange={e => handleChange('poolFees.dynamicFee', Number(e.target.value))}
                      placeholder="0"
                    />
                    <p className="text-xs text-cyber-green/60 mt-1">Volatility-based fee adjustment</p>
                  </div>

                  <div>
                    <label className="block text-xs font-terminal text-cyber-green mb-1">
                      Fee Collection Mode
                    </label>
                    <select
                      className="w-full bg-black border border-cyber-green/30 rounded px-3 py-2 text-white font-terminal text-sm focus:border-cyber-green focus:outline-none"
                      value={getValue('collectFeeMode', 0)}
                      onChange={e => handleChange('collectFeeMode', Number(e.target.value))}
                    >
                      <option value={0}>Quote Only (SOL)</option>
                      <option value={1}>Both Base & Quote</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-terminal text-cyber-green mb-1">
                      Creator Trading Fee %
                    </label>
                    <input
                      type="number"
                      className="w-full bg-black border border-cyber-green/30 rounded px-3 py-2 text-white font-terminal text-sm focus:border-cyber-green focus:outline-none"
                      value={getValue('creatorTradingFeePercentage', 0)}
                      onChange={e => handleChange('creatorTradingFeePercentage', Number(e.target.value))}
                      placeholder="0"
                      min="0"
                      max="100"
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Migration Tab */}
          {activeTab === 'migration' && (
            <>
              <div className="space-y-3">
                <h3 className="text-sm font-terminal text-cyber-purple uppercase flex items-center space-x-2">
                  <GitBranch className="w-4 h-4" />
                  <span>Migration Settings</span>
                </h3>
                
                <div className="space-y-3 bg-black/30 p-3 rounded border border-cyber-green/20">
                  <div>
                    <label className="block text-xs font-terminal text-cyber-green mb-1">
                      Migration Threshold (SOL)
                    </label>
                    <input
                      type="number"
                      className="w-full bg-black border border-cyber-green/30 rounded px-3 py-2 text-white font-terminal text-sm focus:border-cyber-green focus:outline-none"
                      value={getValue('migrationQuoteThreshold', 1)}
                      onChange={e => handleChange('migrationQuoteThreshold', Number(e.target.value))}
                      placeholder="1"
                    />
                    <p className="text-xs text-cyber-green/60 mt-1">Min SOL in pool to trigger migration</p>
                  </div>

                  <div>
                    <label className="block text-xs font-terminal text-cyber-green mb-1">
                      Migration Fee Option
                    </label>
                    <select
                      className="w-full bg-black border border-cyber-green/30 rounded px-3 py-2 text-white font-terminal text-sm focus:border-cyber-green focus:outline-none"
                      value={getValue('migrationFeeOption', 2)}
                      onChange={e => handleChange('migrationFeeOption', Number(e.target.value))}
                    >
                      <option value={0}>0.25%</option>
                      <option value={1}>0.30%</option>
                      <option value={2}>1.00%</option>
                      <option value={3}>2.00%</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-terminal text-cyber-green mb-1">
                      LP Distribution
                    </label>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          className="flex-1 bg-black border border-cyber-green/30 rounded px-3 py-2 text-white font-terminal text-sm focus:border-cyber-green focus:outline-none"
                          value={getValue('partnerLpPercentage', 5)}
                          onChange={e => handleChange('partnerLpPercentage', Number(e.target.value))}
                          placeholder="5"
                          min="0"
                          max="100"
                        />
                        <span className="text-xs font-terminal text-cyber-green">% Partner</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          className="flex-1 bg-black border border-cyber-green/30 rounded px-3 py-2 text-white font-terminal text-sm focus:border-cyber-green focus:outline-none"
                          value={getValue('creatorLpPercentage', 95)}
                          onChange={e => handleChange('creatorLpPercentage', Number(e.target.value))}
                          placeholder="95"
                          min="0"
                          max="100"
                        />
                        <span className="text-xs font-terminal text-cyber-green">% Creator</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Vesting Tab */}
          {activeTab === 'vesting' && (
            <>
              <div className="space-y-3">
                <h3 className="text-sm font-terminal text-cyber-purple uppercase flex items-center space-x-2">
                  <Clock className="w-4 h-4" />
                  <span>Vesting Schedule</span>
                </h3>
                
                <div className="space-y-3 bg-black/30 p-3 rounded border border-cyber-green/20">
                  <div>
                    <label className="block text-xs font-terminal text-cyber-green mb-1">
                      Amount Per Period
                    </label>
                    <input
                      type="number"
                      className="w-full bg-black border border-cyber-green/30 rounded px-3 py-2 text-white font-terminal text-sm focus:border-cyber-green focus:outline-none"
                      value={getValue('lockedVesting.amountPerPeriod', 0)}
                      onChange={e => handleChange('lockedVesting.amountPerPeriod', Number(e.target.value))}
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-terminal text-cyber-green mb-1">
                      Cliff Duration (seconds)
                    </label>
                    <input
                      type="number"
                      className="w-full bg-black border border-cyber-green/30 rounded px-3 py-2 text-white font-terminal text-sm focus:border-cyber-green focus:outline-none"
                      value={getValue('lockedVesting.cliffDurationFromMigrationTime', 0)}
                      onChange={e => handleChange('lockedVesting.cliffDurationFromMigrationTime', Number(e.target.value))}
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-terminal text-cyber-green mb-1">
                      Vesting Frequency (seconds)
                    </label>
                    <input
                      type="number"
                      className="w-full bg-black border border-cyber-green/30 rounded px-3 py-2 text-white font-terminal text-sm focus:border-cyber-green focus:outline-none"
                      value={getValue('lockedVesting.frequency', 0)}
                      onChange={e => handleChange('lockedVesting.frequency', Number(e.target.value))}
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-terminal text-cyber-green mb-1">
                      Number of Periods
                    </label>
                    <input
                      type="number"
                      className="w-full bg-black border border-cyber-green/30 rounded px-3 py-2 text-white font-terminal text-sm focus:border-cyber-green focus:outline-none"
                      value={getValue('lockedVesting.numberOfPeriod', 0)}
                      onChange={e => handleChange('lockedVesting.numberOfPeriod', Number(e.target.value))}
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Advanced Tab */}
          {activeTab === 'advanced' && (
            <>
              <div className="space-y-3">
                <h3 className="text-sm font-terminal text-cyber-purple uppercase flex items-center space-x-2">
                  <Shield className="w-4 h-4" />
                  <span>Advanced Settings</span>
                </h3>
                
                <div className="space-y-3 bg-black/30 p-3 rounded border border-cyber-green/20">
                  <div>
                    <label className="block text-xs font-terminal text-cyber-green mb-1">
                      Token Type
                    </label>
                    <select
                      className="w-full bg-black border border-cyber-green/30 rounded px-3 py-2 text-white font-terminal text-sm focus:border-cyber-green focus:outline-none"
                      value={getValue('tokenType', 1)}
                      onChange={e => handleChange('tokenType', Number(e.target.value))}
                    >
                      <option value={0}>SPL Token</option>
                      <option value={1}>Token-2022</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-terminal text-cyber-green mb-1">
                      Activation Type
                    </label>
                    <select
                      className="w-full bg-black border border-cyber-green/30 rounded px-3 py-2 text-white font-terminal text-sm focus:border-cyber-green focus:outline-none"
                      value={getValue('activationType', 1)}
                      onChange={e => handleChange('activationType', Number(e.target.value))}
                    >
                      <option value={0}>Slot Based</option>
                      <option value={1}>Timestamp Based</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-terminal text-cyber-green mb-1">
                      Migration Option
                    </label>
                    <select
                      className="w-full bg-black border border-cyber-green/30 rounded px-3 py-2 text-white font-terminal text-sm focus:border-cyber-green focus:outline-none"
                      value={getValue('migrationOption', 1)}
                      onChange={e => handleChange('migrationOption', Number(e.target.value))}
                    >
                      <option value={0}>DAMM V1</option>
                      <option value={1}>DAMM V2</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-terminal text-cyber-green mb-1">
                      Initial Price (SOL per token)
                    </label>
                    <input
                      type="number"
                      className="w-full bg-black border border-cyber-green/30 rounded px-3 py-2 text-white font-terminal text-sm focus:border-cyber-green focus:outline-none"
                      value={getValue('sqrtStartPrice', 0.00001)}
                      onChange={e => handleChange('sqrtStartPrice', Number(e.target.value))}
                      placeholder="0.00001"
                      step="0.00001"
                    />
                    <p className="text-xs text-cyber-green/60 mt-1">Price will be converted to sqrt format</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="bg-black/50 border-t border-cyber-green/30 p-4 space-y-3">
          <div className="flex space-x-2">
            <button
              onClick={handleReset}
              className="flex-1 bg-black border border-cyber-green/50 hover:bg-cyber-green/10 text-cyber-green px-4 py-2 font-terminal text-sm uppercase transition-all"
            >
              Reset to Default
            </button>
            <button
              onClick={handleSave}
              className="flex-1 bg-cyber-green hover:bg-cyber-green/90 text-black px-4 py-2 font-terminal text-sm uppercase transition-all"
            >
              Apply Changes
            </button>
          </div>
          <p className="text-xs font-terminal text-cyber-green/60 text-center">
            {Object.keys(localConfig).length} custom parameters set
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
        
        .animate-slideInRight {
          animation: slideInRight 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default CurveConfigPanel;