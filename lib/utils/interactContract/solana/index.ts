import {
  Connection,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
  TokenAccountNotFoundError,
  TokenInvalidAccountOwnerError,
  createAssociatedTokenAccountInstruction,
  createTransferInstruction,
  getAssociatedTokenAddressSync,
  getOrCreateAssociatedTokenAccount,
} from "@solana/spl-token";
import * as anchor from "@project-serum/anchor";
import { isNormalObject } from "../../common/index.js";
import { logItem } from "../../../index.js";
import { validateFuncAndParams } from "./validateFuncAndParams.js";

const interactContractSolana = async (
  action: any,
  abiOrIdl: Record<string, any[] | Record<string, any>>,
  provider: any,
  solanaRpc: string,
  logs: any,
  uuid: string
) => {
  if (action) {
    const connection = new Connection(solanaRpc);
    let res;
    if (action.protocol === "NativeToken") {
      // transfer SOL Token
      const fromPublicKey = action?.params?.from;
      const toPublicKey = action?.params?.to;
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: fromPublicKey,
          toPubkey: toPublicKey,
          lamports: action?.params?.value,
        })
      );
      transaction.feePayer = fromPublicKey;
      transaction.recentBlockhash = (
        await connection.getLatestBlockhash()
      ).blockhash;
      const resObj = await provider.signAndSendTransaction(transaction);
      res = resObj.signature;
    } else if (action.protocol === "SPL") {
      // transfer SPL Token
      const fromPublicKey = action?.params?.from;
      const toPublicKey = action?.params?.to;
      const contractPublicKey = new PublicKey(action.contract);
      const sourceAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        provider,
        contractPublicKey,
        fromPublicKey
      );
      let destinationAccount;
      try {
        destinationAccount = await getOrCreateAssociatedTokenAccount(
          connection,
          provider,
          contractPublicKey,
          toPublicKey
        );
      } catch (error) {
        if (
          error instanceof TokenAccountNotFoundError ||
          error instanceof TokenInvalidAccountOwnerError
        ) {
          const associatedToken = getAssociatedTokenAddressSync(
            contractPublicKey,
            toPublicKey,
            false,
            TOKEN_PROGRAM_ID,
            ASSOCIATED_TOKEN_PROGRAM_ID
          );
          const transaction = new Transaction().add(
            createAssociatedTokenAccountInstruction(
              fromPublicKey,
              associatedToken,
              toPublicKey,
              contractPublicKey,
              TOKEN_PROGRAM_ID,
              ASSOCIATED_TOKEN_PROGRAM_ID
            )
          );
          transaction.feePayer = fromPublicKey;
          transaction.recentBlockhash = (
            await connection.getLatestBlockhash()
          ).blockhash;
          const resObj = await provider.signAndSendTransaction(transaction);
          await connection.confirmTransaction(resObj.signature, "finalized");
        }
      }
      if (!destinationAccount) {
        destinationAccount = await getOrCreateAssociatedTokenAccount(
          connection,
          provider,
          contractPublicKey,
          toPublicKey
        );
      }
      const transaction = new Transaction().add(
        createTransferInstruction(
          sourceAccount.address,
          destinationAccount.address,
          fromPublicKey,
          action?.params?.value
        )
      );
      transaction.feePayer = fromPublicKey;
      transaction.recentBlockhash = (
        await connection.getLatestBlockhash()
      ).blockhash;
      const resObj = await provider.signAndSendTransaction(transaction);
      res = resObj.signature;
    } else {
      const isEmpty =
        Object.entries(abiOrIdl).length === 0 &&
        abiOrIdl.constructor === Object;
      let idl: any = isEmpty ? null : abiOrIdl[action.contract] || null;
      if (!idl) {
        idl = abiOrIdl[action.contract];
        const validateRes = validateFuncAndParams(idl, action);
        if (validateRes) {
          throw new Error(validateRes);
        }
      }
      // contract call
      const solanaProvider = new anchor.AnchorProvider(
        connection,
        provider,
        {}
      );
      anchor.setProvider(solanaProvider);
      const program = new anchor.Program(idl, new PublicKey(action.contract));
      const params = action.params;
      for (const key in params) {
        if (key.endsWith("?")) {
          const newKey = key.slice(0, -1);
          if (params[key] !== undefined && params[key] !== null) {
            params[newKey] = params[key];
          }
          delete params[key];
        }
      }
      const accounts = action.accounts;
      if (params && Object.keys(params).length) {
        const isAccounts = accounts && isNormalObject(accounts);
        res = await program.methods?.[action.call]?.(params)
          .accounts(isAccounts ? accounts : {})
          .rpc();
      } else {
        const isAccounts = accounts && isNormalObject(accounts);
        res = await program.methods?.[action.call]?.()
          .accounts(isAccounts ? accounts : {})
          .rpc();
      }
    }
    await connection.confirmTransaction(res, "finalized");
    action.txid = res;
    action.status = "completed";
    const actionLog: logItem = {
      type: "action",
      timeStamp: Date.now(),
      runId: uuid,
      code: action,
      message: JSON.stringify(action, null, 2),
    };
    logs && logs((state: any) => [...state, actionLog]);
  }
};

export default interactContractSolana;
