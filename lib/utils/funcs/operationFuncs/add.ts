import { BigNumber } from "bignumber.js";

const add = (var1: number | string, var2: number | string) => {
  const result = new BigNumber(var1).plus(var2).toString();
  return result;
};

export default add;
