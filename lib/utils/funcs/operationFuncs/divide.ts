import { BigNumber } from "bignumber.js";

const divide = (var1: number | string, var2: number | string) => {
  const result = new BigNumber(var1).div(var2).toString();
  return result;
};

export default divide;
