import { BigNumber } from "bignumber.js";

const lt = (var1: number | string, var2: number | string) => {
  const result = new BigNumber(var1).lt(var2);
  return result;
};

export default lt;
