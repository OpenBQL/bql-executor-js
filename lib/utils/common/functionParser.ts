import funcs from "../operationFuncs";
import getParentValueAndKeyByPath from "./getParentValueAndKeyByPath";
import getValueByPath from "./getValueByPath";
const functionParser = (
  key: string,
  path: string,
  context: Record<string, any>
) => {
  const funcName = key.slice(1);
  const func = funcs[funcName];
  if (func) {
    const pathValue = getValueByPath(context, path);
    if (pathValue) {
      const paramsArr = pathValue[key];
      const result = func(...paramsArr);
      const parent = getParentValueAndKeyByPath(context, path);
      if (parent) {
        const { parentKey, parentValue } = parent;
        parentValue[parentKey] = result;
      }
    }
  }
};

export default functionParser;
