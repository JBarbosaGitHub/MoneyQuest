import React, { useState } from 'react'

export default function CaseStudies(){
  const [active, setActive] = useState('detail-1')

  const handleClick = (id) => {
    setActive(id)
  }

  return (
    <section className="case-studies" id="case-studies">
      <div className="container-fluid">
        <div className="heading">
          <h2 className="black mb-48"><span className="banner-text" title="CASE STUDIES"> CASE STUDIES</span></h2>
        </div>
        <div className="row">
          <div className="col-xl-6 col-lg-6">
            <div className="brand-area">
              <button type="button" onClick={() => handleClick('detail-1')} className={`square project ${active==='detail-1'? 'active':''}`} id="detail-1">Brand 1</button>
              <button type="button" onClick={() => handleClick('detail-2')} className={`square project ${active==='detail-2'? 'active':''}`} id="detail-2">Brand 2</button>
              <button type="button" onClick={() => handleClick('detail-3')} className={`square project ${active==='detail-3'? 'active':''}`} id="detail-3">Brand 3</button>
              <button type="button" onClick={() => handleClick('detail-4')} className={`square project ${active==='detail-4'? 'active':''}`} id="detail-3">Brand 4</button>
              <button type="button" onClick={() => handleClick('detail-5')} className={`square project ${active==='detail-5'? 'active':''}`} id="detail-3">Brand 5</button>
              <button type="button" onClick={() => handleClick('detail-6')} className={`square project ${active==='detail-6'? 'active':''}`} id="detail-3">Brand 6</button>
              <button type="button" onClick={() => handleClick('detail-7')} className={`square project ${active==='detail-7'? 'active':''}`} id="detail-3">Brand 7</button>
              <button type="button" onClick={() => handleClick('detail-8')} className={`square project ${active==='detail-8'? 'active':''}`} id="detail-3">Brand 8</button>
              <button type="button" onClick={() => handleClick('detail-9')} className={`square project ${active==='detail-9'? 'active':''}`} id="detail-3">Brand 9</button>
            </div>
          </div>
          <div className="col-xl-6 col-lg-6">
            <div className={`brand-detail detail-1 ${active==='detail-1'? 'active':''}`}>
              <img src="/html/assets/media/vectors/shape-2.png" alt="" className="bg-shape" />
              <div className="detail-content">
                <div className="image-block mb-40">
                  <img src="/html/assets/media/brand-logo/brand-img-1.png" alt="" className="detailContent_image" />
                </div>
                <div className="text-block">
                  <img src="/html/assets/media/brand-logo/brand-logo-1.png" alt="" className="detail-logo" />
                  <div className="vr-line"></div>
                  <p className="h-16 fw-400 black">Lorem ipsum dolor sit amet consectetur.</p>
                </div>
              </div>
            </div>
            <div className={`brand-detail detail-2 ${active==='detail-2'? 'active':''}`} style={{display: active==='detail-2' ? 'block' : 'none'}}>
              <img src="/html/assets/media/vectors/shape-2.png" alt="" className="bg-shape" />
              <div className="detail-content">
                <div className="image-block mb-40">
                  <img src="/html/assets/media/brand-logo/brand-img-2.png" alt="" className="detailContent_image" />
                </div>
                <div className="text-block">
                  <img src="/html/assets/media/brand-logo/brand-logo-2.png" alt="" className="detail-logo" />
                  <div className="vr-line"></div>
                  <p className="h-16 fw-400 black">Alternate brand description for brand 2.</p>
                </div>
              </div>
            </div>
            <div className={`brand-detail detail-3 ${active==='detail-3'? 'active':''}`} style={{display: active==='detail-3' ? 'block' : 'none'}}>
              <img src="/html/assets/media/vectors/shape-2.png" alt="" className="bg-shape" />
              <div className="detail-content">
                <div className="image-block mb-40">
                  <img src="/html/assets/media/brand-logo/brand-img-3.png" alt="" className="detailContent_image" />
                </div>
                <div className="text-block">
                  <img src="/html/assets/media/brand-logo/brand-logo-3.png" alt="" className="detail-logo" />
                  <div className="vr-line"></div>
                  <p className="h-16 fw-400 black">Alternate brand description for brand 3.</p>
                </div>
              </div>
            </div>
            <div className={`brand-detail detail-4 ${active==='detail-4'? 'active':''}`} style={{display: active==='detail-4' ? 'block' : 'none'}}>
              <img src="/html/assets/media/vectors/shape-2.png" alt="" className="bg-shape" />
              <div className="detail-content">
                <div className="image-block mb-40">
                  <img src="/html/assets/media/brand-logo/brand-img-4.png" alt="" className="detailContent_image" />
                </div>
                <div className="text-block">
                  <img src="/html/assets/media/brand-logo/brand-logo-4.png" alt="" className="detail-logo" />
                  <div className="vr-line"></div>
                  <p className="h-16 fw-400 black">Alternate brand description for brand 4.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
