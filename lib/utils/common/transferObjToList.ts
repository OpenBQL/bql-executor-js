export interface ListItem {
  key: string | number;
  value: any;
  path: string;
}

const transferObjToList = (
  obj: Record<string, any>,
  prefix = ""
): ListItem[] => {
  const list: ListItem[] = [];
  for (const key in obj) {
    const value = obj[key];
    if (Array.isArray(value)) {
      value.forEach((item, index) => {
        if (typeof item === "object" && item !== null) {
          const subList = transferObjToList(
            item,
            `${prefix}${prefix ? "." : ""}${key}.${index}`
          );
          list.push(...subList);
        } else {
          list.push({
            key: index,
            value: item,
            path: `${prefix}${prefix ? "." : ""}${key}.${index}`,
          });
        }
      });
      list.push({ key, value, path: `${prefix}` });
    } else if (typeof value === "object" && value !== null) {
      const subList = transferObjToList(
        value,
        `${prefix}${prefix ? "." : ""}${key}`
      );
      list.push(...subList);
      list.push({ key, value, path: `${prefix}` });
    } else {
      list.push({ key, value, path: `${prefix}` });
    }
  }
  return list;
};

export default transferObjToList;
