import React, { useEffect, useMemo, useState } from 'react'

/**
 * NumericInput
 * Controlled numeric input that avoids the leading-zero glitch when users clear the field and type again.
 * - Keeps a string value for the input while editing
 * - Parses to number using '.' or ',' on every change and emits via onValue(number)
 * - Percent mode: displays value as percentage 0-100 but emits fraction 0-1 when percent=true
 * - Optional min/max/step forwarded
 */
export default function NumericInput({
  value,
  onValue,
  percent = false,
  disabled = false,
  min,
  max,
  step = 'any',
  className = 'form-control',
  inputProps = {}
}) {
  // Derive display string from numeric value; allow empty while typing
  const initialDisplay = useMemo(() => {
    if (value === undefined || value === null) return ''
    const num = Number(value)
    if (Number.isNaN(num)) return ''
    return percent ? String((num * 100).toFixed(2)).replace(/\.?0+$/, '') : String(num)
  }, [value, percent])

  const [display, setDisplay] = useState(initialDisplay)

  // Keep display in sync if external value changes
  useEffect(() => {
    setDisplay(initialDisplay)
  }, [initialDisplay])

  const parseToNumber = (str) => {
    if (str === '' || str === '-' || str === ',' || str === '.') return NaN
    const normalized = str.replace(',', '.')
    const n = parseFloat(normalized)
    return Number.isNaN(n) ? NaN : n
  }

  return (
    <input
      type="text"
      inputMode="decimal"
      className={className}
      value={display}
      onChange={(e) => {
        const v = e.target.value
        // Accept empty and leading '-' while editing
        if (v === '' || v === '-' || v === ',' || v === '.') {
          setDisplay(v)
          // don't emit yet
          return
        }
        // Only allow valid numeric patterns
        const valid = /^-?\d*(?:[\.,]\d*)?$/.test(v)
        if (!valid) return
        setDisplay(v)
        const parsed = parseToNumber(v)
        if (!Number.isNaN(parsed)) {
          const numberToEmit = percent ? parsed / 100 : parsed
          onValue?.(numberToEmit)
        }
      }}
      onBlur={() => {
        // Normalize on blur
        const parsed = parseToNumber(display)
        if (Number.isNaN(parsed)) {
          // Revert to last good value
          setDisplay(initialDisplay)
        } else {
          const normalized = percent
            ? (parsed / 100)
            : parsed
          onValue?.(normalized)
          const show = percent ? (normalized * 100) : normalized
          setDisplay(String(show))
        }
      }}
      disabled={disabled}
      min={min}
      max={max}
      step={step}
      {...inputProps}
    />
  )
}
