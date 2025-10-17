import React, { useEffect, useState } from 'react'
import EuriborService from '../../services/EuriborService'
import EuriborStatus from '../EuriborStatus'
import NumericInput from '../common/NumericInput'

export default function MaxHouseValue() {
  const [exemption, setExemption] = useState('no')
  const [downPayment, setDownPayment] = useState(30000)
  const [income, setIncome] = useState(1000)
  const [expenses, setExpenses] = useState(300)
  const [birthDate, setBirthDate] = useState('')
  const [spread, setSpread] = useState(1.5)
  const [result, setResult] = useState(null)
  const [euriborRates, setEuriborRates] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadEuriborRates()
  }, [])

  const loadEuriborRates = async () => {
    try {
      const rates = await EuriborService.getCurrentEuriborRates()
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

    const downPaymentValue = Number(downPayment) || 0
    const incomeValue = Number(income) || 0
    const expensesValue = Number(expenses) || 0
    const spreadValue = Number(spread) / 100 || 0

    if (expensesValue >= incomeValue) {
      alert('As despesas não podem ser iguais ou superiores aos rendimentos.')
      return
    }

    // Data de referência para cálculo de idade
    const [day, month, year] = String(birthDate).split('/')
      .map((v) => Number(v))
    if (!day || !month || !year) {
      alert('Por favor, insira uma data de nascimento válida (dd/mm/aaaa).')
      return
    }

    const currentDate = new Date(2025, 6, 30) // 30/07/2025 (mês 6 indexado a 0)
    const birthDateObj = new Date(year, month - 1, day)
    let age = currentDate.getFullYear() - birthDateObj.getFullYear()
    if (
      currentDate.getMonth() < birthDateObj.getMonth() ||
      (currentDate.getMonth() === birthDateObj.getMonth() &&
        currentDate.getDate() < birthDateObj.getDate())
    ) {
      age--
    }

    // Prazo máximo em anos de acordo com idade
    let maxTermYears
    if (age <= 30) maxTermYears = 40
    else if (age <= 35) maxTermYears = 37
    else maxTermYears = 35
    const n = maxTermYears * 12

    const disposable = incomeValue - expensesValue
    const maxMonthlyPayment = disposable * 0.35 // 35% DSTI

    // Euribor 12m + spread como taxa anual (em fração)
    const euriborPct = (euriborRates['12m'] ?? 2.068) / 100
    const annualRate = euriborPct + spreadValue
    const monthlyRate = annualRate / 12

    if (monthlyRate === 0) {
      alert('A taxa de juro não pode ser zero.')
      return
    }

    // Empréstimo máximo por taxa de esforço
    const pow = Math.pow(1 + monthlyRate, -n)
    const maxLoanAfford = maxMonthlyPayment * (1 - pow) / monthlyRate

    // Empréstimo máximo por LTV (90%) => entrada mínima 10%
    const maxLoanLTV = 9 * downPaymentValue

    // Empréstimo máximo
    const maxLoan = Math.min(maxLoanAfford, maxLoanLTV)

    // Preço máximo da casa
    const maxHousePrice = maxLoan + downPaymentValue

    setResult({
      maxHousePrice: maxHousePrice.toFixed(2),
      maxLoan: maxLoan.toFixed(2),
      maxMonthlyPayment: maxMonthlyPayment.toFixed(2),
      maxTermYears,
      annualRate: (annualRate * 100).toFixed(3),
      euriborRate: (euriborPct * 100).toFixed(3),
      spreadRate: (spreadValue * 100).toFixed(1),
    })
  }

  return (
    <div className="simulator-box">
      {loading ? (
        <div style={{ padding: '2rem', color: '#666' }}>
          <p>A carregar taxas Euribor atualizadas...</p>
        </div>
      ) : (
        <>
          <EuriborStatus onRatesUpdate={handleRatesUpdate} />

          <h2 className="simulator-title">Valor Máximo da Casa</h2>

          <div style={{ backgroundColor: '#f8f9fa', padding: '1rem', borderRadius: 8, marginBottom: '1.5rem', border: '1px solid #eac862' }}>
            <h4 style={{ color: '#8cb4bc', marginBottom: '0.5rem' }}>Taxas Utilizadas no Cálculo</h4>
            <div style={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#4b0082' }}>
                  {(euriborRates['12m'] ?? 2.068).toFixed?.(3) || (2.068).toFixed(3)}%
                </div>
                <div style={{ fontSize: '0.8rem', color: '#666' }}>Euribor 12m</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#4b0082' }}>
                  {Number(spread).toLocaleString('pt-PT', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%
                </div>
                <div style={{ fontSize: '0.8rem', color: '#666' }}>Spread</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#4b0082' }}>
                  {(((euriborRates['12m'] ?? 2.068) + Number(spread)) || 0).toFixed(3)}%
                </div>
                <div style={{ fontSize: '0.8rem', color: '#666' }}>Taxa Total</div>
              </div>
            </div>
          </div>

          <form className="simulator-form" onSubmit={handleSubmit}>
            <div className="input-group mb-16">
              <label className="h-14 fw-400 black mb-4">Cumpres os requisitos para a isenção de IMT e IS para jovens?</label>
              <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input type="radio" name="exemption" value="no" checked={exemption === 'no'} onChange={(e) => setExemption(e.target.value)} />
                  Não
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input type="radio" name="exemption" value="yes" checked={exemption === 'yes'} onChange={(e) => setExemption(e.target.value)} />
                  Sim
                </label>
              </div>
            </div>

            <div className="input-group mb-16">
              <label className="h-14 fw-400 black mb-4">Entrada disponível (€)</label>
              <NumericInput value={downPayment} onValue={setDownPayment} min={0} step={500} className="form-control" />
            </div>

            <div className="input-group mb-16">
              <label className="h-14 fw-400 black mb-4">Rendimentos mensais (€)</label>
              <NumericInput value={income} onValue={setIncome} min={0} step={50} className="form-control" />
            </div>

            <div className="input-group mb-16">
              <label className="h-14 fw-400 black mb-4">Despesas mensais (€)</label>
              <NumericInput value={expenses} onValue={setExpenses} min={0} step={50} className="form-control" />
            </div>

            <div className="input-group mb-16">
              <label className="h-14 fw-400 black mb-4">Data de nascimento do titular mais velho</label>
              <input type="text" className="form-control" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} placeholder="dd/mm/aaaa" />
            </div>

            <div className="input-group mb-16">
              <label className="h-14 fw-400 black mb-4">Spread (%)</label>
              <NumericInput value={spread} onValue={setSpread} min={0} step={0.1} className="form-control" />
            </div>

            <div className="simulador-submit-row">
              <button type="submit" className="cus-btn" style={{ width: '220px', maxWidth: '100%', margin: '0 auto', display: 'block', transition: 'transform 0.15s ease' }}
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
                Valor máximo da casa: €{Number(result.maxHousePrice).toLocaleString('pt-PT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <div style={{ fontSize: '0.95rem', color: '#666', textAlign: 'left', marginTop: '10px' }}>
                <p><strong>Detalhes:</strong></p>
                <p>• Empréstimo máximo: €{Number(result.maxLoan).toLocaleString('pt-PT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                <p>• Prestação mensal máxima: €{Number(result.maxMonthlyPayment).toLocaleString('pt-PT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                <p>• Prazo máximo: {result.maxTermYears} anos</p>
                <p>• Euribor 12m utilizada: {result.euriborRate}%</p>
                <p>• Spread aplicado: {result.spreadRate}%</p>
                <p>• Taxa total: {result.annualRate}%</p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
