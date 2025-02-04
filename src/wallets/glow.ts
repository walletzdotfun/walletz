import { WalletAdapter } from '../types';
import { encodeMessage } from '../utils';

let glowAccountChangedCallback: ((newPubkey: string | null) => void) | null = null;
function handleAccountChanged(pubkey: any) {
  if (glowAccountChangedCallback) {
    glowAccountChangedCallback(pubkey ? pubkey.toString() : null);
  }
}

export const GlowAdapter: WalletAdapter = {
  name: 'Glow',
  icon: 'https://lh3.googleusercontent.com/kM0ab_ogwIIk5b1wCIlKrLwztCd_VUqutfLhrgmjX2v7P11hDU2aIaR7r0pldGpK7_L6VxswFu2Zo17LR_En0iV-SdY=s120',
  url: 'https://glow.app/',

  ready(): boolean {
    return typeof window !== 'undefined' && !!(window as any).glow?.isGlow;
  },

  async connect(): Promise<string> {
    if (!this.ready()) {
      throw new Error('Glow not available.');
    }
    try {
      const provider = (window as any).glow;
      const resp = await provider.connect();
      if (resp.publicKey) {
        return resp.publicKey.toString();
      } else {
        throw new Error('Glow connect failed: No public key returned.');
      }
    } catch (error) {
      throw new Error(`Glow connect failed: ${(error as Error).message}`);
    }
  },

  async disconnect(): Promise<void> {
    try {
      const provider = (window as any).glow;
      if (provider?.disconnect) {
        await provider.disconnect();
      }
    } catch (error) {
      throw new Error(`Glow disconnect failed: ${(error as Error).message}`);
    }
  },

  async signMessage(message) {
    const provider = (window as any).glow;
    if (!provider?.signMessage) {
      throw new Error('Glow does not support signMessage');
    }
    try {
      const encoded = encodeMessage(message);
      const { signature } = await provider.signMessage(encoded, 'utf8');
      return signature;
    } catch (error) {
      throw new Error(`Glow signMessage failed: ${(error as Error).message}`);
    }
  },

  onAccountChange(callback) {
    glowAccountChangedCallback = callback;
    const provider = (window as any).glow;
    if (provider?.on) {
      provider.on('accountChanged', handleAccountChanged);
    }
  },

  removeAccountChange() {
    glowAccountChangedCallback = null;
    const provider = (window as any).glow;
    if (provider?.removeListener) {
      provider.removeListener('accountChanged', handleAccountChanged);
    }
  }
};
