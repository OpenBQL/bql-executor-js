import { getAssociatedTokenAddressSync as getAssociatedTokenAddressSync_ } from "@solana/spl-token";
import { PublicKey } from "@solana/web3.js";

const getAssociatedTokenAddressSync = (
  mint: PublicKey,
  owner: PublicKey,
  allowOwnerOffCurve?: boolean,
  programId?: PublicKey,
  associatedTokenProgramId?: PublicKey
) => {
  return getAssociatedTokenAddressSync_(
    mint,
    owner,
    allowOwnerOffCurve,
    programId,
    associatedTokenProgramId
  );
};

export default getAssociatedTokenAddressSync;
