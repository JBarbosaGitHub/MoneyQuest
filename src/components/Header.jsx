import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'

export default function Header({ onOpenContact, onOpenLogin, onOpenAdmin }){
  const [open, setOpen] = useState(false)
  const { currentUser, userProfile } = useAuth()

  return (
    <header className={`header ${open ? 'menu-active' : ''}`}>
      <div className="logo">
        <a href="#">
          <img src="/assets/media/logo.png" className="brand-logo" alt="" />
        </a>
      </div>
      <div className="menu-detail">
        <div className="menu-link">
          <button
            className={`hamburger ${open ? 'show hamburger-close' : ''}`}
            aria-label="Toggle menu"
            onClick={() => setOpen(v => !v)}
          >
            <span className="line-menu half start"></span>
            <span className="line-menu"></span>
            <span className="line-menu half end"></span>
          </button>
          <button className="cus-btn primary contact-btn" onClick={()=>onOpenContact && onOpenContact()}>CONTACTE-NOS</button>
        </div>
        <div className={`toggle-menu ${open ? 'show' : ''}`}>
          <div className="site-header__bg" onClick={() => setOpen(false)}></div>
          <div className="toggle-link">
            <ul className="links list-unstyled">
              <li><a href="#about" onClick={() => setOpen(false)}>About</a></li>
              <li><a href="#service" onClick={() => setOpen(false)}>Services</a></li>
              {/* Consultas link before Simuladores */}
              <li><a href="#consultas" onClick={() => setOpen(false)}>Consultas</a></li>
              <li><a href="#simulators" onClick={() => setOpen(false)}>Simuladores</a></li>
              <li><a href="#testimonials" onClick={() => setOpen(false)}>Testimonials</a></li>
              <li><a href="#team" onClick={() => setOpen(false)}>Team</a></li>
              <li>
                <a 
                  href="#" 
                  onClick={(e) => {
                    e.preventDefault()
                    setOpen(false)
                    onOpenLogin && onOpenLogin()
                  }}
                >
                  {currentUser ? 'Perfil' : 'Login'}
                </a>
              </li>
              {currentUser && userProfile?.isAdmin && (
                <li>
                  <a 
                    href="#" 
                    onClick={(e) => {
                      e.preventDefault()
                      setOpen(false)
                      onOpenAdmin && onOpenAdmin()
                    }}
                  >
                    Admin
                  </a>
                </li>
              )}
            </ul>
            <ul className="social-link list-unstyled">
              <li><a href="#">Instagram</a></li>
              <li><a href="#">Linkedin</a></li>
              <li><a href="#">Indeed</a></li>
            </ul>
          </div>
        </div>
      </div>
    </header>
  )
}
