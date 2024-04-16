import getValueByPath from "./getValueByPath.js";

const replaceVariables = (
  key: string | number,
  value: string,
  path: string,
  context: Record<string, any>
) => {
  const variableName = value.slice(1);
  const result = variableName.includes(".")
    ? getValueByPath(context, variableName)
    : context[variableName];
  if (result) {
    const pathValue = getValueByPath(context, path);
    if (pathValue) {
      pathValue[key] = typeof result === "function" ? result?.() : result;
    }
  }
};

export default replaceVariables;
