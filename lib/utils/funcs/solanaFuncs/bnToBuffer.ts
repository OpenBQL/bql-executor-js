const bnToBuffer = (bn: any) => {
  return bn.toArrayLike(Buffer, "be", 16);
};

export default bnToBuffer;
