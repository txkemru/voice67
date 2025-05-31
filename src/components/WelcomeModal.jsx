import React, { useEffect, useState } from 'react';
import './InfoModal.css';
import rocketGif from './images/rocket.gif';

const WelcomeModal = ({ visible, onClose }) => {
  const [gifLoaded, setGifLoaded] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [canClose, setCanClose] = useState(false);
  const [timer, setTimer] = useState(5);

  useEffect(() => {
    let interval;
    if (visible) {
      setIsVisible(true);
      setIsClosing(false);
      setGifLoaded(false);
      setCanClose(false);
      setTimer(5);
      interval = setInterval(() => {
        setTimer(prev => {
          if (prev <= 1) {
            setCanClose(true);
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [visible]);

  const handleClose = () => {
    if (!canClose) return;
    setIsClosing(true);
    setTimeout(() => {
      setIsVisible(false);
      onClose();
    }, 300);
  };

  if (!isVisible) return null;

  return (
    <div className={`info-modal ${isClosing ? 'fade-out' : ''}`}>
      <div className="info-content welcome-modal-content">
        <div className={`image-wrapper welcome-image-wrapper ${gifLoaded ? 'loaded' : ''}`}> 
          <img
            src={rocketGif}
            alt="Rocket"
            className="info-image welcome-image"
            onLoad={() => setGifLoaded(true)}
          />
        </div>
        <div className="info-section welcome-section" style={{textAlign: 'center'}}>
          <div style={{marginBottom: 10}}>
            <span className="beta-label">БЕТА</span>
            <span style={{marginLeft: 10, fontWeight: 600}}>v1.1.0</span>
          </div>
          <h2 className="welcome-title">О приложении</h2>
          <p className="welcome-text">
            <strong>SpeechAI Assistant</strong> — мини-приложение для Telegram, которое помогает:
          </p>
          <ul className="welcome-list" style={{display:'inline-block', textAlign:'left'}}>
            <li><b>Преобразовывать голос в текст</b> (на Android и ПК)</li>
            <li><b>Получать быстрые советы</b> и анализ идей с помощью ИИ</li>
            <li><b>Сохранять ответы</b> в PDF</li>
          </ul>
          <div className="welcome-warning" style={{textAlign:'center'}}>
            <span>
              <b>Внимание для пользователей iOS:</b><br/>
              В мобильных браузерах iOS функция голосовой записи пока недоступна. Все остальные возможности работают!
            </span>
          </div>
          <div className="info-section contact" style={{marginTop: 18, textAlign:'center'}}>
            <h4>📬 Обратная связь</h4>
            <p>Нашли баг или есть идея? Пишите: <a href="https://t.me/txkem" target="_blank" rel="noopener noreferrer">@txkem</a></p>
          </div>
        </div>
        <div className="modal-buttons">
          <button className="close-button" onClick={handleClose} disabled={!canClose} style={{opacity: canClose ? 1 : 0.6, position: 'relative'}}>
            Понятно
            {!canClose && (
              <span style={{
                position: 'absolute',
                left: '50%',
                bottom: -10,
                width: 44,
                height: 6,
                background: '#ffe0b2',
                borderRadius: 3,
                transform: 'translateX(-50%)',
                overflow: 'hidden',
                display: 'block',
              }}>
                <span style={{
                  display: 'block',
                  height: '100%',
                  background: '#ff9800',
                  width: `${(5-timer)/5*100}%`,
                  transition: 'width 1s linear'
                }} />
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default WelcomeModal; 