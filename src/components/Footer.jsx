import React from 'react'

export default function Footer({ onOpenContact }){
  return (
    <footer>
      <div className="container-fluid">
        <div className="footer-box">
          <img src="/assets/media/vectors/footer-shape.png" alt="" />
          <div className="content-area">
            <div className="menu-detail">
              <h2 className="h-120 fw-900 white"><a href="#" className="contact-btn" onClick={(e)=>{e.preventDefault(); onOpenContact && onOpenContact()}}>LET'S <br/> TALK</a></h2>
              <ul className="footer_menu list-unstyled">
                <li className="h-28 fw-700 white mb-16">SERVICES</li>
                <li className="h-16 fw-400 body-text white mb-8">RETAIL SOLUTIONS</li>
              </ul>
            </div>
            <h2 className="company-name"><a href="#">FINPRO</a> ADVISORS</h2>
            <div className="bottom-bar">
              <h5 className="h-21 white fw-600">©2024 All Rights Reserved</h5>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
