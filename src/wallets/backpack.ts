import { WalletAdapter } from '../types';
import { encodeMessage } from '../utils';

let backpackAccountChangedCallback: ((newPubkey: string | null) => void) | null = null;

function handleAccountChanged(pubkey: any) {
  if (backpackAccountChangedCallback) {
    const pkString = pubkey ? pubkey.toString() : null;
    backpackAccountChangedCallback(pkString);
  }
}

export const BackpackAdapter: WalletAdapter = {
  name: 'Backpack',
  icon: 'https://play-lh.googleusercontent.com/EhgMPJGUYrA7-8PNfOdZgVGzxrOw4toX8tQXv-YzIvN6sAMYFunQ55MVo2SS_hLiNm8',
  url: 'https://www.backpack.app/',

  ready(): boolean {
    return typeof window !== 'undefined' && !!(window as any).backpack?.isBackpack;
  },

  async connect(): Promise<string> {
    if (!this.ready()) {
      throw new Error('Backpack is not available.');
    }
    try {
      const provider = (window as any).backpack;
      const resp = await provider.connect();
      if (resp.publicKey) {
        return resp.publicKey.toString();
      } else {
        throw new Error('Backpack connect failed: No public key returned.');
      }
    } catch (error) {
      throw new Error(`Backpack connect failed: ${(error as Error).message}`);
    }
  },

  async disconnect(): Promise<void> {
    try {
      const provider = (window as any).backpack;
      if (provider?.disconnect) {
        await provider.disconnect();
      }
    } catch (error) {
      throw new Error(`Backpack disconnect failed: ${(error as Error).message}`);
    }
  },

  async signMessage(message) {
    const provider = (window as any).backpack;
    if (!provider?.signMessage) {
      throw new Error('Backpack does not support signMessage');
    }
    try {
      const encoded = encodeMessage(message);
      const { signature } = await provider.signMessage(encoded);
      return signature;
    } catch (error) {
      throw new Error(`Backpack signMessage failed: ${(error as Error).message}`);
    }
  },

  onAccountChange(callback) {
    backpackAccountChangedCallback = callback;
    const provider = (window as any).backpack;
    if (provider?.on) {
      provider.on('accountChanged', handleAccountChanged);
    }
  },

  removeAccountChange() {
    backpackAccountChangedCallback = null;
    const provider = (window as any).backpack;
    if (provider?.removeListener) {
      provider.removeListener('accountChanged', handleAccountChanged);
    }
  }
};
