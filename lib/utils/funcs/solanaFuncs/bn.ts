import * as anchor from "@project-serum/anchor";

const bn = (num: number | string) => {
  return new anchor.BN(num);
};

export default bn;
