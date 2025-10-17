import React, { useEffect, useMemo, useState } from 'react'
import EuriborService from '../../services/EuriborService'
import EuriborStatus from '../EuriborStatus'
import NumericInput from '../common/NumericInput'

export default function EuriborSimulator() {
  const [loanAmount, setLoanAmount] = useState(150000)
  const [loanTerm, setLoanTerm] = useState(480)
  const [firstPayment, setFirstPayment] = useState('')
  const [euriborTerm, setEuriborTerm] = useState('12')
  const [customRate, setCustomRate] = useState(0)
  const [spread, setSpread] = useState(1.5)
  const [budget, setBudget] = useState(1000)
  const [result, setResult] = useState(null)
  const [euriborRates, setEuriborRates] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadEuriborRates()
  }, [])

  const loadEuriborRates = async () => {
    try {
      const rates = await EuriborService.getFormattedRates()
      setEuriborRates(rates)
      setLoading(false)
    } catch (error) {
      console.error('Erro ao carregar taxas Euribor:', error)
      setLoading(false)
    }
  }

  const handleRatesUpdate = () => {
    loadEuriborRates()
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    const amount = Number(loanAmount) || 0
    const term = Number(loanTerm) || 0
  const spreadValue = Number(spread) / 100 || 0
    const budgetValue = Number(budget) || 0

    let euriborRate

    if (euriborTerm === 'custom') {
      euriborRate = Number(customRate) / 100 || 0
    } else {
      const rates = {
        '3': (euriborRates['3m'] ? parseFloat(String(euriborRates['3m']).replace('%','')) : 1.971) / 100,
        '6': (euriborRates['6m'] ? parseFloat(String(euriborRates['6m']).replace('%','')) : 2.053) / 100,
        '12': (euriborRates['12m'] ? parseFloat(String(euriborRates['12m']).replace('%','')) : 2.068) / 100,
      }
      euriborRate = rates[euriborTerm] || 0
    }

    if (!euriborRate || isNaN(euriborRate)) {
      alert('Por favor, insira uma taxa Euribor válida.')
      return
    }

    const monthlyRate = (euriborRate + spreadValue) / 12
    const n = term
    const monthlyPayment = amount * (monthlyRate * Math.pow(1 + monthlyRate, n)) / (Math.pow(1 + monthlyRate, n) - 1)
    const budgetRatio = (monthlyPayment / budgetValue) * 100

    setResult({
      monthlyPayment: monthlyPayment.toFixed(2),
      budgetRatio: budgetRatio.toFixed(1),
      isHighRisk: budgetRatio > 30
    })
  }

  return (
    <div className="simulator-box">
      <h2 className="simulator-title">Simulador Euribor</h2>

      {loading ? (
        <div style={{ padding: '2rem', color: '#666' }}>
          <p>A carregar taxas Euribor atualizadas...</p>
        </div>
      ) : (
        <>
          <EuriborStatus onRatesUpdate={handleRatesUpdate} />

          <div style={{ 
            backgroundColor: '#f8f9fa', 
            padding: '1rem', 
            borderRadius: '8px', 
            marginBottom: '1.5rem',
            border: '1px solid #eac862'
          }}>
            <h4 style={{ color: '#8cb4bc', marginBottom: '0.5rem' }}>Taxas Atuais</h4>
            <div style={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: '1rem' }}>
              {['3m','6m','12m'].map((k) => (
                <div key={k} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#4b0082' }}>
                    {euriborRates[k]}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#666' }}>{k.replace('m',' meses')}</div>
                </div>
              ))}
            </div>
          </div>

          <form className="simulator-form" onSubmit={handleSubmit}>
            <div className="input-group mb-16">
              <label className="h-14 fw-400 black mb-4">Valor do Financiamento (€)</label>
              <NumericInput value={loanAmount} onValue={setLoanAmount} min={0} step={1000} />
            </div>

            <div className="input-group mb-16">
              <label className="h-14 fw-400 black mb-4">Prazo (meses)</label>
              <NumericInput value={loanTerm} onValue={setLoanTerm} min={12} max={600} step={12} />
            </div>

            <div className="input-group mb-16">
              <label className="h-14 fw-400 black mb-4">Mês da 1ª Prestação</label>
              <input type="text" className="form-control" placeholder="mm/aaaa" value={firstPayment} onChange={(e)=>setFirstPayment(e.target.value)} />
            </div>

            <div className="input-group mb-16">
              <label className="h-14 fw-400 black mb-4">Prazo da Euribor</label>
              <select className="form-control" value={euriborTerm} onChange={(e)=>setEuriborTerm(e.target.value)}>
                <option value="">Seleciona um prazo</option>
                <option value="3">3 meses ({euriborRates['3m']})</option>
                <option value="6">6 meses ({euriborRates['6m']})</option>
                <option value="12">12 meses ({euriborRates['12m']})</option>
                <option value="custom">Outra taxa</option>
              </select>
            </div>

            {euriborTerm === 'custom' && (
              <div className="input-group mb-16">
                <label className="h-14 fw-400 black mb-4">Taxa Euribor Personalizada (%)</label>
                <NumericInput value={customRate} onValue={setCustomRate} min={0} step={0.001} />
              </div>
            )}

            <div className="input-group mb-16">
              <label className="h-14 fw-400 black mb-4">Spread (%)</label>
              <NumericInput value={spread} onValue={(v)=>{ setSpread(v); EuriborService.setSpread(Number(v)); }} min={0} step={0.1} />
            </div>

            <div className="input-group mb-16">
              <label className="h-14 fw-400 black mb-4">Orçamento Familiar Mensal (€)</label>
              <NumericInput value={budget} onValue={setBudget} min={0} step={50} />
            </div>

            <div className="simulador-submit-row">
              <button
                type="submit"
                className="cus-btn"
                style={{ width: '220px', maxWidth: '100%', margin: '0 auto', display: 'block', transition: 'transform 0.15s ease' }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.02)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
              >
                Calcular
              </button>
            </div>
          </form>

          {result && (
            <div style={{ marginTop: 20, padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: 10, border: '2px solid #eac862' }}>
              <h3 className="h-21 fw-600" style={{ color: '#8cb4bc', marginBottom: '0.5rem' }}>Resultado da Simulação</h3>
              <p style={{ fontSize: '1.2rem', color: '#4b0082', fontWeight: 600, marginBottom: '0.5rem' }}>
                Prestação Mensal: €{result.monthlyPayment}
              </p>
              <p style={{ fontSize: '1rem', color: result.isHighRisk ? '#d32f2f' : '#2e7d32', fontWeight: 500 }}>
                {result.isHighRisk
                  ? `Atenção: A prestação representa ${result.budgetRatio}% do seu orçamento mensal, acima do recomendado (30%). Considere renegociar ou ajustar as condições do crédito.`
                  : `A prestação representa ${result.budgetRatio}% do seu orçamento mensal, dentro do limite recomendado (30%).`}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  )
}
