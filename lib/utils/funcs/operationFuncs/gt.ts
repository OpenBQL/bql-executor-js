import { BigNumber } from "bignumber.js";

const gt = (var1: number | string, var2: number | string) => {
  const result = new BigNumber(var1).gt(var2);
  return result;
};

export default gt;
