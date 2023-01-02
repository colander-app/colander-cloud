export const getExpiryInSeconds = (in_seconds: number): number =>
  Math.floor(Date.now() / 1000) + in_seconds
