export function parseIntent(message: string) {
  const lower = message.toLowerCase()
  const intent: any = {}

  const budgetMatch = lower.match(/(\d{4,6})/)
  if (budgetMatch) intent.budget = parseInt(budgetMatch[1])

  const brands = ["samsung", "apple", "oneplus", "xiaomi", "vivo", "oppo"]
  for (const b of brands) {
    if (lower.includes(b)) {
      intent.brand = b
      break
    }
  }

  return intent
}
