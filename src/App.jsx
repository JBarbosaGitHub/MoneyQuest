
import React, { useState, useEffect } from 'react'
import Lottie from 'lottie-react'
import Header from './components/Header'
import Banner from './components/Banner'
import Services from './components/Services'
import CaseStudies from './components/CaseStudies'
import Testimonials from './components/Testimonials'
import Team from './components/Team'
import Footer from './components/Footer'
import ContactPopup from './components/ContactPopup'

export default function App(){
  const [openPopup, setOpenPopup] = useState(false)

  const [loading, setLoading] = useState(true)
  const openContactPopup = () => setOpenPopup(true)

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2600)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div>
      {loading && (
        <div id="preloader" className="preloader-animated">
          <div className="loader">
            <Lottie
              path="/assets/media/finpro.json"
              loop={false}
              autoplay
              style={{ width: 320, height: 320 }}
            />
          </div>
        </div>
      )}
      <Header onOpenContact={openContactPopup} />
      <main id="main-wrapper" className="main-wrapper overflow-hidden">
        <Banner onOpenContact={openContactPopup} />
        <Services onOpenContact={openContactPopup} />
        <CaseStudies />
        <Testimonials />
        <Team />
      </main>
      <ContactPopup open={openPopup} onClose={() => setOpenPopup(false)} />
      <Footer onOpenContact={openContactPopup} />
    </div>
  )
}
