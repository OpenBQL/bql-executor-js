import { getValueByPath } from "../../common";
import Web3 from "web3";

const interactContractEvm = async (
  key: string,
  path: string,
  context: Record<string, any>,
  provider: any
) => {
  const pathValue = getValueByPath(context, path);
  if (pathValue) {
    const action = pathValue[key];
    if (action.protocol === "NativeToken") {
      const web3 = new Web3(provider);
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
      console.log("xxx");
    }
  }
};

export default interactContractEvm;
