import { WalletAdapter } from '../types';
import { encodeMessage } from '../utils';

let phantomAccountChangedCallback: ((newPubkey: string | null) => void) | null = null;

function handleAccountChanged(pubkey: any) {
  if (phantomAccountChangedCallback) {
    const pkString = pubkey ? pubkey.toString() : null;
    phantomAccountChangedCallback(pkString);
  }
}

export const PhantomAdapter: WalletAdapter = {
  name: 'Phantom',
  icon: 'https://yt3.googleusercontent.com/0yNbMsS0-rUrtVJmKd6d0xTDmLDEn1qu_KkivaeIC3UmCuXntxE-CJZRhWoy93JXij1YSJFMhA=s900-c-k-c0x00ffffff-no-rj',
  url: 'https://phantom.app/',
  
  ready(): boolean {
    return typeof window !== 'undefined' && !!(window as any).solana?.isPhantom;
  },

  async connect(): Promise<string> {
    if (!this.ready()) {
      throw new Error('Phantom not available in this browser.');
    }
    try {
      const provider = (window as any).solana;
      const response = await provider.connect();
      if (response.publicKey) {
        return response.publicKey.toString();
      } else {
        throw new Error('Phantom connect failed: No public key returned.');
      }
    } catch (error) {
      throw new Error(`Phantom connect failed: ${(error as Error).message}`);
    }
  },

  async disconnect(): Promise<void> {
    try {
      const provider = (window as any).solana;
      if (provider?.disconnect) {
        await provider.disconnect();
      }
    } catch (error) {
      throw new Error(`Phantom disconnect failed: ${(error as Error).message}`);
    }
  },

  async signMessage(message) {
    const provider = (window as any).solana;
    if (!provider?.signMessage) {
      throw new Error('Phantom does not support signMessage.');
    }
    try {
      const encoded = encodeMessage(message);
      const { signature } = await provider.signMessage(encoded, 'utf8');
      return signature;
    } catch (error) {
      throw new Error(`Phantom signMessage failed: ${(error as Error).message}`);
    }
  },

  onAccountChange(callback) {
    phantomAccountChangedCallback = callback;
    const provider = (window as any).solana;
    if (provider?.on) {
      provider.on('accountChanged', handleAccountChanged);
    }
  },

  removeAccountChange() {
    phantomAccountChangedCallback = null;
    const provider = (window as any).solana;
    if (provider?.removeListener) {
      provider.removeListener('accountChanged', handleAccountChanged);
    }
  },
};
