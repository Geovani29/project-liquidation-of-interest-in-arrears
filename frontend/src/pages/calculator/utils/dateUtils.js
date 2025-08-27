const DATE_FMT = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/

export function validateDate(value) {
  return DATE_FMT.test(value)
}

export function toIsoFromDisplay(display) {
  const m = DATE_FMT.exec(display || '')
  if (!m) return ''
  const [_, dd, mm, yyyy] = m
  const pad = (s) => s.toString().padStart(2, '0')
  return `${yyyy}-${pad(mm)}-${pad(dd)}`
}

export function fromIsoToDisplay(iso) {
  if (!iso) return ''
  const parts = iso.split('-')
  if (parts.length !== 3) return ''
  const [yyyy, mm, dd] = parts
  return `${dd}/${mm}/${yyyy}`
}

export function parseDate(dateString) {
  if (!dateString) return null
  const [dd, mm, yyyy] = dateString.split('/').map(Number)
  return new Date(yyyy, mm - 1, dd)
}

export function formatDateForDisplay(date) {
  if (!date) return ''
  const dd = date.getDate().toString().padStart(2, '0')
  const mm = (date.getMonth() + 1).toString().padStart(2, '0')
  const yyyy = date.getFullYear()
  return `${dd}/${mm}/${yyyy}`
}
