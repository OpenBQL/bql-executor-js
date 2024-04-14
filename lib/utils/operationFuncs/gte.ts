import { BigNumber } from "bignumber.js";

const gte = (var1: number | string, var2: number | string) => {
  const result = new BigNumber(var1).gte(var2);
  return result;
};

export default gte;
