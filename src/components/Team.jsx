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
                <img src="/src/assets/Sonia.png" alt="" className="mb-32" loading="lazy" decoding="async" />
                <div className="title">
                  <h4 className="h-38 fw-700 black">SÓNIA SANCHES</h4>
                  <h5 className="h-21 fw-700 font-sec black">Fundadora & Educadora Financeira</h5>
                </div>
                <p className="h-16 fw-400 body-text black">Especialista em educação financeira e pedagogia ativa. Formada em psicologia e educação, com experiência na banca e em formação de adultos e desenvolvimento de programas de literacia económica. Criativa, prática e focada em resultados reais.
</p>
              </div>
            </div>
          </SwiperSlide>
          <SwiperSlide>
            <div className="team-block">
              <img src="/assets/media/vectors/shape-3.png" className="team-shape" alt="" />
              <div className="member-detail">
                <img src="/src/assets/Miguel.png" alt="" className="mb-32" />
                <div className="title">
                  <h4 className="h-38 fw-700 black">MIGUEL DIAS</h4>
                  <h5 className="h-21 fw-700 font-sec black">Fundador & Contabilista</h5>
                </div>
                <p className="h-16 fw-400 body-text black">Especialista financeiro e empreendedor. Apaixonado por matemática aplicada e tecnologia educativa. Formado em gestão, economia e matemática aplicada, lidera workshops de planeamento financeiro e investimento para adultos. Direto, motivador e comprometido com a autonomia.</p>
              </div>
            </div>
          </SwiperSlide>
          {/* Add more team slides as needed */}
        </Swiper>
      </div>
    </section>
  )
}
