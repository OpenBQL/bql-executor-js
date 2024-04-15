export const isNormalObject = (obj: any) => {
  return (
    typeof obj === "object" &&
    Object.prototype.toString.call(obj) === "[object Object]"
  );
};
