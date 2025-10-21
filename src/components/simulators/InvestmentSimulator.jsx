import React, { useState, useMemo } from 'react'
import NumericInput from '../common/NumericInput'
import { useRequireAuth } from '../../hooks/useRequireAuth'

export default function InvestmentSimulator({ onOpenLogin }) {
  const { requireAuth, isAuthenticated } = useRequireAuth(onOpenLogin)
  const [inputs, setInputs] = useState({
    valorInicial: 10000,
    taxaRetornoAnualEsperada: 7,
    anos: 10,
    nivelRisco: 'medio',
    taxaComissoesAnual: parseFloat((0.01).toFixed(4)),
    taxaImpostoGanhos: parseFloat((0.28).toFixed(4)),
    taxaInflacaoAnual: parseFloat((0.024).toFixed(4)),
    contribuicoesAnuais: 1200,
    numSimulacoes: 500,
    fatorDiversificacao: 0.8
  })

  const [errors, setErrors] = useState({})
  const [isCalculating, setIsCalculating] = useState(false)

  // Function to format percentage values without unnecessary decimal zeros
  const formatPercentage = (value) => {
    return Number(value).toLocaleString('pt-PT', {
      minimumFractionDigits: 0, 
      maximumFractionDigits: 2
    });
  }

  const handleInputChange = (field, value) => {
    // Handle string values for dropdown
    if (field === 'nivelRisco') {
      setInputs(prev => ({ ...prev, [field]: value }))
    } else {
      // Parse number value
      const numValue = parseFloat(value) || 0
      
      // Check if this is a percentage field that needs decimal limiting
      const isPercentageField = field === 'taxaRetornoAnualEsperada' || 
        field === 'taxaComissoesAnual' || 
        field === 'taxaImpostoGanhos' || 
        field === 'taxaInflacaoAnual'
      
      // Limit decimal places for percentage fields
      const finalValue = isPercentageField ? 
        parseFloat(numValue.toFixed(4)) : numValue
      
      setInputs(prev => ({ ...prev, [field]: finalValue }))
    }
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }))
    }
  }

  const validateInputs = () => {
    const newErrors = {}
    const { valorInicial, anos, numSimulacoes } = inputs
    
    if (valorInicial < 0) {
      newErrors.valorInicial = "Valor inicial deve ser positivo"
    }
    if (anos <= 0) {
      newErrors.anos = "Anos deve ser maior que 0"
    }
    if (numSimulacoes <= 0 || numSimulacoes > 10000) {
      newErrors.numSimulacoes = "Número de simulações deve estar entre 1 e 10,000"
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Gaussian random number generator (Box-Muller transform)
  const gaussianRandom = (mean = 0, stdDev = 1) => {
    let u = 0, v = 0;
    while(u === 0) u = Math.random(); // Converting [0,1) to (0,1)
    while(v === 0) v = Math.random();
    let z = Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
    return z * stdDev + mean;
  }

  const simulationResults = useMemo(() => {
    if (!validateInputs()) return null

    setIsCalculating(true)

    const {
      valorInicial,
      taxaRetornoAnualEsperada,
      anos,
      nivelRisco,
      taxaComissoesAnual,
      taxaImpostoGanhos,
      taxaInflacaoAnual,
      contribuicoesAnuais,
      numSimulacoes,
      fatorDiversificacao
    } = inputs

    // Risk adjustments (volatility as approximate standard deviation, adjusted by diversification)
    const volatilidades = { 'baixo': 0.05, 'medio': 0.10, 'alto': 0.15 }
    const volatilidade = (volatilidades[nivelRisco.toLowerCase()] || 0.10) * fatorDiversificacao
    
    const taxaRetornoLiquida = (taxaRetornoAnualEsperada / 100) - taxaComissoesAnual - (taxaInflacaoAnual / 2)
    
    const valoresFinais = []
    
    // Monte Carlo simulation
    for (let sim = 0; sim < numSimulacoes; sim++) {
      let valorAtual = valorInicial
      
      for (let ano = 0; ano < anos; ano++) {
        // Simulate annual return with volatility (normal distribution)
        const retornoAnualAjustado = taxaRetornoLiquida + gaussianRandom(0, volatilidade)
        valorAtual = valorAtual * (1 + retornoAnualAjustado) + contribuicoesAnuais
      }
      
      // Adjust for gains tax
      const ganho = valorAtual - valorInicial - (contribuicoesAnuais * anos)
      const imposto = Math.max(0, ganho * taxaImpostoGanhos)
      const valorFinalLiquido = valorAtual - imposto
      
      // Adjust for total compound inflation
      const inflacaoTotal = Math.pow(1 + taxaInflacaoAnual, anos)
      const poderCompra = valorFinalLiquido / inflacaoTotal
      
      valoresFinais.push(poderCompra)
    }
    
    // Enhanced statistics (95% confidence)
    valoresFinais.sort((a, b) => a - b)
    const media = valoresFinais.reduce((sum, val) => sum + val, 0) / valoresFinais.length
    const mediana = valoresFinais[Math.floor(valoresFinais.length / 2)]
    const intervaloConfianca95 = [
      valoresFinais[Math.floor(0.025 * numSimulacoes)],
      valoresFinais[Math.floor(0.975 * numSimulacoes)]
    ]
    
    // Additional statistics
    const minimo = valoresFinais[0]
    const maximo = valoresFinais[valoresFinais.length - 1]
    const desvioPadrao = Math.sqrt(
      valoresFinais.reduce((sum, val) => sum + Math.pow(val - media, 2), 0) / valoresFinais.length
    )
    
    // Probability of loss
    const probabilidadePrejuizo = (valoresFinais.filter(val => val < valorInicial).length / numSimulacoes) * 100
    
    // Enhanced suggestion
    let sugestao
    if (volatilidade > 0.10) {
      sugestao = `Para risco ${nivelRisco}, considere maior diversificação (fator <1) para reduzir volatilidade em até 20%.`
    } else {
      sugestao = `Risco gerível. Monitore inflação (${(taxaInflacaoAnual * 100).toFixed(1)}%) para ajustes anuais.`
    }
    
    // Return analysis
    const retornoTotalEsperado = ((media - valorInicial) / valorInicial) * 100
    const retornoAnualComposto = (Math.pow(media / valorInicial, 1/anos) - 1) * 100

    setTimeout(() => setIsCalculating(false), 100)

    return {
      valorMedioProjetado: Math.round(media * 100) / 100,
      medianaProjetada: Math.round(mediana * 100) / 100,
      intervalo95PorCento: [
        Math.round(intervaloConfianca95[0] * 100) / 100,
        Math.round(intervaloConfianca95[1] * 100) / 100
      ],
      minimo: Math.round(minimo * 100) / 100,
      maximo: Math.round(maximo * 100) / 100,
      desvioPadrao: Math.round(desvioPadrao * 100) / 100,
      probabilidadePrejuizo: Math.round(probabilidadePrejuizo * 10) / 10,
      retornoTotalEsperado: Math.round(retornoTotalEsperado * 10) / 10,
      retornoAnualComposto: Math.round(retornoAnualComposto * 10) / 10,
      riscoNivel: nivelRisco,
      sugestao,
      valoresFinais: valoresFinais.slice(0, 100) // Sample for chart
    }
  }, [inputs])

  const exportToCSVAction = () => {
    if (!simulationResults) return
    
    const csvContent = [
      ['Simulação', 'Poder de Compra'],
      ...simulationResults.valoresFinais.map((val, idx) => [idx + 1, val])
    ].map(row => row.join(',')).join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'investimentos_simulacoes.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const exportToCSV = requireAuth(exportToCSVAction)

  const getRiskColor = (nivel) => {
    switch(nivel.toLowerCase()) {
      case 'baixo': return '#28a745'
      case 'medio': return '#ffc107'
      case 'alto': return '#dc3545'
      default: return '#6c757d'
    }
  }

  return (
    <div className="investment-simulator">
      <div className="container-fluid">
        <div className="heading mb-48">
          <h2 className="black mb-24">
            <span className="banner-text" title="SIMULADOR DE INVESTIMENTOS">SIMULADOR DE INVESTIMENTOS</span>
          </h2>
          <p className="h-16 body-text dark-gray">
            Simule risco e retorno de investimentos com análise Monte Carlo para 500+ cenários
          </p>
        </div>

        <div className="row">
          {/* Input Form */}
          <div className="col-xl-6 col-lg-6">
            <div className="simulator-inputs">
              <h4 className="h-28 fw-700 black mb-24">Parâmetros do Investimento</h4>
              
              {Object.keys(errors).length > 0 && (
                <div className="alert alert-danger mb-16" style={{color: '#d63384', background: '#f8d7da', padding: '12px', borderRadius: '8px'}}>
                  {Object.values(errors).join(', ')}
                </div>
              )}

              <div className="input-group mb-24">
                <label className="h-16 fw-500 black mb-8">Valor Inicial (€)</label>
                <NumericInput
                  value={inputs.valorInicial}
                  onValue={(v) => handleInputChange('valorInicial', v)}
                  min={0}
                  step={100}
                />
              </div>

              <div className="input-group mb-24">
                <label className="h-16 fw-500 black mb-8">Taxa de Retorno Anual Esperada (%)</label>
                <NumericInput
                  value={inputs.taxaRetornoAnualEsperada}
                  onValue={(v) => handleInputChange('taxaRetornoAnualEsperada', v)}
                  min={0}
                  max={30}
                  step={0.1}
                />
                <small className="h-12 fw-400 dark-gray mt-4">Ações: ~7%, Obrigações: ~3%, Misto: ~5%</small>
              </div>

              <div className="input-group mb-24">
                <label className="h-16 fw-500 black mb-8">Horizonte Temporal (Anos)</label>
                <NumericInput
                  value={inputs.anos}
                  onValue={(v) => handleInputChange('anos', v)}
                  min={1}
                  max={50}
                  step={1}
                />
              </div>

              <div className="input-group mb-24">
                <label className="h-16 fw-500 black mb-8">Nível de Risco</label>
                <select
                  className="form-control"
                  value={inputs.nivelRisco}
                  onChange={(e) => handleInputChange('nivelRisco', e.target.value)}
                  style={{color: getRiskColor(inputs.nivelRisco)}}
                >
                  <option value="baixo">Baixo (Volatilidade ~5%)</option>
                  <option value="medio">Médio (Volatilidade ~10%)</option>
                  <option value="alto">Alto (Volatilidade ~15%)</option>
                </select>
              </div>

              <div className="input-group mb-24">
                <label className="h-16 fw-500 black mb-8">Contribuições Anuais (€)</label>
                <NumericInput
                  value={inputs.contribuicoesAnuais}
                  onValue={(v) => handleInputChange('contribuicoesAnuais', v)}
                  min={0}
                  step={100}
                />
              </div>

              <div className="input-group mb-24">
                <label className="h-16 fw-500 black mb-8">Fator de Diversificação</label>
                <input
                  type="range"
                  className="form-control"
                  value={inputs.fatorDiversificacao}
                  onChange={(e) => handleInputChange('fatorDiversificacao', e.target.value)}
                  min="0.1"
                  max="1.5"
                  step="0.1"
                  style={{height: '6px'}}
                />
                <div style={{display: 'flex', justifyContent: 'space-between', marginTop: '4px'}}>
                  <small className="h-12 fw-400 dark-gray">Mais Diversificado (0.1)</small>
                  <small className="h-14 fw-500 black">{inputs.fatorDiversificacao}</small>
                  <small className="h-12 fw-400 dark-gray">Menos Diversificado (1.5)</small>
                </div>
              </div>

              <div className="advanced-options" style={{marginTop: '32px'}}>
                <h5 className="h-21 fw-600 black mb-16">Opções Avançadas</h5>
                
                <div className="input-group mb-16">
                  <label className="h-14 fw-400 black mb-4">Taxa de Comissões Anual (%)</label>
                  <NumericInput
                    value={inputs.taxaComissoesAnual}
                    percent
                    onValue={(v) => handleInputChange('taxaComissoesAnual', v)}
                    min={0}
                    max={5}
                    step={0.01}
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
                    step={0.01}
                  />
                </div>

                <div className="input-group mb-16">
                  <label className="h-14 fw-400 black mb-4">Taxa de Inflação Anual (%)</label>
                  <NumericInput
                    value={inputs.taxaInflacaoAnual}
                    percent
                    onValue={(v) => handleInputChange('taxaInflacaoAnual', v)}
                    min={0}
                    max={10}
                    step={0.01}
                  />
                </div>

                <div className="input-group mb-16">
                  <label className="h-14 fw-400 black mb-4">Número de Simulações</label>
                  <NumericInput
                    value={inputs.numSimulacoes}
                    onValue={(v) => handleInputChange('numSimulacoes', v)}
                    min={100}
                    max={10000}
                    step={100}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="col-xl-6 col-lg-6">
            {isCalculating && (
              <div className="calculating-indicator mb-24" style={{textAlign: 'center', padding: '20px'}}>
                <div style={{fontSize: '16px', marginBottom: '8px'}}>Executando {inputs.numSimulacoes} simulações Monte Carlo...</div>
                <div style={{width: '100%', height: '4px', background: '#f0f0f0', borderRadius: '2px', overflow: 'hidden'}}>
                  <div style={{width: '100%', height: '100%', background: 'linear-gradient(45deg, #15a37a, #0d7f5f)', animation: 'pulse 1.5s infinite'}}></div>
                </div>
              </div>
            )}

            {simulationResults && !isCalculating && (
              <div className="simulator-results">
                <div className="results-header" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px'}}>
                  <h4 className="h-28 fw-700 black">Análise de Risco e Retorno</h4>
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

                {/* Key Metrics */}
                <div className="key-metrics mb-32">
                  <div className="row">
                    <div className="col-6">
                      <div className="metric-card mb-16" style={{background: '#e7f3ff', padding: '16px', borderRadius: '8px'}}>
                        <h6 className="h-14 fw-600 black mb-4">Valor Médio Projetado</h6>
                        <p className="h-24 fw-700 color-primary">{simulationResults.valorMedioProjetado.toLocaleString()}€</p>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="metric-card mb-16" style={{background: '#f8f9fa', padding: '16px', borderRadius: '8px'}}>
                        <h6 className="h-14 fw-600 black mb-4">Retorno Total Esperado</h6>
                        <p className="h-24 fw-700" style={{color: simulationResults.retornoTotalEsperado >= 0 ? '#28a745' : '#dc3545'}}>
                          {simulationResults.retornoTotalEsperado > 0 ? '+' : ''}{simulationResults.retornoTotalEsperado}%
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Risk Analysis */}
                <div className="risk-analysis mb-32">
                  <h5 className="h-21 fw-600 black mb-16">Análise de Risco</h5>
                  
                  <div className="risk-indicator mb-16" style={{padding: '16px', background: '#f8f9fa', borderRadius: '8px', border: `3px solid ${getRiskColor(inputs.nivelRisco)}`}}>
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                      <span className="h-16 fw-600 black">Nível de Risco: {inputs.nivelRisco.toUpperCase()}</span>
                      <span className="h-16 fw-700" style={{color: getRiskColor(inputs.nivelRisco)}}>
                        {simulationResults.probabilidadePrejuizo}% chance de prejuízo
                      </span>
                    </div>
                  </div>

                  <div className="confidence-interval mb-16">
                    <h6 className="h-16 fw-600 black mb-8">Intervalo de Confiança 95%</h6>
                    <div style={{display: 'flex', justifyContent: 'space-between', background: '#fff3cd', padding: '12px', borderRadius: '6px'}}>
                      <span className="h-14 fw-500 black">Pessimista: {simulationResults.intervalo95PorCento[0].toLocaleString()}€</span>
                      <span className="h-14 fw-500 black">Otimista: {simulationResults.intervalo95PorCento[1].toLocaleString()}€</span>
                    </div>
                  </div>

                  <div className="statistics-grid">
                    <div className="row">
                      <div className="col-6 mb-8">
                        <div style={{display: 'flex', justifyContent: 'space-between'}}>
                          <span className="h-14 fw-400 black">Mediana:</span>
                          <span className="h-14 fw-600 black">{simulationResults.medianaProjetada.toLocaleString()}€</span>
                        </div>
                      </div>
                      <div className="col-6 mb-8">
                        <div style={{display: 'flex', justifyContent: 'space-between'}}>
                          <span className="h-14 fw-400 black">Desvio Padrão:</span>
                          <span className="h-14 fw-600 black">{simulationResults.desvioPadrao.toLocaleString()}€</span>
                        </div>
                      </div>
                      <div className="col-6 mb-8">
                        <div style={{display: 'flex', justifyContent: 'space-between'}}>
                          <span className="h-14 fw-400 black">Mínimo:</span>
                          <span className="h-14 fw-600 black">{simulationResults.minimo.toLocaleString()}€</span>
                        </div>
                      </div>
                      <div className="col-6 mb-8">
                        <div style={{display: 'flex', justifyContent: 'space-between'}}>
                          <span className="h-14 fw-400 black">Máximo:</span>
                          <span className="h-14 fw-600 black">{simulationResults.maximo.toLocaleString()}€</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Performance Metrics */}
                <div className="performance-metrics mb-32">
                  <h5 className="h-21 fw-600 black mb-16">Métricas de Performance</h5>
                  
                  <div className="performance-item mb-12" style={{display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #e9ecef'}}>
                    <span className="h-14 fw-500 black">Retorno Anual Composto</span>
                    <span className="h-14 fw-700 color-primary">{simulationResults.retornoAnualComposto}%</span>
                  </div>
                  
                  <div className="performance-item mb-12" style={{display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #e9ecef'}}>
                    <span className="h-14 fw-500 black">Contribuições Totais</span>
                    <span className="h-14 fw-600 black">{(inputs.contribuicoesAnuais * inputs.anos).toLocaleString()}€</span>
                  </div>
                  
                  <div className="performance-item mb-12" style={{display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #e9ecef'}}>
                    <span className="h-14 fw-500 black">Investimento Total</span>
                    <span className="h-14 fw-600 black">{(inputs.valorInicial + inputs.contribuicoesAnuais * inputs.anos).toLocaleString()}€</span>
                  </div>
                </div>

                {/* Suggestion */}
                <div className="suggestion mb-32" style={{background: '#e7f3ff', padding: '16px', borderRadius: '8px', border: '1px solid #b3d9ff'}}>
                  <h6 className="h-16 fw-600 black mb-8">Recomendação</h6>
                  <p className="h-14 fw-400 black">{simulationResults.sugestao}</p>
                </div>

                {/* Simple Distribution Visualization */}
                <div className="distribution-chart">
                  <h5 className="h-21 fw-600 black mb-16">Distribuição de Resultados (Amostra)</h5>
                  <div style={{height: '200px', background: '#f8f9fa', borderRadius: '8px', padding: '16px', display: 'flex', alignItems: 'end', justifyContent: 'space-around'}}>
                    {simulationResults.valoresFinais.slice(0, 20).map((val, idx) => {
                      const height = ((val - simulationResults.minimo) / (simulationResults.maximo - simulationResults.minimo)) * 150
                      return (
                        <div 
                          key={idx}
                          style={{
                            width: '8px',
                            height: `${height}px`,
                            background: val >= inputs.valorInicial ? '#28a745' : '#dc3545',
                            borderRadius: '2px'
                          }}
                          title={`Simulação ${idx + 1}: ${val.toLocaleString()}€`}
                        />
                      )
                    })}
                  </div>
                  <div style={{textAlign: 'center', marginTop: '8px'}}>
                    <small className="h-12 fw-400 dark-gray">
                      Verde: Ganho | Vermelho: Prejuízo | Amostra de 20 simulações
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