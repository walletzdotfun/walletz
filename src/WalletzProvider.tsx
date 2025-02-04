import React, { useEffect, useState, useCallback } from 'react';
import { WalletzContext } from './WalletzContext';
import { WalletzState, WalletzConfig } from './types';
import { ALL_WALLETS } from './wallets/index';
import { fromLamports } from './utils';

interface Props {
  children: React.ReactNode;
  config?: WalletzConfig;
}

const DEFAULT_STATE: WalletzState = {
  walletName: null,
  publicKey: null,
  connected: false,
  connecting: false,
  balanceSOL: null,
  autoConnect: false,
};

export function WalletzProvider({ children, config }: Props) {
  const { rpcUrl = 'https://api.mainnet-beta.solana.com', autoConnect = false } = config || {};

  const [state, setState] = useState<WalletzState>({
    ...DEFAULT_STATE,
    autoConnect: autoConnect,
  });
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Cache the selected wallet adapter
  const [selectedAdapter, setSelectedAdapter] = useState<any>(null);

  useEffect(() => {
    // If autoConnect is true and localStorage has a last wallet, attempt to connect
    if (typeof window !== 'undefined' && state.autoConnect) {
      const lastWallet = localStorage.getItem('walletz_lastWallet');
      if (lastWallet) {
        const adapter = ALL_WALLETS.find((w) => w.name === lastWallet);
        if (adapter && adapter.ready()) {
          connect(lastWallet).catch((err) => {
            console.warn('Auto-connect failed', err);
          });
        }
      }
    }
  }, []);

  // Core connect function
  const connect = useCallback(
    async (walletName: string) => {
      const adapter = ALL_WALLETS.find((w) => w.name === walletName);
      if (!adapter) {
        throw new Error(`Wallet ${walletName} not found.`);
      }
      if (!adapter.ready()) {
        throw new Error(`${walletName} is not available.`);
      }
      setState((s) => ({ ...s, connecting: true }));

      try {
        const publicKey = await adapter.connect();
        // If the wallet provides account change events, attach a listener:
        if (adapter.onAccountChange) {
          adapter.onAccountChange((newPubkey) => {
            setState((prev) => ({
              ...prev,
              publicKey: newPubkey,
              connected: !!newPubkey,
            }));
          });
        }

        setSelectedAdapter(adapter);
        setState((s) => ({
          ...s,
          walletName,
          publicKey,
          connected: true,
          connecting: false,
        }));

        // Store the last wallet if autoConnect
        if (state.autoConnect) {
          localStorage.setItem('walletz_lastWallet', walletName);
        }

        // Fetch initial balance
        await getBalance(publicKey);
        setIsModalOpen(false);
      } catch (error) {
        setState((s) => ({ ...s, connecting: false }));
        console.error(`Error connecting to ${walletName}:`, error);
        throw error;
      }
    },
    [state.autoConnect]
  );

  const disconnect = useCallback(async () => {
    if (selectedAdapter) {
      try {
        if (selectedAdapter.removeAccountChange) {
          selectedAdapter.removeAccountChange();
        }
        await selectedAdapter.disconnect();
      } catch (error) {
        console.error(`Error disconnecting ${selectedAdapter.name}:`, error);
      }
    }
    setState((s) => ({
      ...s,
      walletName: null,
      publicKey: null,
      connected: false,
      connecting: false,
      balanceSOL: null,
    }));
    setSelectedAdapter(null);
    localStorage.removeItem('walletz_lastWallet');
  }, [selectedAdapter]);

  const signMessage = useCallback(async (message: Uint8Array | string) => {
    if (!selectedAdapter || !selectedAdapter.signMessage) {
      throw new Error('No wallet connected or signMessage not supported by this wallet.');
    }
    try {
      return await selectedAdapter.signMessage(message);
    } catch (error) {
      console.error('Error signing message:', error);
      throw error;
    }
  }, [selectedAdapter]);

  const getBalance = useCallback(
    async (publicKeyParam?: string): Promise<number> => {
      const pubkey = publicKeyParam || state.publicKey;
      if (!pubkey) return 0;

      try {
        const resp = await fetch(rpcUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            id: 1,
            method: 'getBalance',
            params: [pubkey],
          }),
        });
        const data = await resp.json();
        const lamports = data?.result?.value ?? 0;
        const sol = fromLamports(lamports);
        setState((s) => ({ ...s, balanceSOL: sol }));
        return sol;
      } catch (err) {
        console.error('Failed to fetch balance:', err);
        return 0;
      }
    },
    [state.publicKey, rpcUrl]
  );

  const getTokenBalances = useCallback(async () => {
    if (!state.publicKey) return [];
    try {
      const resp = await fetch(rpcUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'getTokenAccountsByOwner',
          params: [
            state.publicKey,
            { programId: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA' },
            { encoding: 'jsonParsed' },
          ],
        }),
      });
      const data = await resp.json();
      return data?.result?.value || [];
    } catch (error) {
      console.error('Error fetching SPL token balances:', error);
      return [];
    }
  }, [state.publicKey, rpcUrl]);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const contextValue = {
    ...state,
    connect,
    disconnect,
    signMessage,
    getBalance,
    getTokenBalances,
    openModal,
    closeModal,
    isModalOpen,
  };

  return (
    <WalletzContext.Provider value={contextValue}>
      {children}
    </WalletzContext.Provider>
  );
}
