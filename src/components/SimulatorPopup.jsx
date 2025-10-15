
import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

export default function SimulatorPopup({ open, onClose, title, children }) {
  const modalRef = useRef(null);

  useEffect(() => {
    if (open) {
      document.body.classList.add('popup-open');
      document.body.style.overflow = 'hidden';
      // Trap focus inside modal
      const focusable = modalRef.current.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      if (focusable.length) focusable[0].focus();
      const handleTab = (e) => {
        const focusableEls = Array.from(focusable);
        const first = focusableEls[0];
        const last = focusableEls[focusableEls.length - 1];
        if (e.key === 'Tab') {
          if (e.shiftKey) {
            if (document.activeElement === first) {
              e.preventDefault();
              last.focus();
            }
          } else {
            if (document.activeElement === last) {
              e.preventDefault();
              first.focus();
            }
          }
        }
        if (e.key === 'Escape') {
          onClose();
        }
      };
      document.addEventListener('keydown', handleTab);
      return () => {
        document.body.classList.remove('popup-open');
        document.body.style.overflow = '';
        document.removeEventListener('keydown', handleTab);
      };
    } else {
      document.body.classList.remove('popup-open');
      document.body.style.overflow = '';
    }
    return () => {
      document.body.classList.remove('popup-open');
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  // Check if we're on mobile
  const isMobile = window.innerWidth <= 768;

  return createPortal(
    <div
      className="begin-popup"
      style={{
        right: 0,
        zIndex: 9999,
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        padding: '0',
      }}
      aria-modal="true"
      role="dialog"
      tabIndex={-1}
      ref={modalRef}
    >
      <div
        className="overlay"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.6)',
          zIndex: 1,
          pointerEvents: 'auto',
          cursor: 'pointer',
        }}
        onClick={onClose}
        aria-hidden="true"
      ></div>
      <div
        className="content"
        style={{
          position: 'relative',
          zIndex: 2,
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          width: isMobile ? '95vw' : '90vw',
          maxWidth: '1400px',
          height: isMobile ? 'auto' : '85vh',
          maxHeight: isMobile ? '85vh' : '85vh',
          background: '#fff',
          borderRadius: '24px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          overflow: 'hidden',
        }}
      >
        <div
          className="popup-left"
          style={{
            flex: isMobile ? 'none' : '0 0 300px',
            background: '#fff',
            padding: isMobile ? '16px 12px' : '32px 24px',
            borderRight: isMobile ? 'none' : '1.5px solid #e9ecef',
            borderBottom: isMobile ? '1.5px solid #e9ecef' : 'none',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-start',
            minWidth: isMobile ? '0' : '260px',
            width: isMobile ? '100%' : 'auto',
            height: isMobile ? 'auto' : '100%',
            boxSizing: 'border-box',
            overflowY: 'visible',
          }}
        >
          <button
            className="close-btn begin-popupClose simulator-close-btn"
            type="button"
            onClick={onClose}
            style={{
              marginBottom: '24px',
              fontWeight: 700,
              fontSize: '1.1rem',
              borderRadius: '8px',
              padding: '7px 16px',
              border: '2px solid #222',
              background: '#fff',
              color: '#222',
              transition: 'all 0.2s',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              cursor: 'pointer',
              outline: 'none',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#222'}
            onMouseLeave={e => e.currentTarget.style.background = '#fff'}
            onFocus={e => e.currentTarget.style.boxShadow = '0 0 0 2px #222'}
            onBlur={e => e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)'}
          >
            <span style={{ display: 'inline-block', transition: 'transform 0.2s' }}>FECHAR</span>
          </button>
          <div style={{ marginBottom: '16px' }}>
            <h2 className="h-47 fw-700 black mb-8" style={{ fontSize: '1.5rem', lineHeight: '1.2' }}>
              <span className="banner-text">{title}</span>
            </h2>
          </div>
          <span className="vert-line"></span>
          <hr className="bg-dark-black mb-48" />
          <div className="h-16 fw-400 body-text dark-black timing mb-16">
            Interaja com o simulador e feche para voltar aos estudos.
          </div>
        </div>
        <div
          className="popup-right"
          style={{
            flex: '1 1 0%',
            background: '#f8f9fa',
            padding: isMobile ? '16px 12px' : '24px 24px',
            height: isMobile ? 'auto' : '100%',
            maxHeight: isMobile ? '70vh' : '100%',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-start',
            alignItems: 'stretch',
            boxSizing: 'border-box',
            minWidth: 0,
            minHeight: isMobile ? '250px' : 'auto',
          }}
        >
          <div style={{ width: '100%' }}>{children}</div>
        </div>
      </div>
      {/* Responsive styles and prevent background scroll */}
      <style>{`
        body.popup-open {
          overflow: hidden !important;
        }
        .begin-popup { pointer-events: auto; }
        .begin-popup .overlay { pointer-events: auto; }
        .begin-popup .content { pointer-events: auto; }
        .simulator-close-btn {
          transition: all 0.2s;
        }
        .simulator-close-btn:hover, .simulator-close-btn:focus {
          background: #222 !important;
          color: #fff !important;
          transform: scale(1.05);
          box-shadow: 0 0 0 2px #222;
        }
        .simulator-close-btn:active {
          transform: scale(0.97);
        }
        .begin-popup input.form-control, .begin-popup select.form-control, .begin-popup textarea.form-control {
          font-size: 0.95rem !important;
          padding: 6px 10px !important;
          border-radius: 7px !important;
          min-height: 32px !important;
          height: 32px !important;
          margin-bottom: 12px !important;
        }
        .begin-popup label, .begin-popup .input-group label {
          font-size: 0.98rem !important;
          margin-bottom: 8px !important;
          display: block !important;
          text-align: left !important;
        }
        /* Ensure spacing between label and its following input/select/textarea */
        .begin-popup label + input.form-control,
        .begin-popup label + select.form-control,
        .begin-popup label + textarea.form-control {
          margin-top: 8px !important;
        }
        .begin-popup .input-group {
          margin-bottom: 20px !important;
          display: flex !important;
          flex-direction: column !important;
          align-items: flex-start !important;
        }
        .begin-popup input.form-control,
        .begin-popup select.form-control,
        .begin-popup textarea.form-control {
          width: 100% !important;
          box-sizing: border-box !important;
          margin-left: 0 !important;
        }
        @media (max-width: 1200px) {
          .begin-popup { 
            padding: 20px;
          }
          .begin-popup .content { 
            flex-direction: column; 
            width: 90vw; 
            height: auto; 
            max-height: 90vh; 
            overflow: hidden;
            margin: auto;
          }
          .begin-popup .popup-left { 
            flex: none; 
            min-width: 0; 
            width: 100%; 
            border-right: none; 
            border-bottom: 1.5px solid #e9ecef; 
            padding: 20px 16px; 
            height: auto; 
          }
          .begin-popup .popup-right { 
            flex: 1;
            padding: 20px 16px; 
            height: auto; 
            min-height: 400px;
            overflow-y: auto;
          }
        }
        @media (max-width: 800px) {
          .begin-popup { 
            padding: 16px;
          }
          .begin-popup .content { 
            width: 95vw; 
            height: auto;
            max-height: 85vh;
            border-radius: 16px; 
            display: flex;
            flex-direction: column;
          }
          .begin-popup .popup-left { 
            padding: 16px 12px;
            flex-shrink: 0;
          }
          .begin-popup .popup-right { 
            padding: 16px 12px;
            flex: 1;
            overflow-y: auto;
            min-height: 300px;
          }
        }
        @media (max-width: 430px) {
          .begin-popup { 
            padding: 8px;
          }
          .begin-popup .content { 
            height: auto; 
            max-height: 90vh;
            width: 98vw;
            border-radius: 12px;
          }
          .begin-popup .popup-left { 
            padding: 12px 8px; 
          }
          .begin-popup .popup-right { 
            padding: 12px 8px; 
            font-size: 14px;
            min-height: 250px;
          }
          .begin-popup .simulator-close-btn { 
            font-size: 0.9rem !important; 
            padding: 6px 12px !important; 
          }
          .begin-popup h2 {
            font-size: 1.2rem !important;
          }
        }
      `}</style>
    </div>,
    document.body
  );
}

