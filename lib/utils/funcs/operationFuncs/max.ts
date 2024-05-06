import { BigNumber } from "bignumber.js";

const max = (...rest: any[]) => {
  const result = BigNumber.maximum(...rest);
  return result;
};

export default max;
