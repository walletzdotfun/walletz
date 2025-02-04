export function truncateAddress(address: string, length = 4): string {
  if (!address) return "";
  return `${address.slice(0, length)}...${address.slice(-length)}`;
}

export function toLamports(amountSol: number): number {
  return Math.floor(amountSol * 1e9);
}

export function fromLamports(amountLamports: number): number {
  return amountLamports / 1e9;
}

export function encodeMessage(msg: string | Uint8Array): Uint8Array {
  if (typeof msg === "string") {
    return new TextEncoder().encode(msg);
  }
  return msg;
}
