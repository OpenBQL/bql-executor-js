import { web3 } from "@project-serum/anchor";
import { PublicKey } from "@solana/web3.js";

const findProgramAddressSync = (bufferArr: Buffer[], programId: PublicKey) => {
  const [pda] = web3.PublicKey.findProgramAddressSync(bufferArr, programId);
  return pda;
};

export default findProgramAddressSync;
