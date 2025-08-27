import { parseDate } from './dateUtils'
import { parseCurrencyInput } from './currencyUtils'

export function validateBusinessRules(form) {
  // Validar fechas
  if (!form.fechaInicial || !form.fechaCorte || !form.fechaVencimiento) {
    return 'Todos los campos de fecha son obligatorios'
  }

  // Validar capital
  if (!form.capitalBase) {
    return 'El capital base es obligatorio'
  }

  const cap = parseCurrencyInput(form.capitalBase)
  if (cap <= 0) {
    return 'El capital debe ser mayor a 0'
  }

  // Validar tasa
  if (!form.tasaMensual) {
    return 'La tasa mensual es obligatoria'
  }

  const tasa = Number(form.tasaMensual)
  if (tasa <= 0 || tasa > 100) {
    return 'La tasa debe estar entre 0 y 100%'
  }

  // Validar fechas lógicas
  const start = parseDate(form.fechaInicial)
  const end = parseDate(form.fechaCorte)
  const venc = parseDate(form.fechaVencimiento)

  if (!start || !end || !venc) {
    return 'Formato de fecha inválido (dd/mm/aaaa)'
  }

  if (start >= end) {
    return 'La fecha de corte debe ser posterior a la fecha inicial'
  }

  if (end > venc) {
    return 'La fecha de corte no puede ser posterior a la fecha de vencimiento'
  }

  return null // Sin errores
}

export function validateFormFields(form) {
  const errors = {}

  if (!form.fechaInicial) errors.fechaInicial = 'Fecha inicial es requerida'
  if (!form.fechaCorte) errors.fechaCorte = 'Fecha de corte es requerida'
  if (!form.capitalBase) errors.capitalBase = 'Capital base es requerido'
  if (!form.tasaMensual) errors.tasaMensual = 'Tasa mensual es requerida'
  if (!form.fechaVencimiento) errors.fechaVencimiento = 'Fecha de vencimiento es requerida'

  return errors
}
