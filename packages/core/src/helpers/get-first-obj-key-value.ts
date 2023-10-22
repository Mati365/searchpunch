export const getFirstObjKeyValue = <O extends Record<string, any>>(obj: O) => {
  const [key] = Object.keys(obj);

  return obj[key];
};
