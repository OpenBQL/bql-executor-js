import { BigNumber } from 'bignumber.js'

const add = (var1: number, var2: number) => {
  const result = new BigNumber(var1).plus(var2).toString()
  return result
}

export default add
