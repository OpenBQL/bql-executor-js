import isNormalObject from "./isNormalObject.js";

const validateParams = (context: Record<string, any>, params: any) => {
  if (!context.params || !Array.isArray(context.params)) return "";
  for (const item of context.params) {
    if (item.required) {
      if (!params || !params[item.name]) {
        return `${item.name} is required`;
      }
    }
    if (item.type === "number") {
      if (isNaN(parseFloat(params[item.name])))
        return `${item.name} is a ${item.type} type`;
    }
    if (item.type === "string") {
      if (typeof params[item.name] !== "string")
        return `${item.name} is a ${item.type} type`;
    }
    if (item.type === "array") {
      if (!Array.isArray(params[item.name]))
        return `${item.name} is a ${item.type} type`;
    }
    if (item.type === "object") {
      if (!isNormalObject(params[item.name]))
        return `${item.name} is a ${item.type} type`;
    }
  }
  return "";
};

export default validateParams;
