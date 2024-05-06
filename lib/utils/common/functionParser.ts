import funcs from "../funcs/index.js";
import getParentValueAndKeyByPath from "./getParentValueAndKeyByPath.js";
import getValueByPath from "./getValueByPath.js";
const functionParser = async (
  key: string,
  path: string,
  context: Record<string, any>,
  abiOrIdl: Record<string, any[] | Record<string, any>>
) => {
  const funcName = key.slice(1);
  const func = funcs[funcName];
  if (func) {
    const pathValue = getValueByPath(context, path);
    if (pathValue) {
      const paramsArr = pathValue[key];
      const result = await (funcName === "fetchAccountFromPDA"
        ? func(abiOrIdl, ...paramsArr)
        : func(...paramsArr));
      const parent = getParentValueAndKeyByPath(context, path);
      if (parent) {
        const { parentKey, parentValue } = parent;
        parentValue[parentKey] = result;
      }
    }
  }
};

export default functionParser;
