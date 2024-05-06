import { PublicKey } from "@solana/web3.js";

const publicKey = (address: string) => {
  return new PublicKey(address);
};

export default publicKey;
