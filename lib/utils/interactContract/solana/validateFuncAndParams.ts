import { isNormalObject } from "../../common";

export const validateFuncAndParams = (idl: any, action: any) => {
  const error = "";
  const idlParams: any[] = [];
  const call = action.call;
  const params = action.params;

  const instructions = idl.instructions;
  const funObj = instructions.find((item: any) => item.name === call);
  if (!funObj) {
    return `The contract address with protocol ${action.protocol} cannot find ${call} function.`;
  } else if (params) {
    if (isNormalObject(params)) {
      const bqlParams = Object.keys(params);
      if (funObj.args?.length) {
        if (funObj.args[0]?.type?.defined) {
          const typeDefined = funObj.args[0]?.type?.defined;
          const funcArg = idl.types.find(
            (item: any) => item.name === typeDefined
          );
          const fields = funcArg?.type?.fields;
          fields.forEach((item: any) => {
            const isOption =
              Object.prototype.toString.call(item.type) === "[object Object]";
            if (!isOption) idlParams.push(item.name);
          });
        } else {
          funObj.args.forEach((item: any) => {
            idlParams.push(item.name);
          });
        }

        const everyBool = idlParams.every((item: any) =>
          bqlParams.includes(item)
        );
        if (!everyBool) {
          return `The ${action.call} function under the protocol ${
            action.protocol
          } is missing required fields, required fields are: ${idlParams.join(
            ","
          )}`;
        }
        for (const [key, value] of Object.entries(params)) {
          if (idlParams.includes(key)) {
            if (value === null) {
              return `The required parameters of the ${
                action.call
              } function under the protocol ${
                action.protocol
              } are not fully filled in, required fields are: ${idlParams.join(
                ","
              )}`;
            }
          }
        }
      }
    } else {
      return `The params of the ${action.call} function under the protocol should be an object`;
    }
  }
  return error;
};
