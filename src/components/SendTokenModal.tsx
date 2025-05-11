import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useStore } from '../store';
import { createConnection } from '../utils/connection';

interface SendTokenModalProps {
  visible: boolean;
  mint: string;
  onClose: () => void;
  onSend: (mint: string, recipient: string, amount: number) => Promise<any>;
}

const SendTokenModal: React.FC<SendTokenModalProps> = ({ visible, mint, onClose, onSend }) => {
  const { activeWallet, balance: solBalance } = useStore();
  const connection = createConnection();
  // Available balance for this mint (in units)
  const [available, setAvailable] = useState<number>(0);
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  // Native SOL mint address
  const NATIVE_MINT = 'So11111111111111111111111111111111111111112';

  useEffect(() => {
    if (visible) {
      setRecipient('');
      setAmount('');
      setError(null);
      setIsSending(false);
      // Fetch available balance
      if (activeWallet) {
        if (mint === NATIVE_MINT) {
          setAvailable(solBalance);
        } else {
          connection.getTokenBalance(mint, activeWallet.publicKey)
            .then(bal => setAvailable(bal))
            .catch(() => setAvailable(0));
        }
      }
    }
  }, [visible, mint, activeWallet, solBalance]);

  if (!visible) return null;

  const handleSend = () => {
    setError(null);
    if (!activeWallet) return;
    if (!recipient.trim()) {
      setError('Recipient address is required');
      return;
    }
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) {
      setError('Amount must be a positive number');
      return;
    }
    if (amt > available) {
      setError(`Insufficient funds: available ${available}`);
      return;
    }
    setIsSending(true);
    Promise.resolve(onSend(mint, recipient.trim(), amt))
      .catch(() => {
        // Reset sending state on error
        setIsSending(false);
      });
  };

  return (
    <div className="fixed inset-0 bg-cyber-black/90 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-cyber-dark border border-cyber-green/30 rounded-md w-full max-w-md animate-fade-scale-in shadow-terminal p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-cyber-green font-terminal text-lg">Send Token</h3>
          <button onClick={onClose} className="text-cyber-green hover:text-cyber-green-dark">
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-cyber-green text-sm">
          Mint: <span className="font-mono break-all">{mint}</span>
        </p>
        <input
          type="text"
          placeholder="Recipient address"
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
          className="w-full bg-cyber-black border border-cyber-green/50 rounded-sm p-2 text-cyber-green font-mono text-sm focus:border-cyber-green focus:outline-none"
        />
        <input
          type="number"
          step="any"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full bg-cyber-black border border-cyber-green/50 rounded-sm p-2 text-cyber-green font-mono text-sm focus:border-cyber-green focus:outline-none"
        />
        {error && (
          <div className="text-cyber-orange text-xs font-terminal">
            {error}
          </div>
        )}
        <div className="flex justify-between items-center text-xs font-mono text-cyber-green">
          Available: {available}
        </div>
        <div className="flex justify-end space-x-2 mt-4">
          <button
            onClick={onClose}
            disabled={isSending}
            className="px-4 py-2 bg-cyber-dark border border-cyber-green/30 text-cyber-green/70 rounded-md font-terminal hover:bg-cyber-green/10 hover:text-cyber-green disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleSend}
            disabled={isSending || parseFloat(amount) <= 0 || parseFloat(amount) > available}
            className={`px-4 py-2 bg-cyber-green text-cyber-black rounded-md font-terminal hover:bg-cyber-green-dark transition-opacity ${
              isSending || parseFloat(amount) <= 0 || parseFloat(amount) > available
                ? 'opacity-50 cursor-not-allowed'
                : ''
            }`}
          >
            {isSending ? 'Sending...' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SendTokenModal;