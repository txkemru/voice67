import React, { useState, useRef, useEffect } from 'react';
import './ChatMenu.css';

const ChatMenu = ({ onRename, onDelete, onExportPDF, onOpenDevModal, onOpenWelcomeModal }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
        setShowMore(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleMenuClick = (e) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
    setShowMore(false);
  };

  const handleAction = (action) => {
    action();
    setIsOpen(false);
    setShowMore(false);
  };

  return (
    <div className="chat-menu" ref={menuRef}>
      <button className="menu-trigger" onClick={handleMenuClick} title="Меню">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="6" r="2" fill="currentColor"/>
          <circle cx="12" cy="12" r="2" fill="currentColor"/>
          <circle cx="12" cy="18" r="2" fill="currentColor"/>
        </svg>
      </button>
      {isOpen && (
        <div className={`menu-dropdown ${isOpen ? 'open' : ''}`} onClick={(e) => e.stopPropagation()}>
          <button onClick={() => handleAction(onRename)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" fill="currentColor"/>
            </svg>
            Переименовать
          </button>
          <button onClick={() => handleAction(onDelete)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" fill="currentColor"/>
            </svg>
            Удалить
          </button>
          <button onClick={() => handleAction(onExportPDF)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" fill="currentColor"/>
            </svg>
            Сохранить в PDF
          </button>
        </div>
      )}
    </div>
  );
};

export default ChatMenu; 