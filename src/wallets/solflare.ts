import { WalletAdapter } from '../types';
import { encodeMessage } from '../utils';

export const SolflareAdapter: WalletAdapter = {
  name: 'Solflare',
  icon: 'https://solflare.com/logo.png',
  url: 'https://solflare.com/',
  ready: function (): boolean {
    return typeof window !== 'undefined' && !!(window as any).solflare;
  },
  connect: async function (): Promise<string> {
    const provider = (window as any).solflare;
    if (!provider) throw new Error('Solflare not available');
    await provider.connect();
    return provider.publicKey?.toString();
  },
  disconnect: async function (): Promise<void> {
    const provider = (window as any).solflare;
    if (provider?.disconnect) {
      await provider.disconnect();
    }
  },
  signMessage: async function (message) {
    const provider = (window as any).solflare;
    if (!provider.signMessage) {
      throw new Error('Solflare does not support signMessage?');
    }
    const encoded = encodeMessage(message);
    const { signature } = await provider.signMessage(encoded, 'utf8');
    return signature;
  }
};
