import { PublicKey } from "@solana/web3.js";
import * as anchor from "@project-serum/anchor";

const fetchAccountFromPDA = async (
  abiOrIdl: Record<string, any[] | Record<string, any>>,
  contractAddress: string,
  accountStr: string,
  pda: PublicKey
) => {
  const idl: any = abiOrIdl[contractAddress] || null;
  const program = new anchor.Program(idl, new PublicKey(contractAddress));
  const account = await program.account[accountStr].fetch(pda);
  return account;
};

export default fetchAccountFromPDA;
