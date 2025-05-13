import React, { useState, useEffect, useMemo } from 'react';
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
  const activeWallet = useStore(state => state.activeWallet);
  const solBalance = useStore(state => state.nativeSolBalance);
  const connection = createConnection();
  // Available balance for this mint (in units)
  const [available, setAvailable] = useState<number>(0);
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  // Native SOL mint address
  const NATIVE_MINT = 'So11111111111111111111111111111111111111112';
  // Token symbol for display (SOL or truncated mint)
  const mintSymbol = mint === NATIVE_MINT
    ? 'SOL'
    : `${mint.slice(0,4)}...${mint.slice(-4)}`;
  // Format available balance with commas
  const formattedAvailable = available.toLocaleString();
  // Address book entries and actions
  const addressBook = useStore(state => state.addressBook);
  const addAddressBookEntry = useStore(state => state.addAddressBookEntry);
  // Local label for saving addresses
  const [newLabel, setNewLabel] = useState('');

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
  
  // Compute suggestions from address book based on input
  const suggestions = useMemo(() => {
    const term = recipient.trim().toLowerCase();
    if (!term) return [];
    return Object.entries(addressBook)
      .filter(([addr, label]) =>
        addr.toLowerCase().includes(term) || label.toLowerCase().includes(term)
      )
      .filter(([addr]) => addr !== recipient)
      .slice(0, 5);
  }, [recipient, addressBook]);

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
      setError(`Insufficient funds: available ${available.toLocaleString()}`);
      return;
    }
    setIsSending(true);
    Promise.resolve(onSend(mint, recipient.trim(), amt))
      .catch(() => {
        // Reset sending state and close modal on error
        setIsSending(false);
        onClose();
      });
  };

  return (
    <div className="fixed inset-0 bg-cyber-black/90 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-cyber-dark border border-cyber-green/30 rounded-md w-full max-w-md animate-fade-scale-in shadow-terminal p-6 space-y-4">
        <div className="flex justify-between items-center">
        <h3 className="text-cyber-green font-terminal text-lg">Send {mintSymbol}</h3>
          <button onClick={onClose} className="text-cyber-green hover:text-cyber-green-dark">
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-cyber-green text-sm">
          Mint: <span className="font-mono break-all">{mint}</span>
        </p>
        <div className="w-full relative">
          <input
            type="text"
            placeholder="Recipient address"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            className="w-full bg-cyber-black border border-cyber-green/50 rounded-sm p-2 text-cyber-green font-mono text-sm focus:border-cyber-green focus:outline-none"
          />
          {/* Address book suggestions */}
          {suggestions.length > 0 && (
            <ul className="absolute z-50 bg-cyber-dark border border-cyber-green/50 w-full mt-1 max-h-32 overflow-auto text-cyber-green font-mono text-sm rounded-sm">
              {suggestions.map(([addr, label]) => (
                <li
                  key={addr}
                  onClick={() => setRecipient(addr)}
                  className="px-2 py-1 hover:bg-cyber-green/20 cursor-pointer flex justify-between"
                >
                  <span>{label}</span>
                  <span className="ml-2 text-xs text-cyber-green/70">{addr.slice(0,4)}...{addr.slice(-4)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        {/* Save to address book */}
        {recipient && !addressBook[recipient] && (
          <div className="flex items-center space-x-2">
            <input
              type="text"
              placeholder="Label (optional)"
              value={newLabel}
              onChange={e => setNewLabel(e.target.value)}
              className="flex-grow bg-cyber-black border border-cyber-green/50 rounded-sm p-2 text-cyber-green font-mono text-sm focus:border-cyber-green focus:outline-none"
            />
            <button
              type="button"
              onClick={async () => {
                await addAddressBookEntry(recipient, newLabel.trim() || recipient);
                setNewLabel('');
              }}
              className="px-3 py-2 bg-cyber-green text-cyber-black rounded-sm font-terminal text-xs hover:bg-cyber-green-dark"
            >
              Save
            </button>
          </div>
        )}
        <div className="w-full relative">
          <input
            type="number"
            step="any"
            placeholder="0.0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full bg-cyber-black border border-cyber-green/50 rounded-sm p-2 pr-12 text-cyber-green font-mono text-sm focus:border-cyber-green focus:outline-none"
          />
          <button
            type="button"
            onClick={() => setAmount(available.toString())}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs font-terminal text-cyber-green hover:text-cyber-green-dark"
          >
            MAX
          </button>
        </div>
        {error && (
          <div className="text-cyber-orange text-xs font-terminal">
            {error}
          </div>
        )}
        <div className="text-xs font-mono text-cyber-green">
          Available: {formattedAvailable} {mintSymbol}
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