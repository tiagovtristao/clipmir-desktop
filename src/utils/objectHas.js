export default (obj, keys) => {
  if (typeof obj !== 'object' || obj === null) {
    return false;
  }

  for (let i = 0; i < keys.length; i++) {
    if (!Object.prototype.hasOwnProperty.call(obj, keys[i])) {
      return false;
    }
  }

  return true;
};
