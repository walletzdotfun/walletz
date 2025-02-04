import React from 'react';
import { useWalletz } from '../useWalletz';
import { ALL_WALLETS } from '../wallets';
import './styles.css';

export function WalletzModal() {
  const { isModalOpen, closeModal, connect, config } = useWalletz();
  const theme = config?.theme || 'light';

  if (!isModalOpen) return null;

  const availableWallets = ALL_WALLETS.filter((w) => w.ready());
  const otherWallets = ALL_WALLETS.filter((w) => !w.ready());

  return (
    <div className={`walletz-modal-overlay walletz-theme-${theme}`} onClick={closeModal}>
      <div className="walletz-modal" onClick={(e) => e.stopPropagation()}>
        <h3>Connect a Wallet</h3>
        <div className="walletz-modal-grid">
          {availableWallets.map((wallet) => (
            <button
              key={wallet.name}
              className="walletz-option"
              onClick={() => connect(wallet.name)}
            >
              {wallet.icon && (
                <img src={wallet.icon} alt={wallet.name} className="walletz-option-icon" />
              )}
              <span>{wallet.name}</span>
            </button>
          ))}
          {otherWallets.length > 0 && (
            <>
              <div className="walletz-not-installed">Not Installed</div>
              {otherWallets.map((wallet) => (
                <a
                  key={wallet.name}
                  className="walletz-option-disabled"
                  href={wallet.url || '#'}
                  target="_blank"
                  rel="noreferrer"
                >
                  {wallet.icon && (
                    <img src={wallet.icon} alt={wallet.name} className="walletz-option-icon" />
                  )}
                  <span>{wallet.name}</span>
                </a>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
