import React from 'react';
import { WalletzState, WalletzConfig } from './types';

export interface WalletzContextValue extends WalletzState {
  connect(walletName: string): Promise<void>;
  disconnect(): Promise<void>;
  signMessage(msg: Uint8Array | string): Promise<Uint8Array>;
  getBalance(): Promise<number>;
  getTokenBalances(): Promise<any[]>;
  openModal(): void;
  closeModal(): void;
  isModalOpen: boolean;
  config?: WalletzConfig;
}

export const WalletzContext = React.createContext<WalletzContextValue | null>(null);
