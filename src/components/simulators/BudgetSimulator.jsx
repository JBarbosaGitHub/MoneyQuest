import React, { useState, useMemo } from 'react'

export default function BudgetSimulator() {
  const [inputs, setInputs] = useState({
    rendimentoMensalLiquido: 2000,
    despesasFixas: 800,
    despesasVariaveis: 500,
    taxaImposto: 0.20,
    taxaInflacaoAnual: 0.024,
    metaPoupancaMensal: 300,
    dividaMensal: 200,
    jurosDividaAnual: 0.05,
    mesesProjetados: 12,
    fatorDespesasInesperadas: 0.05
  })

  const [errors, setErrors] = useState({})

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
    const { rendimentoMensalLiquido, despesasFixas, despesasVariaveis, metaPoupancaMensal, dividaMensal } = inputs
    
    if (rendimentoMensalLiquido < 0 || despesasFixas < 0 || despesasVariaveis < 0 || metaPoupancaMensal < 0 || dividaMensal < 0) {
      newErrors.negative = "Valores de entrada não podem ser negativos."
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const simulationResults = useMemo(() => {
    if (!validateInputs()) return null

    const {
      rendimentoMensalLiquido,
      despesasFixas,
      despesasVariaveis,
      taxaImposto,
      taxaInflacaoAnual,
      metaPoupancaMensal,
      dividaMensal,
      jurosDividaAnual,
      mesesProjetados,
      fatorDespesasInesperadas
    } = inputs

    // Calculate approximate gross income
    const rendimentoBruto = rendimentoMensalLiquido / (1 - taxaImposto)
    
    // Initialize variables
    const saldosMensais = []
    let totalDespesasAcumuladas = 0
    let totalPoupancaAcumulada = 0
    
    for (let mes = 1; mes <= mesesProjetados; mes++) {
      // Adjust for monthly compound inflation
      const inflacaoMensal = Math.pow(1 + taxaInflacaoAnual, 1/12) - 1
      const despesasFixasAjustadas = despesasFixas * Math.pow(1 + inflacaoMensal, mes)
      const despesasVariaveisAjustadas = despesasVariaveis * Math.pow(1 + inflacaoMensal, mes) + 
                                        (despesasVariaveis * fatorDespesasInesperadas)
      
      // Calculate interest on debt (compounded monthly)
      const jurosMensal = dividaMensal * (jurosDividaAnual / 12)
      
      const totalDespesasMensal = despesasFixasAjustadas + despesasVariaveisAjustadas + dividaMensal + jurosMensal
      const saldoMensal = rendimentoMensalLiquido - totalDespesasMensal
      
      let poupancaMensal, excedente
      if (saldoMensal >= metaPoupancaMensal) {
        poupancaMensal = metaPoupancaMensal
        excedente = saldoMensal - metaPoupancaMensal
      } else {
        poupancaMensal = Math.max(0, saldoMensal)
        excedente = 0
      }
      
      saldosMensais.push({
        mes,
        saldo: Math.round(saldoMensal * 100) / 100,
        poupanca: Math.round(poupancaMensal * 100) / 100,
        excedente: Math.round(excedente * 100) / 100
      })
      
      totalDespesasAcumuladas += totalDespesasMensal
      totalPoupancaAcumulada += poupancaMensal
    }
    
    // Ideal allocation (50/30/20 adjustable)
    const alocacaoIdeal = {
      necessidades: Math.round(rendimentoMensalLiquido * 0.50 * 100) / 100,
      desejos: Math.round(rendimentoMensalLiquido * 0.30 * 100) / 100,
      poupancaDivida: Math.round(rendimentoMensalLiquido * 0.20 * 100) / 100
    }
    
    // Improved optimization suggestions
    const deficitTotal = metaPoupancaMensal * mesesProjetados - totalPoupancaAcumulada
    let sugestao
    
    if (deficitTotal > (rendimentoMensalLiquido * 0.10 * mesesProjetados)) {
      sugestao = `Alerta: Déficit elevado. Reduza despesas variáveis em ${Math.round(Math.abs(deficitTotal) / mesesProjetados * 100) / 100}€ mensais ou aumente rendimento em 10%.`
    } else if (deficitTotal > 0) {
      sugestao = `Reduza despesas variáveis em ${Math.round(Math.abs(deficitTotal) / mesesProjetados * 100) / 100}€ mensais para equilibrar.`
    } else {
      sugestao = "Orçamento equilibrado. Considere investir excedentes em produtos de poupança com rendimento acima da inflação."
    }
    
    return {
      rendimentoBrutoEstimado: Math.round(rendimentoBruto * 100) / 100,
      saldosMensais,
      alocacaoIdeal,
      totalDespesasAcumuladas: Math.round(totalDespesasAcumuladas * 100) / 100,
      totalPoupancaAcumulada: Math.round(totalPoupancaAcumulada * 100) / 100,
      sugestao
    }
  }, [inputs])

  const exportToCSV = () => {
    if (!simulationResults) return
    
    const csvContent = [
      ['Mês', 'Saldo', 'Poupança', 'Excedente'],
      ...simulationResults.saldosMensais.map(row => [row.mes, row.saldo, row.poupanca, row.excedente])
    ].map(row => row.join(',')).join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'orcamento_resultados.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="budget-simulator">
      <div className="container-fluid">
        <div className="heading mb-48">
          <h2 className="black mb-24">
            <span className="banner-text" title="SIMULADOR DE ORÇAMENTO">SIMULADOR DE ORÇAMENTO</span>
          </h2>
          <p className="h-16 body-text dark-gray">
            Simule e otimize o seu orçamento pessoal com projeções detalhadas
          </p>
        </div>

        <div className="row">
          {/* Input Form */}
          <div className="col-xl-6 col-lg-6">
            <div className="simulator-inputs">
              <h4 className="h-28 fw-700 black mb-24">Dados de Entrada</h4>
              
              {errors.negative && (
                <div className="alert alert-danger mb-16" style={{color: '#d63384', background: '#f8d7da', padding: '12px', borderRadius: '8px'}}>
                  {errors.negative}
                </div>
              )}

              <div className="input-group mb-24">
                <label className="h-16 fw-500 black mb-8">Rendimento Mensal Líquido (€)</label>
                <input
                  type="number"
                  className="form-control"
                  value={inputs.rendimentoMensalLiquido}
                  onChange={(e) => handleInputChange('rendimentoMensalLiquido', e.target.value)}
                  min="0"
                  step="10"
                />
              </div>

              <div className="input-group mb-24">
                <label className="h-16 fw-500 black mb-8">Despesas Fixas (€)</label>
                <input
                  type="number"
                  className="form-control"
                  value={inputs.despesasFixas}
                  onChange={(e) => handleInputChange('despesasFixas', e.target.value)}
                  min="0"
                  step="10"
                />
              </div>

              <div className="input-group mb-24">
                <label className="h-16 fw-500 black mb-8">Despesas Variáveis (€)</label>
                <input
                  type="number"
                  className="form-control"
                  value={inputs.despesasVariaveis}
                  onChange={(e) => handleInputChange('despesasVariaveis', e.target.value)}
                  min="0"
                  step="10"
                />
              </div>

              <div className="input-group mb-24">
                <label className="h-16 fw-500 black mb-8">Meta de Poupança Mensal (€)</label>
                <input
                  type="number"
                  className="form-control"
                  value={inputs.metaPoupancaMensal}
                  onChange={(e) => handleInputChange('metaPoupancaMensal', e.target.value)}
                  min="0"
                  step="10"
                />
              </div>

              <div className="input-group mb-24">
                <label className="h-16 fw-500 black mb-8">Dívida Mensal (€)</label>
                <input
                  type="number"
                  className="form-control"
                  value={inputs.dividaMensal}
                  onChange={(e) => handleInputChange('dividaMensal', e.target.value)}
                  min="0"
                  step="10"
                />
              </div>

              <div className="input-group mb-24">
                <label className="h-16 fw-500 black mb-8">Meses de Projeção</label>
                <input
                  type="number"
                  className="form-control"
                  value={inputs.mesesProjetados}
                  onChange={(e) => handleInputChange('mesesProjetados', e.target.value)}
                  min="1"
                  max="60"
                  step="1"
                />
              </div>

              <div className="advanced-options" style={{marginTop: '32px'}}>
                <h5 className="h-21 fw-600 black mb-16">Opções Avançadas</h5>
                
                <div className="input-group mb-16">
                  <label className="h-14 fw-400 black mb-4">Taxa de Imposto (%)</label>
                  <input
                    type="number"
                    className="form-control"
                    value={inputs.taxaImposto * 100}
                    onChange={(e) => handleInputChange('taxaImposto', e.target.value / 100)}
                    min="0"
                    max="50"
                    step="0.1"
                  />
                </div>

                <div className="input-group mb-16">
                  <label className="h-14 fw-400 black mb-4">Taxa de Inflação Anual (%)</label>
                  <input
                    type="number"
                    className="form-control"
                    value={inputs.taxaInflacaoAnual * 100}
                    onChange={(e) => handleInputChange('taxaInflacaoAnual', e.target.value / 100)}
                    min="0"
                    max="10"
                    step="0.1"
                  />
                </div>

                <div className="input-group mb-16">
                  <label className="h-14 fw-400 black mb-4">Juros da Dívida Anual (%)</label>
                  <input
                    type="number"
                    className="form-control"
                    value={inputs.jurosDividaAnual * 100}
                    onChange={(e) => handleInputChange('jurosDividaAnual', e.target.value / 100)}
                    min="0"
                    max="30"
                    step="0.1"
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
                  <h4 className="h-28 fw-700 black">Resultados da Simulação</h4>
                  <button 
                    className="cus-btn"
                    onClick={exportToCSV}
                    style={{padding: '8px 16px', fontSize: '14px'}}
                  >
                    Exportar CSV
                  </button>
                </div>

                {/* Summary Cards */}
                <div className="summary-cards mb-32">
                  <div className="summary-card mb-16" style={{background: '#f8f9fa', padding: '16px', borderRadius: '8px'}}>
                    <h6 className="h-16 fw-600 black mb-4">Rendimento Bruto Estimado</h6>
                    <p className="h-24 fw-700 color-primary">{simulationResults.rendimentoBrutoEstimado}€</p>
                  </div>
                  
                  <div className="summary-card mb-16" style={{background: '#f8f9fa', padding: '16px', borderRadius: '8px'}}>
                    <h6 className="h-16 fw-600 black mb-4">Poupança Total Acumulada</h6>
                    <p className="h-24 fw-700 color-primary">{simulationResults.totalPoupancaAcumulada}€</p>
                  </div>

                  <div className="summary-card mb-16" style={{background: '#f8f9fa', padding: '16px', borderRadius: '8px'}}>
                    <h6 className="h-16 fw-600 black mb-4">Despesas Totais Acumuladas</h6>
                    <p className="h-24 fw-700 black">{simulationResults.totalDespesasAcumuladas}€</p>
                  </div>
                </div>

                {/* Ideal Allocation */}
                <div className="ideal-allocation mb-32">
                  <h5 className="h-21 fw-600 black mb-16">Alocação Ideal (50/30/20)</h5>
                  <div className="allocation-bars">
                    <div className="allocation-item mb-8" style={{display: 'flex', justifyContent: 'space-between'}}>
                      <span className="h-14 fw-400 black">Necessidades (50%)</span>
                      <span className="h-14 fw-600 black">{simulationResults.alocacaoIdeal.necessidades}€</span>
                    </div>
                    <div className="allocation-item mb-8" style={{display: 'flex', justifyContent: 'space-between'}}>
                      <span className="h-14 fw-400 black">Desejos (30%)</span>
                      <span className="h-14 fw-600 black">{simulationResults.alocacaoIdeal.desejos}€</span>
                    </div>
                    <div className="allocation-item mb-8" style={{display: 'flex', justifyContent: 'space-between'}}>
                      <span className="h-14 fw-400 black">Poupança/Dívida (20%)</span>
                      <span className="h-14 fw-600 black">{simulationResults.alocacaoIdeal.poupancaDivida}€</span>
                    </div>
                  </div>
                </div>

                {/* Suggestion */}
                <div className="suggestion mb-32" style={{background: '#e7f3ff', padding: '16px', borderRadius: '8px', border: '1px solid #b3d9ff'}}>
                  <h6 className="h-16 fw-600 black mb-8">Sugestão de Otimização</h6>
                  <p className="h-14 fw-400 black">{simulationResults.sugestao}</p>
                </div>

                {/* Monthly Results Table */}
                <div className="monthly-results">
                  <h5 className="h-21 fw-600 black mb-16">Projeção Mensal</h5>
                  <div className="table-responsive" style={{maxHeight: '400px', overflowY: 'auto'}}>
                    <table className="table" style={{width: '100%', borderCollapse: 'collapse'}}>
                      <thead>
                        <tr style={{background: '#f8f9fa'}}>
                          <th style={{padding: '8px', borderBottom: '1px solid #dee2e6'}}>Mês</th>
                          <th style={{padding: '8px', borderBottom: '1px solid #dee2e6'}}>Saldo</th>
                          <th style={{padding: '8px', borderBottom: '1px solid #dee2e6'}}>Poupança</th>
                          <th style={{padding: '8px', borderBottom: '1px solid #dee2e6'}}>Excedente</th>
                        </tr>
                      </thead>
                      <tbody>
                        {simulationResults.saldosMensais.map((row) => (
                          <tr key={row.mes}>
                            <td style={{padding: '8px', borderBottom: '1px solid #dee2e6'}}>{row.mes}</td>
                            <td style={{padding: '8px', borderBottom: '1px solid #dee2e6', color: row.saldo < 0 ? '#d63384' : '#198754'}}>
                              {row.saldo}€
                            </td>
                            <td style={{padding: '8px', borderBottom: '1px solid #dee2e6'}}>{row.poupanca}€</td>
                            <td style={{padding: '8px', borderBottom: '1px solid #dee2e6'}}>{row.excedente}€</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
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