import React, { useState } from 'react'
import NumericInput from '../common/NumericInput'

export default function FinancialIndependence() {
  // Acumulação
  const [initialInvestment, setInitialInvestment] = useState(10000)
  const [investmentYears, setInvestmentYears] = useState(35)
  const [monthlyContribution, setMonthlyContribution] = useState(400)
  const [annualReturn, setAnnualReturn] = useState(0.08) // percent mode emits fraction
  // Rendimento
  const [retirementYears, setRetirementYears] = useState(30)
  const [retirementReturn, setRetirementReturn] = useState(0.01) // monthly percent as fraction
  // Resultado
  const [result, setResult] = useState(null)

  const handleSubmit = (e) => {
    e.preventDefault()
    // Fase de acumulação
    const initial = Number(initialInvestment) || 0
    const years = Number(investmentYears) || 0
    const monthly = Number(monthlyContribution) || 0
    const annual = Number(annualReturn) || 0 // already fraction (e.g., 0.08)
    // Fase de rendimento
    const retYears = Number(retirementYears) || 0
    const retReturn = Number(retirementReturn) || 0 // monthly fraction (e.g., 0.01)

    const monthlyReturn = Math.pow(1 + annual, 1 / 12) - 1
    const nAccumulation = years * 12
    const futureValueInitial = initial * Math.pow(1 + monthlyReturn, nAccumulation)
    const futureValueContributions = monthly * (Math.pow(1 + monthlyReturn, nAccumulation) - 1) / monthlyReturn
    const accumulatedWealth = futureValueInitial + futureValueContributions

    let withdrawalText = ''
    if (retYears === 0) {
      const withdrawal = accumulatedWealth * retReturn
      withdrawalText = `Poderá retirar €${withdrawal.toFixed(2)} por mês indefinidamente.`
    } else {
      const nRetirement = retYears * 12
      const withdrawal = (accumulatedWealth * retReturn) / (1 - Math.pow(1 + retReturn, -nRetirement))
      withdrawalText = `Poderá retirar €${withdrawal.toFixed(2)} por mês durante ${nRetirement} meses (${retYears} anos).`
    }

    setResult({
      accumulatedWealth: accumulatedWealth.toFixed(2),
      withdrawalText,
    })
  }

  return (
    <div className="simulator-box">
      <h2 className="simulator-title">Simulador de Independência Financeira</h2>
      <form className="simulator-form" onSubmit={handleSubmit}>
        <div className="input-group mb-16">
          <label className="h-14 fw-400 black mb-4">Capital inicial disponível (€)</label>
          <NumericInput className="form-control" value={initialInvestment} onValue={setInitialInvestment} min={0} step={100} />
        </div>
        <div className="input-group mb-16">
          <label className="h-14 fw-400 black mb-4">Período de investimento (anos)</label>
          <NumericInput className="form-control" value={investmentYears} onValue={setInvestmentYears} min={0} step={1} />
        </div>
        <div className="input-group mb-16">
          <label className="h-14 fw-400 black mb-4">Contribuição mensal (€)</label>
          <NumericInput className="form-control" value={monthlyContribution} onValue={setMonthlyContribution} min={0} step={10} />
        </div>
        <div className="input-group mb-16">
          <label className="h-14 fw-400 black mb-4">Rentabilidade anual (%)</label>
          <NumericInput className="form-control" value={annualReturn} onValue={setAnnualReturn} percent min={0} step={0.01} />
        </div>
        <div className="input-group mb-16">
          <label className="h-14 fw-400 black mb-4">Período de retirada (anos, 0 para indefinido)</label>
          <NumericInput className="form-control" value={retirementYears} onValue={setRetirementYears} min={0} step={1} />
        </div>
        <div className="input-group mb-16">
          <label className="h-14 fw-400 black mb-4">Rentabilidade mensal na reforma (%)</label>
          <NumericInput className="form-control" value={retirementReturn} onValue={setRetirementReturn} percent min={0} step={0.01} />
        </div>
        <div className="simulador-submit-row">
          <button type="submit" className="cus-btn" style={{ width: '220px', maxWidth: '100%', margin: '0 auto', display: 'block' }}>
            Calcular
          </button>
        </div>
      </form>
      {result && (
        <div style={{ marginTop: 24, background: '#f8f9fa', borderRadius: 12, padding: 18, display: 'inline-block' }}>
          <p className="h-16 fw-600" style={{ color: '#8cb4bc' }}>Fase de Acumulação</p>
          <p>Património acumulado: €{Number(result.accumulatedWealth).toLocaleString('pt-PT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          <p className="h-16 fw-600" style={{ color: '#eac862', marginTop: 12 }}>Fase de Rendimento</p>
          <p>{result.withdrawalText}</p>
        </div>
      )}
    </div>
  )
}
