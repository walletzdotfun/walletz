import { useContext } from 'react';
import { WalletzContext } from './WalletzContext';

export function useWalletz() {
  const ctx = useContext(WalletzContext);
  if (!ctx) {
    throw new Error('useWalletz must be used within a <WalletzProvider>');
  }
  return ctx;
}
