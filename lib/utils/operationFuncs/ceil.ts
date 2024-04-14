import { BigNumber } from "bignumber.js";

const ceil = (var1: number | string) => {
  const result = new BigNumber(var1)
    .integerValue(BigNumber.ROUND_UP)
    .toString();
  return result;
};

export default ceil;
