export default (obj, keys) => {
  if (typeof obj !== 'object' || typeof obj === 'null') {
    return false;
  }

  for (let i = 0; i < keys.length; i++) {
    if (!Object.prototype.hasOwnProperty.call(obj, keys[i])) {
      return false;
    }
  }

  return true;
};
