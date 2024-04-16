/* eslint-disable import/no-default-export */

declare module "js-yaml";
declare module "bn.js" {
  class BN {
    constructor(
      number: string | number | BN,
      base?: number,
      endian?: "le" | "be",
      ...args: any[]
    );
  }
  export = BN;
}
