import React, { useEffect, useState } from 'react';
import './SplashScreen.css';
import donvGif from './images/donv.gif';

// Если понадобится вернуть анимацию текста, можно раскомментировать
// const texts = [
//   'Будим ИИ...',
//   'Загружаем интеллект...',
//   'SpeechAI Assistant',
// ];

const SplashScreen = ({ visible, isDark, userName }) => {
  // Typewriter effect for 'Загружаем...'
  const fullText = 'Загружаем...';
  const [typed, setTyped] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!visible) return;
    let timeout;
    if (!deleting && index < fullText.length) {
      timeout = setTimeout(() => {
        setTyped(fullText.slice(0, index + 1));
        setIndex(index + 1);
      }, 90);
    } else if (!deleting && index === fullText.length) {
      timeout = setTimeout(() => setDeleting(true), 900);
    } else if (deleting && index > 0) {
      timeout = setTimeout(() => {
        setTyped(fullText.slice(0, index - 1));
        setIndex(index - 1);
      }, 50);
    } else if (deleting && index === 0) {
      timeout = setTimeout(() => setDeleting(false), 500);
    }
    return () => clearTimeout(timeout);
  }, [index, deleting, visible]);

  useEffect(() => {
    if (!visible) {
      setTyped('');
      setDeleting(false);
      setIndex(0);
    }
  }, [visible]);

  return (
    <div className={`splash-screen${visible ? '' : ' hide'}${isDark ? ' dark' : ''}`}>
      <img src={donvGif} alt="Загрузка..." className="splash-gif" />
      <div className="splash-hello">Привет, {userName}!</div>
      <div className="splash-typewriter">{typed}<span className="splash-cursor">|</span></div>
      {/* <div className="splash-title">
        <span className={`splash-anim-text${fade ? ' hide' : ''}`}>{texts[textIndex]}</span>
      </div> */}
    </div>
  );
};

export default SplashScreen; 