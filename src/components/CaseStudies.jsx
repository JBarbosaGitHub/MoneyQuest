import React, { useState } from 'react'
import BudgetSimulator from './simulators/BudgetSimulator'
import InvestmentSimulator from './simulators/InvestmentSimulator'
import BusinessViabilityCalculator from './simulators/BusinessViabilityCalculator'
import RetirementPlanningSimulator from './simulators/RetirementPlanningSimulator'
import BondInvestmentSimulator from './simulators/BondInvestmentSimulator'
import EducationSavingsSimulator from './simulators/EducationSavingsSimulator'
import SimulatorPopup from './SimulatorPopup'

const simulators = [
  {
    id: 'budget',
    name: 'Simulador de Orçamento',
    logo: '/assets/media/brand-logo/brand-logo-1.png',
    image: '/assets/media/brand-logo/brand-img-1.png',
    component: <BudgetSimulator />,
    description: 'Planeie o seu orçamento mensal e otimize despesas e poupança.'
  },
  {
    id: 'investment',
    name: 'Simulador de Investimento',
    logo: '/assets/media/brand-logo/brand-logo-2.png',
    image: '/assets/media/brand-logo/brand-img-2.png',
    component: <InvestmentSimulator />,
    description: 'Analise cenários de investimento e risco com Monte Carlo.'
  },
  {
    id: 'business',
    name: 'Viabilidade de Negócio',
    logo: '/assets/media/brand-logo/brand-logo-3.png',
    image: '/assets/media/brand-logo/brand-img-3.png',
    component: <BusinessViabilityCalculator />,
    description: 'Projete a viabilidade financeira do seu negócio.'
  },
  {
    id: 'retirement',
    name: 'Planeamento de Reforma',
    logo: '/assets/media/brand-logo/brand-logo-4.png',
    image: '/assets/media/brand-logo/brand-img-4.png',
    component: <RetirementPlanningSimulator />,
    description: 'Simule o seu plano de reforma e avalie o gap financeiro.'
  },
  {
    id: 'bond',
    name: 'Investimento em Obrigações',
    logo: '/assets/media/brand-logo/brand-logo-5.png',
    image: '/assets/media/brand-logo/brand-img-5.png',
    component: <BondInvestmentSimulator />,
    description: 'Avalie obrigações, YTM, risco e retornos líquidos.'
  },
  {
    id: 'education',
    name: 'Poupança para Educação',
    logo: '/assets/media/brand-logo/brand-logo-6.png',
    image: '/assets/media/brand-logo/brand-img-6.png',
    component: <EducationSavingsSimulator />,
    description: 'Projete custos de educação e plano de poupança familiar.'
  }
]

export default function CaseStudies() {
  const [openSim, setOpenSim] = useState(null)
  const [showAll, setShowAll] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Detect screen size
  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Determine how many simulators to show
  const initialCount = isMobile ? 3 : 8
  const visibleCount = showAll ? simulators.length : initialCount
  const visibleSimulators = simulators.slice(0, visibleCount)
  const shouldShowButton = simulators.length > initialCount

  return (
    <section className="simulators reveal" id="simulators">
      <div className="container-fluid">
        <div className="heading reveal" style={{ marginBottom: '48px' }}>
          <h2 className="black mb-48"><span className="banner-text" title="SIMULADORES">SIMULADORES</span></h2>
        </div>
        <div className="simulators-box" style={{
          background: '#f8f9fa',
          borderRadius: '24px',
          boxShadow: '0 4px 24px rgba(0,0,0,0.07)',
          padding: '32px 40px 40px 40px',
          maxWidth: '1400px',
          width: '100%',
          margin: '0 auto',
          border: '2px solid #222',
        }}>
          <div className="brand-area" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '40px',
            justifyItems: 'center',
            alignItems: 'center',
            padding: '16px',
            margin: '0 8px',
          }}>
            {visibleSimulators.map(sim => (
              <button
                key={sim.id}
                type="button"
                onClick={() => setOpenSim(sim.id)}
                className="square project simulator-card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '16px',
                  padding: '40px 24px',
                  borderRadius: '20px',
                  background: '#f8f9fa',
                  boxShadow: 'none',
                  border: '2px solid #222',
                  cursor: 'pointer',
                  minHeight: '260px',
                  width: '100%',
                  maxWidth: '260px',
                  margin: '8px',
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)';
                  e.currentTarget.style.borderColor = '#007bff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.borderColor = '#222';
                }}
              >
                <span className="banner-text" style={{ textAlign: 'center', fontSize: '1.6rem', marginBottom: '8px', letterSpacing: '1px' }}>{sim.name}</span>
                <img src={sim.image} alt={sim.name} style={{ width: 96, height: 96, borderRadius: '14px', objectFit: 'cover', margin: '8px 0' }} />
                <p className="h-16 fw-400 dark-gray" style={{ textAlign: 'center', marginTop: '8px', fontSize: '1rem' }}>{sim.description}</p>
              </button>
            ))}
          </div>
          
          {shouldShowButton && (
            <div className="show-more-container" style={{
              display: 'flex',
              justifyContent: 'center',
              marginTop: '40px',
            }}>
              <button 
                className="show-more-btn cus-btn-2"
                onClick={() => setShowAll(!showAll)}
                style={{
                  fontFamily: '"Saira Condensed", sans-serif',
                  padding: 'clamp(12px, 0.833vw, 24px) clamp(24px, 1.667vw, 48px)',
                  letterSpacing: '0.021875vw',
                  display: 'inline-block',
                  textAlign: 'center',
                  fontWeight: 'bold',
                  fontSize: 'clamp(14px, 0.83vw, 30px)',
                  borderRadius: '15px',
                  position: 'relative',
                  border: '0',
                  boxShadow: '0px 6px 0px 0px #000',
                  backgroundColor: '#5DAD9E',
                  color: '#FAFDFF',
                  textDecoration: 'none',
                  transition: '0.3s ease all',
                  zIndex: 1,
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#7E8081';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#5DAD9E';
                }}
              >
                {showAll ? 'Mostrar Menos' : 'Mostrar Mais'}
              </button>
            </div>
          )}
        </div>
        {simulators.map(sim => (
          <SimulatorPopup
            key={sim.id}
            open={openSim === sim.id}
            onClose={() => setOpenSim(null)}
            title={sim.name}
          >
            {sim.component}
          </SimulatorPopup>
        ))}
      </div>
    </section>
  )
}
