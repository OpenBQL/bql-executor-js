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
import { getValueByPath, isNormalObject } from "../../common";
import { logItem } from "../../..";
import { validateFuncAndParams } from "./validateFuncAndParams";

const interactContractSolana = async (
  key: string,
  path: string,
  context: Record<string, any>,
  abiOrIdl: Record<string, any[] | Record<string, any>>,
  provider: any,
  solanaRpc: string,
  logs: logItem[],
  uuid: string
) => {
  const pathValue = getValueByPath(context, path);
  if (pathValue) {
    const action = pathValue[key];

    const connection = new Connection(solanaRpc);
    let res;
    if (action.protocol === "NativeToken") {
      // transfer SOL Token
      const fromPublicKey = new PublicKey(action?.params?.from || "");
      const toPublicKey = new PublicKey(action?.params?.to || "");
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
      const fromPublicKey = new PublicKey(action?.params?.from || "");
      const toPublicKey = new PublicKey(action?.params?.to || "");
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
      const instructions = idl.instructions;
      const funObj = instructions.find(
        (item: any) => item.name === action.call
      );
      let fields = [];
      if (funObj.args?.length) {
        if (funObj.args[0]?.type?.defined) {
          const typeDefined = funObj.args[0]?.type?.defined;
          const funcArg = idl.types.find(
            (item: any) => item.name === typeDefined
          );
          fields = funcArg?.type?.fields;
        } else {
          fields = funObj.args;
        }
      }
      for (const [key, value] of Object.entries(params)) {
        const currObj = fields.find((item: any) => item.name === key);
        if (
          currObj.type === "publicKey" ||
          currObj.type?.option === "publicKey"
        ) {
          params[key] = new PublicKey(value as any);
        }
        if (
          currObj.type?.includes("u") ||
          currObj.type?.option?.includes("u")
        ) {
          params[key] = new anchor.BN(value as any);
        }
      }
      const accounts = action.accounts;
      if (accounts && isNormalObject(accounts)) {
        for (const [key, value] of Object.entries(accounts)) {
          accounts[key] = value ? new PublicKey(value) : value;
        }
      }

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
    logs.push({
      type: "action",
      timeStamp: Date.now(),
      runId: uuid,
      code: action,
      message: JSON.stringify(action, null, 2),
    });
  }
};

export default interactContractSolana;
