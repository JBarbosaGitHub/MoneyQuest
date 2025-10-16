import React, { useState, useEffect } from 'react'
import emailjs from '@emailjs/browser'

export default function ContactPopup({ open, onClose }){
  const [formState, setFormState] = useState({ name: '', email: '', phone: '', company_name: '', message_project: '' })
  const [submitted, setSubmitted] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState(null)
  const [faqOpen, setFaqOpen] = useState(null)

  // Prevent text from disappearing by always showing value
  const handleChange = (e) => {
    setFormState(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    // basic required fields
    if (!formState.name || !formState.email) return
    
    setSending(true)
    setError(null)

    try {
      // Replace these with your EmailJS credentials from the dashboard
      const serviceID = 'service_fnddf33'  // Your Service ID from the screenshot
      const templateID = 'template_jlw285l'  // Get this from your email template page
      const publicKey = 'AEyQk9R6TTOCPPnC6'    // Get this from Account > General

      // These variable names MUST match your EmailJS template exactly
      const templateParams = {
        from_name: formState.name,          // matches {{from_name}} in template
        from_email: formState.email,        // matches {{from_email}} in template  
        phone: formState.phone,             // matches {{phone}} in template
        company_name: formState.company_name, // matches {{company_name}} in template
        message_project: formState.message_project // matches {{message_project}} in template
      }

      await emailjs.send(serviceID, templateID, templateParams, publicKey)
      
      setSubmitted(true)
      setSending(false)
      
      setTimeout(() => {
        setSubmitted(false)
        onClose()
        setFormState({ name: '', email: '', phone: '', company_name: '', message_project: '' })
      }, 2500)
    } catch (err) {
      console.error('Email send error:', err)
      setError('Failed to send message. Please try again.')
      setSending(false)
    }
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
          <div className="col-xl-5 col-lg-4 fade-in">
            <div className="company-contact-detail">
              <button className="close-btn begin-popupClose" type="button" onClick={onClose}>VOLTAR</button>
              <h2 className="h-90 fw-800 black mb-8">FALE <span>CONNOSCO</span></h2>
              <h5 className="h-21 font-sec fw-700 dark-black mb-48">Estamos aqui para ouvir as suas questões ou ideias!</h5>
              <span className="vert-line"></span>
              <hr className="bg-dark-black mb-48" />
              <ul className="footer_menu list-unstyled">
                <li>
                  <ul className="list-unstyled mb-48">
                    <li className="h-28 fw-700 dark-black mb-16">HORÁRIO</li>
                    <li className="h-16 fw-400 body-text dark-black timing"><span>SEG-SEX</span><span>09H-17H</span></li>
                    <li className="h-16 fw-400 body-text dark-black timing"><span>SÁB-DOM</span><span>11H-18H</span></li>
                  </ul>
                  <hr className="bg-dark-black mb-48" />
                </li>
                <li>
                  <ul className="list-unstyled">
                    <li className="h-28 fw-700 dark-black mb-16">CONTACTOS</li>
                    <li className="h-16 fw-400 body-text dark-black mb-16"><a href="tel:123456789">T. +123 123 4567</a></li>
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
                  <h2 className="h-47 fw-700 white mb-16 mt-5">Obrigado pelo seu contacto!</h2>
                  <p className="text-14 fw-500 white-sec mb-48">A nossa equipa está a analisar o seu pedido e irá responder brevemente.</p>
                </div>
              ) : (
                <div className="form-content-wrap fade-in">
                  {error && (
                    <div className="alert alert-danger mb-16" style={{color: '#d63384', background: '#f8d7da', padding: '12px', borderRadius: '8px'}}>
                      {error}
                    </div>
                  )}
                  <form action="/" className="form-group contact-form mb-48" id="contact-form" method="post" onSubmit={handleSubmit}>
                    <div className="row">
                      <div className="col-md-6 mb-32">
                        <input type="text" className="form-control" name="name" required placeholder="Nome" value={formState.name} onChange={handleChange} disabled={sending} />
                      </div>
                      <div className="col-md-6 mb-32">
                        <input type="email" className="form-control" name="email" required placeholder="Email" value={formState.email} onChange={handleChange} disabled={sending} />
                      </div>
                      <div className="col-md-6 mb-32">
                        <input type="tel" className="form-control" name="phone" placeholder="Telefone" value={formState.phone} onChange={handleChange} disabled={sending} />
                      </div>
                      <div className="col-md-6 mb-32">
                        <input type="text" className="form-control" name="company_name" placeholder="Empresa" value={formState.company_name} onChange={handleChange} disabled={sending} />
                      </div>
                      <input type="hidden" name="formType" id="formType" value="enquire" />
                    </div>
                    <div className="row project-fields">
                      <div className="col-12 mb-32">
                        <textarea name="message_project" className="form-control" placeholder="Mensagem" value={formState.message_project} onChange={handleChange} disabled={sending}></textarea>
                      </div>
                    </div>
                    <button type="submit" className="cus-btn-2 w-100" disabled={sending}>
                      {sending ? 'A ENVIAR...' : 'ENVIAR MENSAGEM'} &nbsp;&nbsp;<i className="fal fa-chevron-right"></i>
                    </button>
                    <div id="message" className="alert-msg"></div>
                  </form>
                  {/* FAQ Section - styled as cards with icons */}
                  <div className="faq-section mt-48">
                    <h4 className="h-28 fw-700 dark-black mb-16">PERGUNTAS FREQUENTES</h4>
                    {[{
                      q: 'Como posso contactar o suporte?',
                      a: 'Pode usar o formulário de contacto ou enviar email para info@example.com.'
                    }, {
                      q: 'Qual é o vosso horário?',
                      a: 'Estamos abertos de segunda a sexta, das 09h às 17h, e fins de semana das 11h às 18h.'
                    }, {
                      q: 'Quando recebo resposta?',
                      a: 'Respondemos a todos os pedidos no prazo de 24 horas.'
                    }].map((item, idx) => (
                      <div key={idx} className={`faq-card mb-16${faqOpen===idx ? ' open' : ''}`}>
                        <div style={{flex:'1'}}>
                          <div className="faq-question h-16 fw-500" onClick={()=>setFaqOpen(faqOpen===idx?null:idx)}>
                            {item.q}
                          </div>
                          {faqOpen===idx && <div className="faq-answer h-16 fw-400 mt-8">{item.a}</div>}
                        </div>
                        <button
                          className="faq-toggle-btn"
                          aria-label={faqOpen===idx ? 'Collapse' : 'Expand'}
                          onClick={()=>setFaqOpen(faqOpen===idx?null:idx)}
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
