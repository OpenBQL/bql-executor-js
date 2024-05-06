import transferObjToList from "../lib/utils/common/transferObjToList";

describe("transferObjToList", () => {
  test("should return an array of ListItem objects", () => {
    const obj = {
      network: "ethereum",
      workflow: [
        {
          action: {
            protocol: "ERC20",
            contract: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
            call: "transfer",
            params: {
              from: "0x621784f337e4245A20208A1476c1f35Da85f990f",
              to: "0x1664F394fBEF31C9136d391459d7E924c5E8535a",
              value: {
                _add: [1, 2],
              },
            },
          },
        },
      ],
    };

    const result = transferObjToList(obj);

    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(13);
    expect(result).toEqual([
      {
        key: "network",
        value: "ethereum",
        path: "",
      },
      {
        key: "protocol",
        value: "ERC20",
        path: "workflow.0.action",
      },
      {
        key: "contract",
        value: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
        path: "workflow.0.action",
      },
      {
        key: "call",
        value: "transfer",
        path: "workflow.0.action",
      },
      {
        key: "from",
        value: "0x621784f337e4245A20208A1476c1f35Da85f990f",
        path: "workflow.0.action.params",
      },
      {
        key: "to",
        value: "0x1664F394fBEF31C9136d391459d7E924c5E8535a",
        path: "workflow.0.action.params",
      },
      {
        key: 0,
        value: 1,
        path: "workflow.0.action.params.value._add",
      },
      {
        key: 1,
        value: 2,
        path: "workflow.0.action.params.value._add",
      },
      {
        key: "_add",
        value: [1, 2],
        path: "workflow.0.action.params.value",
      },
      {
        key: "value",
        value: {
          _add: [1, 2],
        },
        path: "workflow.0.action.params",
      },
      {
        key: "params",
        value: {
          from: "0x621784f337e4245A20208A1476c1f35Da85f990f",
          to: "0x1664F394fBEF31C9136d391459d7E924c5E8535a",
          value: {
            _add: [1, 2],
          },
        },
        path: "workflow.0.action",
      },
      {
        key: "action",
        value: {
          protocol: "ERC20",
          contract: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
          call: "transfer",
          params: {
            from: "0x621784f337e4245A20208A1476c1f35Da85f990f",
            to: "0x1664F394fBEF31C9136d391459d7E924c5E8535a",
            value: {
              _add: [1, 2],
            },
          },
        },
        path: "workflow.0",
      },
      {
        key: "workflow",
        value: [
          {
            action: {
              protocol: "ERC20",
              contract: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
              call: "transfer",
              params: {
                from: "0x621784f337e4245A20208A1476c1f35Da85f990f",
                to: "0x1664F394fBEF31C9136d391459d7E924c5E8535a",
                value: {
                  _add: [1, 2],
                },
              },
            },
          },
        ],
        path: "",
      },
    ]);
  });
});
