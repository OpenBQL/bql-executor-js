import { BigNumber } from "bignumber.js";

const lte = (var1: number | string, var2: number | string) => {
  const result = new BigNumber(var1).lte(var2);
  return result;
};

export default lte;
