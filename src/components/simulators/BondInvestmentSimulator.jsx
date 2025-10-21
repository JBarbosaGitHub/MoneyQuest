import React, { useState, useMemo } from 'react'
import NumericInput from '../common/NumericInput'
import { useRequireAuth } from '../../hooks/useRequireAuth'

// Calculate Modified Duration (simplified Macaulay duration approximation)
function calculateModifiedDuration(principal, couponRate, maturity, ytm, frequency) {
  const couponPayment = (principal * couponRate) / frequency
  const periods = maturity * frequency
  const yieldPerPeriod = ytm / frequency
  let weightedTime = 0
  let presentValue = 0
  for (let t = 1; t <= periods; t++) {
    const cashFlow = t === periods ? couponPayment + principal : couponPayment
    const pv = cashFlow / Math.pow(1 + yieldPerPeriod, t)
    weightedTime += (t / frequency) * pv
    presentValue += pv
  }
  const macaulayDuration = weightedTime / presentValue
  return macaulayDuration / (1 + yieldPerPeriod) // Modified duration
}

export default function BondInvestmentSimulator({ onOpenLogin }) {
  const { requireAuth, isAuthenticated } = useRequireAuth(onOpenLogin)
  const [inputs, setInputs] = useState({
    montanteInvestido: 10000,
    taxaCupaoAnual: 0.03,
    maturidadeAnos: 10,
    taxaDescontoMercado: 0.04,
    taxaInflacaoAnual: 0.024,
    taxaImpostoGanhos: 0.28,
    frequenciaPagamentos: 2, // 2 for semi-annual, 1 for annual
    precoMercado: 0 // Optional: if buying existing bond at market price
  })

  const [errors, setErrors] = useState({})

  // Function to format percentage values without unnecessary decimal zeros
  const formatPercentage = (value) => {
    return Number(value).toLocaleString('pt-PT', {
      minimumFractionDigits: 0, 
      maximumFractionDigits: 2
    });
  }

  const handleInputChange = (field, value) => {
    const numValue = parseFloat(value) || 0
    setInputs(prev => ({ ...prev, [field]: numValue }))
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }))
    }
  }

  const validateInputs = () => {
    const newErrors = {}
    const { montanteInvestido, maturidadeAnos } = inputs
    if (montanteInvestido <= 0) {
      newErrors.montanteInvestido = "Montante deve ser positivo"
    }
    if (maturidadeAnos <= 0) {
      newErrors.maturidadeAnos = "Maturidade deve ser positiva"
    }
    if (maturidadeAnos > 50) {
      newErrors.maturidadeAnos = "Maturidade muito longa (máx. 50 anos)"
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const bondAnalysis = useMemo(() => {
    if (!validateInputs()) return null
    const {
      montanteInvestido,
      taxaCupaoAnual,
      maturidadeAnos,
      taxaDescontoMercado,
      taxaInflacaoAnual,
      taxaImpostoGanhos,
      frequenciaPagamentos,
      precoMercado
    } = inputs
    const periodos = maturidadeAnos * frequenciaPagamentos
    const cupaoPeriodicoNominal = (montanteInvestido * taxaCupaoAnual) / frequenciaPagamentos
    const taxaDescontoPeriodica = taxaDescontoMercado / frequenciaPagamentos
    const taxaInflacaoPeriodica = taxaInflacaoAnual / frequenciaPagamentos
    // Calculate present value (theoretical bond price)
    let valorPresente = 0
    // Present value of coupon payments
    for (let p = 1; p <= periodos; p++) {
      valorPresente += cupaoPeriodicoNominal / Math.pow(1 + taxaDescontoPeriodica, p)
    }
    // Present value of principal repayment
    valorPresente += montanteInvestido / Math.pow(1 + taxaDescontoPeriodica, periodos)
    // Determine actual purchase price
    const precoCompra = precoMercado > 0 ? precoMercado : valorPresente
    // Calculate Yield to Maturity (YTM) using approximation method
    const cupaoAnualTotal = taxaCupaoAnual * montanteInvestido
    const ganhoCapital = (montanteInvestido - precoCompra) / maturidadeAnos
    const ytmAproximado = (cupaoAnualTotal + ganhoCapital) / ((montanteInvestido + precoCompra) / 2)
    // Detailed cash flow analysis
    const fluxosCaixa = []
    let valorAcumulado = 0
    let jurosTotais = 0
    for (let p = 1; p <= periodos; p++) {
      const ano = Math.ceil(p / frequenciaPagamentos)
      const periodo = p % frequenciaPagamentos === 0 ? frequenciaPagamentos : p % frequenciaPagamentos
      // Coupon payment adjusted for reinvestment
      const cupaoReal = cupaoPeriodicoNominal
      valorAcumulado += cupaoReal
      jurosTotais += cupaoReal
      // Compound interest on reinvestment (assuming coupons reinvested at YTM)
      if (p < periodos) {
        const periodosRestantes = periodos - p
        const valorFuturo = cupaoReal * Math.pow(1 + (ytmAproximado / frequenciaPagamentos), periodosRestantes)
        valorAcumulado += (valorFuturo - cupaoReal)
      }
      fluxosCaixa.push({
        periodo: p,
        ano,
        subperiodo: periodo,
        cupao: Math.round(cupaoReal * 100) / 100,
        valorAcumulado: Math.round(valorAcumulado * 100) / 100
      })
    }
    // Add principal repayment at maturity
    valorAcumulado += montanteInvestido
    const valorFinalBruto = valorAcumulado
    // Calculate taxes
    const ganhosCapitais = Math.max(0, montanteInvestido - precoCompra)
    const ganhosJuros = jurosTotais + (valorAcumulado - montanteInvestido - jurosTotais) // Reinvestment gains
    const impostoTotal = (ganhosCapitais + ganhosJuros) * taxaImpostoGanhos
    const valorFinalLiquido = valorFinalBruto - impostoTotal
    // Inflation adjustment
    const inflacaoTotal = Math.pow(1 + taxaInflacaoAnual, maturidadeAnos)
    const valorAjustadoInflacao = valorFinalLiquido / inflacaoTotal
    const poderCompraReal = valorAjustadoInflacao
    // Performance metrics
    const retornoTotalNominal = ((valorFinalLiquido - precoCompra) / precoCompra) * 100
    const retornoAnualNominal = Math.pow(valorFinalLiquido / precoCompra, 1/maturidadeAnos) - 1
    const retornoAnualReal = Math.pow(poderCompraReal / precoCompra, 1/maturidadeAnos) - 1
    // Bond characteristics
    const premioDesconto = ((valorPresente - precoCompra) / precoCompra) * 100
    const currentYield = (cupaoAnualTotal / precoCompra) * 100
    const duration = calculateModifiedDuration(montanteInvestido, taxaCupaoAnual, maturidadeAnos, ytmAproximado, frequenciaPagamentos)
    // Risk analysis
    let riscoClassificacao = "Baixo"
    let riscoDescricao = "Obrigação estável com risco de crédito mínimo"
    if (maturidadeAnos > 10) {
      riscoClassificacao = "Médio"
      riscoDescricao = "Risco de taxa de juro moderado devido à maturidade longa"
    }
    if (taxaCupaoAnual > 0.08) {
      riscoClassificacao = "Alto"
      riscoDescricao = "Taxa elevada indica maior risco de crédito"
    }
    // Enhanced suggestions
    let sugestao
    if (ytmAproximado * 100 < taxaInflacaoAnual * 100) {
      sugestao = `YTM (${(ytmAproximado * 100).toFixed(2)}%) inferior à inflação. Considere obrigações indexadas (OTRV) ou diversificação.`
    } else if (retornoAnualReal * 100 < 1) {
      sugestao = `Retorno real baixo (${(retornoAnualReal * 100).toFixed(2)}%). Avalie alternativas com maior proteção inflacionária.`
    } else {
      sugestao = `Investimento conservador adequado. Retorno real de ${(retornoAnualReal * 100).toFixed(2)}% oferece proteção do capital.`
    }
    return {
      // Bond Valuation
      valorPresente: Math.round(valorPresente * 100) / 100,
      precoCompra: Math.round(precoCompra * 100) / 100,
      premioDesconto: Math.round(premioDesconto * 100) / 100,
      // Yields
      ytmAproximado: Math.round(ytmAproximado * 10000) / 100,
      currentYield: Math.round(currentYield * 100) / 100,
      // Returns
      valorFinalBruto: Math.round(valorFinalBruto * 100) / 100,
      valorFinalLiquido: Math.round(valorFinalLiquido * 100) / 100,
      poderCompraReal: Math.round(poderCompraReal * 100) / 100,
      retornoTotalNominal: Math.round(retornoTotalNominal * 100) / 100,
      retornoAnualNominal: Math.round(retornoAnualNominal * 10000) / 100,
      retornoAnualReal: Math.round(retornoAnualReal * 10000) / 100,
      // Taxes and Costs
      impostoTotal: Math.round(impostoTotal * 100) / 100,
      jurosTotais: Math.round(jurosTotais * 100) / 100,
      // Risk Metrics
      duration: Math.round(duration * 100) / 100,
      riscoClassificacao,
      riscoDescricao,
      // Cash Flows
      fluxosCaixa,
      periodos,
      // Analysis
      sugestao
    }
  }, [inputs])

  const exportToCSVAction = () => {
    if (!bondAnalysis) return
    
    const csvContent = [
      ['Período', 'Ano', 'Sub-período', 'Cupão', 'Valor Acumulado'],
      ...bondAnalysis.fluxosCaixa.map(row => [
        row.periodo, row.ano, row.subperiodo, row.cupao, row.valorAcumulado
      ])
    ].map(row => row.join(',')).join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'obrigacoes_fluxos.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const exportToCSV = requireAuth(exportToCSVAction)

  const getYieldColor = (yield_val, inflation) => {
    const realYield = yield_val - inflation * 100
    if (realYield > 2) return '#28a745'
    if (realYield > 0) return '#ffc107'
    return '#dc3545'
  }

  const getRiskColor = (risco) => {
    switch(risco.toLowerCase()) {
      case 'baixo': return '#28a745'
      case 'médio': case 'medio': return '#ffc107'
      case 'alto': return '#dc3545'
      default: return '#6c757d'
    }
  }

  return (
    <div className="bond-investment-simulator">
      <div className="container-fluid">
        <div className="heading mb-48">
          <h2 className="black mb-24">
            <span className="banner-text" title="SIMULADOR DE OBRIGAÇÕES">SIMULADOR DE OBRIGAÇÕES</span>
          </h2>
          <p className="h-16 body-text dark-gray">
            Analise investimentos em obrigações com cálculos de YTM, duração e retornos ajustados
          </p>
        </div>

        <div className="row">
          {/* Input Form */}
          <div className="col-xl-6 col-lg-6">
            <div className="simulator-inputs">
              <h4 className="h-28 fw-700 black mb-24">Características da Obrigação</h4>
              
              {Object.keys(errors).length > 0 && (
                <div className="alert alert-danger mb-16" style={{color: '#d63384', background: '#f8d7da', padding: '12px', borderRadius: '8px'}}>
                  {Object.values(errors).join(', ')}
                </div>
              )}

              <div className="bond-basics mb-32" style={{background: '#f8f9fa', padding: '16px', borderRadius: '8px'}}>
                <h5 className="h-21 fw-600 black mb-16">Dados Básicos</h5>
                
                <div className="input-group mb-16">
                  <label className="h-14 fw-500 black mb-4">Valor Nominal / Montante Investido (€)</label>
                  <NumericInput
                    value={inputs.montanteInvestido}
                    onValue={(v) => handleInputChange('montanteInvestido', v)}
                    min={100}
                    step={100}
                  />
                </div>

                <div className="input-group mb-16">
                  <label className="h-14 fw-500 black mb-4">Taxa de Cupão Anual (%)</label>
                  <NumericInput
                    value={inputs.taxaCupaoAnual}
                    percent
                    onValue={(v) => handleInputChange('taxaCupaoAnual', v)}
                    min={0}
                    max={15}
                    step={0.1}
                  />
                  <small className="h-12 fw-400 dark-gray mt-4">Taxa de juro da obrigação</small>
                </div>

                <div className="input-group mb-16">
                  <label className="h-14 fw-500 black mb-4">Maturidade (Anos)</label>
                  <NumericInput
                    value={inputs.maturidadeAnos}
                    onValue={(v) => handleInputChange('maturidadeAnos', v)}
                    min={1}
                    max={50}
                    step={1}
                  />
                </div>

                <div className="input-group mb-16">
                  <label className="h-14 fw-500 black mb-4">Frequência de Pagamentos</label>
                  <select
                    className="form-control"
                    value={inputs.frequenciaPagamentos}
                    onChange={(e) => handleInputChange('frequenciaPagamentos', e.target.value)}
                  >
                    <option value={1}>Anual</option>
                    <option value={2}>Semestral</option>
                    <option value={4}>Trimestral</option>
                  </select>
                </div>
              </div>

              <div className="market-data mb-32">
                <h5 className="h-21 fw-600 black mb-16">Dados de Mercado</h5>
                
                <div className="input-group mb-16">
                  <label className="h-14 fw-500 black mb-4">Taxa de Desconto de Mercado (%)</label>
                  <NumericInput
                    value={inputs.taxaDescontoMercado}
                    percent
                    onValue={(v) => handleInputChange('taxaDescontoMercado', v)}
                    min={0}
                    max={20}
                    step={0.1}
                  />
                  <small className="h-12 fw-400 dark-gray mt-4">Taxa de juro de mercado para desconto</small>
                </div>

                <div className="input-group mb-16">
                  <label className="h-14 fw-500 black mb-4">Preço de Compra (€) - Opcional</label>
                  <input
                    type="number"
                    className="form-control"
                    value={inputs.precoMercado}
                    onChange={(e) => handleInputChange('precoMercado', e.target.value)}
                    min="0"
                    step="10"
                    placeholder="Deixar vazio para usar valor teórico"
                  />
                  <small className="h-12 fw-400 dark-gray mt-4">Se comprar no mercado secundário</small>
                </div>
              </div>

              <div className="economic-factors">
                <h5 className="h-21 fw-600 black mb-16">Fatores Económicos</h5>
                
                <div className="input-group mb-16">
                  <label className="h-14 fw-400 black mb-4">Taxa de Inflação Anual (%)</label>
                  <input
                    type="number"
                    className="form-control"
                    value={Number((inputs.taxaInflacaoAnual * 100).toFixed(2))}
                    onChange={(e) => handleInputChange('taxaInflacaoAnual', e.target.value / 100)}
                    min="0"
                    max="10"
                    step="0.1"
                  />
                </div>

                <div className="input-group mb-16">
                  <label className="h-14 fw-400 black mb-4">Taxa de Imposto sobre Ganhos (%)</label>
                  <input
                    type="number"
                    className="form-control"
                    value={Number((inputs.taxaImpostoGanhos * 100).toFixed(2))}
                    onChange={(e) => handleInputChange('taxaImpostoGanhos', e.target.value / 100)}
                    min="0"
                    max="50"
                    step="0.1"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="col-xl-6 col-lg-6">
            {bondAnalysis && (
              <div className="simulator-results">
                <div className="results-header" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px'}}>
                  <h4 className="h-28 fw-700 black">Análise da Obrigação</h4>
                  <button 
                    className="cus-btn"
                    onClick={exportToCSV}
                    style={{
                      padding: '8px 16px', 
                      fontSize: '14px',
                      opacity: isAuthenticated ? 1 : 0.7,
                      cursor: isAuthenticated ? 'pointer' : 'help'
                    }}
                    title={isAuthenticated ? 'Exportar para CSV' : '🔒 Faça login para exportar'}
                  >
                    {isAuthenticated ? '📊 Exportar CSV' : '🔒 Exportar CSV'}
                  </button>
                </div>

                {!isAuthenticated && (
                  <div style={{
                    padding: '12px',
                    background: '#fff3cd',
                    border: '1px solid #ffc107',
                    borderRadius: '8px',
                    marginBottom: '16px',
                    fontSize: '14px',
                    color: '#856404'
                  }}>
                    💡 <strong>Dica:</strong> Faça login para exportar os seus resultados em CSV
                  </div>
                )}

                {/* Bond Valuation */}
                <div className="bond-valuation mb-32">
                  <h5 className="h-21 fw-600 black mb-16">Avaliação da Obrigação</h5>
                  
                  <div className="row">
                    <div className="col-6">
                      <div className="valuation-card mb-16" style={{background: '#e7f3ff', padding: '16px', borderRadius: '8px'}}>
                        <h6 className="h-14 fw-600 black mb-4">Valor Presente Teórico</h6>
                        <p className="h-20 fw-700 color-primary">{bondAnalysis.valorPresente.toLocaleString()}€</p>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="valuation-card mb-16" style={{background: '#f8f9fa', padding: '16px', borderRadius: '8px'}}>
                        <h6 className="h-14 fw-600 black mb-4">Preço de Compra</h6>
                        <p className="h-20 fw-700 black">{bondAnalysis.precoCompra.toLocaleString()}€</p>
                      </div>
                    </div>
                  </div>

                  <div className="premium-discount" style={{background: bondAnalysis.premioDesconto >= 0 ? '#d1e7dd' : '#f8d7da', padding: '12px', borderRadius: '6px'}}>
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                      <span className="h-14 fw-500 black">
                        {bondAnalysis.premioDesconto >= 0 ? 'Prémio' : 'Desconto'}:
                      </span>
                      <span className="h-16 fw-700" style={{color: bondAnalysis.premioDesconto >= 0 ? '#198754' : '#dc3545'}}>
                        {bondAnalysis.premioDesconto > 0 ? '+' : ''}{bondAnalysis.premioDesconto}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Yield Analysis */}
                <div className="yield-analysis mb-32">
                  <h5 className="h-21 fw-600 black mb-16">Análise de Rendimento</h5>
                  
                  <div className="yield-metrics">
                    <div className="yield-item mb-12" style={{display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #e9ecef'}}>
                      <span className="h-14 fw-500 black">Yield to Maturity (YTM)</span>
                      <span className="h-16 fw-700" style={{color: getYieldColor(bondAnalysis.ytmAproximado, inputs.taxaInflacaoAnual)}}>
                        {bondAnalysis.ytmAproximado}%
                      </span>
                    </div>
                    
                    <div className="yield-item mb-12" style={{display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #e9ecef'}}>
                      <span className="h-14 fw-500 black">Current Yield</span>
                      <span className="h-14 fw-700 black">{bondAnalysis.currentYield}%</span>
                    </div>
                    
                    <div className="yield-item mb-12" style={{display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #e9ecef'}}>
                      <span className="h-14 fw-500 black">Retorno Anual Real</span>
                      <span className="h-14 fw-700" style={{color: bondAnalysis.retornoAnualReal > 0 ? '#28a745' : '#dc3545'}}>
                        {bondAnalysis.retornoAnualReal > 0 ? '+' : ''}{bondAnalysis.retornoAnualReal}%
                      </span>
                    </div>
                  </div>

                  <div className="inflation-comparison mt-16" style={{background: '#fff3cd', padding: '12px', borderRadius: '6px'}}>
                    <small className="h-12 fw-500 black">
                      Taxa de Inflação: {(inputs.taxaInflacaoAnual * 100).toFixed(1)}% | 
                      Rendimento Real: {(bondAnalysis.ytmAproximado - inputs.taxaInflacaoAnual * 100).toFixed(2)}%
                    </small>
                  </div>
                </div>

                {/* Risk Assessment */}
                <div className="risk-assessment mb-32">
                  <h5 className="h-21 fw-600 black mb-16">Avaliação de Risco</h5>
                  
                  <div className="risk-indicator mb-16" style={{
                    padding: '16px', 
                    background: '#f8f9fa', 
                    borderRadius: '8px', 
                    border: `3px solid ${getRiskColor(bondAnalysis.riscoClassificacao)}`
                  }}>
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px'}}>
                      <span className="h-16 fw-600 black">Risco: {bondAnalysis.riscoClassificacao.toUpperCase()}</span>
                      <span className="h-14 fw-600" style={{color: getRiskColor(bondAnalysis.riscoClassificacao)}}>
                        Duração: {bondAnalysis.duration} anos
                      </span>
                    </div>
                    <p className="h-14 fw-400 black mb-0">{bondAnalysis.riscoDescricao}</p>
                  </div>

                  <div className="duration-info" style={{background: '#e7f3ff', padding: '12px', borderRadius: '6px'}}>
                    <small className="h-12 fw-500 color-primary">
                      Duração Modificada: {bondAnalysis.duration} anos | 
                      Sensibilidade: {(bondAnalysis.duration * 1).toFixed(1)}% por cada 1% de variação na taxa
                    </small>
                  </div>
                </div>

                {/* Return Summary */}
                <div className="return-summary mb-32">
                  <h5 className="h-21 fw-600 black mb-16">Resumo de Retornos</h5>
                  
                  <div className="return-breakdown">
                    <div className="return-item mb-12" style={{display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #e9ecef'}}>
                      <span className="h-14 fw-500 black">Valor Final Bruto</span>
                      <span className="h-14 fw-700 color-primary">{bondAnalysis.valorFinalBruto.toLocaleString()}€</span>
                    </div>
                    
                    <div className="return-item mb-12" style={{display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #e9ecef'}}>
                      <span className="h-14 fw-500 black">Impostos Totais</span>
                      <span className="h-14 fw-700" style={{color: '#dc3545'}}>-{bondAnalysis.impostoTotal.toLocaleString()}€</span>
                    </div>
                    
                    <div className="return-item mb-12" style={{display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #e9ecef'}}>
                      <span className="h-14 fw-600 black">Valor Final Líquido</span>
                      <span className="h-16 fw-700 color-primary">{bondAnalysis.valorFinalLiquido.toLocaleString()}€</span>
                    </div>
                    
                    <div className="return-item mb-12" style={{display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #e9ecef'}}>
                      <span className="h-14 fw-500 black">Poder de Compra Real</span>
                      <span className="h-14 fw-700 black">{bondAnalysis.poderCompraReal.toLocaleString()}€</span>
                    </div>
                    
                    <div className="return-item" style={{display: 'flex', justifyContent: 'space-between', padding: '8px 0'}}>
                      <span className="h-14 fw-600 black">Retorno Total</span>
                      <span className="h-16 fw-700" style={{color: bondAnalysis.retornoTotalNominal >= 0 ? '#28a745' : '#dc3545'}}>
                        {bondAnalysis.retornoTotalNominal > 0 ? '+' : ''}{bondAnalysis.retornoTotalNominal}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Recommendation */}
                <div className="recommendation mb-32" style={{background: '#e7f3ff', padding: '16px', borderRadius: '8px', border: '1px solid #b3d9ff'}}>
                  <h6 className="h-16 fw-600 black mb-8">Análise e Recomendação</h6>
                  <p className="h-14 fw-400 black">{bondAnalysis.sugestao}</p>
                </div>

                {/* Cash Flow Schedule */}
                <div className="cash-flow-schedule">
                  <h5 className="h-21 fw-600 black mb-16">Fluxo de Pagamentos</h5>
                  <div className="table-responsive" style={{maxHeight: '300px', overflowY: 'auto'}}>
                    <table className="table" style={{width: '100%', borderCollapse: 'collapse', fontSize: '12px'}}>
                      <thead>
                        <tr style={{background: '#f8f9fa', position: 'sticky', top: 0}}>
                          <th style={{padding: '8px 4px', borderBottom: '1px solid #dee2e6'}}>Período</th>
                          <th style={{padding: '8px 4px', borderBottom: '1px solid #dee2e6'}}>Ano</th>
                          <th style={{padding: '8px 4px', borderBottom: '1px solid #dee2e6'}}>Cupão</th>
                          <th style={{padding: '8px 4px', borderBottom: '1px solid #dee2e6'}}>Acumulado</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bondAnalysis.fluxosCaixa.map((row) => (
                          <tr key={row.periodo}>
                            <td style={{padding: '6px 4px', borderBottom: '1px solid #dee2e6'}}>{row.periodo}</td>
                            <td style={{padding: '6px 4px', borderBottom: '1px solid #dee2e6'}}>{row.ano}</td>
                            <td style={{padding: '6px 4px', borderBottom: '1px solid #dee2e6'}}>{row.cupao.toLocaleString()}€</td>
                            <td style={{padding: '6px 4px', borderBottom: '1px solid #dee2e6', fontWeight: 'bold', color: '#198754'}}>
                              {row.valorAcumulado.toLocaleString()}€
                            </td>
                          </tr>
                        ))}
                        <tr style={{background: '#e7f3ff'}}>
                          <td colSpan="3" style={{padding: '8px 4px', fontWeight: 'bold'}}>Principal (Maturidade)</td>
                          <td style={{padding: '8px 4px', fontWeight: 'bold', color: '#198754'}}>
                            +{inputs.montanteInvestido.toLocaleString()}€
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Bond Characteristics Summary */}
                <div className="bond-summary mt-32" style={{background: '#f8f9fa', padding: '16px', borderRadius: '8px'}}>
                  <h6 className="h-16 fw-600 black mb-12">Características da Obrigação</h6>
                  <div style={{fontSize: '12px', lineHeight: '1.4'}}>
                    <div className="summary-row" style={{display: 'flex', justifyContent: 'space-between', marginBottom: '4px'}}>
                      <span>Valor Nominal:</span>
                      <span>{inputs.montanteInvestido.toLocaleString()}€</span>
                    </div>
                    <div className="summary-row" style={{display: 'flex', justifyContent: 'space-between', marginBottom: '4px'}}>
                      <span>Taxa Cupão:</span>
                      <span>{(inputs.taxaCupaoAnual * 100).toFixed(2)}%</span>
                    </div>
                    <div className="summary-row" style={{display: 'flex', justifyContent: 'space-between', marginBottom: '4px'}}>
                      <span>Maturidade:</span>
                      <span>{inputs.maturidadeAnos} anos</span>
                    </div>
                    <div className="summary-row" style={{display: 'flex', justifyContent: 'space-between', marginBottom: '4px'}}>
                      <span>Pagamentos:</span>
                      <span>{inputs.frequenciaPagamentos === 1 ? 'Anuais' : inputs.frequenciaPagamentos === 2 ? 'Semestrais' : 'Trimestrais'}</span>
                    </div>
                    <div className="summary-row" style={{display: 'flex', justifyContent: 'space-between'}}>
                      <span>Total de Cupões:</span>
                      <span>{bondAnalysis.periodos} pagamentos</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}