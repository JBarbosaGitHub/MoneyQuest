import React, { useState } from 'react'
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
  const openContactPopup = () => setOpenPopup(true)

  return (
    <div>
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
