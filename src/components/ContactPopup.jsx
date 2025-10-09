import React, { useState, useEffect } from 'react'

export default function ContactPopup({ open, onClose }){
  const [formState, setFormState] = useState({ name: '', email: '', phone: '', company_name: '', message_project: '' })
  const [submitted, setSubmitted] = useState(false)
  const [faqOpen, setFaqOpen] = useState(null)

  // Prevent text from disappearing by always showing value
  const handleChange = (e) => {
    setFormState(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // basic required fields
    if (!formState.name || !formState.email) return
    setSubmitted(true)
    setTimeout(() => {
      setSubmitted(false)
      onClose()
      setFormState({ name: '', email: '', phone: '', company_name: '', message_project: '' })
    }, 1500)
  }

  useEffect(() => {
    if (open) {
      document.body.classList.add('popup-open')
    } else {
      document.body.classList.remove('popup-open')
    }
    return () => document.body.classList.remove('popup-open')
  }, [open])

  if (!open) return null

  return (
    <div className="begin-popup" style={{ right: 0 }}>
      <div className="overlay" onClick={onClose} style={{ transform: 'scale(1)', opacity: 0.5 }}></div>
      <div className="content">
        <div className="row">
          <div className="col-xl-5 col-lg-4">
            <div className="company-contact-detail">
              <button className="close-btn begin-popupClose" type="button" onClick={onClose}>GO BACK</button>
              <h2 className="h-90 fw-800 black mb-8">GET IN <span>TOUCH</span></h2>
              <h5 className="h-21 font-sec fw-700 dark-black mb-48">We are here to listen to your questions or ideas!</h5>
              <span className="vert-line"></span>
              <hr className="bg-dark-black mb-48" />
              <ul className="footer_menu list-unstyled">
                <li>
                  <ul className="list-unstyled mb-48">
                    <li className="h-28 fw-700 dark-black mb-16">OPENING HOURS</li>
                    <li className="h-16 fw-400 body-text dark-black timing"><span>MON-FRI</span><span>09AM-5PM</span></li>
                    <li className="h-16 fw-400 body-text dark-black timing"><span>SAT-SUN</span><span>11AM-6PM</span></li>
                  </ul>
                  <hr className="bg-dark-black mb-48" />
                </li>
                <li>
                  <ul className="list-unstyled">
                    <li className="h-28 fw-700 dark-black mb-16">CONTACT DETAILS</li>
                    <li className="h-16 fw-400 body-text dark-black mb-16"><a href="tel:123456789">P. +123 123 4567</a></li>
                    <li className="h-16 fw-400 body-text dark-black"><a href="mailto:info@example.com">E. info@example.com</a></li>
                  </ul>
                </li>
              </ul>
            </div>
          </div>
          <div className="col-xl-7 col-lg-8 fade-in">
            <div className="parent">
              {submitted ? (
                <div className="thanksMessage fade-in">
                  <h2 className="h-47 fw-700 white mb-16 mt-5">Thanks For Reaching Out</h2>
                  <p className="text-14 fw-500 white-sec mb-48">Our team are reviewing your enquiry, and will be in touch shortly.</p>
                </div>
              ) : (
                <div className="form-content-wrap fade-in">
                  <form action="/" className="form-group contact-form mb-48" id="contact-form" method="post" onSubmit={handleSubmit}>
                    <div className="row">
                      <div className="col-md-6 mb-32">
                        <input type="text" className="form-control" name="name" required placeholder="Your Name" value={formState.name} onChange={handleChange} />
                      </div>
                      <div className="col-md-6 mb-32">
                        <input type="email" className="form-control" name="email" required placeholder="Your Email" value={formState.email} onChange={handleChange} />
                      </div>
                      <div className="col-md-6 mb-32">
                        <input type="tel" className="form-control" name="phone" placeholder="Phone Number" value={formState.phone} onChange={handleChange} />
                      </div>
                      <div className="col-md-6 mb-32">
                        <input type="text" className="form-control" name="company_name" placeholder="Business Name" value={formState.company_name} onChange={handleChange} />
                      </div>
                      <input type="hidden" name="formType" id="formType" value="enquire" />
                    </div>
                    <div className="row project-fields">
                      <div className="col-12 mb-32">
                        <textarea name="message_project" className="form-control" placeholder="Project Description" value={formState.message_project} onChange={handleChange}></textarea>
                      </div>
                    </div>
                    <button type="submit" className="cus-btn-2 w-100">SEND MESSAGE &nbsp;&nbsp;<i className="fal fa-chevron-right"></i></button>
                    <div id="message" className="alert-msg"></div>
                  </form>
                  {/* FAQ Section - styled as cards with icons */}
                  <div className="faq-section mt-48">
                    <h4 className="h-28 fw-700 dark-black mb-16">FAQ'S</h4>
                    {[{
                      q: 'How do I contact support?',
                      a: 'You can use the contact form or email us at info@example.com.'
                    }, {
                      q: 'What are your business hours?',
                      a: 'We are open Monday to Friday, 9AM to 5PM, and weekends 11AM to 6PM.'
                    }, {
                      q: 'How soon will I get a response?',
                      a: 'We aim to respond within 24 hours to all enquiries.'
                    }].map((item, idx) => (
                      <div key={idx} className={`faq-card mb-16${faqOpen===idx ? ' open' : ''}`} style={{background:'#fff', borderRadius:'12px', boxShadow:'0 2px 8px rgba(0,0,0,0.04)', padding:'16px 24px', display:'flex', alignItems:'center', justifyContent:'space-between'}}>
                        <div style={{flex:'1'}}>
                          <div className="faq-question h-16 fw-500" style={{cursor:'pointer'}} onClick={()=>setFaqOpen(faqOpen===idx?null:idx)}>
                            {item.q}
                          </div>
                          {faqOpen===idx && <div className="faq-answer h-16 fw-400 mt-8" style={{color:'#333'}}>{item.a}</div>}
                        </div>
                        <button
                          className="faq-toggle-btn"
                          aria-label={faqOpen===idx ? 'Collapse' : 'Expand'}
                          onClick={()=>setFaqOpen(faqOpen===idx?null:idx)}
                          style={{background:'none', border:'none', outline:'none', cursor:'pointer', marginLeft:'16px', fontSize:'24px', display:'flex', alignItems:'center'}}
                        >
                          {faqOpen===idx ? (
                            <span style={{fontWeight:'bold', fontSize:'24px'}}>−</span>
                          ) : (
                            <span style={{fontWeight:'bold', fontSize:'24px'}}>+</span>
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
