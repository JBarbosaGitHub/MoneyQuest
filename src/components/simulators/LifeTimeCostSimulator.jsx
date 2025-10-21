import React, { useMemo, useState } from 'react'
import NumericInput from '../common/NumericInput'

const defaultItems = [
  { name: 'Jantar a dois em restaurante', price: 200 },
  { name: 'Roupa nova', price: 150 },
  { name: 'Telemóvel novo', price: 2500 },
  { name: 'Viagem de férias', price: 5000 },
  { name: 'Carro novo (popular)', price: 85000 },
  { name: 'Casa própria', price: 400000 },
  { name: 'Bilhete de cinema', price: 30 },
  { name: 'Subscrição mensal de streaming', price: 45 },
  { name: 'Ténis de ginásio', price: 1000 },
  { name: 'Perfume', price: 490 }
]

const formatCurrency = (value) => Number(value || 0).toLocaleString('pt-PT', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
})

const formatHours = (hours) => {
  const wholeHours = Math.floor(hours)
  const minutes = Math.round((hours - wholeHours) * 60)
  return `${wholeHours}h ${minutes.toString().padStart(2, '0')}min`
}

const formatDays = (hours, dailyHours) => {
  const days = Math.floor(hours / dailyHours)
  const remainingHours = hours % dailyHours
  const wholeHours = Math.floor(remainingHours)
  const minutes = Math.round((remainingHours - wholeHours) * 60)
  return `${days}d ${wholeHours}h ${minutes.toString().padStart(2, '0')}min`
}

export default function LifeTimeCostSimulator() {
  const [inputs, setInputs] = useState({
    monthlySalary: 3000,
    monthlyHours: 220,
    dailyHours: 8
  })
  const [errors, setErrors] = useState({})
  const [results, setResults] = useState(null)

  const handleInputChange = (field, value) => {
    setInputs((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: null }))
  }

  const validateInputs = () => {
    const newErrors = {}
    const mHours = parseInt(inputs.monthlyHours)
    const dHours = parseInt(inputs.dailyHours)
    if ((parseFloat(inputs.monthlySalary) || 0) < 0) newErrors.monthlySalary = 'Salário deve ser positivo'
    if (!mHours || mHours <= 0) newErrors.monthlyHours = 'As horas por mês devem ser maiores que zero'
    if (!dHours || dHours <= 0) newErrors.dailyHours = 'As horas por dia devem ser maiores que zero'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const computed = useMemo(() => {
    if (!validateInputs()) return null
    const salary = parseFloat(inputs.monthlySalary) || 0
    const mHours = parseInt(inputs.monthlyHours) || 0
    const dHours = parseInt(inputs.dailyHours) || 0
    if (mHours <= 0 || dHours <= 0) return null

    const hourlyWage = salary / mHours
    const weeklyIncome = salary / 4.333
    const table = defaultItems.map((item) => {
      const hours = item.price / (hourlyWage || 1)
      return {
        name: item.name,
        price: item.price,
        hours: formatHours(hours),
        days: formatDays(hours, dHours)
      }
    })
    return { hourlyWage, weeklyIncome, table }
  }, [inputs])

  const onSubmit = (e) => {
    e.preventDefault()
    const ok = validateInputs()
    if (!ok) return
    setResults(computed)
  }

  return (
    <div className="simulator-box">
      <h2 className="simulator-title">Quanto Tempo de Vida Custa?</h2>

      <form className="simulator-form" onSubmit={onSubmit}>
        <div className="input-group mb-24">
          <label className="h-16 fw-500 black mb-8">Salário Líquido Mensal (€)</label>
          <NumericInput
            value={inputs.monthlySalary}
            onValue={(v) => handleInputChange('monthlySalary', v)}
            min={0}
          />
          {errors.monthlySalary && <small className="error-text">{errors.monthlySalary}</small>}
        </div>

        <div className="input-group mb-24">
          <label className="h-16 fw-500 black mb-8">Horas Trabalhadas por Mês</label>
          <NumericInput
            value={inputs.monthlyHours}
            onValue={(v) => handleInputChange('monthlyHours', v)}
            min={1}
          />
          {errors.monthlyHours && <small className="error-text">{errors.monthlyHours}</small>}
        </div>

        <div className="input-group mb-24">
          <label className="h-16 fw-500 black mb-8">Horas por Dia de Trabalho</label>
          <NumericInput
            value={inputs.dailyHours}
            onValue={(v) => handleInputChange('dailyHours', v)}
            min={1}
          />
          {errors.dailyHours && <small className="error-text">{errors.dailyHours}</small>}
        </div>

  <button type="submit" className="cus-btn" style={{width:'220px',maxWidth:'100%',margin:'0 auto',display:'block'}}>Calcular</button>
      </form>

      {results && (
        <div className="simulator-results" style={{ marginTop: 24 }}>
          <h3 className="h-21 fw-600 color-primary mb-16">Resultados</h3>
          <p className="h-14 mb-8">Valor da Hora Trabalhada: <b>€{formatCurrency(results.hourlyWage)}</b></p>
          <p className="h-14 mb-16">Rendimento Semanal: <b>€{formatCurrency(results.weeklyIncome)}</b></p>

          <div style={{ overflowX: 'auto' }}>
            <table className="simulator-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Preço (€)</th>
                  <th>Custo em Horas</th>
                  <th>Custo em Dias</th>
                </tr>
              </thead>
              <tbody>
                {results.table.map((row, idx) => (
                  <tr key={idx}>
                    <td>{row.name}</td>
                    <td>€{formatCurrency(row.price)}</td>
                    <td>{row.hours}</td>
                    <td>{row.days}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
