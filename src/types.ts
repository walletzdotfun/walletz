export interface WalletAdapter {
  name: string;
  icon?: string; // Base64 or URL
  url?: string; // Install link or docs link
  ready(): boolean;
  connect(): Promise<string>; // Connect returns the base58-encoded public key
  disconnect(): Promise<void>;   // Disconnect from the wallet
  signMessage?(message: Uint8Array | string): Promise<Uint8Array>; // Sign a message 

  // Called by the provider if we want to track account changes. Not all wallets support this; if they do, attach event listeners here.
  onAccountChange?(callback: (newPubkey: string | null) => void): void;

  // (Optional) remove the account change listener
  removeAccountChange?(): void;
}

export interface WalletzState {
  walletName: string | null;
  publicKey: string | null; // base58 address
  connected: boolean;
  connecting: boolean;
  balanceSOL: number | null;
  autoConnect: boolean;
}

//custom user config
export interface WalletzConfig {
  rpcUrl?: string;
  autoConnect?: boolean;
}
