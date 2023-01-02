const BYTES_PER_KB = 1024
const UnitScale = {
  kb: 1,
  mb: 2,
  gb: 3,
  tb: 4,
}
type SizeUnit = keyof typeof UnitScale
export const toBytes = (size: number, unit: SizeUnit): number => {
  if (!UnitScale[unit]) {
    throw new Error(`Unable to convert size unit ${unit}`)
  }
  return size * Math.pow(BYTES_PER_KB, UnitScale[unit])
}

const MINUTE_SECONDS = 60
const HOUR_SECONDS = 60 * MINUTE_SECONDS
const DAY_SECONDS = 24 * HOUR_SECONDS
const TimeUnitScale = {
  sec: 1,
  min: MINUTE_SECONDS,
  hr: HOUR_SECONDS,
  day: DAY_SECONDS,
}
type TimeUnit = keyof typeof TimeUnitScale
export const toSeconds = (time: number, unit: TimeUnit): number => {
  if (!TimeUnitScale[unit]) {
    throw new Error(`Unable to convert time unit ${unit}`)
  }
  return time * TimeUnitScale[unit]
}
