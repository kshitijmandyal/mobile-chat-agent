export function checkSafety(message: string) {
  const lower = message.toLowerCase()
  const banned = ["api key", "system prompt", "ignore rules", "trash brand"]
  for (const b of banned) {
    if (lower.includes(b)) return false
  }
  return true
}
