export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0
  }).format(amount || 0)
}

export const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

export const getCapitalFromFormData = (formData) => {
  try {
    const data = typeof formData === 'string' ? JSON.parse(formData) : formData
    const capital = data?.capitalBase?.replace(/[.,]/g, '')
    return parseInt(capital) || 0
  } catch {
    return 0
  }
}
