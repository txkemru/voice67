import React, { useEffect, useState } from 'react';
import './InfoModal.css';
import emojiGif from './images/emoji.gif';
import ThemeIcon from './ThemeIcon';

const InfoModal = ({ visible, onClose }) => {
  const [gifLoaded, setGifLoaded] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isDarkTheme, setIsDarkTheme] = useState(() => document.body.classList.contains('dark'));

  useEffect(() => {
    if (visible) {
      setIsVisible(true);
      setIsClosing(false);
      setGifLoaded(false); // сбрасываем гифку при каждом открытии
    }
  }, [visible]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsVisible(false);
      onClose();
    }, 300); // должно совпадать с анимацией закрытия
  };

  if (!isVisible) return null;

  return (
    <div className={`info-modal ${isClosing ? 'fade-out' : ''}`}>
      <div className="info-content">
        <div className={`image-wrapper ${gifLoaded ? 'loaded' : ''}`}>
          <img
            src={emojiGif}
            alt="Emoji"
            className="info-image"
            onLoad={() => setGifLoaded(true)}
          />
        </div>

        <div className="info-section" style={{textAlign:'center'}}>
            <h3>Быстрые советы</h3>
            <ul style={{display:'inline-block', textAlign:'left', margin:'10px auto', maxWidth: 400, fontSize:'0.97em', paddingLeft:18}}>
              <li>Для голосового ввода используйте микрофон (Android/ПК)</li>
              <li>Для смены темы — кнопка в меню</li>
              <li>PDF — для сохранения чата</li>
            </ul>
        </div>

        <div className="info-section contact" style={{textAlign:'center'}}>
            <h4>📬 Обратная связь</h4>
            <p>Если заметили баг или есть предложения — напишите мне:</p>
            <p><a href="https://t.me/txkem" target="_blank" rel="noopener noreferrer">@txkem</a></p>
        </div>

        <div className="modal-buttons">
          <button className="close-button" onClick={handleClose}>Закрыть</button>
          <button className="theme-toggle-button" onClick={() => {
            const isDark = document.body.classList.toggle('dark');
            setIsDarkTheme(isDark);
            sessionStorage.setItem('theme', isDark ? 'dark' : 'light');
          }}>
            <ThemeIcon isDark={isDarkTheme} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default InfoModal;
