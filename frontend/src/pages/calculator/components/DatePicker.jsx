import { memo } from 'react'
import { toIsoFromDisplay, fromIsoToDisplay } from '../utils'

export const DatePicker = memo(({ valueDisplay, onChange, className, disabled }) => {
  const empty = !valueDisplay
  
  const handleFocus = (e) => {
    e.target.type = 'date'
    e.target.value = toIsoFromDisplay(valueDisplay)
  }
  
  const handleBlur = (e) => {
    if (!e.target.value) {
      e.target.type = 'text'
      e.target.value = ''
    }
  }
  
  const handleChange = (e) => {
    onChange(fromIsoToDisplay(e.target.value))
  }

  return (
    <input
      type={empty ? 'text' : 'date'}
      placeholder={empty ? 'dd/mm/aaaa' : undefined}
      value={empty ? '' : toIsoFromDisplay(valueDisplay)}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onChange={handleChange}
      className={className}
      disabled={disabled}
    />
  )
})
