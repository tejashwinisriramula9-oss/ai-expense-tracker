export function formatCurrency(value) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value ?? 0)
}

export function formatDate(value) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function getTrendLabel(value) {
  return value > 0 ? `Up ${value}% compared to last month` : `Down ${Math.abs(value)}% from last month`
}
