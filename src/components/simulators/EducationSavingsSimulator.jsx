import React, { useState, useMemo } from 'react'
import NumericInput from '../common/NumericInput'
import { useRequireAuth } from '../../hooks/useRequireAuth'

export default function EducationSavingsSimulator({ onOpenLogin }) {
  const { requireAuth, isAuthenticated } = useRequireAuth(onOpenLogin)
  const [inputs, setInputs] = useState({
    idadeAtualCrianca: 5,
    idadeEnsinoSuperior: 18,
    custoAnualEducacao: 6000,
    taxaCrescimentoCustos: 0.05,
    poupancasIniciais: 1000,
    contribuicoesMensais: 150,
    taxaRetornoAnual: 0.04,
    taxaInflacaoAnual: 0.024,
    duracaoEducacao: 4,
    subsidioEstatal: 0, // Annual state subsidy/scholarship
    tipoEducacao: 'publica', // publica, privada, internacional
    custoExtra: 0 // Additional costs (books, accommodation, etc.)
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

  const handleSelectChange = (field, value) => {
    setInputs(prev => ({ ...prev, [field]: value }))
    
    // Auto-adjust education costs based on type
    if (field === 'tipoEducacao') {
      let custoBase
      switch (value) {
        case 'publica':
          custoBase = 6000 // Public university in Portugal
          break
        case 'privada':
          custoBase = 12000 // Private university
          break
        case 'internacional':
          custoBase = 25000 // International/abroad
          break
        default:
          custoBase = 6000
      }
      setInputs(prev => ({ ...prev, custoAnualEducacao: custoBase }))
    }
  }

  const validateInputs = () => {
    const newErrors = {}
    const { idadeAtualCrianca, idadeEnsinoSuperior, duracaoEducacao, contribuicoesMensais } = inputs
    
    if (idadeAtualCrianca >= idadeEnsinoSuperior) {
      newErrors.idadeAtualCrianca = "Idade da criança deve ser inferior à idade de entrada no ensino superior"
    }
    if (idadeAtualCrianca < 0 || idadeAtualCrianca > 17) {
      newErrors.idadeAtualCrianca = "Idade deve estar entre 0 e 17 anos"
    }
    if (duracaoEducacao < 1 || duracaoEducacao > 8) {
      newErrors.duracaoEducacao = "Duração deve estar entre 1 e 8 anos"
    }
    if (contribuicoesMensais < 0) {
      newErrors.contribuicoesMensais = "Contribuições não podem ser negativas"
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const educationAnalysis = useMemo(() => {
    if (!validateInputs()) return null

    const {
      idadeAtualCrianca,
      idadeEnsinoSuperior,
      custoAnualEducacao,
      taxaCrescimentoCustos,
      poupancasIniciais,
      contribuicoesMensais,
      taxaRetornoAnual,
      taxaInflacaoAnual,
      duracaoEducacao,
      subsidioEstatal,
      custoExtra
    } = inputs

    const anosAteInicio = idadeEnsinoSuperior - idadeAtualCrianca
    
    // Calculate total education costs with inflation
    let custosTotaisEducacao = 0
    const custosAnuais = []
    
    for (let ano = 0; ano < duracaoEducacao; ano++) {
      const anoEducacao = anosAteInicio + ano
      const custoAnualAjustado = (custoAnualEducacao + custoExtra) * Math.pow(1 + taxaCrescimentoCustos, anoEducacao)
      const subsidioAjustado = subsidioEstatal * Math.pow(1 + taxaInflacaoAnual, anoEducacao)
      const custoLiquido = Math.max(0, custoAnualAjustado - subsidioAjustado)
      
      custosAnuais.push({
        ano: ano + 1,
        custoAnual: Math.round(custoAnualAjustado),
        subsidio: Math.round(subsidioAjustado),
        custoLiquido: Math.round(custoLiquido)
      })
      
      custosTotaisEducacao += custoLiquido
    }

    // Calculate savings projection with compound interest
    let poupancasProjetadas = poupancasIniciais
    const projecaoAnual = []
    
    for (let ano = 1; ano <= anosAteInicio; ano++) {
      // Annual compound interest on existing savings
      poupancasProjetadas *= (1 + taxaRetornoAnual)
      
      // Add monthly contributions compounded monthly
      const contribuicaoAnual = contribuicoesMensais * 12
      const taxaRetornoMensal = taxaRetornoAnual / 12
      
      // Future value of annuity (monthly contributions)
      let valorContribuicoes = 0
      for (let mes = 1; mes <= 12; mes++) {
        valorContribuicoes += contribuicoesMensais * Math.pow(1 + taxaRetornoMensal, 12 - mes)
      }
      
      poupancasProjetadas += valorContribuicoes
      
      projecaoAnual.push({
        ano,
        idadeCrianca: idadeAtualCrianca + ano,
        saldoInicial: Math.round(poupancasProjetadas - valorContribuicoes - (poupancasProjetadas / (1 + taxaRetornoAnual))),
        contribuicoes: Math.round(contribuicaoAnual),
        juros: Math.round((poupancasProjetadas - valorContribuicoes) - (poupancasProjetadas / (1 + taxaRetornoAnual))),
        saldoFinal: Math.round(poupancasProjetadas)
      })
    }

    // Calculate financing gap
    const gapFinanciamento = custosTotaisEducacao - poupancasProjetadas
    
    // Calculate required monthly contribution to meet target
    let contribuicaoNecessaria = 0
    if (gapFinanciamento > 0 && anosAteInicio > 0) {
      // Using present value of annuity formula
      const taxaMensal = taxaRetornoAnual / 12
      const numMeses = anosAteInicio * 12
      const valorFuturoNecessario = custosTotaisEducacao - (poupancasIniciais * Math.pow(1 + taxaRetornoAnual, anosAteInicio))
      
      if (taxaMensal > 0) {
        contribuicaoNecessaria = valorFuturoNecessario / (((Math.pow(1 + taxaMensal, numMeses) - 1) / taxaMensal) * Math.pow(1 + taxaMensal, -numMeses) * Math.pow(1 + taxaRetornoAnual, anosAteInicio))
      } else {
        contribuicaoNecessaria = valorFuturoNecessario / numMeses
      }
    }

    // Performance metrics
    const totalContribuicoes = poupancasIniciais + (contribuicoesMensais * 12 * anosAteInicio)
    const totalJuros = poupancasProjetadas - totalContribuicoes
    const taxaRetornoEfetiva = anosAteInicio > 0 ? Math.pow(poupancasProjetadas / poupancasIniciais, 1/anosAteInicio) - 1 : 0

    // Coverage analysis
    const percentualCobertura = (poupancasProjetadas / custosTotaisEducacao) * 100
    let statusCobertura
    let corStatus
    
    if (percentualCobertura >= 100) {
      statusCobertura = "Objetivo Alcançado"
      corStatus = "#28a745"
    } else if (percentualCobertura >= 80) {
      statusCobertura = "Quase Suficiente"
      corStatus = "#ffc107"
    } else if (percentualCobertura >= 50) {
      statusCobertura = "Parcialmente Coberto"
      corStatus = "#fd7e14"
    } else {
      statusCobertura = "Insuficiente"
      corStatus = "#dc3545"
    }

    // Enhanced suggestions based on Portuguese context
    let sugestao
    if (gapFinanciamento > 0) {
      const aumentoNecessario = contribuicaoNecessaria - contribuicoesMensais
      if (aumentoNecessario > 0) {
        sugestao = `Aumente contribuições em ${Math.round(aumentoNecessario)}€/mês. Considere Certificados de Aforro ou contas poupança educação com benefícios fiscais.`
      } else {
        sugestao = `Gap de ${Math.round(gapFinanciamento)}€. Explore bolsas de estudo, crédito estudantil ou trabalho part-time durante os estudos.`
      }
    } else {
      const excesso = Math.abs(gapFinanciamento)
      if (excesso > custosTotaisEducacao * 0.2) {
        sugestao = `Poupança excessiva de ${Math.round(excesso)}€. Considere reduzir contribuições ou diversificar investimentos para outros objetivos familiares.`
      } else {
        sugestao = `Poupança suficiente! Mantenha disciplina e considere PPR Educação ou seguros de educação para otimização fiscal.`
      }
    }

    // Education cost breakdown by type
    const custoMedio = {
      publica: { propina: 697, residencia: 3600, alimentacao: 1800, material: 600, total: 6697 },
      privada: { propina: 6500, residencia: 3600, alimentacao: 1800, material: 800, total: 12700 },
      internacional: { propina: 15000, residencia: 8000, alimentacao: 3000, material: 1000, total: 27000 }
    }

    return {
      // Costs
      custosTotaisEducacao: Math.round(custosTotaisEducacao),
      custosAnuais,
      
      // Savings
      poupancasProjetadas: Math.round(poupancasProjetadas),
      projecaoAnual,
      
      // Gap Analysis
      gapFinanciamento: Math.round(gapFinanciamento),
      contribuicaoNecessaria: Math.round(contribuicaoNecessaria),
      percentualCobertura: Math.round(percentualCobertura * 100) / 100,
      statusCobertura,
      corStatus,
      
      // Performance
      totalContribuicoes: Math.round(totalContribuicoes),
      totalJuros: Math.round(totalJuros),
      taxaRetornoEfetiva: Math.round(taxaRetornoEfetiva * 10000) / 100,
      
      // Timeline
      anosAteInicio,
      
      // Recommendations
      sugestao,
      custoMedio: custoMedio[inputs.tipoEducacao]
    }
  }, [inputs])

  const exportToCSVAction = () => {
    if (!educationAnalysis) return
    
    const csvContent = [
      ['Ano Educação', 'Custo Anual', 'Subsídio', 'Custo Líquido'],
      ...educationAnalysis.custosAnuais.map(row => [
        row.ano, row.custoAnual, row.subsidio, row.custoLiquido
      ]),
      [],
      ['Ano Poupança', 'Idade Criança', 'Saldo Inicial', 'Contribuições', 'Juros', 'Saldo Final'],
      ...educationAnalysis.projecaoAnual.map(row => [
        row.ano, row.idadeCrianca, row.saldoInicial, row.contribuicoes, row.juros, row.saldoFinal
      ])
    ].map(row => row.join(',')).join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'educacao_projecoes.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const exportToCSV = requireAuth(exportToCSVAction)

  const getProgressColor = (percentage) => {
    if (percentage >= 100) return '#28a745'
    if (percentage >= 80) return '#ffc107'
    if (percentage >= 50) return '#fd7e14'
    return '#dc3545'
  }

  return (
    <div className="education-savings-simulator">
      <div className="container-fluid">
        <div className="heading mb-48">
          <h2 className="black mb-24">
            <span className="banner-text" title="SIMULADOR DE POUPANÇA EDUCAÇÃO">SIMULADOR DE POUPANÇA EDUCAÇÃO</span>
          </h2>
          <p className="h-16 body-text dark-gray">
            Planeie antecipadamente os custos do ensino superior com projeções detalhadas
          </p>
        </div>

        <div className="row">
          {/* Input Form */}
          <div className="col-xl-6 col-lg-6">
            <div className="simulator-inputs">
              <h4 className="h-28 fw-700 black mb-24">Dados da Criança e Educação</h4>
              
              {Object.keys(errors).length > 0 && (
                <div className="alert alert-danger mb-16" style={{color: '#d63384', background: '#f8d7da', padding: '12px', borderRadius: '8px'}}>
                  {Object.values(errors).join(', ')}
                </div>
              )}

              <div className="child-info mb-32" style={{background: '#e7f3ff', padding: '16px', borderRadius: '8px'}}>
                <h5 className="h-21 fw-600 black mb-16">Informação da Criança</h5>
                
                <div className="input-group mb-16">
                  <label className="h-14 fw-500 black mb-4">Idade Atual da Criança</label>
                  <NumericInput
                    value={inputs.idadeAtualCrianca}
                    onValue={(v) => handleInputChange('idadeAtualCrianca', v)}
                    min={0}
                    max={17}
                    step={1}
                  />
                </div>

                <div className="input-group mb-16">
                  <label className="h-14 fw-500 black mb-4">Idade de Entrada no Ensino Superior</label>
                  <NumericInput
                    value={inputs.idadeEnsinoSuperior}
                    onValue={(v) => handleInputChange('idadeEnsinoSuperior', v)}
                    min={16}
                    max={25}
                    step={1}
                  />
                </div>

                <div className="input-group mb-16">
                  <label className="h-14 fw-500 black mb-4">Tipo de Educação</label>
                  <select
                    className="form-control"
                    value={inputs.tipoEducacao}
                    onChange={(e) => handleSelectChange('tipoEducacao', e.target.value)}
                  >
                    <option value="publica">Universidade Pública (Portugal)</option>
                    <option value="privada">Universidade Privada</option>
                    <option value="internacional">Ensino Internacional/Estrangeiro</option>
                  </select>
                </div>

                <div className="input-group">
                  <label className="h-14 fw-500 black mb-4">Duração da Educação (Anos)</label>
                  <NumericInput
                    value={inputs.duracaoEducacao}
                    onValue={(v) => handleInputChange('duracaoEducacao', v)}
                    min={1}
                    max={8}
                    step={1}
                  />
                  <small className="h-12 fw-400 dark-gray mt-4">Licenciatura: 3 anos | Mestrado: +2 anos</small>
                </div>
              </div>

              <div className="cost-info mb-32">
                <h5 className="h-21 fw-600 black mb-16">Custos Educacionais</h5>
                
                <div className="input-group mb-16">
                  <label className="h-14 fw-500 black mb-4">Custo Anual Total Atual (€)</label>
                  <NumericInput
                    value={inputs.custoAnualEducacao}
                    onValue={(v) => handleInputChange('custoAnualEducacao', v)}
                    min={500}
                    step={100}
                  />
                  <small className="h-12 fw-400 dark-gray mt-4">Inclui propinas, alimentação, material didático</small>
                </div>

                <div className="input-group mb-16">
                  <label className="h-14 fw-500 black mb-4">Custos Extras Anuais (€)</label>
                  <NumericInput
                    value={inputs.custoExtra}
                    onValue={(v) => handleInputChange('custoExtra', v)}
                    min={0}
                    step={50}
                  />
                  <small className="h-12 fw-400 dark-gray mt-4">Residência universitária, transporte, etc.</small>
                </div>

                <div className="input-group mb-16">
                  <label className="h-14 fw-500 black mb-4">Taxa de Crescimento dos Custos (%)</label>
                  <NumericInput
                    value={inputs.taxaCrescimentoCustos}
                    percent
                    onValue={(v) => handleInputChange('taxaCrescimentoCustos', v)}
                    min={0}
                    max={15}
                    step={0.1}
                  />
                  <small className="h-12 fw-400 dark-gray mt-4">Inflação específica dos custos educacionais</small>
                </div>

                <div className="input-group">
                  <label className="h-14 fw-500 black mb-4">Subsídio/Bolsa Estatal Anual (€)</label>
                  <NumericInput
                    value={inputs.subsidioEstatal}
                    onValue={(v) => handleInputChange('subsidioEstatal', v)}
                    min={0}
                    step={50}
                  />
                  <small className="h-12 fw-400 dark-gray mt-4">Bolsa de estudo ou apoios sociais esperados</small>
                </div>
              </div>

              <div className="savings-info">
                <h5 className="h-21 fw-600 black mb-16">Plano de Poupança</h5>
                
                <div className="input-group mb-16">
                  <label className="h-14 fw-500 black mb-4">Poupanças Iniciais (€)</label>
                  <NumericInput
                    value={inputs.poupancasIniciais}
                    onValue={(v) => handleInputChange('poupancasIniciais', v)}
                    min={0}
                    step={100}
                  />
                </div>

                <div className="input-group mb-16">
                  <label className="h-14 fw-500 black mb-4">Contribuições Mensais (€)</label>
                  <NumericInput
                    value={inputs.contribuicoesMensais}
                    onValue={(v) => handleInputChange('contribuicoesMensais', v)}
                    min={0}
                    step={10}
                  />
                </div>

                <div className="input-group mb-16">
                  <label className="h-14 fw-500 black mb-4">Taxa de Retorno Anual (%)</label>
                  <NumericInput
                    value={inputs.taxaRetornoAnual}
                    percent
                    onValue={(v) => handleInputChange('taxaRetornoAnual', v)}
                    min={0}
                    max={12}
                    step={0.1}
                  />
                  <small className="h-12 fw-400 dark-gray mt-4">Certificados, PPR, fundos de investimento</small>
                </div>

                <div className="input-group">
                  <label className="h-14 fw-500 black mb-4">Taxa de Inflação Geral (%)</label>
                  <NumericInput
                    value={inputs.taxaInflacaoAnual}
                    percent
                    onValue={(v) => handleInputChange('taxaInflacaoAnual', v)}
                    min={0}
                    max={10}
                    step={0.1}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="col-xl-6 col-lg-6">
            {educationAnalysis && (
              <div className="simulator-results">
                <div className="results-header" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px'}}>
                  <h4 className="h-28 fw-700 black">Análise de Poupança Educacional</h4>
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

                {/* Coverage Status */}
                <div className="coverage-status mb-32" style={{
                  background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)', 
                  padding: '20px', 
                  borderRadius: '12px',
                  border: `3px solid ${educationAnalysis.corStatus}`
                }}>
                  <div style={{textAlign: 'center'}}>
                    <h5 className="h-24 fw-700 black mb-8">{educationAnalysis.statusCobertura}</h5>
                    <div className="coverage-percentage" style={{fontSize: '36px', fontWeight: 'bold', color: educationAnalysis.corStatus, marginBottom: '12px'}}>
                      {educationAnalysis.percentualCobertura}%
                    </div>
                    <div className="progress-bar" style={{
                      width: '100%', 
                      height: '12px', 
                      backgroundColor: '#e9ecef', 
                      borderRadius: '6px', 
                      overflow: 'hidden',
                      marginBottom: '16px'
                    }}>
                      <div style={{
                        width: `${Math.min(educationAnalysis.percentualCobertura, 100)}%`,
                        height: '100%',
                        backgroundColor: getProgressColor(educationAnalysis.percentualCobertura),
                        transition: 'width 0.3s ease'
                      }}></div>
                    </div>
                    <p className="h-14 fw-500 black">
                      Cobertura dos custos educacionais em {educationAnalysis.anosAteInicio} anos
                    </p>
                  </div>
                </div>

                {/* Cost vs Savings Summary */}
                <div className="cost-savings-summary mb-32">
                  <div className="row">
                    <div className="col-6">
                      <div className="cost-card" style={{background: '#fff3cd', padding: '16px', borderRadius: '8px', textAlign: 'center'}}>
                        <h6 className="h-14 fw-600 black mb-8">Custo Total Necessário</h6>
                        <p className="h-24 fw-700" style={{color: '#856404'}}>{educationAnalysis.custosTotaisEducacao.toLocaleString()}€</p>
                        <small className="h-12 fw-400 dark-gray">{educationAnalysis.duracaoEducacao} anos de educação</small>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="savings-card" style={{background: '#d1e7dd', padding: '16px', borderRadius: '8px', textAlign: 'center'}}>
                        <h6 className="h-14 fw-600 black mb-8">Poupanças Projetadas</h6>
                        <p className="h-24 fw-700" style={{color: '#0f5132'}}>{educationAnalysis.poupancasProjetadas.toLocaleString()}€</p>
                        <small className="h-12 fw-400 dark-gray">Aos {inputs.idadeEnsinoSuperior} anos da criança</small>
                      </div>
                    </div>
                  </div>

                  <div className="gap-analysis mt-16" style={{
                    background: educationAnalysis.gapFinanciamento > 0 ? '#f8d7da' : '#d1e7dd',
                    padding: '16px', 
                    borderRadius: '8px', 
                    textAlign: 'center'
                  }}>
                    <h6 className="h-16 fw-600 black mb-8">
                      {educationAnalysis.gapFinanciamento > 0 ? 'Gap de Financiamento' : 'Excesso de Poupança'}
                    </h6>
                    <p className="h-20 fw-700" style={{
                      color: educationAnalysis.gapFinanciamento > 0 ? '#721c24' : '#0f5132'
                    }}>
                      {educationAnalysis.gapFinanciamento > 0 ? '' : '+'}
                      {Math.abs(educationAnalysis.gapFinanciamento).toLocaleString()}€
                    </p>
                  </div>
                </div>

                {/* Savings Performance */}
                <div className="savings-performance mb-32">
                  <h5 className="h-21 fw-600 black mb-16">Performance da Poupança</h5>
                  
                  <div className="performance-metrics">
                    <div className="metric-item mb-12" style={{display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #e9ecef'}}>
                      <span className="h-14 fw-500 black">Total de Contribuições</span>
                      <span className="h-14 fw-700 black">{educationAnalysis.totalContribuicoes.toLocaleString()}€</span>
                    </div>
                    
                    <div className="metric-item mb-12" style={{display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #e9ecef'}}>
                      <span className="h-14 fw-500 black">Juros Compostos Gerados</span>
                      <span className="h-14 fw-700 color-primary">{educationAnalysis.totalJuros.toLocaleString()}€</span>
                    </div>
                    
                    <div className="metric-item mb-12" style={{display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #e9ecef'}}>
                      <span className="h-14 fw-500 black">Taxa de Retorno Efetiva</span>
                      <span className="h-14 fw-700 color-primary">{educationAnalysis.taxaRetornoEfetiva}%/ano</span>
                    </div>
                    
                    <div className="metric-item" style={{display: 'flex', justifyContent: 'space-between', padding: '8px 0'}}>
                      <span className="h-14 fw-600 black">Anos até ao Início</span>
                      <span className="h-16 fw-700 black">{educationAnalysis.anosAteInicio} anos</span>
                    </div>
                  </div>
                </div>

                {/* Gap Solution */}
                {educationAnalysis.gapFinanciamento > 0 && (
                  <div className="gap-solution mb-32" style={{background: '#fff3cd', padding: '16px', borderRadius: '8px', border: '1px solid #ffeaa7'}}>
                    <h6 className="h-16 fw-600 black mb-12">Solução para o Gap</h6>
                    <div className="solution-metrics">
                      <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '8px'}}>
                        <span className="h-14 fw-500 black">Contribuição Atual Mensal:</span>
                        <span className="h-14 fw-700 black">{inputs.contribuicoesMensais}€</span>
                      </div>
                      <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '12px'}}>
                        <span className="h-14 fw-500 black">Contribuição Necessária:</span>
                        <span className="h-16 fw-700" style={{color: '#856404'}}>{educationAnalysis.contribuicaoNecessaria}€</span>
                      </div>
                      <div style={{display: 'flex', justifyContent: 'space-between'}}>
                        <span className="h-14 fw-600 black">Aumento Requerido:</span>
                        <span className="h-16 fw-700" style={{color: '#dc3545'}}>
                          +{Math.max(0, educationAnalysis.contribuicaoNecessaria - inputs.contribuicoesMensais)}€/mês
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Education Cost Breakdown */}
                <div className="cost-breakdown mb-32">
                  <h5 className="h-21 fw-600 black mb-16">Custos por Ano de Educação</h5>
                  <div className="table-responsive" style={{maxHeight: '200px', overflowY: 'auto'}}>
                    <table className="table" style={{width: '100%', borderCollapse: 'collapse', fontSize: '13px'}}>
                      <thead>
                        <tr style={{background: '#f8f9fa', position: 'sticky', top: 0}}>
                          <th style={{padding: '8px 6px', borderBottom: '1px solid #dee2e6'}}>Ano</th>
                          <th style={{padding: '8px 6px', borderBottom: '1px solid #dee2e6'}}>Custo Bruto</th>
                          <th style={{padding: '8px 6px', borderBottom: '1px solid #dee2e6'}}>Subsídio</th>
                          <th style={{padding: '8px 6px', borderBottom: '1px solid #dee2e6'}}>Custo Líquido</th>
                        </tr>
                      </thead>
                      <tbody>
                        {educationAnalysis.custosAnuais.map((row) => (
                          <tr key={row.ano}>
                            <td style={{padding: '6px', borderBottom: '1px solid #dee2e6', fontWeight: 'bold'}}>{row.ano}º</td>
                            <td style={{padding: '6px', borderBottom: '1px solid #dee2e6'}}>{row.custoAnual.toLocaleString()}€</td>
                            <td style={{padding: '6px', borderBottom: '1px solid #dee2e6', color: '#28a745'}}>
                              {row.subsidio > 0 ? `-${row.subsidio.toLocaleString()}€` : '-'}
                            </td>
                            <td style={{padding: '6px', borderBottom: '1px solid #dee2e6', fontWeight: 'bold', color: '#dc3545'}}>
                              {row.custoLiquido.toLocaleString()}€
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Savings Projection */}
                <div className="savings-projection mb-32">
                  <h5 className="h-21 fw-600 black mb-16">Projeção de Poupança Anual</h5>
                  <div className="table-responsive" style={{maxHeight: '250px', overflowY: 'auto'}}>
                    <table className="table" style={{width: '100%', borderCollapse: 'collapse', fontSize: '12px'}}>
                      <thead>
                        <tr style={{background: '#f8f9fa', position: 'sticky', top: 0}}>
                          <th style={{padding: '6px 4px', borderBottom: '1px solid #dee2e6'}}>Ano</th>
                          <th style={{padding: '6px 4px', borderBottom: '1px solid #dee2e6'}}>Idade</th>
                          <th style={{padding: '6px 4px', borderBottom: '1px solid #dee2e6'}}>Contribuições</th>
                          <th style={{padding: '6px 4px', borderBottom: '1px solid #dee2e6'}}>Juros</th>
                          <th style={{padding: '6px 4px', borderBottom: '1px solid #dee2e6'}}>Saldo</th>
                        </tr>
                      </thead>
                      <tbody>
                        {educationAnalysis.projecaoAnual.map((row) => (
                          <tr key={row.ano}>
                            <td style={{padding: '4px', borderBottom: '1px solid #dee2e6', fontWeight: 'bold'}}>{row.ano}</td>
                            <td style={{padding: '4px', borderBottom: '1px solid #dee2e6'}}>{row.idadeCrianca}</td>
                            <td style={{padding: '4px', borderBottom: '1px solid #dee2e6', color: '#198754'}}>
                              +{row.contribuicoes.toLocaleString()}€
                            </td>
                            <td style={{padding: '4px', borderBottom: '1px solid #dee2e6', color: '#0d6efd'}}>
                              +{row.juros.toLocaleString()}€
                            </td>
                            <td style={{padding: '4px', borderBottom: '1px solid #dee2e6', fontWeight: 'bold'}}>
                              {row.saldoFinal.toLocaleString()}€
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Recommendation */}
                <div className="recommendation mb-32" style={{background: '#e7f3ff', padding: '16px', borderRadius: '8px', border: '1px solid #b3d9ff'}}>
                  <h6 className="h-16 fw-600 black mb-8">Recomendação Personalizada</h6>
                  <p className="h-14 fw-400 black">{educationAnalysis.sugestao}</p>
                </div>

                {/* Portuguese Education Context */}
                <div className="education-context" style={{background: '#f8f9fa', padding: '16px', borderRadius: '8px'}}>
                  <h6 className="h-16 fw-600 black mb-12">Contexto Educacional Português</h6>
                  <div style={{fontSize: '12px', lineHeight: '1.4'}}>
                    <div className="context-item mb-8">
                      <strong>Custos Médios Anuais ({inputs.tipoEducacao}):</strong>
                      <div className="cost-details mt-4" style={{paddingLeft: '12px'}}>
                        <div>• Propinas: {educationAnalysis.custoMedio.propina.toLocaleString()}€</div>
                        <div>• Residência: {educationAnalysis.custoMedio.residencia.toLocaleString()}€</div>
                        <div>• Alimentação: {educationAnalysis.custoMedio.alimentacao.toLocaleString()}€</div>
                        <div>• Material: {educationAnalysis.custoMedio.material.toLocaleString()}€</div>
                        <div style={{borderTop: '1px solid #dee2e6', paddingTop: '4px', marginTop: '4px', fontWeight: 'bold'}}>
                          Total: {educationAnalysis.custoMedio.total.toLocaleString()}€/ano
                        </div>
                      </div>
                    </div>
                    
                    <div className="context-tips">
                      <strong>Dicas de Otimização Fiscal:</strong>
                      <div style={{paddingLeft: '12px', marginTop: '4px'}}>
                        • PPR Educação com benefícios fiscais<br/>
                        • Certificados de Aforro para capital garantido<br/>
                        • Seguros de educação com cobertura adicional<br/>
                        • Bolsas de mérito e apoios sociais disponíveis
                      </div>
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