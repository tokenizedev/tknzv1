import React from 'react';

interface BackupMnemonicModalProps {
  mnemonic: string;
  mnemonicCopied: boolean;
  onCopy: () => void;
  onConfirm: () => void;
}

const BackupMnemonicModal: React.FC<BackupMnemonicModalProps> = ({
  mnemonic,
  mnemonicCopied,
  onCopy,
  onConfirm,
}) => (
  <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
    <div className="bg-cyber-black p-6 rounded-md border border-cyber-green max-w-md w-full space-y-4">
      <h3 className="text-cyber-green font-terminal text-lg">Backup Your Seed Phrase</h3>
      <p className="text-cyber-green text-sm">
        Write down or copy these words in order and keep them safe. They're the only way to recover your wallet.
      </p>
      <div className="bg-cyber-black/80 border border-cyber-green/50 p-4 rounded font-mono text-cyber-green text-sm break-words">
        {mnemonic}
      </div>
      <div className="flex justify-end space-x-2">
        {mnemonicCopied ? (
          <div className="flex items-center space-x-2 px-3 py-1 bg-cyber-green/20 border border-cyber-green rounded-sm">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="confirm-copy"
                checked
                readOnly
                className="form-checkbox text-cyber-green bg-cyber-black h-3 w-3"
              />
              <label htmlFor="confirm-copy" className="text-cyber-green text-xs ml-1.5">
                Copied to clipboard
              </label>
            </div>
          </div>
        ) : (
          <button
            onClick={onCopy}
            className="px-3 py-1 border border-cyber-green text-cyber-green rounded-sm text-xs"
          >
            Copy
          </button>
        )}
        <button
          onClick={onConfirm}
          className="px-3 py-1 bg-cyber-green text-black rounded-sm text-xs"
        >
          I've copied it
        </button>
      </div>
    </div>
  </div>
);

export default BackupMnemonicModal;