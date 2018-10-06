import getZeroEx from './getZeroEx';


const cache = {};

export const getTokenMetaData = async (address) => {
  const zeroEx = await getZeroEx;
  if (!(address in cache)) {
    cache[address] = await zeroEx.tokenRegistry.getTokenIfExistsAsync(address);
  }

  return cache[address];  
}
