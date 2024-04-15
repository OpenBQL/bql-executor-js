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
      const receipt = await web3.eth.sendTransaction(action.params);
      console.log(receipt);
    }
  }
};

export default interactContractEvm;
