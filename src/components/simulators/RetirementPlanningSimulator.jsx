import React, { useState, useMemo } from 'react'
import NumericInput from '../common/NumericInput'
import { useRequireAuth } from '../../hooks/useRequireAuth'

export default function RetirementPlanningSimulator({ onOpenLogin }) {
  const { requireAuth, isAuthenticated } = useRequireAuth(onOpenLogin)
  const [inputs, setInputs] = useState({
    idadeAtual: 40,
    idadeReforma: 65,
    rendimentoMensalAtual: 2000,
    taxaCrescimentoSalarial: 0.02,
    poupancasAtuais: 10000,
    contribuicoesMensais: 200,
    taxaRetornoAnual: 0.05,
    taxaInflacaoAnual: 0.024,
    taxaImpostoGanhos: 0.28,
    despesasMensaisReforma: 1500,
    anosPosReforma: 25,
    numSimulacoes: 100
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
    const { 
      idadeAtual, 
      idadeReforma, 
      rendimentoMensalAtual, 
      poupancasAtuais, 
      contribuicoesMensais, 
      despesasMensaisReforma 
    } = inputs
    
    if (idadeAtual >= idadeReforma) {
      newErrors.idade = "Idade de reforma deve ser maior que idade atual"
    }
    if (rendimentoMensalAtual < 0 || poupancasAtuais < 0 || contribuicoesMensais < 0 || despesasMensaisReforma < 0) {
      newErrors.negative = "Valores monetários devem ser positivos"
    }
    if (idadeAtual < 18 || idadeAtual > 80) {
      newErrors.idadeAtual = "Idade atual deve estar entre 18 e 80 anos"
    }
    if (idadeReforma < 50 || idadeReforma > 90) {
      newErrors.idadeReforma = "Idade de reforma deve estar entre 50 e 90 anos"
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const simulationResults = useMemo(() => {
    if (!validateInputs()) return null

    const {
      idadeAtual,
      idadeReforma,
      rendimentoMensalAtual,
      taxaCrescimentoSalarial,
      poupancasAtuais,
      contribuicoesMensais,
      taxaRetornoAnual,
      taxaInflacaoAnual,
      taxaImpostoGanhos,
      despesasMensaisReforma,
      anosPosReforma,
      numSimulacoes
    } = inputs

    const anosAteReforma = idadeReforma - idadeAtual
    
    // 4% rule adjusted for taxes - calculate needed amount for sustainable retirement
    const montanteNecessario = (despesasMensaisReforma * 12 * anosPosReforma) / (0.04 * (1 - taxaImpostoGanhos))
    
    // Detailed year-by-year projection for main scenario
    const projecaoAnual = []
    let poupancas = poupancasAtuais
    let rendimento = rendimentoMensalAtual
    let contribuicaoAnualTotal = 0
    
    for (let ano = 0; ano < anosAteReforma; ano++) {
      const idadeAno = idadeAtual + ano
      rendimento = ano === 0 ? rendimento : rendimento * (1 + taxaCrescimentoSalarial)
      const rendimentoAnual = rendimento * 12
      const contribuicaoAnual = contribuicoesMensais * 12
      contribuicaoAnualTotal += contribuicaoAnual
      
      // Real return after inflation
      const retornoReal = taxaRetornoAnual - taxaInflacaoAnual
      poupancas = poupancas * (1 + retornoReal) + contribuicaoAnual
      
      projecaoAnual.push({
        ano: ano + 1,
        idade: idadeAno + 1,
        rendimentoMensal: Math.round(rendimento * 100) / 100,
        rendimentoAnual: Math.round(rendimentoAnual * 100) / 100,
        contribuicaoAnual: Math.round(contribuicaoAnual * 100) / 100,
        poupancasAcumuladas: Math.round(poupancas * 100) / 100
      })
    }

    // Monte Carlo simulation for variability analysis
    const valoresFinais = []
    for (let sim = 0; sim < numSimulacoes; sim++) {
      let poupancasSim = poupancasAtuais
      let rendimentoSim = rendimentoMensalAtual
      
      for (let ano = 0; ano < anosAteReforma; ano++) {
        rendimentoSim *= (1 + taxaCrescimentoSalarial)
        // Add some volatility to returns (±2%)
        const retornoVariavel = taxaRetornoAnual + (Math.random() - 0.5) * 0.04
        const retornoReal = retornoVariavel - taxaInflacaoAnual
        poupancasSim = poupancasSim * (1 + retornoReal) + (contribuicoesMensais * 12)
      }
      
      // Calculate taxes on gains
      const ganho = poupancasSim - poupancasAtuais - contribuicaoAnualTotal
      const imposto = Math.max(0, ganho * taxaImpostoGanhos)
      const poupancasLiquidas = poupancasSim - imposto
      
      valoresFinais.push(poupancasLiquidas)
    }

    // Statistics
    const media = valoresFinais.reduce((sum, val) => sum + val, 0) / numSimulacoes
    valoresFinais.sort((a, b) => a - b)
    const mediana = valoresFinais[Math.floor(valoresFinais.length / 2)]
    const percentil25 = valoresFinais[Math.floor(valoresFinais.length * 0.25)]
    const percentil75 = valoresFinais[Math.floor(valoresFinais.length * 0.75)]

    // Calculate main scenario with taxes
    const poupancasFinalMain = projecaoAnual[projecaoAnual.length - 1]?.poupancasAcumuladas || 0
    const ganhoMain = poupancasFinalMain - poupancasAtuais - contribuicaoAnualTotal
    const impostoMain = Math.max(0, ganhoMain * taxaImpostoGanhos)
    const poupancasLiquidasMain = poupancasFinalMain - impostoMain

    const gapPoupanca = montanteNecessario - media
    const gapPercentual = montanteNecessario > 0 ? (gapPoupanca / montanteNecessario) * 100 : 0

    // Enhanced suggestions
    let sugestao
    if (gapPoupanca > 0) {
      const contribuicaoAdicionalMensal = gapPoupanca / (12 * anosAteReforma)
      if (contribuicaoAdicionalMensal > rendimentoMensalAtual * 0.1) {
        sugestao = `Gap significativo: Aumente contribuições em ${Math.round(contribuicaoAdicionalMensal)}€/mês OU considere trabalhar até aos ${idadeReforma + 2} anos para reduzir o déficit.`
      } else {
        sugestao = `Aumente contribuições mensais em ${Math.round(contribuicaoAdicionalMensal)}€ para cobrir o gap de reforma.`
      }
    } else {
      const excedente = Math.abs(gapPoupanca)
      sugestao = `Planeamento sustentável! Excedente de ${Math.round(excedente).toLocaleString()}€. Considere diversificação ou reforma antecipada.`
    }

    // Retirement sustainability analysis
    const rendaMensalPossivel = (poupancasLiquidasMain * 0.04 * (1 - taxaImpostoGanhos)) / 12
    const taxaSubstituicao = rendaMensalPossivel > 0 ? (rendaMensalPossivel / rendimentoMensalAtual) * 100 : 0

    // Additional metrics
    const contribuicaoTotalInvestida = poupancasAtuais + contribuicaoAnualTotal
    const crescimentoTotal = poupancasLiquidasMain - contribuicaoTotalInvestida
    const retornoEfetivo = contribuicaoTotalInvestida > 0 ? Math.pow(poupancasLiquidasMain / contribuicaoTotalInvestida, 1/anosAteReforma) - 1 : 0

    return {
      anosAteReforma,
      montanteNecessario: Math.round(montanteNecessario * 100) / 100,
      poupancasProjetadasMedia: Math.round(media * 100) / 100,
      poupancasLiquidasMain: Math.round(poupancasLiquidasMain * 100) / 100,
      gapPoupanca: Math.round(gapPoupanca * 100) / 100,
      gapPercentual: Math.round(gapPercentual * 10) / 10,
      rendaMensalPossivel: Math.round(rendaMensalPossivel * 100) / 100,
      taxaSubstituicao: Math.round(taxaSubstituicao * 10) / 10,
      contribuicaoTotalInvestida: Math.round(contribuicaoTotalInvestida * 100) / 100,
      crescimentoTotal: Math.round(crescimentoTotal * 100) / 100,
      retornoEfetivo: Math.round(retornoEfetivo * 1000) / 10,
      mediana: Math.round(mediana * 100) / 100,
      percentil25: Math.round(percentil25 * 100) / 100,
      percentil75: Math.round(percentil75 * 100) / 100,
      projecaoAnual,
      sugestao,
      valoresFinais: valoresFinais.slice(0, 50) // Sample for visualization
    }
  }, [inputs])

  const exportToCSVAction = () => {
    if (!simulationResults) return
    
    const csvContent = [
      ['Ano', 'Idade', 'Rendimento Mensal', 'Contribuição Anual', 'Poupanças Acumuladas'],
      ...simulationResults.projecaoAnual.map(row => [
        row.ano, row.idade, row.rendimentoMensal, row.contribuicaoAnual, row.poupancasAcumuladas
      ])
    ].map(row => row.join(',')).join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'reforma_simulacoes.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const exportToCSV = requireAuth(exportToCSVAction)

  const getGapColor = (gapPercentual) => {
    if (gapPercentual <= 0) return '#28a745'
    if (gapPercentual <= 25) return '#ffc107'
    return '#dc3545'
  }

  const getGapStatus = (gapPercentual) => {
    if (gapPercentual <= 0) return 'EXCEDENTE'
    if (gapPercentual <= 25) return 'MODERADO'
    return 'CRÍTICO'
  }

  return (
    <div className="retirement-planning-simulator">
      <div className="container-fluid">
        <div className="heading mb-48">
          <h2 className="black mb-24">
            <span className="banner-text" title="SIMULADOR DE REFORMA">SIMULADOR DE REFORMA</span>
          </h2>
          <p className="h-16 body-text dark-gray">
            Planeie a sua reforma com análise detalhada de poupanças e projeções de longo prazo
          </p>
        </div>

        <div className="row">
          {/* Input Form */}
          <div className="col-xl-6 col-lg-6">
            <div className="simulator-inputs">
              <h4 className="h-28 fw-700 black mb-24">Dados Pessoais e Financeiros</h4>
              
              {Object.keys(errors).length > 0 && (
                <div className="alert alert-danger mb-16" style={{color: '#d63384', background: '#f8d7da', padding: '12px', borderRadius: '8px'}}>
                  {Object.values(errors).join(', ')}
                </div>
              )}

              <div className="personal-info mb-32" style={{background: '#f8f9fa', padding: '16px', borderRadius: '8px'}}>
                <h5 className="h-21 fw-600 black mb-16">Informação Pessoal</h5>
                
                <div className="row">
                  <div className="col-6">
                    <div className="input-group mb-16">
                      <label className="h-14 fw-500 black mb-4">Idade Atual</label>
                      <NumericInput
                        value={inputs.idadeAtual}
                        onValue={(v) => handleInputChange('idadeAtual', v)}
                        min={18}
                        max={80}
                        step={1}
                      />
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="input-group mb-16">
                      <label className="h-14 fw-500 black mb-4">Idade de Reforma</label>
                      <NumericInput
                        value={inputs.idadeReforma}
                        onValue={(v) => handleInputChange('idadeReforma', v)}
                        min={50}
                        max={90}
                        step={1}
                      />
                    </div>
                  </div>
                </div>

                {simulationResults && (
                  <div className="time-info mt-8 mb-8" style={{background: '#e7f3ff', padding: '8px 12px', borderRadius: '6px'}}>
                    <small className="h-12 fw-500 color-primary">
                      {simulationResults.anosAteReforma} anos até à reforma
                    </small>
                  </div>
                )}
              </div>

              <div className="input-group mb-24">
                <label className="h-16 fw-500 black mb-8">Rendimento Mensal Atual (€)</label>
                <NumericInput
                  value={inputs.rendimentoMensalAtual}
                  onValue={(v) => handleInputChange('rendimentoMensalAtual', v)}
                  min={0}
                  step={50}
                />
              </div>

              <div className="input-group mb-24">
                <label className="h-16 fw-500 black mb-8">Taxa de Crescimento Salarial Anual (%)</label>
                <NumericInput
                  value={inputs.taxaCrescimentoSalarial}
                  percent
                  onValue={(v) => handleInputChange('taxaCrescimentoSalarial', v)}
                  min={0}
                  max={10}
                  step={0.1}
                />
                <small className="h-12 fw-400 dark-gray mt-4">Crescimento médio esperado do salário</small>
              </div>

              <div className="savings-section mb-24" style={{background: '#f8f9fa', padding: '16px', borderRadius: '8px'}}>
                <h5 className="h-21 fw-600 black mb-16">Poupanças e Investimentos</h5>
                
                <div className="input-group mb-16">
                  <label className="h-14 fw-500 black mb-4">Poupanças Atuais (€)</label>
                  <NumericInput
                    value={inputs.poupancasAtuais}
                    onValue={(v) => handleInputChange('poupancasAtuais', v)}
                    min={0}
                    step={1000}
                  />
                </div>

                <div className="input-group mb-16">
                  <label className="h-14 fw-500 black mb-4">Contribuições Mensais (€)</label>
                  <NumericInput
                    value={inputs.contribuicoesMensais}
                    onValue={(v) => handleInputChange('contribuicoesMensais', v)}
                    min={0}
                    step={25}
                  />
                  <small className="h-12 fw-400 dark-gray mt-4">PPR, fundos de pensões, etc.</small>
                </div>

                <div className="input-group mb-16">
                  <label className="h-14 fw-500 black mb-4">Taxa de Retorno Anual Esperada (%)</label>
                  <NumericInput
                    value={inputs.taxaRetornoAnual}
                    percent
                    onValue={(v) => handleInputChange('taxaRetornoAnual', v)}
                    min={0}
                    max={15}
                    step={0.1}
                  />
                  <small className="h-12 fw-400 dark-gray mt-4">Conservador: 3-4%, Moderado: 5-7%, Agressivo: 8-10%</small>
                </div>
              </div>

              <div className="retirement-section mb-24">
                <h5 className="h-21 fw-600 black mb-16">Planeamento da Reforma</h5>
                
                <div className="input-group mb-16">
                  <label className="h-14 fw-500 black mb-4">Despesas Mensais na Reforma (€)</label>
                  <NumericInput
                    value={inputs.despesasMensaisReforma}
                    onValue={(v) => handleInputChange('despesasMensaisReforma', v)}
                    min={0}
                    step={50}
                  />
                  <small className="h-12 fw-400 dark-gray mt-4">Estimativa do orçamento mensal necessário</small>
                </div>

                <div className="input-group mb-16">
                  <label className="h-14 fw-500 black mb-4">Anos Pós-Reforma</label>
                  <NumericInput
                    value={inputs.anosPosReforma}
                    onValue={(v) => handleInputChange('anosPosReforma', v)}
                    min={10}
                    max={40}
                    step={1}
                  />
                  <small className="h-12 fw-400 dark-gray mt-4">Esperança de vida pós-reforma</small>
                </div>
              </div>

              <div className="advanced-options">
                <h5 className="h-21 fw-600 black mb-16">Configurações Avançadas</h5>
                
                <div className="input-group mb-16">
                  <label className="h-14 fw-400 black mb-4">Taxa de Inflação Anual (%)</label>
                  <NumericInput
                    value={inputs.taxaInflacaoAnual}
                    percent
                    onValue={(v) => handleInputChange('taxaInflacaoAnual', v)}
                    min={0}
                    max={10}
                    step={0.1}
                  />
                </div>

                <div className="input-group mb-16">
                  <label className="h-14 fw-400 black mb-4">Taxa de Imposto sobre Ganhos (%)</label>
                  <NumericInput
                    value={inputs.taxaImpostoGanhos}
                    percent
                    onValue={(v) => handleInputChange('taxaImpostoGanhos', v)}
                    min={0}
                    max={50}
                    step={0.1}
                  />
                </div>

                <div className="input-group mb-16">
                  <label className="h-14 fw-400 black mb-4">Número de Simulações</label>
                  <NumericInput
                    value={inputs.numSimulacoes}
                    onValue={(v) => handleInputChange('numSimulacoes', v)}
                    min={50}
                    max={1000}
                    step={50}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="col-xl-6 col-lg-6">
            {simulationResults && (
              <div className="simulator-results">
                <div className="results-header" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px'}}>
                  <h4 className="h-28 fw-700 black">Análise de Reforma</h4>
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

                {/* Gap Analysis */}
                <div className="gap-analysis mb-32" style={{
                  background: getGapColor(simulationResults.gapPercentual),
                  color: 'white',
                  padding: '24px',
                  borderRadius: '12px',
                  textAlign: 'center'
                }}>
                  <h3 className="h-32 fw-800 mb-8" style={{color: 'white'}}>
                    {simulationResults.gapPoupanca >= 0 ? '+' : ''}{simulationResults.gapPoupanca.toLocaleString()}€
                  </h3>
                  <h5 className="h-21 fw-600 mb-4" style={{color: 'white'}}>
                    GAP DE REFORMA: {getGapStatus(simulationResults.gapPercentual)}
                  </h5>
                  <p className="h-14 fw-400" style={{color: 'white', opacity: 0.9}}>
                    {simulationResults.gapPercentual > 0 ? 
                      `Déficit de ${simulationResults.gapPercentual}%` : 
                      `Excedente de ${Math.abs(simulationResults.gapPercentual)}%`
                    }
                  </p>
                </div>

                {/* Key Metrics */}
                <div className="key-metrics mb-32">
                  <div className="row">
                    <div className="col-6">
                      <div className="metric-card mb-16" style={{background: '#e7f3ff', padding: '16px', borderRadius: '8px'}}>
                        <h6 className="h-14 fw-600 black mb-4">Montante Necessário</h6>
                        <p className="h-20 fw-700 color-primary">{simulationResults.montanteNecessario.toLocaleString()}€</p>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="metric-card mb-16" style={{background: '#f8f9fa', padding: '16px', borderRadius: '8px'}}>
                        <h6 className="h-14 fw-600 black mb-4">Projetado (Média)</h6>
                        <p className="h-20 fw-700" style={{color: simulationResults.poupancasProjetadasMedia >= simulationResults.montanteNecessario ? '#28a745' : '#dc3545'}}>
                          {simulationResults.poupancasProjetadasMedia.toLocaleString()}€
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Retirement Income Analysis */}
                <div className="income-analysis mb-32">
                  <h5 className="h-21 fw-600 black mb-16">Análise de Rendimento na Reforma</h5>
                  
                  <div className="income-comparison mb-16" style={{background: '#f8f9fa', padding: '16px', borderRadius: '8px'}}>
                    <div className="income-item mb-12" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                      <span className="h-14 fw-500 black">Rendimento Atual</span>
                      <span className="h-16 fw-700 black">{inputs.rendimentoMensalAtual.toLocaleString()}€/mês</span>
                    </div>
                    <div className="income-item mb-12" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                      <span className="h-14 fw-500 black">Rendimento Projetado (Reforma)</span>
                      <span className="h-16 fw-700 color-primary">{simulationResults.rendaMensalPossivel.toLocaleString()}€/mês</span>
                    </div>
                    <div className="income-item" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px', borderTop: '1px solid #dee2e6'}}>
                      <span className="h-14 fw-600 black">Taxa de Substituição</span>
                      <span className="h-16 fw-700" style={{color: simulationResults.taxaSubstituicao >= 70 ? '#28a745' : simulationResults.taxaSubstituicao >= 50 ? '#ffc107' : '#dc3545'}}>
                        {simulationResults.taxaSubstituicao}%
                      </span>
                    </div>
                  </div>

                  <div className="target-info" style={{background: '#fff3cd', padding: '12px', borderRadius: '6px'}}>
                    <small className="h-12 fw-500 black">
                      Meta recomendada: 70-80% do rendimento atual | Despesas planejadas: {inputs.despesasMensaisReforma.toLocaleString()}€/mês
                    </small>
                  </div>
                </div>

                {/* Investment Performance */}
                <div className="investment-performance mb-32">
                  <h5 className="h-21 fw-600 black mb-16">Performance do Investimento</h5>
                  
                  <div className="performance-metrics">
                    <div className="performance-item mb-12" style={{display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #e9ecef'}}>
                      <span className="h-14 fw-500 black">Total Investido</span>
                      <span className="h-14 fw-700 black">{simulationResults.contribuicaoTotalInvestida.toLocaleString()}€</span>
                    </div>
                    
                    <div className="performance-item mb-12" style={{display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #e9ecef'}}>
                      <span className="h-14 fw-500 black">Crescimento Total</span>
                      <span className="h-14 fw-700 color-primary">{simulationResults.crescimentoTotal.toLocaleString()}€</span>
                    </div>
                    
                    <div className="performance-item mb-12" style={{display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #e9ecef'}}>
                      <span className="h-14 fw-500 black">Retorno Anual Efetivo</span>
                      <span className="h-14 fw-700 color-primary">{simulationResults.retornoEfetivo}%</span>
                    </div>
                  </div>
                </div>

                {/* Risk Analysis */}
                <div className="risk-analysis mb-32">
                  <h5 className="h-21 fw-600 black mb-16">Análise de Risco (Monte Carlo)</h5>
                  
                  <div className="risk-ranges">
                    <div className="risk-item mb-8" style={{display: 'flex', justifyContent: 'space-between'}}>
                      <span className="h-14 fw-400 black">Cenário Pessimista (25%)</span>
                      <span className="h-14 fw-600" style={{color: '#dc3545'}}>{simulationResults.percentil25.toLocaleString()}€</span>
                    </div>
                    <div className="risk-item mb-8" style={{display: 'flex', justifyContent: 'space-between'}}>
                      <span className="h-14 fw-500 black">Cenário Mediano (50%)</span>
                      <span className="h-14 fw-700 black">{simulationResults.mediana.toLocaleString()}€</span>
                    </div>
                    <div className="risk-item mb-8" style={{display: 'flex', justifyContent: 'space-between'}}>
                      <span className="h-14 fw-400 black">Cenário Otimista (75%)</span>
                      <span className="h-14 fw-600" style={{color: '#28a745'}}>{simulationResults.percentil75.toLocaleString()}€</span>
                    </div>
                  </div>
                </div>

                {/* Recommendation */}
                <div className="recommendation mb-32" style={{background: '#e7f3ff', padding: '16px', borderRadius: '8px', border: '1px solid #b3d9ff'}}>
                  <h6 className="h-16 fw-600 black mb-8">Recomendação Estratégica</h6>
                  <p className="h-14 fw-400 black">{simulationResults.sugestao}</p>
                </div>

                {/* Annual Projection Table */}
                <div className="annual-projection">
                  <h5 className="h-21 fw-600 black mb-16">Projeção Anual</h5>
                  <div className="table-responsive" style={{maxHeight: '300px', overflowY: 'auto'}}>
                    <table className="table" style={{width: '100%', borderCollapse: 'collapse', fontSize: '12px'}}>
                      <thead>
                        <tr style={{background: '#f8f9fa', position: 'sticky', top: 0}}>
                          <th style={{padding: '8px 4px', borderBottom: '1px solid #dee2e6'}}>Ano</th>
                          <th style={{padding: '8px 4px', borderBottom: '1px solid #dee2e6'}}>Idade</th>
                          <th style={{padding: '8px 4px', borderBottom: '1px solid #dee2e6'}}>Salário/Mês</th>
                          <th style={{padding: '8px 4px', borderBottom: '1px solid #dee2e6'}}>Poupanças</th>
                        </tr>
                      </thead>
                      <tbody>
                        {simulationResults.projecaoAnual.map((row) => (
                          <tr key={row.ano}>
                            <td style={{padding: '6px 4px', borderBottom: '1px solid #dee2e6'}}>{row.ano}</td>
                            <td style={{padding: '6px 4px', borderBottom: '1px solid #dee2e6'}}>{row.idade}</td>
                            <td style={{padding: '6px 4px', borderBottom: '1px solid #dee2e6'}}>{row.rendimentoMensal.toLocaleString()}€</td>
                            <td style={{padding: '6px 4px', borderBottom: '1px solid #dee2e6', fontWeight: 'bold', color: '#198754'}}>
                              {row.poupancasAcumuladas.toLocaleString()}€
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Growth Visualization */}
                <div className="growth-visualization mt-32">
                  <h5 className="h-21 fw-600 black mb-16">Crescimento das Poupanças</h5>
                  <div style={{height: '80px', background: '#f8f9fa', borderRadius: '8px', padding: '8px', display: 'flex', alignItems: 'end', justifyContent: 'space-around'}}>
                    {simulationResults.projecaoAnual.filter((_, idx) => idx % Math.ceil(simulationResults.projecaoAnual.length / 20) === 0).map((row, idx) => {
                      const maxValue = Math.max(...simulationResults.projecaoAnual.map(r => r.poupancasAcumuladas))
                      const height = (row.poupancasAcumuladas / maxValue) * 60 + 5
                      return (
                        <div 
                          key={idx}
                          style={{
                            width: '8px',
                            height: `${height}px`,
                            background: 'linear-gradient(to top, #15a37a, #0d7f5f)',
                            borderRadius: '2px',
                            margin: '0 1px'
                          }}
                          title={`Ano ${row.ano}: ${row.poupancasAcumuladas.toLocaleString()}€`}
                        />
                      )
                    })}
                  </div>
                  <div style={{textAlign: 'center', marginTop: '8px'}}>
                    <small className="h-12 fw-400 dark-gray">
                      Evolução das poupanças até à reforma (amostra de anos)
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