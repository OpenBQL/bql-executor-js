const getValueByPath = (obj: Record<string, any>, path: string) => {
  const keys = path.split('.')
  let value = obj
  for (const key of keys) {
    if (value[key] === undefined) {
      return undefined
    }
    value = value[key]
  }
  return value
}

export default getValueByPath
