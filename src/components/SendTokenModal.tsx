import React, { useState, useEffect, useMemo } from 'react';
import { X, Send, AlertCircle, CheckCircle, User } from 'lucide-react';
import { useStore } from '../store';
import { createConnection, web3Connection } from '../utils/connection';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';

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
  const [isSuccess, setIsSuccess] = useState(false);
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
      setIsSuccess(false);
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
      .then(() => {
        setIsSuccess(true);
        setTimeout(() => {
          onClose();
        }, 2000);
      })
      .catch(() => {
        // Reset sending state and close modal on error
        setIsSending(false);
        onClose();
      });
  };

  // Calculate how much of available balance the amount represents
  const amountPercent = parseFloat(amount) > 0 && available > 0
    ? Math.min((parseFloat(amount) / available) * 100, 100)
    : 0;

  // Handler for MAX button: subtract estimated fee for native SOL
  const handleMax = async () => {
    if (mint === NATIVE_MINT) {
      try {
        const latest = await web3Connection.getLatestBlockhash();
        // @ts-ignore: deprecated fee calculator for legacy RPC
        const feeCalc = await web3Connection.getFeeCalculatorForBlockhash(latest.blockhash);
        const lamportsPerSig = feeCalc?.value?.feeCalculator?.lamportsPerSignature ?? 0;
        const feeSol = lamportsPerSig / LAMPORTS_PER_SOL;
        const maxVal = available - feeSol;
        setAmount(maxVal > 0 ? maxVal.toString() : '0');
      } catch (error) {
        console.error('Failed to estimate fee, defaulting to full balance', error);
        setAmount(available.toString());
      }
    } else {
      setAmount(available.toString());
    }
  };

  return (
    <div className="fixed inset-0 bg-cyber-black/90 backdrop-blur-lg flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-gradient-to-b from-cyber-dark to-cyber-black border border-cyber-green/30 rounded-xl w-full max-w-md animate-fade-scale-in shadow-[0_0_20px_rgba(0,255,170,0.15)] p-6">
        {isSuccess ? (
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <CheckCircle className="w-16 h-16 text-cyber-green animate-pulse" />
            <h3 className="text-cyber-green font-terminal text-xl">Transfer Complete</h3>
            <p className="text-cyber-green/80 text-center">
              Successfully sent {amount} {mintSymbol} to {recipient.slice(0,6)}...{recipient.slice(-4)}
            </p>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-cyber-green font-terminal text-xl flex items-center">
                <Send className="w-5 h-5 mr-2" /> Send {mintSymbol}
              </h3>
              <button 
                onClick={onClose} 
                className="text-cyber-green hover:text-cyber-green-dark bg-cyber-black/30 rounded-full p-1.5 hover:bg-cyber-black/50 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex justify-between items-center text-cyber-green/70 text-xs font-terminal mb-1">
              <span>FROM</span>
              <span className="text-cyber-green">Balance: {formattedAvailable} {mintSymbol}</span>
            </div>
            
            <div className="bg-cyber-black/60 border border-cyber-green/20 rounded-xl p-3 mb-4 hover:border-cyber-green/40 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="bg-cyber-green/20 rounded-full w-8 h-8 flex items-center justify-center mr-2">
                    <span className="text-cyber-green font-terminal">{mintSymbol[0]}</span>
                  </div>
                  <div>
                    <p className="text-cyber-green font-terminal">{mintSymbol}</p>
                    <p className="text-cyber-green/60 text-xs font-mono truncate max-w-[200px]">{mint}</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Amount input with progress bar */}
            <div className="bg-cyber-black/60 border border-cyber-green/20 rounded-xl p-4 mb-4 relative hover:border-cyber-green/40 transition-colors">
              <div className="absolute bottom-0 left-0 bg-cyber-green/10 h-1 rounded-b-xl" style={{ width: `${amountPercent}%` }}></div>
              <label className="text-cyber-green/70 text-xs font-terminal mb-2 block">AMOUNT</label>
              <div className="flex items-center">
                <input
                  type="number"
                  step="any"
                  placeholder="0.0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-transparent border-none p-0 text-cyber-green font-terminal text-2xl focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleMax}
                  className="ml-2 px-2 py-1 bg-cyber-green/20 text-cyber-green text-xs font-terminal rounded-md hover:bg-cyber-green/30 transition-colors"
                >
                  MAX
                </button>
              </div>
            </div>
            
            <div className="flex justify-between items-center text-cyber-green/70 text-xs font-terminal mb-1">
              <span>TO</span>
            </div>
            
            <div className="bg-cyber-black/60 border border-cyber-green/20 rounded-xl p-4 mb-4 hover:border-cyber-green/40 transition-colors">
              <div className="flex items-center">
                <div className="bg-cyber-green/20 rounded-full w-8 h-8 flex items-center justify-center mr-2">
                  <User className="w-4 h-4 text-cyber-green" />
                </div>
                <input
                  type="text"
                  placeholder="Recipient address"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  className="w-full bg-transparent border-none p-0 text-cyber-green font-mono text-sm focus:outline-none"
                />
              </div>
            </div>
            
            {/* Address book suggestions */}
            {suggestions.length > 0 && (
              <ul className="bg-cyber-black/90 border border-cyber-green/30 rounded-xl mt-1 mb-4 max-h-40 overflow-auto text-cyber-green animate-slide-up">
                {suggestions.map(([addr, label]) => (
                  <li
                    key={addr}
                    onClick={() => setRecipient(addr)}
                    className="p-3 hover:bg-cyber-green/10 cursor-pointer border-b border-cyber-green/10 last:border-none"
                  >
                    <div className="flex items-center">
                      <div className="bg-cyber-green/20 rounded-full w-6 h-6 flex items-center justify-center mr-2">
                        <User className="w-3 h-3 text-cyber-green" />
                      </div>
                      <div>
                        <p className="font-terminal">{label}</p>
                        <p className="text-xs text-cyber-green/60 font-mono">{addr.slice(0,6)}...{addr.slice(-4)}</p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            
            {/* Save to address book */}
            {recipient && !addressBook[recipient] && (
              <div className="bg-cyber-black/60 border border-cyber-green/20 rounded-xl p-3 mb-4 animate-slide-up">
                <p className="text-cyber-green/70 text-xs font-terminal mb-2">SAVE TO ADDRESS BOOK</p>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    placeholder="Label (optional)"
                    value={newLabel}
                    onChange={e => setNewLabel(e.target.value)}
                    className="flex-grow bg-cyber-black/60 border border-cyber-green/30 rounded-md p-2 text-cyber-green font-mono text-sm focus:border-cyber-green focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={async () => {
                      await addAddressBookEntry(recipient, newLabel.trim() || recipient);
                      setNewLabel('');
                    }}
                    className="px-3 py-2 bg-cyber-green text-cyber-black rounded-md font-terminal text-xs hover:bg-cyber-green/80 transition-colors"
                  >
                    Save
                  </button>
                </div>
              </div>
            )}
            
            {error && (
              <div className="bg-cyber-orange/10 border border-cyber-orange/30 rounded-xl p-3 mb-4 flex items-center">
                <AlertCircle className="w-5 h-5 text-cyber-orange mr-2" />
                <div className="text-cyber-orange text-sm font-terminal">
                  {error}
                </div>
              </div>
            )}
            
            <button
              onClick={handleSend}
              disabled={isSending || parseFloat(amount) <= 0 || parseFloat(amount) > available || !recipient}
              className={`w-full px-6 py-3 mt-2 bg-gradient-to-r from-cyber-green to-cyber-green-dark text-cyber-black rounded-xl font-terminal text-md hover:from-cyber-green-dark hover:to-cyber-green transition-all duration-300 flex justify-center items-center ${
                isSending || parseFloat(amount) <= 0 || parseFloat(amount) > available || !recipient
                  ? 'opacity-50 cursor-not-allowed'
                  : 'shadow-[0_0_15px_rgba(0,255,170,0.3)] hover:shadow-[0_0_20px_rgba(0,255,170,0.5)]'
              }`}
            >
              {isSending ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-cyber-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" /> Send {mintSymbol}
                </>
              )}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default SendTokenModal;