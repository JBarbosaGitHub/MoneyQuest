
import React, { useState, useEffect } from 'react'
import Lottie from 'lottie-react'
import Header from './components/Header'
import Banner from './components/Banner'
import Services from './components/Services'
import CaseStudies from './components/CaseStudies'
import ConsultasFinanceiras from './components/ConsultasFinanceiras'
import Testimonials from './components/Testimonials'
import Team from './components/Team'
import Footer from './components/Footer'
import ContactPopup from './components/ContactPopup'
import Login from './components/Login'
import ConsultasAdminModal from './components/ConsultasAdminModal'
import useReveal from './hooks/useReveal'

export default function App(){
  const [openPopup, setOpenPopup] = useState(false)
  const [openLogin, setOpenLogin] = useState(false)
  const [openAdmin, setOpenAdmin] = useState(false)

  const [loading, setLoading] = useState(true)
  const openContactPopup = () => setOpenPopup(true)
  const openLoginPopup = () => setOpenLogin(true)
  const openAdminPanel = () => setOpenAdmin(true)
  const [lottieData, setLottieData] = useState(null)

  // Initialize scroll reveal once
  useReveal && useReveal('.reveal')

  useEffect(() => {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setLoading(false)
      return
    }
    const timer = setTimeout(() => setLoading(false), 2600)
    return () => clearTimeout(timer)
  }, [])

  // Fetch Lottie JSON from public folder (works in dev and prod)
  useEffect(() => {
    let active = true
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) return
    fetch('/assets/media/finpro.json')
      .then(r => r.ok ? r.json() : Promise.reject(new Error('Failed to load Lottie JSON')))
      .then(json => { if (active) setLottieData(json) })
      .catch(() => {})
    return () => { active = false }
  }, [])

  return (
    <div>
      {loading && (
        <div id="preloader" className="preloader-animated">
          <div className="loader">
            {lottieData ? (
              <Lottie
                animationData={lottieData}
                loop={false}
                autoplay
                style={{ width: 320, height: 320 }}
                onComplete={() => setLoading(false)}
              />
            ) : (
              <img src="/assets/media/logo.png" alt="Logo" style={{ width: 320, height: 320 }} />
            )}
          </div>
        </div>
      )}
      <Header onOpenContact={openContactPopup} onOpenLogin={openLoginPopup} onOpenAdmin={openAdminPanel} />
      <main id="main-wrapper" className="main-wrapper overflow-hidden">
        <Banner onOpenContact={openContactPopup} />
        <Services onOpenContact={openContactPopup} />
        {/* Consultas before Simuladores */}
        <ConsultasFinanceiras onOpenLogin={openLoginPopup} />
        <CaseStudies onOpenLogin={openLoginPopup} />
        <Testimonials />
        <Team />
      </main>
      <ContactPopup open={openPopup} onClose={() => setOpenPopup(false)} />
      {openLogin && <Login onClose={() => setOpenLogin(false)} />}
      <ConsultasAdminModal open={openAdmin} onClose={() => setOpenAdmin(false)} />
      <Footer onOpenContact={openContactPopup} />
    </div>
  )
}
