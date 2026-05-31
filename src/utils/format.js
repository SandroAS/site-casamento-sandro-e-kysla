export function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

export function normalizeQuotas(gift) {
  if (gift.quotas?.length) {
    return gift.quotas.map((q, i) => ({
      ...q,
      id: q.id || `${gift.id}-${i + 1}`,
    }))
  }

  const count = gift.quotaCount || 1
  const value = Math.round((gift.totalValue / count) * 100) / 100

  return Array.from({ length: count }, (_, i) => ({
    id: `${gift.id}-${i + 1}`,
    value,
    status: 'available',
  }))
}

export function giftStats(gift) {
  const quotas = normalizeQuotas(gift)
  const available = quotas.filter((q) => q.status === 'available').length
  const total = quotas.length
  const paid = quotas.filter((q) => q.status === 'paid').length

  return { quotas, available, total, paid }
}
