import { getValueByPath } from "../../common";
import Web3 from "web3";
import * as ERC20 from "../../../abis/erc20.json";

const interactContractEvm = async (
  key: string,
  path: string,
  context: Record<string, any>,
  provider: any
) => {
  const pathValue = getValueByPath(context, path);
  if (pathValue) {
    const action = pathValue[key];
    const web3 = new Web3(provider);
    if (action.protocol === "NativeToken") {
      const transactionPromise = new Promise((resolve, reject) => {
        web3.eth
          .sendTransaction(action.params)
          .on("transactionHash", function (hash) {
            console.log("Transaction Hash:", hash);
          })
          .on("receipt", function (receipt) {
            resolve(receipt);
          })
          .on("error", function (error) {
            reject(error);
          });
      });
      await transactionPromise;
    } else {
      let res;
      const contractObj = await new web3.eth.Contract(
        ERC20 as any,
        action.contract
      );
      if (action.params) {
        if (action.value && !isNaN(action.value) && action.value !== "0") {
          res = await contractObj?.methods?.[action.call]?.(
            ...Object.values(action.params),
            { value: action.value }
          ).call();
        } else {
          res = await contractObj?.methods?.[action.call]?.(
            ...Object.values(action.params)
          ).call();
        }
      } else {
        if (action.value && !isNaN(action.value) && action.value !== "0") {
          res = await contractObj?.methods?.[action.call]?.({
            value: action.value,
          }).call();
        } else {
          res = await contractObj?.methods?.[action.call]?.().call();
        }
      }
      console.log(res);
    }
  }
};

export default interactContractEvm;
