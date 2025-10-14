
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
          transform: 'scale(1)',
          opacity: 0.5,
          zIndex: 1,
          pointerEvents: 'auto',
          cursor: 'not-allowed',
        }}
        aria-hidden="true"
      ></div>
      <div
        className="content"
        style={{
          position: 'relative',
          zIndex: 2,
          display: 'flex',
          flexDirection: 'row',
          width: '90vw',
          maxWidth: '1600px',
          minHeight: '80vh',
          height: '90vh',
          background: '#fff',
          borderRadius: '24px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          overflow: 'visible',
        }}
      >
        <div
          className="popup-left"
          style={{
            flex: '0 0 340px',
            background: '#fff',
            padding: '40px 32px',
            borderRight: '1.5px solid #e9ecef',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-start',
            minWidth: '260px',
            height: '100%',
            boxSizing: 'border-box',
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
            padding: '32px 32px',
            height: '100%',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-start',
            alignItems: 'stretch',
            boxSizing: 'border-box',
          }}
        >
          <div style={{ width: '100%', height: '100%' }}>{children}</div>
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
          .begin-popup .content { flex-direction: column; min-height: 90vh; width: 98vw; }
          .begin-popup .popup-left { flex: none; min-width: 0; width: 100%; border-right: none; border-bottom: 1.5px solid #e9ecef; padding: 32px 16px; height: auto; }
          .begin-popup .popup-right { padding: 24px 8px; height: 100%; }
        }
        @media (max-width: 800px) {
          .begin-popup .content { min-height: 100vh; width: 100vw; border-radius: 0; }
          .begin-popup .popup-left { padding: 24px 8px; }
          .begin-popup .popup-right { padding: 12px 2px; }
        }
      `}</style>
    </div>,
    document.body
  );
}

