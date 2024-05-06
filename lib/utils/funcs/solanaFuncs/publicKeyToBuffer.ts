import { PublicKey } from "@solana/web3.js";

const publicKeyToBuffer = (publicKey: PublicKey) => {
  return publicKey.toBuffer();
};

export default publicKeyToBuffer;
