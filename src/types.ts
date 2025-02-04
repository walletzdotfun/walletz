export interface WalletAdapter {
  name: string;
  icon?: string; // Base64 or URL
  url?: string; // Install link or docs link
  ready(): boolean;
  connect(): Promise<string>; // returns base58-encoded publicKey
  disconnect(): Promise<void>;
  signMessage?(message: Uint8Array | string): Promise<Uint8Array>;
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
