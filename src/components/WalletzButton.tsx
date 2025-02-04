import React, { useState } from 'react';
import { useWalletz } from '../useWalletz';
import { truncateAddress } from '../utils';

export function WalletzButton() {
  const {
    connected,
    connecting,
    publicKey,
    balanceSOL,
    openModal,
    disconnect,
    walletName
  } = useWalletz();

  const [showDropdown, setShowDropdown] = useState(false);

  const handleButtonClick = () => {
    if (!connected) {
      openModal();
    } else {
      setShowDropdown((prev) => !prev);
    }
  };

  if (connecting) {
    return <button disabled>Connecting...</button>;
  }

  if (!connected) {
    return <button onClick={handleButtonClick}>Connect Wallet</button>;
  }

  // If connected
  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button onClick={handleButtonClick}>
        {truncateAddress(publicKey || '')}
        {balanceSOL !== null ? ` – ${balanceSOL.toFixed(2)} SOL` : ''}
      </button>
      {showDropdown && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            background: '#fff',
            border: '1px solid #ccc',
            padding: '0.5rem',
            minWidth: '140px',
          }}
        >
          <div style={{ padding: '0.25rem 0' }}>
            <strong>{walletName}</strong>
          </div>
          <button
            style={{ width: '100%', marginTop: '0.5rem' }}
            onClick={() => {
              disconnect();
              setShowDropdown(false);
            }}
          >
            Disconnect
          </button>
        </div>
      )}
    </div>
  );
}
