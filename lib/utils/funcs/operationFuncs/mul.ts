import { BigNumber } from "bignumber.js";

const mul = (var1: number | string, var2: number | string) => {
  const result = new BigNumber(var1).times(var2).toString();
  return result;
};

export default mul;
