import { BigNumber } from "bignumber.js";

const min = (...rest: any[]) => {
  const result = BigNumber.minimum(...rest);
  return result;
};

export default min;
