import { WalletAdapter } from '../types';
import { encodeMessage } from '../utils';

export const PhantomAdapter: WalletAdapter = {
  name: 'Phantom',
  icon: 'https://ipfs.everipedia.org/ipfs/Qmacpgp47AVAKPh1Q8LvEoXLM9ZNsBKqc8nYvbfUHR6K8x',
  url: 'https://phantom.app/',
  ready: function (): boolean {
    return typeof window !== 'undefined' && !!(window as any).solana?.isPhantom;
  },
  connect: async function (): Promise<string> {
    if (!this.ready()) throw new Error('Phantom not available');
    const provider = (window as any).solana;
    const resp = await provider.connect({ onlyIfTrusted: false });
    return resp.publicKey?.toString();
  },
  disconnect: async function (): Promise<void> {
    const provider = (window as any).solana;
    if (provider?.disconnect) {
      await provider.disconnect();
    }
  },
  signMessage: async function (message): Promise<Uint8Array> {
    const provider = (window as any).solana;
    if (!provider.signMessage) {
      throw new Error('Phantom does not support signMessage?');
    }
    const encoded = encodeMessage(message);
    const { signature } = await provider.signMessage(encoded, 'utf8');
    return signature;
  }
};
