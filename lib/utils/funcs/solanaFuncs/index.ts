import publicKey from "./publicKey.js";
import bn from "./bn.js";
import strToBuffer from "./strToBuffer.js";
import publicKeyToBuffer from "./publicKeyToBuffer.js";
import bnToBuffer from "./bnToBuffer.js";
import fetchAccountFromPDA from "./fetchAccountFromPDA.js";
import getAssociatedTokenAddressSync from "./getAssociatedTokenAddressSync.js";
import findProgramAddressSync from "./findProgramAddressSync.js";

const solanaFuncs: Record<string, any> = {
  publicKey,
  bn,
  strToBuffer,
  publicKeyToBuffer,
  bnToBuffer,
  fetchAccountFromPDA,
  getAssociatedTokenAddressSync,
  findProgramAddressSync,
};

export default solanaFuncs;
