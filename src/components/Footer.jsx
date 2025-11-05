
import React from 'react'

export default function Footer({ onOpenContact }) {
  return (
    <footer>
      <div className="container-fluid">
        <div className="footer-box">
          <img src="/assets/media/vectors/footer-shape.png" alt="Forma decorativa do rodapé" />
          <div className="content-area">
            <div className="menu-detail">
              <h2 className="h-120 fw-900 white">
                <a href="#" className="contact-btn" onClick={e => { e.preventDefault(); onOpenContact && onOpenContact(); }}>
                  LET'S <br /> TALK
                </a>
              </h2>
              <ul className="footer_menu list-unstyled">
                <li className="h-28 fw-700 white mb-16">SERVICES</li>
                <li className="h-16 fw-400 body-text white mb-8"><a href="#">RETAIL SOLUTIONS</a></li>
                <li className="h-16 fw-400 body-text white mb-8"><a href="#">SHOPPING CENTER SOLUTIONS</a></li>
                <li className="h-16 fw-400 body-text white mb-8"><a href="#">SIGNAGE INSTALLATIONS</a></li>
                <li className="h-16 fw-400 body-text white mb-8"><a href="#">INSPIRED CAMPAIGN BUILDER</a></li>
              </ul>
              <ul className="footer_menu list-unstyled mt-32">
                <li className="h-28 fw-700 white mb-16">IMPORTANT LINKS</li>
                <li className="h-16 fw-400 body-text white mb-8"><a href="#">SERVICES</a></li>
                <li className="h-16 fw-400 body-text white mb-8"><a href="#">ABOUT US</a></li>
                <li className="h-16 fw-400 body-text white mb-8"><a href="#">GALLERY</a></li>
                <li className="h-16 fw-400 body-text white mb-8"><a href="#">HELP CENTER</a></li>
                <li className="h-16 fw-400 body-text white mb-8"><a href="#" className="contact-btn">CONTACTE-NOS</a></li>
              </ul>
              <ul className="footer_menu list-unstyled mt-32">
                <li className="h-28 fw-700 white mb-16">OPENING HOURS</li>
                <li className="h-16 fw-400 body-text white timing"><span>MON-FRI</span><span>09AM-5PM</span></li>
                <li className="h-16 fw-400 body-text white timing"><span>SAT-SUN</span><span>11AM-6PM</span></li>
              </ul>
              <ul className="footer_menu list-unstyled mt-32">
                <li className="h-28 fw-700 white mb-16">CONTACT DETAILS</li>
                <li className="h-16 fw-400 body-text white mb-8"><a href="tel:+1231234567">P. +123 123 4567</a></li>
                <li className="h-16 fw-400 body-text white"><a href="mailto:info@example.com">E. info@example.com</a></li>
              </ul>
            </div>
            <h2 className="company-name"><a href="#">FINPRO</a> ADVISORS</h2>
            <div className="bottom-bar">
              <h5 className="h-21 white fw-600">©2024 All Rights Reserved</h5>
              <div className="social-icons">
                <a href="#" aria-label="Instagram"><i className="fab fa-instagram"></i></a>
                <a href="#" aria-label="LinkedIn"><i className="fab fa-linkedin"></i></a>
                <a href="#" aria-label="Indeed"><i className="fab fa-indeed"></i></a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
