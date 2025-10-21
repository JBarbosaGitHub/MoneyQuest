import React, { useState, useMemo } from 'react'
import NumericInput from '../common/NumericInput'
import { calculateCITForSME, formatEUR, formatPercent } from '../../services/taxCalcPT'
import { useRequireAuth } from '../../hooks/useRequireAuth'

export default function BusinessViabilityCalculator({ onOpenLogin }) {
  const { requireAuth, isAuthenticated } = useRequireAuth(onOpenLogin)
  const [inputs, setInputs] = useState({
    capitalInicial: 50000,
    receitaMensalInicial: 10000,
    custosFixosMensais: 4000,
    percentagemCustosVariaveis: parseFloat((0.30).toFixed(4)),
    despesasMarketingMensais: 1000,
    taxaCrescimentoReceitaMensal: parseFloat((0.05).toFixed(4)),
    emprestimo: 20000,
    jurosEmprestimoAnual: parseFloat((0.06).toFixed(4)),
    taxaImpostoCorporativo: parseFloat((0.21).toFixed(4)),
    mesesProjetados: 24,
    fatorRiscoReceita: parseFloat((0.10).toFixed(4)),
    taxaIRC: parseFloat((0.16).toFixed(4)),
    usarRegraPME: true
  })

  // NumericInput will manage display typing for all fields

  const [errors, setErrors] = useState({})

  // Function to format percentage values without unnecessary decimal zeros
  const formatPercentage = (value) => {
    return Number(value).toLocaleString('pt-PT', {
      minimumFractionDigits: 0, 
      maximumFractionDigits: 2
    });
  }

  const handleInputChange = (field, value) => {
    // Parse and limit decimal places for percentage fields
    const numValue = parseFloat(value) || 0
    const isPercentageField = field.includes('percentagem') || 
      field === 'taxaCrescimentoReceitaMensal' || 
      field === 'jurosEmprestimoAnual' || 
      field === 'taxaImpostoCorporativo' ||
      field === 'taxaIRC' || 
      field === 'fatorRiscoReceita'
      
    // Limit percentage fields to 2 decimal places
    const finalValue = isPercentageField ? 
      parseFloat(numValue.toFixed(4)) : numValue
      
    setInputs(prev => ({ ...prev, [field]: finalValue }))
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }))
    }
  }

  const validateInputs = () => {
    const newErrors = {}
    const { capitalInicial, receitaMensalInicial, mesesProjetados } = inputs
    
    if (capitalInicial < 0) {
      newErrors.capitalInicial = "Capital inicial deve ser positivo"
    }
    if (receitaMensalInicial < 0) {
      newErrors.receitaMensalInicial = "Receita deve ser positiva"
    }
    if (mesesProjetados <= 0) {
      newErrors.mesesProjetados = "Meses deve ser maior que 0"
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Simulate revenue risk with deterministic variations
  const simulateRevenueRisk = (baseRevenue, month, riskFactor) => {
    // Use deterministic variation based on month to simulate risk without randomness
    const variation = Math.sin(month * 0.5) * riskFactor * 0.5 + (riskFactor * 0.5)
    return baseRevenue * (1 - variation)
  }

  const calculationResults = useMemo(() => {
    if (!validateInputs()) return null

    const {
      capitalInicial,
      receitaMensalInicial,
      custosFixosMensais,
      percentagemCustosVariaveis,
      despesasMarketingMensais,
      taxaCrescimentoReceitaMensal,
      emprestimo,
      jurosEmprestimoAnual,
      taxaImpostoCorporativo,
      mesesProjetados,
      fatorRiscoReceita
    } = inputs

    // Initialize variables
    const fluxosCaixaMensais = []
    let totalLucroAcumulado = 0
    let mesBreakEven = null
    let fundingGap = 0
    
    let saldoAtual = capitalInicial + emprestimo

    for (let mes = 1; mes <= mesesProjetados; mes++) {
      // Revenue growth with risk (deterministic reduction up to factor)
      const receitaAjustada = receitaMensalInicial * Math.pow(1 + taxaCrescimentoReceitaMensal, mes - 1)
      const receitaMensal = simulateRevenueRisk(receitaAjustada, mes, fatorRiscoReceita)
      
      // Costs
      const custosVariaveisMensais = receitaMensal * percentagemCustosVariaveis
      const amortizacaoMensal = emprestimo > 0 ? emprestimo / mesesProjetados : 0
      const saldoEmprestimo = emprestimo - (amortizacaoMensal * (mes - 1))
      const jurosMensal = saldoEmprestimo > 0 ? saldoEmprestimo * (jurosEmprestimoAnual / 12) : 0
      
      const totalCustosMensais = custosFixosMensais + custosVariaveisMensais + 
                                despesasMarketingMensais + amortizacaoMensal + jurosMensal
      
      const lucroBrutoMensal = receitaMensal - totalCustosMensais
      // CIT (IRC)
      // If Regra PME is active: 16% on first €50k/year and 20% above, prorated monthly.
      // Otherwise, use the flat IRC rate from inputs.taxaIRC.
      let impostoMensal = 0
      if (inputs.usarRegraPME) {
        const monthlyTierLimit = 50000 / 12
        const cit = calculateCITForSME(lucroBrutoMensal, { tierLimit: monthlyTierLimit })
        impostoMensal = Math.max(0, cit.tax)
      } else {
        impostoMensal = Math.max(0, lucroBrutoMensal * (inputs.taxaIRC || 0))
      }
      const lucroLiquidoMensal = lucroBrutoMensal - impostoMensal
      
      saldoAtual += lucroLiquidoMensal
      
      fluxosCaixaMensais.push({
        mes,
        receita: Math.round(receitaMensal * 100) / 100,
        custosFixos: Math.round(custosFixosMensais * 100) / 100,
        custosVariaveis: Math.round(custosVariaveisMensais * 100) / 100,
        marketing: Math.round(despesasMarketingMensais * 100) / 100,
        amortizacao: Math.round(amortizacaoMensal * 100) / 100,
        juros: Math.round(jurosMensal * 100) / 100,
        lucroBruto: Math.round(lucroBrutoMensal * 100) / 100,
        imposto: Math.round(impostoMensal * 100) / 100,
        lucroLiquido: Math.round(lucroLiquidoMensal * 100) / 100,
        saldoAcumulado: Math.round(saldoAtual * 100) / 100
      })
      
      totalLucroAcumulado += lucroLiquidoMensal
      
      if (mesBreakEven === null && saldoAtual >= capitalInicial) {
        mesBreakEven = mes
      }
      
      if (saldoAtual < 0) {
        fundingGap = Math.max(fundingGap, Math.abs(saldoAtual))
      }
    }

    // Break-even in sales volume (adjusted average)
    const breakEvenVendasMedio = (custosFixosMensais + despesasMarketingMensais) / 
                                 (1 - percentagemCustosVariaveis - fatorRiscoReceita)

    // Viability score (0-100, improved with weights)
    const receitaTotal = fluxosCaixaMensais.reduce((sum, d) => sum + d.receita, 0)
    const margemLucroMedia = receitaTotal > 0 ? (totalLucroAcumulado / receitaTotal) * 100 : 0
    
    let pontuacao = 0
    pontuacao += margemLucroMedia * 2 // Profit margin weight
    pontuacao += mesBreakEven && mesBreakEven < mesesProjetados / 2 ? 30 : 0 // Early break-even bonus
    pontuacao -= capitalInicial > 0 ? (fundingGap / capitalInicial) * 25 : 0 // Funding gap penalty
    pontuacao += totalLucroAcumulado > 0 ? 20 : 0 // Profitability bonus
    pontuacao = Math.min(100, Math.max(0, pontuacao))

    // Enhanced suggestion
    let sugestao
    if (pontuacao < 40) {
      sugestao = `Viabilidade baixa (${pontuacao.toFixed(1)}/100). Reduza custos fixos em 15% ou aumente crescimento de receita para mitigar risco de ${(fatorRiscoReceita * 100).toFixed(0)}%.`
    } else if (pontuacao < 70) {
      sugestao = `Viabilidade moderada (${pontuacao.toFixed(1)}/100). Considere otimizar custos variáveis e monitorar fluxo de caixa nos primeiros 6 meses.`
    } else {
      sugestao = `Viabilidade boa (${pontuacao.toFixed(1)}/100). Monitore empréstimos e impostos para otimização. Considere expansão após estabilização.`
    }

    // Additional metrics
    const roiAnual = capitalInicial > 0 ? ((totalLucroAcumulado / (mesesProjetados / 12)) / capitalInicial) * 100 : 0
  const margemLiquidaMedia = receitaTotal > 0 ? (totalLucroAcumulado / receitaTotal) * 100 : 0
    const custoTotalMedio = fluxosCaixaMensais.reduce((sum, d) => 
      sum + d.custosFixos + d.custosVariaveis + d.marketing + d.amortizacao + d.juros, 0) / mesesProjetados

    return {
      fluxosCaixa: fluxosCaixaMensais,
      mesBreakEven,
      breakEvenVendas: Math.round(breakEvenVendasMedio * 100) / 100,
      fundingGap: Math.round(fundingGap * 100) / 100,
      pontuacaoViabilidade: Math.round(pontuacao * 10) / 10,
      totalLucroAcumulado: Math.round(totalLucroAcumulado * 100) / 100,
      receitaTotal: Math.round(receitaTotal * 100) / 100,
      margemLiquidaMedia: Math.round(margemLiquidaMedia * 10) / 10,
      roiAnual: Math.round(roiAnual * 10) / 10,
      custoTotalMedio: Math.round(custoTotalMedio * 100) / 100,
      sugestao
    }
  }, [inputs])

  const exportToCSVAction = () => {
    if (!calculationResults) return
    
    const csvContent = [
      ['Mês', 'Receita', 'Lucro Líquido', 'Saldo Acumulado', 'Custos Fixos', 'Custos Variáveis', 'Marketing', 'Amortização', 'Juros'],
      ...calculationResults.fluxosCaixa.map(row => [
        row.mes, row.receita, row.lucroLiquido, row.saldoAcumulado,
        row.custosFixos, row.custosVariaveis, row.marketing, row.amortizacao, row.juros
      ])
    ].map(row => row.join(',')).join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'viabilidade_resultados.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const exportToCSV = requireAuth(exportToCSVAction)

  const getViabilityColor = (score) => {
    if (score >= 70) return '#28a745'
    if (score >= 40) return '#ffc107'
    return '#dc3545'
  }

  const getViabilityLabel = (score) => {
    if (score >= 70) return 'BOA'
    if (score >= 40) return 'MODERADA'
    return 'BAIXA'
  }

  return (
    <div className="business-viability-calculator">
      <div className="container-fluid">
        <div className="heading mb-48">
          <h2 className="black mb-24">
            <span className="banner-text" title="CALCULADORA DE VIABILIDADE">CALCULADORA DE VIABILIDADE</span>
          </h2>
          <p className="h-16 body-text dark-gray">
            Analise a viabilidade financeira do seu negócio com projeções detalhadas de fluxo de caixa
          </p>
        </div>

        <div className="row">
          {/* Input Form */}
          <div className="col-xl-6 col-lg-6">
            <div className="simulator-inputs">
              <h4 className="h-28 fw-700 black mb-24">Dados do Negócio</h4>
              
              {Object.keys(errors).length > 0 && (
                <div className="alert alert-danger mb-16" style={{color: '#d63384', background: '#f8d7da', padding: '12px', borderRadius: '8px'}}>
                  {Object.values(errors).join(', ')}
                </div>
              )}

              <div className="input-group mb-24">
                <label className="h-16 fw-500 black mb-8">Capital Inicial (€)</label>
                <NumericInput
                  value={inputs.capitalInicial}
                  onValue={(v) => handleInputChange('capitalInicial', v)}
                  min={0}
                  step={1000}
                />
              </div>

              <div className="input-group mb-24">
                <label className="h-16 fw-500 black mb-8">Receita Mensal Inicial (€)</label>
                <NumericInput
                  value={inputs.receitaMensalInicial}
                  onValue={(v) => handleInputChange('receitaMensalInicial', v)}
                  min={0}
                  step={100}
                />
              </div>

              <div className="input-group mb-24">
                <label className="h-16 fw-500 black mb-8">Custos Fixos Mensais (€)</label>
                <NumericInput
                  value={inputs.custosFixosMensais}
                  onValue={(v) => handleInputChange('custosFixosMensais', v)}
                  min={0}
                  step={100}
                />
                <small className="h-12 fw-400 dark-gray mt-4">Renda, salários, seguros, etc.</small>
              </div>

              <div className="input-group mb-24">
                <label className="h-16 fw-500 black mb-8">Custos Variáveis (% da Receita)</label>
                <NumericInput
                  value={inputs.percentagemCustosVariaveis}
                  percent
                  onValue={(v) => handleInputChange('percentagemCustosVariaveis', v)}
                  min={0}
                  max={90}
                  step={0.01}
                />
                <small className="h-12 fw-400 dark-gray mt-4">Materiais, comissões, etc. (ex: 30%)</small>
              </div>

              <div className="input-group mb-24">
                <label className="h-16 fw-500 black mb-8">Despesas de Marketing Mensais (€)</label>
                <NumericInput
                  value={inputs.despesasMarketingMensais}
                  onValue={(v) => handleInputChange('despesasMarketingMensais', v)}
                  min={0}
                  step={50}
                />
              </div>

              <div className="input-group mb-24">
                <label className="h-16 fw-500 black mb-8">Taxa de Crescimento Mensal (%)</label>
                <NumericInput
                  value={inputs.taxaCrescimentoReceitaMensal}
                  percent
                  onValue={(v) => handleInputChange('taxaCrescimentoReceitaMensal', v)}
                  min={-10}
                  max={20}
                  step={0.01}
                />
              </div>

              <div className="loan-section mb-24" style={{background: '#f8f9fa', padding: '16px', borderRadius: '8px'}}>
                <h5 className="h-21 fw-600 black mb-16">Financiamento</h5>
                
                <div className="input-group mb-16">
                  <label className="h-14 fw-400 black mb-4">Montante do Empréstimo (€)</label>
                  <NumericInput
                    value={inputs.emprestimo}
                    onValue={(v) => handleInputChange('emprestimo', v)}
                    min={0}
                    step={1000}
                  />
                </div>

                <div className="input-group mb-16">
                  <label className="h-14 fw-400 black mb-4">Taxa de Juros Anual (%)</label>
                  <NumericInput
                    value={inputs.jurosEmprestimoAnual}
                    percent
                    onValue={(v) => handleInputChange('jurosEmprestimoAnual', v)}
                    min={0}
                    max={15}
                    step={0.01}
                  />
                </div>
              </div>

              <div className="advanced-options">
                <h5 className="h-21 fw-600 black mb-16">Configurações Avançadas</h5>
                
                <div className="input-group mb-16">
                  <label className="h-14 fw-400 black mb-4">Período de Projeção (Meses)</label>
                  <NumericInput
                    value={inputs.mesesProjetados}
                    onValue={(v) => handleInputChange('mesesProjetados', v)}
                    min={6}
                    max={60}
                    step={1}
                  />
                </div>

                <div className="input-group mb-16">
                  <label className="h-14 fw-400 black mb-4">Aplicar Regra PME (IRC)</label>
                  <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                    <input
                      id="usarRegraPME"
                      type="checkbox"
                      className="form-check-input"
                      checked={inputs.usarRegraPME}
                      onChange={(e) => setInputs(prev => ({ ...prev, usarRegraPME: e.target.checked }))}
                    />
                    <label htmlFor="usarRegraPME" className="h-14 fw-400 black">16% até €50.000/ano e 20% acima</label>
                  </div>
                </div>

                <div className="input-group mb-16">
                  <label className="h-14 fw-400 black mb-4">Taxa de IRC (%)</label>
                  <NumericInput
                    value={inputs.taxaIRC}
                    percent
                    onValue={(v) => handleInputChange('taxaIRC', v)}
                    disabled={inputs.usarRegraPME}
                    min={0}
                    max={40}
                    step={0.01}
                  />
                </div>

                <div className="input-group mb-16">
                  <label className="h-14 fw-400 black mb-4">Fator de Risco de Receita (%)</label>
                  <NumericInput
                    value={inputs.fatorRiscoReceita}
                    percent
                    onValue={(v) => handleInputChange('fatorRiscoReceita', v)}
                    min={0}
                    max={50}
                    step={0.01}
                  />
                  <small className="h-12 fw-400 dark-gray mt-4">Variação esperada na receita</small>
                </div>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="col-xl-6 col-lg-6">
            {calculationResults && (
              <div className="simulator-results">
                <div className="results-header" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px'}}>
                  <h4 className="h-28 fw-700 black">Análise de Viabilidade</h4>
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

                {/* Viability Score */}
                <div className="viability-score mb-32" style={{
                  background: getViabilityColor(calculationResults.pontuacaoViabilidade),
                  color: 'white',
                  padding: '24px',
                  borderRadius: '12px',
                  textAlign: 'center'
                }}>
                  <h3 className="h-32 fw-800 mb-8" style={{color: 'white'}}>
                    {calculationResults.pontuacaoViabilidade}/100
                  </h3>
                  <h5 className="h-21 fw-600" style={{color: 'white'}}>
                    VIABILIDADE {getViabilityLabel(calculationResults.pontuacaoViabilidade)}
                  </h5>
                </div>

                {/* Key Metrics */}
                <div className="key-metrics mb-32">
                  <div className="row">
                    <div className="col-6">
                      <div className="metric-card mb-16" style={{background: '#e7f3ff', padding: '16px', borderRadius: '8px'}}>
                        <h6 className="h-14 fw-600 black mb-4">Break-Even</h6>
                        <p className="h-20 fw-700 color-primary">
                          {calculationResults.mesBreakEven ? `Mês ${calculationResults.mesBreakEven}` : 'Não atingido'}
                        </p>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="metric-card mb-16" style={{background: '#f8f9fa', padding: '16px', borderRadius: '8px'}}>
                        <h6 className="h-14 fw-600 black mb-4">ROI Anual</h6>
                        <p className="h-20 fw-700" style={{color: calculationResults.roiAnual >= 0 ? '#28a745' : '#dc3545'}}>
                          {calculationResults.roiAnual > 0 ? '+' : ''}{calculationResults.roiAnual}%
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Financial Summary */}
                <div className="financial-summary mb-32">
                  <h5 className="h-21 fw-600 black mb-16">Resumo Financeiro</h5>
                  
                  <div className="summary-item mb-12" style={{display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #e9ecef'}}>
                    <span className="h-14 fw-500 black">Receita Total Projetada</span>
                    <span className="h-14 fw-700 color-primary">{calculationResults.receitaTotal.toLocaleString()}€</span>
                  </div>
                  
                  <div className="summary-item mb-12" style={{display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #e9ecef'}}>
                    <span className="h-14 fw-500 black">Lucro Acumulado</span>
                    <span className="h-14 fw-700" style={{color: calculationResults.totalLucroAcumulado >= 0 ? '#28a745' : '#dc3545'}}>
                      {calculationResults.totalLucroAcumulado.toLocaleString()}€
                    </span>
                  </div>
                  
                  <div className="summary-item mb-12" style={{display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #e9ecef'}}>
                    <span className="h-14 fw-500 black">Margem Líquida Média</span>
                    <span className="h-14 fw-700 black">{calculationResults.margemLiquidaMedia}%</span>
                  </div>
                  <div className="summary-item mb-12" style={{display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #e9ecef'}}>
                    <span className="h-14 fw-500 black">Imposto (IRC) - Regra PME</span>
                    <span className="h-14 fw-700 black">
                      {formatEUR(
                        calculationResults.fluxosCaixa.reduce((sum, d) => sum + (d.imposto || 0), 0)
                      )}
                    </span>
                  </div>
                  
                  <div className="summary-item mb-12" style={{display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #e9ecef'}}>
                    <span className="h-14 fw-500 black">Break-Even em Vendas</span>
                    <span className="h-14 fw-700 black">{calculationResults.breakEvenVendas.toLocaleString()}€/mês</span>
                  </div>
                  
                  {calculationResults.fundingGap > 0 && (
                    <div className="summary-item mb-12" style={{display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #e9ecef'}}>
                      <span className="h-14 fw-500 black">Necessidade de Financiamento</span>
                      <span className="h-14 fw-700" style={{color: '#dc3545'}}>{calculationResults.fundingGap.toLocaleString()}€</span>
                    </div>
                  )}
                </div>

                {/* Recommendation */}
                <div className="recommendation mb-32" style={{background: '#e7f3ff', padding: '16px', borderRadius: '8px', border: '1px solid #b3d9ff'}}>
                  <h6 className="h-16 fw-600 black mb-8">Recomendação</h6>
                  <p className="h-14 fw-400 black">{calculationResults.sugestao}</p>
                </div>

                {/* Cash Flow Chart */}
                <div className="cash-flow-chart mb-32">
                  <h5 className="h-21 fw-600 black mb-16">Fluxo de Caixa Mensal</h5>
                  <div className="table-responsive" style={{maxHeight: '400px', overflowY: 'auto'}}>
                    <table className="table" style={{width: '100%', borderCollapse: 'collapse', fontSize: '12px'}}>
                      <thead>
                        <tr style={{background: '#f8f9fa', position: 'sticky', top: 0}}>
                          <th style={{padding: '8px 4px', borderBottom: '1px solid #dee2e6'}}>Mês</th>
                          <th style={{padding: '8px 4px', borderBottom: '1px solid #dee2e6'}}>Receita</th>
                          <th style={{padding: '8px 4px', borderBottom: '1px solid #dee2e6'}}>Lucro Líq.</th>
                          <th style={{padding: '8px 4px', borderBottom: '1px solid #dee2e6'}}>Saldo</th>
                        </tr>
                      </thead>
                      <tbody>
                        {calculationResults.fluxosCaixa.map((row) => (
                          <tr key={row.mes}>
                            <td style={{padding: '6px 4px', borderBottom: '1px solid #dee2e6'}}>{row.mes}</td>
                            <td style={{padding: '6px 4px', borderBottom: '1px solid #dee2e6'}}>{row.receita.toLocaleString()}€</td>
                            <td style={{padding: '6px 4px', borderBottom: '1px solid #dee2e6', color: row.lucroLiquido < 0 ? '#d63384' : '#198754'}}>
                              {row.lucroLiquido.toLocaleString()}€
                            </td>
                            <td style={{padding: '6px 4px', borderBottom: '1px solid #dee2e6', color: row.saldoAcumulado < 0 ? '#d63384' : '#198754', fontWeight: 'bold'}}>
                              {row.saldoAcumulado.toLocaleString()}€
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Visual Cash Flow Indicator */}
                <div className="cash-flow-visual">
                  <h5 className="h-21 fw-600 black mb-16">Tendência do Saldo</h5>
                  <div style={{height: '60px', background: '#f8f9fa', borderRadius: '8px', padding: '8px', display: 'flex', alignItems: 'end', justifyContent: 'space-around'}}>
                    {calculationResults.fluxosCaixa.slice(0, 24).map((row, idx) => {
                      const maxSaldo = Math.max(...calculationResults.fluxosCaixa.map(r => Math.abs(r.saldoAcumulado)))
                      const height = (Math.abs(row.saldoAcumulado) / maxSaldo) * 40 + 5
                      return (
                        <div 
                          key={idx}
                          style={{
                            width: '6px',
                            height: `${height}px`,
                            background: row.saldoAcumulado >= 0 ? '#28a745' : '#dc3545',
                            borderRadius: '2px',
                            margin: '0 1px'
                          }}
                          title={`Mês ${row.mes}: ${row.saldoAcumulado.toLocaleString()}€`}
                        />
                      )
                    })}
                  </div>
                  <div style={{textAlign: 'center', marginTop: '8px'}}>
                    <small className="h-12 fw-400 dark-gray">
                      Verde: Saldo Positivo | Vermelho: Saldo Negativo
                    </small>
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