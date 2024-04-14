import { BigNumber } from "bignumber.js";

const eq = (var1: number | string, var2: number | string) => {
  const result = new BigNumber(var1).eq(var2);
  return result;
};

export default eq;
