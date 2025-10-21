import React from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import 'swiper/css'

export default function Services({ onOpenContact }){
  return (
    <section className="services reveal" id="service">
      <div className="container-fluid">
        <div className="row">
          <div className="heading reveal">
            <h2 className="black mb-48"><span className="banner-text" title="SERVICES"> SERVICES</span></h2>
          </div>
          <Swiper
            className="services-slider reveal"
            spaceBetween={24}
            slidesPerView={3}
            breakpoints={{
              0: { slidesPerView: 1 },
              600: { slidesPerView: 2 },
              1100: { slidesPerView: 3 },
            }}
            loop={true}
            autoplay={false}
          >
            <SwiperSlide>
              <div className="service-block_link contact-btn" onClick={()=>onOpenContact && onOpenContact()}>
                <div className="service-block">
                  <div className="content">
                    <h4 className="h-38 black mb-12">PERSONAL <br/> FINANCE</h4>
                    <p className="h-16 body-text fw-500 mb-40 black">Lorem ipsum dolor sit amet consectetur.</p>
                    <img src="/assets/media/images/card-1.png" alt="" className="card-image" loading="lazy" decoding="async" />
                  </div>
                  <img src="/assets/media/vectors/shape-1.png" alt="" className="shape-image" />
                  <h3 data-text="GET STARTED">GET STARTED</h3>
                </div>
              </div>
            </SwiperSlide>
            <SwiperSlide>
              <div className="service-block_link contact-btn" onClick={()=>onOpenContact && onOpenContact()}>
                <div className="service-block">
                  <div className="content">
                    <h4 className="h-38 black mb-12">PAYROLL <br/> MANAGEMENT</h4>
                    <p className="h-16 body-text fw-500 mb-40 black">Lorem ipsum dolor sit amet consectetur.</p>
                    <img src="/assets/media/images/card-2.png" alt="" className="card-image" loading="lazy" decoding="async" />
                  </div>
                  <img src="/assets/media/vectors/shape-1.png" alt="" className="shape-image" />
                  <h3 data-text="GET STARTED">GET STARTED</h3>
                </div>
              </div>
            </SwiperSlide>
            <SwiperSlide>
              <div className="service-block_link contact-btn">
                <div className="service-block">
                  <div className="content">
                    <h4 className="h-38 black mb-12">PAYROLL <br/> MANAGEMENT</h4>
                    <p className="h-16 body-text fw-500 mb-40 black">Lorem ipsum dolor sit amet consectetur.</p>
                    <img src="/assets/media/images/card-2.png" alt="" className="card-image" loading="lazy" decoding="async" />
                  </div>
                  <img src="/assets/media/vectors/shape-1.png" alt="" className="shape-image" />
                  <h3 data-text="GET STARTED">GET STARTED</h3>
                </div>
              </div>
            </SwiperSlide>
            {/* Add more slides as needed */}
          </Swiper>
        </div>
      </div>
    </section>
  )
}
