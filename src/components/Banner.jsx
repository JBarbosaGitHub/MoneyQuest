import React, {useState} from 'react'

function AccordionItem({title, children, isOpen, onToggle}){
  return (
    <div className={`accordion ${isOpen ? 'accordion_active' : ''}`}>
      <div className="accordion_intro" onClick={onToggle} role="button" tabIndex={0}>
        <h4 className="dark-black">{title}</h4>
      </div>
      <div className="accordion_content" style={{ maxHeight: isOpen ? `${2000}px` : null }} aria-hidden={!isOpen}>
        {children}
      </div>
    </div>
  )
}


export default function Banner({ onOpenContact }){
  const [openIndex, setOpenIndex] = useState(0)

  const toggle = (i) => setOpenIndex(prev => prev === i ? -1 : i)

  return (
    <section className="banner reveal">
      <div className="container-fluid">
        <div className="row">
          <div className="col-xl-7 col-lg-7 col-md-7 col-sm-7 order-sm-1 order-2 reveal">
            <div className="text-block">
              <h1 className="black mb-32"><span className="banner-text" title="MASTERING">MASTERING</span><br/> <span className="rotate-text">YOUR</span> <span className="banner-text color-primary" title="FINANCE">FINANCE</span></h1>
              <p className="dark-black h-16 body-text mb-32">Lorem ipsum dolor sit amet consectetur adipisicing elit. Libero accusamus incidunt, animi commodi nemo maiores nihil eius nulla, reprehenderit dolor tempore.</p>
              <div className="btn-block">
                <button type="button" className="cus-btn-2 contact-btn" onClick={()=>onOpenContact && onOpenContact()}>SCHEDULE A MEETING &nbsp;&nbsp;<i className="fal fa-chevron-right"></i></button>
              </div>
            </div>
          </div>
          <div className="col-xl-5 col-lg-5 col-md-5 col-sm-5 order-sm-2 order-1 reveal">
            <div className="image-block">
              <div className="banner-image">
                <img src="/assets/media/images/hero-banner.png" alt="" className="first" fetchpriority="high" decoding="async" />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="about-sec reveal" id="about">
        <div className="container-fluid">
          <div className="row">
            <div className="col-xl-7 col-lg-7 col-md-7 col-sm-7 reveal">
              <div className="accordion_block">
                <AccordionItem title="OUR STORY" isOpen={openIndex===0} onToggle={() => toggle(0)}>
                  <p className="h-16 body-text dark-gray fw-400 mb-16 mt-24">Lorem ipsum dolor sit amet consectetur, adipisicing elit. Nisi quidem quaerat expedita aspernatur natus ipsam impedit nobis delectus eligendi ea tenetur...</p>
                </AccordionItem>
                <AccordionItem title="OUR VISION" isOpen={openIndex===1} onToggle={() => toggle(1)}>
                  <p className="h-16 body-text dark-gray fw-400 mb-16 mt-24">Lorem ipsum dolor sit amet consectetur, adipisicing elit. Nisi quidem quaerat expedita aspernatur natus ipsam impedit nobis delectus eligendi ea tenetur...</p>
                </AccordionItem>
                <AccordionItem title="WHY YOU CHOOSE US?" isOpen={openIndex===2} onToggle={() => toggle(2)}>
                  <p className="h-16 body-text dark-gray fw-400 mb-16 mt-24">Lorem ipsum dolor sit amet consectetur, adipisicing elit. Nisi quidem quaerat expedita aspernatur natus ipsam impedit nobis delectus eligendi ea tenetur...</p>
                </AccordionItem>
              </div>
            </div>
            <div className="col-xl-5 col-lg-5 col-md-5 reveal">
              <img src="/assets/media/about/image-1.png" alt="" className="about-main-image" loading="lazy" decoding="async" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
