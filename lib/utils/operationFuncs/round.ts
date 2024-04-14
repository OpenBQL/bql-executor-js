import { BigNumber } from "bignumber.js";

const round = (var1: number | string, num: number) => {
  const result = new BigNumber(var1).dp(num);

  return result;
};

export default round;
