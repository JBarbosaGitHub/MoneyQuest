import React, { useState, useEffect } from 'react'
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore'
import { db } from '../firebase/config'
import { useAuth } from '../contexts/AuthContext'
import CheckoutButton from './CheckoutButton'

// Icon map for colorful themed icons per consulta type
const iconMap = {
  'planeamento-financeiro': { emoji: '📊', bg: '#FDE68A', fg: '#1F2937' },
  'investimentos': { emoji: '💼', bg: '#BFDBFE', fg: '#1E3A8A' },
  'reforma': { emoji: '🌴', bg: '#A7F3D0', fg: '#065F46' },
  'credito': { emoji: '🏠', bg: '#FFE4E6', fg: '#9F1239' },
  'negocios': { emoji: '🏢', bg: '#FBCFE8', fg: '#831843' },
  'fiscal': { emoji: '📋', bg: '#C7D2FE', fg: '#312E81' },
  'seguros': { emoji: '🛡️', bg: '#DDD6FE', fg: '#4C1D95' },
  'outros': { emoji: '✨', bg: '#E5E7EB', fg: '#111827' }
}

function IconBadge({ type, name }) {
  const cfg = iconMap[type] || iconMap['outros']
  return (
    <div
      aria-label={name}
      title={name}
      style={{
        width: 80,
        height: 80,
        borderRadius: 12,
        background: cfg.bg,
        color: cfg.fg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 36,
        boxShadow: 'inset 0 0 0 2px rgba(0,0,0,0.08)',
        flexShrink: 0
      }}
    >
      <span role="img" aria-hidden>{cfg.emoji}</span>
    </div>
  )
}

function ConsultaCard({ consulta, onOpenLogin }) {
  const { currentUser } = useAuth()
  const [isHovered, setIsHovered] = useState(false)

  const handleCheckout = () => {
    if (!currentUser) {
      onOpenLogin()
      return
    }
  }

  return (
    <div
      className="consulta-card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        padding: '24px',
        borderRadius: '20px',
        background: '#ffffff',
        boxShadow: isHovered ? '0 8px 24px rgba(0,0,0,0.12)' : '0 2px 8px rgba(0,0,0,0.08)',
        border: `2px solid ${isHovered ? '#5DAD9E' : '#e5e7eb'}`,
        cursor: 'default',
        height: '100%',
        width: '100%',
        maxWidth: '380px',
        margin: '8px',
        transition: 'all 0.3s ease',
        transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Header with icon and title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <IconBadge type={consulta.type} name={consulta.title} />
        <div style={{ flex: 1 }}>
          <h3 className="banner-text" style={{ 
            fontSize: '1.3rem', 
            marginBottom: '4px',
            lineHeight: 1.2 
          }}>
            {consulta.title}
          </h3>
          {consulta.duration && (
            <span style={{ 
              fontSize: '0.9rem', 
              color: '#6b7280',
              fontWeight: '600'
            }}>
              ⏱️ {consulta.duration}
            </span>
          )}
        </div>
      </div>

      {/* Description */}
      <p style={{
        fontSize: '0.95rem',
        lineHeight: 1.5,
        color: '#4b5563',
        margin: '8px 0',
        flex: 1
      }}>
        {consulta.description}
      </p>

      {/* Features list */}
      {consulta.features && consulta.features.length > 0 && (
        <ul style={{
          listStyle: 'none',
          padding: 0,
          margin: '12px 0',
          fontSize: '0.9rem',
          color: '#374151'
        }}>
          {consulta.features.map((feature, idx) => (
            <li key={idx} style={{ 
              marginBottom: '8px',
              paddingLeft: '20px',
              position: 'relative'
            }}>
              <span style={{ 
                position: 'absolute', 
                left: 0,
                color: '#5DAD9E',
                fontWeight: 'bold'
              }}>✓</span>
              {feature}
            </li>
          ))}
        </ul>
      )}

      {/* Price and button */}
      <div style={{
        marginTop: 'auto',
        paddingTop: '16px',
        borderTop: '1px solid #e5e7eb',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px'
      }}>
        <div>
          <div style={{ 
            fontSize: '2rem', 
            fontWeight: 'bold',
            color: '#1f2937',
            lineHeight: 1
          }}>
            {consulta.price}€
          </div>
          {consulta.priceNote && (
            <div style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '4px' }}>
              {consulta.priceNote}
            </div>
          )}
        </div>
        
        <CheckoutButton
          productId={consulta.id}
          amount={consulta.price}
          currency="EUR"
          description={consulta.title}
          buyerEmail={currentUser?.email || ''}
          successUrl={window.location.origin + '/'}
          onStart={handleCheckout}
          className="cus-btn-2"
          disabled={!currentUser}
          style={{
            padding: '12px 24px',
            fontSize: '1rem',
            fontWeight: 'bold',
            whiteSpace: 'nowrap'
          }}
        >
          {currentUser ? 'Reservar' : 'Login'}
        </CheckoutButton>
      </div>
    </div>
  )
}

export default function ConsultasFinanceiras({ onOpenLogin }) {
  const [consultas, setConsultas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showAll, setShowAll] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Detect screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Fetch consultas from Firestore
  useEffect(() => {
    async function fetchConsultas() {
      try {
        setLoading(true)
        const q = query(
          collection(db, 'consultas'),
          where('active', '==', true)
        )
        const snapshot = await getDocs(q)
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        
        // Sort by order field if it exists, otherwise by title
        data.sort((a, b) => {
          if (a.order !== undefined && b.order !== undefined) {
            return a.order - b.order
          }
          return a.title.localeCompare(b.title)
        })
        
        setConsultas(data)
        setError(null)
      } catch (err) {
        console.error('Error fetching consultas:', err)
        setError('Erro ao carregar consultas financeiras')
      } finally {
        setLoading(false)
      }
    }

    fetchConsultas()
  }, [])

  // Determine how many to show
  const initialCount = isMobile ? 3 : 6
  const visibleCount = showAll ? consultas.length : initialCount
  const visibleConsultas = consultas.slice(0, visibleCount)
  const shouldShowButton = consultas.length > initialCount

  if (loading) {
    return (
      <section className="consultas-financeiras reveal" id="consultas">
        <div className="container-fluid">
          <div className="heading reveal" style={{ marginBottom: '48px' }}>
            <h2 className="black mb-48"><span className="banner-text" title="CONSULTAS FINANCEIRAS">CONSULTAS FINANCEIRAS</span></h2>
          </div>
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div className="spinner-border" role="status" style={{ width: '3rem', height: '3rem' }}>
              <span className="visually-hidden">A carregar...</span>
            </div>
          </div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="consultas-financeiras reveal" id="consultas">
        <div className="container-fluid">
          <div className="heading reveal" style={{ marginBottom: '48px' }}>
            <h2 className="black mb-48"><span className="banner-text" title="CONSULTAS FINANCEIRAS">CONSULTAS FINANCEIRAS</span></h2>
          </div>
          <div style={{ 
            textAlign: 'center', 
            padding: '60px 20px',
            color: '#dc3545',
            fontSize: '1.1rem'
          }}>
            {error}
          </div>
        </div>
      </section>
    )
  }

  if (consultas.length === 0) {
    return (
      <section className="consultas-financeiras reveal" id="consultas">
        <div className="container-fluid">
          <div className="heading reveal" style={{ marginBottom: '48px' }}>
            <h2 className="black mb-48"><span className="banner-text" title="CONSULTAS FINANCEIRAS">CONSULTAS FINANCEIRAS</span></h2>
          </div>
          <div style={{ 
            textAlign: 'center', 
            padding: '60px 20px',
            color: '#6b7280',
            fontSize: '1.1rem'
          }}>
            Nenhuma consulta disponível no momento.
          </div>
        </div>
      </section>
    )
  }

  return (
    // Reuse the same section class as Simuladores to inherit identical heading styles
    <section className="simulators reveal" id="consultas">
      <div className="container-fluid">
        <div className="heading reveal" style={{ marginBottom: '48px' }}>
          <h2 className="black mb-48"><span className="banner-text" title="CONSULTAS FINANCEIRAS">CONSULTAS FINANCEIRAS</span></h2>
        </div>

        {/* Use the same box class name as Simuladores so the frame/shadow/border match exactly */}
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
          <div className="consultas-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '32px',
            justifyItems: 'center',
            alignItems: 'stretch',
            padding: '16px',
            margin: '0 8px',
          }}>
            {visibleConsultas.map(consulta => (
              <ConsultaCard 
                key={consulta.id} 
                consulta={consulta} 
                onOpenLogin={onOpenLogin}
              />
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
                  e.currentTarget.style.backgroundColor = '#7E8081'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#5DAD9E'
                }}
              >
                {showAll ? 'Mostrar Menos' : 'Mostrar Mais'}
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
