import React, { useEffect } from 'react'
import ConsultasAdmin from './ConsultasAdmin'
import { useAuth } from '../contexts/AuthContext'

export default function ConsultasAdminModal({ open, onClose }) {
  const { currentUser, userProfile } = useAuth()

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [open])

  if (!open) return null

  const isAdmin = !!(currentUser && userProfile?.isAdmin)

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.7)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        overflowY: 'auto',
        padding: '20px'
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'white',
          borderRadius: '16px',
          maxWidth: '1400px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          position: 'relative',
          margin: '40px auto'
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: 'sticky',
            top: '20px',
            right: '20px',
            float: 'right',
            background: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            fontSize: '24px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold',
            zIndex: 10,
            marginRight: '20px',
            marginTop: '20px'
          }}
          title="Fechar"
        >
          ×
        </button>
        {isAdmin ? (
          <ConsultasAdmin />
        ) : (
          <div style={{ padding: '60px 24px', textAlign: 'center' }}>
            <h3 style={{ marginBottom: '8px' }}>Sem acesso</h3>
            <p>Esta área é reservada a administradores.</p>
          </div>
        )}
      </div>
    </div>
  )
}
