import React, { useState } from 'react'
import BudgetSimulator from './simulators/BudgetSimulator'
import InvestmentSimulator from './simulators/InvestmentSimulator'
import BusinessViabilityCalculator from './simulators/BusinessViabilityCalculator'
import RetirementPlanningSimulator from './simulators/RetirementPlanningSimulator'
import BondInvestmentSimulator from './simulators/BondInvestmentSimulator'
import EducationSavingsSimulator from './simulators/EducationSavingsSimulator'
import FirstMillionSimulator from './simulators/FirstMillionSimulator'
import LifeTimeCostSimulator from './simulators/LifeTimeCostSimulator'
import SimulatorPopup from './SimulatorPopup'

// Icon map for colorful themed icons per simulator
const iconMap = {
  budget: { emoji: '💰', bg: '#FDE68A', fg: '#1F2937' },
  investment: { emoji: '📈', bg: '#BFDBFE', fg: '#1E3A8A' },
  business: { emoji: '🏢', bg: '#FBCFE8', fg: '#831843' },
  retirement: { emoji: '🌴', bg: '#A7F3D0', fg: '#065F46' },
  bond: { emoji: '🧾', bg: '#C7D2FE', fg: '#312E81' },
  education: { emoji: '🎓', bg: '#FECACA', fg: '#7F1D1D' },
  lifetimecost: { emoji: '⏱️', bg: '#DDD6FE', fg: '#4C1D95' },
  firstmillion: { emoji: '🥇', bg: '#FDE68A', fg: '#92400E' },
}

function IconBadge({ id, name }) {
  const cfg = iconMap[id] || { emoji: '✨', bg: '#E5E7EB', fg: '#111827' }
  return (
    <div
      aria-label={name}
      title={name}
      style={{
        width: 96,
        height: 96,
        borderRadius: 16,
        background: cfg.bg,
        color: cfg.fg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 44,
        boxShadow: 'inset 0 0 0 2px rgba(0,0,0,0.08)'
      }}
    >
      <span role="img" aria-hidden>{cfg.emoji}</span>
    </div>
  )
}

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
  },
  {
    id: 'lifetimecost',
    name: 'Custo em Tempo de Vida',
    logo: '/assets/media/brand-logo/brand-logo-8.png',
    image: '/assets/media/brand-logo/brand-img-8.png',
    component: <LifeTimeCostSimulator />,
    description: 'Veja quantas horas/dias precisa trabalhar para pagar itens do dia a dia.'
  },
  {
    id: 'firstmillion',
    name: 'Primeiro Milhão',
    logo: '/assets/media/brand-logo/brand-logo-7.png',
    image: '/assets/media/brand-logo/brand-img-7.png',
    component: <FirstMillionSimulator />,
    description: 'Descubra quanto investir por mês para alcançar o primeiro milhão.'
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
          padding: '32px 40px 24px 40px',
          maxWidth: '1400px',
          width: '100%',
          margin: '0 auto 8px',
          border: '2px solid #222',
        }}>
          <div className="brand-area" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gridTemplateRows: 'none',
            gap: '32px',
            justifyItems: 'center',
            alignItems: 'stretch',
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
                  gap: '14px',
                  padding: '28px 20px',
                  borderRadius: '20px',
                  background: '#f8f9fa',
                  boxShadow: 'none',
                  border: '2px solid #222',
                  cursor: 'pointer',
                  height: '320px',
                  width: '100%',
                  maxWidth: '280px',
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
                <span className="banner-text" style={{ textAlign: 'center', fontSize: '1.4rem', marginBottom: '4px', letterSpacing: '1px', lineHeight: 1.2 }}>{sim.name}</span>
                <IconBadge id={sim.id} name={sim.name} />
                <p
                  className="h-16 fw-400 dark-gray"
                  style={{
                    textAlign: 'center',
                    marginTop: '4px',
                    fontSize: '0.98rem',
                    lineHeight: 1.35,
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    maxWidth: '220px'
                  }}
                >
                  {sim.description}
                </p>
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
