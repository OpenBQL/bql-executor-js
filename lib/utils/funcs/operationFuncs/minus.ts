import { BigNumber } from "bignumber.js";

const minus = (var1: number | string, var2: number | string) => {
  const result = new BigNumber(var1).minus(var2).toString();
  return result;
};

export default minus;
