export const stringToBoolean = (val?: string): boolean => {
  return /^true$/i.test(val || '');
};

