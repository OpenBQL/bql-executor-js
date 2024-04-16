export const zeroAddress = "0x0000000000000000000000000000000000000000";

export const getUnix = () => {
  return Math.floor(Date.now() / 1000);
};

export const publicVariable = {
  CURRENT_TIMESTAMP: getUnix,
  ZERO_ADDRESS: zeroAddress,
};
