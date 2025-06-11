import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useStore } from '../store';

interface CurveConfigPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const CurveConfigPanel: React.FC<CurveConfigPanelProps> = ({ isOpen, onClose }) => {
  const { curveConfigOverrides, setCurveConfigOverrides } = useStore();
  const [localConfig, setLocalConfig] = useState<Record<string, any>>({});

  useEffect(() => {
    if (isOpen) {
      setLocalConfig(curveConfigOverrides || {});
    }
  }, [isOpen, curveConfigOverrides]);

  const handleChange = (key: string, value: any) => {
    setLocalConfig(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    setCurveConfigOverrides(localConfig);
    onClose();
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
      <div className="absolute right-0 top-0 w-80 h-full bg-white shadow-lg overflow-auto p-4 transform transition-transform duration-300">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Bonding Curve Config</h2>
          <button onClick={onClose} className="p-1"><X /></button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium">Base Fee (bps)</label>
            <input type="number" className="w-full border rounded p-1" value={localConfig.poolFees?.baseFee || ''}
              onChange={e => handleChange('poolFees.baseFee', Number(e.target.value))} />
          </div>
          <div>
            <label className="block text-sm font-medium">Dynamic Fee (bps)</label>
            <input type="number" className="w-full border rounded p-1" value={localConfig.poolFees?.dynamicFee || ''}
              onChange={e => handleChange('poolFees.dynamicFee', Number(e.target.value))} />
          </div>
          <div>
            <label className="block text-sm font-medium">Collect Fee Mode</label>
            <select className="w-full border rounded p-1" value={localConfig.collectFeeMode ?? ''}
              onChange={e => handleChange('collectFeeMode', Number(e.target.value))}>
              <option value={0}>Quote Only</option>
              <option value={1}>Both Base & Quote</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium">Activation Type</label>
            <select className="w-full border rounded p-1" value={localConfig.activationType ?? ''}
              onChange={e => handleChange('activationType', Number(e.target.value))}>
              <option value={0}>Slot Based</option>
              <option value={1}>Timestamp Based</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium">Activation Value</label>
            <input type="number" className="w-full border rounded p-1" value={localConfig.activationValue || ''}
              onChange={e => handleChange('activationValue', Number(e.target.value))} />
          </div>
          <div>
            <label className="block text-sm font-medium">Migration Quote Threshold</label>
            <input type="number" className="w-full border rounded p-1" value={localConfig.migrationQuoteThreshold || ''}
              onChange={e => handleChange('migrationQuoteThreshold', Number(e.target.value))} />
          </div>
          <div>
            <label className="block text-sm font-medium">Partner LP %</label>
            <input type="number" className="w-full border rounded p-1" value={localConfig.partnerLpPercentage || ''}
              onChange={e => handleChange('partnerLpPercentage', Number(e.target.value))} />
          </div>
          <div>
            <label className="block text-sm font-medium">Creator LP %</label>
            <input type="number" className="w-full border rounded p-1" value={localConfig.creatorLpPercentage || ''}
              onChange={e => handleChange('creatorLpPercentage', Number(e.target.value))} />
          </div>
          <div>
            <label className="block text-sm font-medium">Migration Fee Option</label>
            <select className="w-full border rounded p-1" value={localConfig.migrationFeeOption ?? ''}
              onChange={e => handleChange('migrationFeeOption', Number(e.target.value))}>
              <option value={0}>0.25%</option>
              <option value={1}>0.30%</option>
              <option value={2}>1.00%</option>
              <option value={3}>2.00%</option>
            </select>
          </div>
          <div className="flex space-x-2 mt-4">
            <button onClick={handleSave} className="flex-1 bg-blue-600 text-white p-2 rounded">Save</button>
            <button onClick={onClose} className="flex-1 border p-2 rounded">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CurveConfigPanel;