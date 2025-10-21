import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'

export default function Login({ onClose }) {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [name, setName] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [resetMode, setResetMode] = useState(false)

  const { signup, login, loginWithGoogle, logout, currentUser, resetPassword, userProfile } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')

    if (resetMode) {
      // Password reset
      if (!email) {
        return setError('Por favor, insira o seu email.')
      }
      try {
        setLoading(true)
        await resetPassword(email)
        setMessage('Email de recuperação enviado! Verifique a sua caixa de entrada.')
        setEmail('')
      } catch (err) {
        setError('Erro ao enviar email de recuperação: ' + err.message)
      }
      setLoading(false)
      return
    }

    if (!isLogin) {
      // Sign up validation
      if (!name || name.trim().length < 2) {
        return setError('Por favor, insira o seu nome completo.')
      }
      if (!birthDate) {
        return setError('Por favor, insira a sua data de nascimento.')
      }
      if (password !== confirmPassword) {
        return setError('As palavras-passe não coincidem.')
      }
      if (password.length < 6) {
        return setError('A palavra-passe deve ter pelo menos 6 caracteres.')
      }
    }

    try {
      setLoading(true)
      if (isLogin) {
        await login(email, password)
        setMessage('Login efetuado com sucesso!')
      } else {
        await signup(email, password, { name, birthDate })
        setMessage('Conta criada com sucesso!')
      }
      // Clear form
      setEmail('')
      setPassword('')
      setConfirmPassword('')
      setName('')
      setBirthDate('')
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') {
        setError('Este email já está registado.')
      } else if (err.code === 'auth/weak-password') {
        setError('A palavra-passe é muito fraca.')
      } else if (err.code === 'auth/invalid-email') {
        setError('Email inválido.')
      } else if (err.code === 'auth/user-not-found') {
        setError('Utilizador não encontrado.')
      } else if (err.code === 'auth/wrong-password') {
        setError('Palavra-passe incorreta.')
      } else {
        setError('Erro: ' + err.message)
      }
    }
    setLoading(false)
  }

  const handleGoogleLogin = async () => {
    try {
      setLoading(true)
      setError('')
      await loginWithGoogle()
      setMessage('Login com Google efetuado com sucesso!')
    } catch (err) {
      setError('Erro ao fazer login com Google: ' + err.message)
    }
    setLoading(false)
  }

  const handleLogout = async () => {
    try {
      setLoading(true)
      await logout()
      setMessage('Logout efetuado com sucesso!')
    } catch (err) {
      setError('Erro ao fazer logout: ' + err.message)
    }
    setLoading(false)
  }

  if (currentUser) {
    return (
      <div className="login-container" style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.85)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '20px'
      }}>
        <div className="login-box" style={{
          background: '#fff',
          borderRadius: '24px',
          padding: '48px 40px',
          maxWidth: '500px',
          width: '100%',
          position: 'relative',
          boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
          border: '2px solid #222'
        }}>
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              background: 'transparent',
              border: 'none',
              fontSize: '28px',
              cursor: 'pointer',
              color: '#222',
              lineHeight: 1,
              padding: '5px 10px'
            }}
            aria-label="Fechar"
          >
            ×
          </button>

          <h2 className="banner-text" style={{
            textAlign: 'center',
            marginBottom: '24px',
            fontSize: '2rem',
            color: '#222'
          }}>
            Área de Utilizador
          </h2>

          <div style={{
            padding: '24px',
            background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
            borderRadius: '16px',
            marginBottom: '20px',
            border: '2px solid #dee2e6'
          }}>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #8cb4bc 0%, #6a9aa5 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                fontSize: '2rem',
                color: 'white',
                fontWeight: 'bold',
                boxShadow: '0 4px 12px rgba(140, 180, 188, 0.3)'
              }}>
                {(userProfile?.name || currentUser.displayName || currentUser.email || '?').charAt(0).toUpperCase()}
              </div>
              <p style={{ fontSize: '0.85rem', color: '#6c757d', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 500 }}>
                Bem-vindo(a)
              </p>
            </div>

            <div style={{
              background: 'white',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '16px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
            }}>
              {/* Name */}
              {(userProfile?.name || currentUser.displayName) && (
                <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '1.2rem' }}>👤</span>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '0.75rem', color: '#6c757d', marginBottom: '2px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Nome
                    </p>
                    <p style={{ fontSize: '1rem', fontWeight: 600, color: '#222' }}>
                      {userProfile?.name || currentUser.displayName}
                    </p>
                  </div>
                </div>
              )}

              {/* Email */}
              <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1.2rem' }}>📧</span>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '0.75rem', color: '#6c757d', marginBottom: '2px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Email
                  </p>
                  <p style={{ fontSize: '0.95rem', fontWeight: 500, color: '#222', wordBreak: 'break-all' }}>
                    {currentUser.email}
                  </p>
                </div>
              </div>

              {/* Birth Date */}
              {userProfile?.birthDate && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '1.2rem' }}>🎂</span>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '0.75rem', color: '#6c757d', marginBottom: '2px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Data de Nascimento
                    </p>
                    <p style={{ fontSize: '0.95rem', fontWeight: 500, color: '#222' }}>
                      {new Date(userProfile.birthDate).toLocaleDateString('pt-PT', { 
                        day: '2-digit', 
                        month: 'long', 
                        year: 'numeric' 
                      })}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={handleLogout}
              disabled={loading}
              className="cus-btn"
              style={{
                width: '100%',
                margin: '0 auto',
                display: 'block',
                fontSize: '16px'
              }}
            >
              {loading ? 'A sair...' : '🚪 Sair da Conta'}
            </button>
          </div>

          {message && (
            <div style={{
              padding: '12px',
              background: '#d4edda',
              color: '#155724',
              borderRadius: '8px',
              marginBottom: '16px',
              border: '1px solid #c3e6cb'
            }}>
              {message}
            </div>
          )}

          {error && (
            <div style={{
              padding: '12px',
              background: '#f8d7da',
              color: '#721c24',
              borderRadius: '8px',
              marginBottom: '16px',
              border: '1px solid #f5c6cb'
            }}>
              {error}
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="login-container" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.85)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '20px',
      overflowY: 'auto'
    }}>
      <div className="login-box" style={{
        background: '#fff',
        borderRadius: '24px',
        padding: '48px 40px',
        maxWidth: '500px',
        width: '100%',
        position: 'relative',
        boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
        border: '2px solid #222',
        margin: 'auto',
        maxHeight: '90vh',
        overflowY: 'auto'
      }}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'transparent',
            border: 'none',
            fontSize: '28px',
            cursor: 'pointer',
            color: '#222',
            lineHeight: 1,
            padding: '5px 10px'
          }}
          aria-label="Fechar"
        >
          ×
        </button>

        <h2 className="banner-text" style={{
          textAlign: 'center',
          marginBottom: '24px',
          fontSize: '2rem',
          color: '#222'
        }}>
          {resetMode ? 'Recuperar Palavra-passe' : isLogin ? 'Entrar' : 'Criar Conta'}
        </h2>

        {error && (
          <div style={{
            padding: '12px',
            background: '#f8d7da',
            color: '#721c24',
            borderRadius: '8px',
            marginBottom: '16px',
            border: '1px solid #f5c6cb'
          }}>
            {error}
          </div>
        )}

        {message && (
          <div style={{
            padding: '12px',
            background: '#d4edda',
            color: '#155724',
            borderRadius: '8px',
            marginBottom: '16px',
            border: '1px solid #c3e6cb'
          }}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ marginBottom: '24px' }}>
          {!isLogin && !resetMode && (
            <>
              <div style={{ marginBottom: '20px' }}>
                <label className="h-14 fw-400 black mb-4" style={{ display: 'block', marginBottom: '8px' }}>
                  Nome Completo
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="form-control"
                  placeholder="João Silva"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '2px solid #222',
                    borderRadius: '12px',
                    fontSize: '16px'
                  }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label className="h-14 fw-400 black mb-4" style={{ display: 'block', marginBottom: '8px' }}>
                  Data de Nascimento
                </label>
                <input
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  required
                  className="form-control"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '2px solid #222',
                    borderRadius: '12px',
                    fontSize: '16px'
                  }}
                />
              </div>
            </>
          )}

          <div style={{ marginBottom: '20px' }}>
            <label className="h-14 fw-400 black mb-4" style={{ display: 'block', marginBottom: '8px' }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="form-control"
              placeholder="email"
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '2px solid #222',
                borderRadius: '12px',
                fontSize: '16px'
              }}
            />
          </div>

          {!resetMode && (
            <>
              <div style={{ marginBottom: '20px' }}>
                <label className="h-14 fw-400 black mb-4" style={{ display: 'block', marginBottom: '8px' }}>
                  Palavra-passe
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="form-control"
                  placeholder="••••••••"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '2px solid #222',
                    borderRadius: '12px',
                    fontSize: '16px'
                  }}
                />
              </div>

              {!isLogin && (
                <div style={{ marginBottom: '20px' }}>
                  <label className="h-14 fw-400 black mb-4" style={{ display: 'block', marginBottom: '8px' }}>
                    Confirmar Palavra-passe
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="form-control"
                    placeholder="••••••••"
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '2px solid #222',
                      borderRadius: '12px',
                      fontSize: '16px'
                    }}
                  />
                </div>
              )}
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="cus-btn"
            style={{
              width: '100%',
              marginBottom: '16px'
            }}
          >
            {loading ? 'Aguarde...' : resetMode ? 'Enviar Email de Recuperação' : isLogin ? 'Entrar' : 'Criar Conta'}
          </button>
        </form>

        {!resetMode && (
          <>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '24px',
              gap: '12px'
            }}>
              <div style={{ flex: 1, height: '1px', background: '#ddd' }}></div>
              <span style={{ color: '#666', fontSize: '14px' }}>ou</span>
              <div style={{ flex: 1, height: '1px', background: '#ddd' }}></div>
            </div>

            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              type="button"
              style={{
                width: '100%',
                padding: '12px 24px',
                border: '2px solid #222',
                borderRadius: '12px',
                background: '#fff',
                fontSize: '16px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                marginBottom: '24px',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#f8f9fa'
                e.currentTarget.style.transform = 'translateY(-2px)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#fff'
                e.currentTarget.style.transform = 'translateY(0)'
              }}
            >
              <svg width="20" height="20" viewBox="0 0 20 20">
                <path fill="#4285F4" d="M19.6 10.23c0-.82-.1-1.42-.25-2.05H10v3.72h5.5c-.15.96-.74 2.31-2.04 3.22v2.45h3.16c1.89-1.73 2.98-4.3 2.98-7.34z"/>
                <path fill="#34A853" d="M13.46 15.13c-.83.59-1.96 1-3.46 1-2.64 0-4.88-1.74-5.68-4.15H1.07v2.52C2.72 17.75 6.09 20 10 20c2.7 0 4.96-.89 6.62-2.42l-3.16-2.45z"/>
                <path fill="#FBBC05" d="M3.99 10c0-.69.12-1.35.32-1.97V5.51H1.07A9.973 9.973 0 000 10c0 1.61.39 3.14 1.07 4.49l3.24-2.52c-.2-.62-.32-1.28-.32-1.97z"/>
                <path fill="#EA4335" d="M10 3.88c1.88 0 3.13.81 3.85 1.48l2.84-2.76C14.96.99 12.7 0 10 0 6.09 0 2.72 2.25 1.07 5.51l3.24 2.52C5.12 5.62 7.36 3.88 10 3.88z"/>
              </svg>
              Continuar com Google
            </button>
          </>
        )}

        <div style={{ textAlign: 'center' }}>
          {!resetMode && (
            <>
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#8cb4bc',
                  cursor: 'pointer',
                  fontSize: '14px',
                  textDecoration: 'underline',
                  marginBottom: '12px'
                }}
              >
                {isLogin ? 'Não tem conta? Criar conta' : 'Já tem conta? Entrar'}
              </button>
              <br />
            </>
          )}
          <button
            type="button"
            onClick={() => {
              setResetMode(!resetMode)
              setError('')
              setMessage('')
            }}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#8cb4bc',
              cursor: 'pointer',
              fontSize: '14px',
              textDecoration: 'underline'
            }}
          >
            {resetMode ? 'Voltar ao login' : 'Esqueceu a palavra-passe?'}
          </button>
        </div>
      </div>
    </div>
  )
}
