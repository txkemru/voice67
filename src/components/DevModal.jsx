import React, { useEffect, useState } from 'react';
import './DevModal.css';
import devGif from './images/develop.gif';

const DevModal = ({ visible, onClose }) => {
  const [gifLoaded, setGifLoaded] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (visible) {
      setIsVisible(true);
      setIsClosing(false);
      setGifLoaded(false);
    }
  }, [visible]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsVisible(false);
      onClose();
    }, 300);
  };

  if (!isVisible) return null;

  return (
    <div className={`info-modal ${isClosing ? 'fade-out' : ''}`}>
      <div className="info-content">
        <div className={`image-wrapper ${gifLoaded ? 'loaded' : ''}`}>
          <img
            src={devGif}
            alt="Dev"
            className="info-image"
            onLoad={() => setGifLoaded(true)}
          />
        </div>

            <div className="dev-content">
                <h2 className="dev-title">Разработчик</h2>
                <div className="dev-info">
                    <p><strong>Имя:</strong> Владимир Пушков</p>
                    <p><strong>Telegram:</strong> <a href="https://t.me/txkem" target="_blank" rel="noopener noreferrer">@txkem</a></p>
                </div>
                <p className="dev-note">⚡ Проект создан с <span style={{color:'#ff9800', fontWeight:600}}>❤️</span> на <strong>React</strong> + <strong>Vite</strong><br />специально для <strong>Telegram Mini Apps</strong></p>
            </div>

        <div className="modal-buttons">
          <button className="close-button" onClick={handleClose}>Закрыть</button>
        </div>
      </div>
    </div>
  );
};

export default DevModal;
