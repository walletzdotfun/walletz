import React, { useState, useRef, useEffect } from 'react';
import { useWalletz } from '../useWalletz';
import { truncateAddress } from '../utils';
import './styles.css';

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
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleButtonClick = () => {
    if (!connected) {
      openModal();
    } else {
      setShowDropdown((prev) => !prev);
    }
  };

  if (connecting) {
    return (
      <button className="walletz-connect-button loading" disabled>
        Connecting...
      </button>
    );
  }

  if (!connected) {
    return (
      <button className="walletz-connect-button" onClick={handleButtonClick}>
        Connect Wallet
      </button>
    );
  }

  // If connected
  return (
    <div className="walletz-dropdown-container" ref={dropdownRef}>
      <button 
        className="walletz-connect-button walletz-connected" 
        onClick={handleButtonClick}
      >
        <span>{truncateAddress(publicKey || '')}</span>
        {balanceSOL !== null && (
          <span className="walletz-balance">{balanceSOL.toFixed(2)} SOL</span>
        )}
      </button>
      
      {showDropdown && (
        <div className="walletz-dropdown">
          <div className="walletz-dropdown-wallet-name">
            {walletName}
          </div>
          <button
            className="walletz-dropdown-disconnect"
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
