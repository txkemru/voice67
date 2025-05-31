import React, { useRef, useState, useEffect } from 'react';
import './ChatMenu.css';

const FooterMenu = ({ onOpenDevModal, onOpenWelcomeModal }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
      <div style={{position: 'relative', display: 'inline-block'}} ref={menuRef}>
        <button className="menu-trigger" onClick={() => setIsOpen(v => !v)} title="Ещё возможности">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="6" r="2" fill="currentColor"/>
            <circle cx="12" cy="12" r="2" fill="currentColor"/>
            <circle cx="12" cy="18" r="2" fill="currentColor"/>
          </svg>
        </button>
        <div className={`footer-fab-menu${isOpen ? ' open' : ''}`}> 
          <button className="footer-fab-btn" onClick={() => { setIsOpen(false); onOpenDevModal(); }}>Автор</button>
          <button className="footer-fab-btn" onClick={() => { setIsOpen(false); onOpenWelcomeModal(); }}>Справка</button>
        </div>
      </div>
    </div>
  );
};

export default FooterMenu; 