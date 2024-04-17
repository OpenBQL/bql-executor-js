import getValueByPath from "../lib/utils/common/getValueByPath";

describe("getValueByPath", () => {
  test("should return the value at the specified path", () => {
    const obj = {
      network: "ethereum",
      amount: "100",
      workflow: [
        {
          action: {
            protocol: "ERC20",
            contract: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
            call: "transfer",
            params: {
              from: "0x621784f337e4245A20208A1476c1f35Da85f990f",
              to: "0x1664F394fBEF31C9136d391459d7E924c5E8535a",
              value: "$amount",
            },
          },
        },
      ],
    };

    const result = getValueByPath(obj, "workflow.0.action.params");
    expect(result).toEqual({
      from: "0x621784f337e4245A20208A1476c1f35Da85f990f",
      to: "0x1664F394fBEF31C9136d391459d7E924c5E8535a",
      value: "$amount",
    });
  });
});
