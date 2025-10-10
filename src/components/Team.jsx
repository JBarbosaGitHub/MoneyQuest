import React from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import 'swiper/css'

export default function Team(){
  return (
    <section className="team reveal" id="team">
      <div className="container-fluid">
        <div className="heading reveal">
          <h2 className="black mb-48"><span className="banner-text" title="MEET OUR TEAM"> MEET OUR TEAM</span></h2>
        </div>
        <Swiper
          className="team-slider reveal"
          spaceBetween={24}
          slidesPerView={3}
          loop={true}
          breakpoints={{
            0: { slidesPerView: 1 },
            600: { slidesPerView: 2 },
            1100: { slidesPerView: 3 },
          }}
        >
          <SwiperSlide>
            <div className="team-block">
              <img src="/assets/media/vectors/shape-3.png" className="team-shape" alt="" loading="lazy" decoding="async" />
              <div className="member-detail">
                <img src="/assets/media/users/user-1.png" alt="" className="mb-32" loading="lazy" decoding="async" />
                <div className="title">
                  <h4 className="h-38 fw-700 black">JACOB ANDREW</h4>
                  <h5 className="h-21 fw-700 font-sec black">Founder & Accountant</h5>
                </div>
                <p className="h-16 fw-400 body-text black">Josh will handle your BAS, Individual & Company Tax Returns.</p>
              </div>
            </div>
          </SwiperSlide>
          <SwiperSlide>
            <div className="team-block">
              <img src="/assets/media/vectors/shape-3.png" className="team-shape" alt="" />
              <div className="member-detail">
                <img src="/assets/media/users/user-1.png" alt="" className="mb-32" />
                <div className="title">
                  <h4 className="h-38 fw-700 black">JACOB ANDREW</h4>
                  <h5 className="h-21 fw-700 font-sec black">Founder & Accountant</h5>
                </div>
                <p className="h-16 fw-400 body-text black">Josh will handle your BAS, Individual & Company Tax Returns.</p>
              </div>
            </div>
          </SwiperSlide>
          <SwiperSlide>
            <div className="team-block">
              <img src="/assets/media/vectors/shape-3.png" className="team-shape" alt="" />
              <div className="member-detail">
                <img src="/assets/media/users/user-1.png" alt="" className="mb-32" />
                <div className="title">
                  <h4 className="h-38 fw-700 black">JACOB ANDREW</h4>
                  <h5 className="h-21 fw-700 font-sec black">Founder & Accountant</h5>
                </div>
                <p className="h-16 fw-400 body-text black">Josh will handle your BAS, Individual & Company Tax Returns.</p>
              </div>
            </div>
          </SwiperSlide>
          {/* Add more team slides as needed */}
        </Swiper>
      </div>
    </section>
  )
}
