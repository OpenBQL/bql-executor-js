const getParentValueAndKeyByPath = (obj: Record<string, any>, path: string) => {
  const keys = path.split(".");
  let value = obj;
  let parentValue = obj;
  let parentKey = "";
  for (const key of keys) {
    if (value[key] === undefined) {
      return null;
    }
    parentKey = key;
    parentValue = value;
    value = value[key];
  }
  return { parentValue, parentKey };
};

export default getParentValueAndKeyByPath;
