export function formatCurrency(n) {
  return new Intl.NumberFormat('es-CO', { 
    style: 'currency', 
    currency: 'COP', 
    maximumFractionDigits: 0 
  }).format(n || 0)
}

export function formatCurrencyInput(amount) {
  const digits = String(amount || '').replace(/[^0-9]/g, '')
  return digits ? new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 }).format(Number(digits)) : ''
}

export function parseCurrencyInput(value) {
  return Number(String(value || '').replace(/[^0-9]/g, ''))
}

export function formatCurrencyForDisplay(amount) {
  if (!amount) return ''
  return new Intl.NumberFormat('es-CO', { 
    style: 'currency', 
    currency: 'COP', 
    maximumFractionDigits: 0 
  }).format(amount)
}
