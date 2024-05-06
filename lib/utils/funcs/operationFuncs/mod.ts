import { BigNumber } from "bignumber.js";

const mod = (var1: number | string, var2: number | string) => {
  const result = new BigNumber(var1).mod(var2).toString();
  return result;
};

export default mod;
