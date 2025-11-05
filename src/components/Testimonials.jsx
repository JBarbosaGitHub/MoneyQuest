import React from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination, A11y, Keyboard } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'


export default function Testimonials(){
  return (
    <section className="testimonials reveal" id="testimonials">
      <div className="container-fluid reveal">
        <div className="heading reveal">
          <h2 className="black mb-48"><span className="banner-text" title="TESTIMONIALS"> TESTIMONIALS</span></h2>
        </div>
      </div>
      <Swiper
        className="testimonials-slider reveal"
        modules={[Navigation, Pagination, A11y, Keyboard]}
        spaceBetween={24}
        slidesPerView={3}
        loop={true}
        pagination={{ clickable: true }}
        navigation
        keyboard={{ enabled: true }}
        breakpoints={{
          0: { slidesPerView: 1 },
          600: { slidesPerView: 2 },
          1100: { slidesPerView: 3 },
        }}
      >
        <SwiperSlide>
          <div className="testimonials-block reveal">
            <div className="title mb-32 reveal">
              <img src="/assets/media/icons/testimonial-1.png" alt="Foto de perfil do testemunho" />
              <div>
                <h4 className="h-28 fw-700 black mb-8">NAME OF PERSON</h4>
                <h6 className="h-21 font-sec fw-700 black">Position</h6>
              </div>
            </div>
            <p className="h-16 fw-400 body-text mb-24 black">Lorem ipsum dolor sit amet consectetur.</p>
          </div>
        </SwiperSlide>
        <SwiperSlide>
          <div className="testimonials-block reveal">
            <div className="title mb-32 reveal">
              <img src="/assets/media/icons/testimonial-1.png" alt="Foto de perfil do testemunho" />
              <div>
                <h4 className="h-28 fw-700 black mb-8">NAME OF PERSON</h4>
                <h6 className="h-21 font-sec fw-700 black">Position</h6>
              </div>
            </div>
            <p className="h-16 fw-400 body-text mb-24 black">Lorem ipsum dolor sit amet consectetur.</p>
          </div>
        </SwiperSlide>
        <SwiperSlide>
          <div className="testimonials-block reveal">
            <div className="title mb-32 reveal">
              <img src="/assets/media/icons/testimonial-1.png" alt="Foto de perfil do testemunho" />
              <div>
                <h4 className="h-28 fw-700 black mb-8">NAME OF PERSON</h4>
                <h6 className="h-21 font-sec fw-700 black">Position</h6>
              </div>
            </div>
            <p className="h-16 fw-400 body-text mb-24 black">Lorem ipsum dolor sit amet consectetur.</p>
          </div>
        </SwiperSlide>
        {/* Add more testimonial slides as needed */}
      </Swiper>
    </section>
  )
}
