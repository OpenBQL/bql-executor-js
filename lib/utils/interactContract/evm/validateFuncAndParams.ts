import { isNormalObject } from "../../common";

export const validateFuncAndParams = (abi: any[], action: any) => {
  const error = "";
  const abiParams = [];
  const call = action.call;
  const params = action.params;
  const funcArr = abi.filter((item) => item.name === call);
  if (funcArr.length === 1) {
    const funObj = funcArr[0];
    if (!funObj) {
      return `The contract address with protocol ${action.protocol} cannot find ${call} function.`;
    } else if (params) {
      if (isNormalObject(params)) {
        const bqlParams = Object.keys(params);
        for (const obj of funObj.inputs) {
          abiParams.push(obj.name);
        }
        const abiParamsStr = abiParams.join(",");
        const bqlParamsStr = bqlParams.join(",");
        if (abiParamsStr !== bqlParamsStr) {
          return `The parameters of the ${action.call} function under the protocol ${action.protocol} are (${abiParamsStr}), The parameters you fill in are (${bqlParamsStr}).`;
        }
        for (const value of Object.values(params)) {
          if (value === null) {
            return `The corresponding values of the params of the ${action.call} function under the protocol ${action.protocol} are not fully filled in.`;
          }
        }
      } else {
        return `The params of the ${action.call} function under the protocol should be an object`;
      }
    }
  }
  return error;
};
