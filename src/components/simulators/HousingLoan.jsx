import React, { useEffect, useState } from 'react'
import EuriborService from '../../services/EuriborService'
import EuriborStatus from '../EuriborStatus'
import NumericInput from '../common/NumericInput'

export default function HousingLoan() {
  const [youth, setYouth] = useState('no')
  const [acquisitionValue, setAcquisitionValue] = useState(150000)
  const [loanValue, setLoanValue] = useState(120000)
  const [transfer, setTransfer] = useState('no')
  const [rateType, setRateType] = useState('variable')
  const [termYears, setTermYears] = useState(40)
  const [indexer, setIndexer] = useState('')
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

  const fixedBaseRates = {
    5: 2.5,
    10: 2.85,
    15: 3.0,
    20: 3.0,
    25: 3.1,
    30: 3.2,
    35: 3.3,
    40: 3.4
  }

  const mixedBaseRates = {
    5: 2.6,
    10: 2.85,
    15: 3.0,
    20: 3.0,
    25: 3.1,
    30: 3.2,
    35: 3.3,
    40: 3.4
  }

  const populateIndexer = (type) => {
    if (type === 'variable') {
      return Object.keys(euriborRates).map((key) => ({
        value: key,
        label: `Euribor ${key} (${(euriborRates[key])?.toFixed?.(3) ?? 'N/A'}%)`
      }))
    } else {
      const rates = type === 'fixed' ? fixedBaseRates : mixedBaseRates
      return Object.keys(rates).map((years) => ({
        value: years,
        label: `${years} anos (${rates[years]}%)`
      }))
    }
  }

  // Atualizar indexador quando o tipo de taxa ou as taxas Euribor mudam
  useEffect(() => {
    const options = populateIndexer(rateType)
    if (options.length > 0) {
      // Se o indexer atual não é válido, selecionar o primeiro
      if (!options.some((o) => String(o.value) === String(indexer))) {
        setIndexer(String(options[0].value))
      }
    } else {
      setIndexer('')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rateType, euriborRates])

  const handleSubmit = (e) => {
    e.preventDefault()

    const acquisition = Number(acquisitionValue) || 0
    const loan = Number(loanValue) || 0
    const youthValue = youth === 'yes'
    const term = Number(termYears) || 0
    const ltv = acquisition > 0 ? loan / acquisition : 0

    if (ltv > 1) {
      alert('O montante do empréstimo não pode exceder o valor da aquisição.')
      return
    }
    if (!youthValue && ltv > 0.9) {
      alert('Para rácios superiores a 90%, é necessária a Garantia Estatal para jovens.')
      return
    }

    let baseRate
    let baseDisplay
    if (rateType === 'variable') {
      baseRate = euriborRates[indexer] || 0
      baseDisplay = `Euribor ${indexer}: ${baseRate.toFixed(3)} %`
    } else {
      const table = rateType === 'fixed' ? fixedBaseRates : mixedBaseRates
      baseRate = table[indexer]
      baseDisplay = `Taxa base ${indexer} anos: ${baseRate.toFixed(3)} %`
    }

    const spread = 1.5
    const annualRate = baseRate + spread
    const monthlyRate = annualRate / 100 / 12
    const n = term * 12

    if (monthlyRate === 0) {
      alert('A taxa de juro não pode ser zero.')
      return
    }

    const payment = loan * (monthlyRate * Math.pow(1 + monthlyRate, n)) / (Math.pow(1 + monthlyRate, n) - 1)

    // Aproximação da TAEG baseada no tipo de taxa
    let taegDiff
    if (rateType === 'variable') taegDiff = 0.75
    else if (rateType === 'fixed') taegDiff = 0.8
    else taegDiff = 0.7
    const taeg = annualRate + taegDiff

    const mtic = payment * n

    setResult({
      payment: payment.toFixed(2),
      rateType: rateType.charAt(0).toUpperCase() + rateType.slice(1),
      baseDisplay,
      annualRate: annualRate.toFixed(3),
      taeg: taeg.toFixed(1),
      mtic: mtic.toFixed(2)
    })
  }

  const handleYouthChange = (value) => {
    setYouth(value)
    if (value === 'yes') {
      alert(`Condições para o Crédito Jovem\nAo selecionar esta oferta declaro que todos os proponentes:\n• Estão a simular aquisição de 1ª Habitação Própria Permanente\n• Têm domiciliação fiscal em Portugal\n• Têm idade igual ou inferior a 35 anos\n• Têm rendimentos até ao 8 escalão (inclusive) do IRS\n• Têm a situação tributária e contributiva regularizadas\n• Não são proprietários de prédio urbano habitacional\n• Nunca usufruiu(iram) da garantia pessoal do estado\n• Todos os adquirentes do imóvel serão mutuários do empréstimo.`)
    }
  }

  const handleRatesUpdate = () => loadEuriborRates()

  return (
    <div className="simulator-box">
      {loading ? (
        <div style={{ padding: '2rem', color: '#666' }}>
          <p>A carregar taxas Euribor atualizadas...</p>
        </div>
      ) : (
        <>
          <EuriborStatus onRatesUpdate={handleRatesUpdate} />

          <h2 className="simulator-title">Simulador de Crédito à Habitação</h2>

          <form className="simulator-form" onSubmit={handleSubmit}>
            <div className="input-group mb-16">
              <label className="h-14 fw-400 black mb-4">Possui menos de 36 anos e deseja simular com Garantia Estatal?</label>
              <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="radio"
                    name="youth"
                    value="no"
                    checked={youth === 'no'}
                    onChange={(e) => handleYouthChange(e.target.value)}
                  />
                  Não
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="radio"
                    name="youth"
                    value="yes"
                    checked={youth === 'yes'}
                    onChange={(e) => handleYouthChange(e.target.value)}
                  />
                  Sim
                </label>
              </div>
            </div>

            <div className="input-group mb-16">
              <label className="h-14 fw-400 black mb-4">Valor da Compra do Imóvel (€)</label>
              <NumericInput value={acquisitionValue} onValue={setAcquisitionValue} min={0} step={1000} className="form-control" />
            </div>

            <div className="input-group mb-16">
              <label className="h-14 fw-400 black mb-4">Montante do Empréstimo (€)</label>
              <NumericInput value={loanValue} onValue={setLoanValue} min={0} step={1000} className="form-control" />
            </div>

            <div className="input-group mb-16">
              <label className="h-14 fw-400 black mb-4">Transferência de outro banco?</label>
              <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="radio"
                    name="transfer"
                    value="no"
                    checked={transfer === 'no'}
                    onChange={(e) => setTransfer(e.target.value)}
                  />
                  Não
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="radio"
                    name="transfer"
                    value="yes"
                    checked={transfer === 'yes'}
                    onChange={(e) => setTransfer(e.target.value)}
                  />
                  Sim
                </label>
              </div>
            </div>

            <div className="input-group mb-16">
              <label className="h-14 fw-400 black mb-4">Tipo de Taxa de Juro</label>
              <select value={rateType} onChange={(e) => setRateType(e.target.value)} className="form-control">
                <option value="variable">Taxa Variável</option>
                <option value="fixed">Taxa Fixa</option>
                <option value="mixed">Taxa Mista</option>
              </select>
            </div>

            <div className="input-group mb-16">
              <label className="h-14 fw-400 black mb-4">Prazo Total (anos)</label>
              <NumericInput value={termYears} onValue={setTermYears} min={1} max={40} step={1} className="form-control" />
            </div>

            <div className="input-group mb-16">
              <label className="h-14 fw-400 black mb-4">Indexante</label>
              <select value={indexer} onChange={(e) => setIndexer(e.target.value)} className="form-control">
                {populateIndexer(rateType).map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
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
              <h3 className="h-21 fw-600" style={{ color: '#8cb4bc', marginBottom: '0.5rem' }}>Opções Disponíveis</h3>
              <div style={{ textAlign: 'left', fontSize: '0.95rem', color: '#666' }}>
                <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Prestação Base</p>
                <p style={{ fontSize: '1.3rem', color: '#4b0082', fontWeight: 700, marginBottom: '0.5rem' }}>
                  {Number(result.payment).toLocaleString('pt-PT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                </p>
                <p style={{ fontSize: '0.9rem', color: '#888', marginBottom: '0.5rem' }}>sem produtos de venda cruzada</p>
                <p><strong>Tipo taxa:</strong> {result.rateType}</p>
                <p><strong>{result.baseDisplay}</strong></p>
                <p><strong>Spread Base:</strong> {(1.5).toLocaleString('pt-PT', { minimumFractionDigits: 3, maximumFractionDigits: 3 })} %</p>
                <p><strong>TAN:</strong> {result.annualRate} %</p>
                <p><strong>TAEG:</strong> {result.taeg} %</p>
                <p><strong>MTIC:</strong> {Number(result.mtic).toLocaleString('pt-PT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €</p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
