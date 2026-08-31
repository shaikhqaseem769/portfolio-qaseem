export const START_WORK_DATE = '2019-02-01'

export function getExperienceYears(startDate = START_WORK_DATE, referenceDate = new Date()): number {
  const start = new Date(startDate)
  const now = new Date(referenceDate)

  let years = now.getFullYear() - start.getFullYear()
  const monthDiff = now.getMonth() - start.getMonth()
  const dayDiff = now.getDate() - start.getDate()

  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
    years -= 1
  }

  return Math.max(years, 0)
}

export function getExperienceLabel(startDate = START_WORK_DATE, referenceDate = new Date()): string {
  const years = getExperienceYears(startDate, referenceDate)
  return `${years}+`
}
