import { getValueByPath } from "../../common";
import { Contract } from "ethers";
import ERC20 from "../../../abis/erc20.json";
import { Web3Provider } from "@ethersproject/providers";
import { isNormalObject, getUuid } from "../../common";
import { logItem } from "../../..";

const interactContractEvm = async (
  key: string,
  path: string,
  context: Record<string, any>,
  provider: any,
  account: string,
  logs: logItem[]
) => {
  const pathValue = getValueByPath(context, path);
  if (pathValue) {
    const action = pathValue[key];
    const library = new Web3Provider(provider);
    const signer = library.getSigner(account).connectUnchecked();
    let res;
    if (action.protocol === "NativeToken") {
      // native coin transfer
      res = await signer?.["sendTransaction"]?.(action.params);
    } else {
      // contract call
      const contractObj = new Contract(action.contract, ERC20, signer);
      const hasValue =
        action.value && !isNaN(action.value) && action.value !== "0";
      if (action.params) {
        const hasSameNameFunc =
          ERC20.filter((item) => item.name === action.call).length > 1;

        const funcName = hasSameNameFunc
          ? `${action.call}(${Object.keys(action.params).join(",")})`
          : action.call;
        const params = [...Object.values(action.params)];
        if (hasValue) params.push({ value: action.value });

        res = await contractObj?.[funcName]?.(...params);
      } else {
        const params = [];
        if (hasValue) params.push({ value: action.value });
        res = await contractObj?.[action.call]?.(...params);
      }

      if (res?.hash) {
        const receipt = await library.waitForTransaction(res.hash);
        action.txid = res.hash;
        if (receipt?.status === 1) {
          action.status = "completed";
        } else {
          action.status = "failed";
        }
      } else {
        if (action.return && Array.isArray(action.return)) {
          for (const obj of action.return) {
            if (isNormalObject(obj)) {
              const value = Array.isArray(res)
                ? res.map((item) => item.toString())
                : res?.toString();
              context[Object.keys(obj)[0]] = value;
              obj[Object.keys(obj)[0]] = value;
            }
          }
        }
      }
      logs.push({
        type: "action",
        timeStamp: Date.now(),
        runId: getUuid(),
        code: action,
        message: JSON.stringify(action, null, 2),
      });
    }
  }
};

export default interactContractEvm;
