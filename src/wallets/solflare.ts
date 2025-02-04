import { WalletAdapter } from '../types';
import { encodeMessage } from '../utils';

let solflareAccountChangedCallback: ((newPubkey: string | null) => void) | null = null;

function handleAccountChanged(pubkey: any) {
  if (solflareAccountChangedCallback) {
    const pkString = pubkey ? pubkey.toString() : null;
    solflareAccountChangedCallback(pkString);
  }
}

export const SolflareAdapter: WalletAdapter = {
  name: 'Solflare',
  icon: 'https://cdn.prod.website-files.com/66e480f0e9eccea9c231ce92/66e619478b339554984f72ff_solflare-wallet-logo.png',
  url: 'https://solflare.com/',

  ready(): boolean {
    return typeof window !== 'undefined' && !!(window as any).solflare;
  },

  async connect(): Promise<string> {
    if (!this.ready()) {
      throw new Error('Solflare is not available.');
    }
    try {
      const provider = (window as any).solflare;
      await provider.connect();
      return provider.publicKey?.toString();
    } catch (error) {
      throw new Error(`Solflare connect failed: ${(error as Error).message}`);
    }
  },

  async disconnect(): Promise<void> {
    try {
      const provider = (window as any).solflare;
      if (provider?.disconnect) {
        await provider.disconnect();
      }
    } catch (error) {
      throw new Error(`Solflare disconnect failed: ${(error as Error).message}`);
    }
  },

  async signMessage(message) {
    const provider = (window as any).solflare;
    if (!provider?.signMessage) {
      throw new Error('Solflare does not support signMessage');
    }
    try {
      const encoded = encodeMessage(message);
      const { signature } = await provider.signMessage(encoded, 'utf8');
      return signature;
    } catch (error) {
      throw new Error(`Solflare signMessage failed: ${(error as Error).message}`);
    }
  },

  onAccountChange(callback) {
    solflareAccountChangedCallback = callback;
    const provider = (window as any).solflare;
    if (provider?.on) {
      provider.on('accountChanged', handleAccountChanged);
    }
  },

  removeAccountChange() {
    solflareAccountChangedCallback = null;
    const provider = (window as any).solflare;
    if (provider?.removeListener) {
      provider.removeListener('accountChanged', handleAccountChanged);
    }
  }
};
