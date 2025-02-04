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
          // Attempt to connect silently
          connect(lastWallet).catch((err) => {
            console.warn('Auto-connect failed', err);
          });
        }
      }
    }
  }, []);

  const connect = useCallback(async (walletName: string) => {
    const adapter = ALL_WALLETS.find((w) => w.name === walletName);
    if (!adapter) throw new Error(`Wallet ${walletName} not found in adapters.`);
    if (!adapter.ready()) throw new Error(`${walletName} not available.`);

    try {
      setState((s) => ({ ...s, connecting: true }));
      const publicKey = await adapter.connect();
      setState((s) => ({
        ...s,
        walletName,
        publicKey,
        connected: true,
        connecting: false,
      }));
      setSelectedAdapter(adapter);
      // Store last wallet if autoConnect is on
      if (state.autoConnect) {
        localStorage.setItem('walletz_lastWallet', walletName);
      }
      // fetch initial balance
      await getBalance();
      setIsModalOpen(false);
    } catch (err) {
      setState((s) => ({ ...s, connecting: false }));
      throw err;
    }
  }, [state.autoConnect]);

  const disconnect = useCallback(async () => {
    if (selectedAdapter) {
      await selectedAdapter.disconnect();
    }
    setState((s) => ({
      ...s,
      walletName: null,
      publicKey: null,
      connected: false,
    }));
    setSelectedAdapter(null);
    localStorage.removeItem('walletz_lastWallet');
  }, [selectedAdapter]);

  const signMessage = useCallback(async (message: Uint8Array | string) => {
    if (!selectedAdapter || !selectedAdapter.signMessage) {
      throw new Error('No wallet connected or signMessage not supported');
    }
    return await selectedAdapter.signMessage(message);
  }, [selectedAdapter]);

  // Minimal direct fetch call to get balance from RPC
  const getBalance = useCallback(async (): Promise<number> => {
    if (!state.publicKey) return 0;
    try {
      const resp = await fetch(rpcUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'getBalance',
          params: [state.publicKey],
        }),
      });
      const data = await resp.json();
      const lamports = data?.result?.value ?? 0;
      const sol = fromLamports(lamports);
      setState((s) => ({ ...s, balanceSOL: sol }));
      return sol;
    } catch (err) {
      console.error('Failed to fetch balance', err);
      return 0;
    }
  }, [state.publicKey, rpcUrl]);

  // Minimal direct fetch call to get SPL token balances
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
            // SPL token program
            { programId: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA' },
            { encoding: 'jsonParsed' },
          ],
        }),
      });
      const data = await resp.json();
      // parse data.result.value for token info
      const tokenAccounts = data?.result?.value ?? [];
      // Return simplified array or full details
      return tokenAccounts;
    } catch (err) {
      console.error('Failed to fetch SPL token balances', err);
      return [];
    }
  }, [state.publicKey, rpcUrl]);

  // Modal controls
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
