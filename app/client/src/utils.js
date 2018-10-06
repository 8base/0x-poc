// config
import config from './config';

export const displayBigInt = (bigInt) => {
  return bigInt.toString(10);
}

export const displayBigIntWithPrecision = (bigInt) => {
  return bigInt.shift(-config.precision).toString(10);
}