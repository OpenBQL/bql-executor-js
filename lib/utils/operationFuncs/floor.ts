import { BigNumber } from "bignumber.js";

const floor = (var1: number | string) => {
  const result = new BigNumber(var1)
    .integerValue(BigNumber.ROUND_DOWN)
    .toString();
  return result;
};

export default floor;
