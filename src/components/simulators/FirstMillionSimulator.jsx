import React, { useState, useMemo } from 'react';
import NumericInput from '../common/NumericInput';

const periods = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60];

export default function FirstMillionSimulator() {
  const [inputs, setInputs] = useState({
    goalAmount: 1000000,
    monthlyReturn: 0.5,
    investmentYears: 10
  });
  const [results, setResults] = useState(null);
  const [errors, setErrors] = useState({});

  // Format currency and percentage
  const formatCurrency = value => Number(value).toLocaleString('pt-PT', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const formatPercentage = value => Number(value).toLocaleString('pt-PT', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '%';

  const handleInputChange = (field, value) => {
    setInputs(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validateInputs = () => {
    const newErrors = {};
    if (inputs.goalAmount <= 0) newErrors.goalAmount = 'Objetivo deve ser positivo';
    if (inputs.monthlyReturn <= 0) newErrors.monthlyReturn = 'Rentabilidade deve ser positiva';
    if (inputs.investmentYears <= 0) newErrors.investmentYears = 'Período deve ser maior que 0';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const simulationResults = useMemo(() => {
    if (!validateInputs()) return null;
    const goal = parseFloat(inputs.goalAmount) || 0;
    const monthlyR = parseFloat(inputs.monthlyReturn) / 100 || 0;
    const selectedYears = parseInt(inputs.investmentYears) || 0;
    const table = periods.map(years => {
      const months = years * 12;
      const monthlyInvestment = goal * monthlyR / (Math.pow(1 + monthlyR, months) - 1);
      return { years, months, monthlyInvestment };
    });
    return { table, selectedYears, goal, monthlyR };
  }, [inputs]);

  return (
    <div className="simulator-box">
      <h2 className="simulator-title">Simulador do 1º Milhão</h2>
      <form className="simulator-form" onSubmit={e => { e.preventDefault(); setResults(simulationResults); }}>
        <div className="input-group mb-24">
          <label className="h-16 fw-500 black mb-8">Montante do Objetivo (€)</label>
          <NumericInput value={inputs.goalAmount} onValue={(v) => handleInputChange('goalAmount', v)} min={0} />
        </div>
        <div className="input-group mb-24">
          <label className="h-16 fw-500 black mb-8">Rentabilidade Mensal (%)</label>
          <NumericInput value={inputs.monthlyReturn} onValue={(v) => handleInputChange('monthlyReturn', v)} percent min={0} step={0.01} />
        </div>
        <div className="input-group mb-24">
          <label className="h-16 fw-500 black mb-8">Período de Investimento (anos)</label>
          <select className="form-control" value={inputs.investmentYears} onChange={e => handleInputChange('investmentYears', e.target.value)}>
            {periods.map(y => <option key={y} value={y}>{y} anos</option>)}
          </select>
        </div>
  <button type="submit" className="cus-btn" style={{width:'220px',maxWidth:'100%',margin:'0 auto',display:'block'}}>Calcular</button>
      </form>
      {results && results.table && (
        <div className="simulator-results" style={{ marginTop: 24 }}>
          <h3 className="h-21 fw-600 color-primary mb-16">Resultados da Simulação</h3>
          <div style={{ overflowX: 'auto' }}>
            <table className="simulator-table">
              <thead>
                <tr>
                  <th>Anos</th>
                  <th>Nº de Meses</th>
                  <th>Rentabilidade Mensal</th>
                  <th>Objetivo</th>
                  <th>Investimento Mensal</th>
                </tr>
              </thead>
              <tbody>
                {results.table.map(row => (
                  <tr key={row.years} className={row.years === results.selectedYears ? 'highlight-row' : ''}>
                    <td>{row.years}</td>
                    <td>{row.months}</td>
                    <td>{formatPercentage(results.monthlyR * 100)}</td>
                    <td>€{formatCurrency(results.goal)}</td>
                    <td>€{formatCurrency(row.monthlyInvestment)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
