export function startOfDay(date) {
  return date.set({
    hour: 0,
    minute: 0,
    second: 0,
    millisecond: 0
  });
}