import { BigNumber } from "bignumber.js";

const pow = (var1: number | string, var2: number) => {
  const result = new BigNumber(var1).pow(var2).toString();
  return result;
};

export default pow;
