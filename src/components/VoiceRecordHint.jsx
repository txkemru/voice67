import React, { useEffect, useState } from 'react';
import './VoiceRecordHint.css';

const VoiceRecordHint = ({ visible, onHide, isRecording }) => {
  const [progress, setProgress] = useState(100);
  const [isContinuing, setIsContinuing] = useState(false);

  useEffect(() => {
    let timer;
    let progressTimer;

    if (visible) {
      setProgress(100);
      setIsContinuing(false);

      // Таймер для прогресс-бара
      const startTime = Date.now();
      const duration = 5000;

      progressTimer = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
        setProgress(remaining);

        if (remaining <= 0) {
          clearInterval(progressTimer);
          setIsContinuing(true);
          // Даём время на анимацию смены текста
          timer = setTimeout(() => {
            onHide();
          }, 2000);
        }
      }, 16);
    }

    return () => {
      clearInterval(progressTimer);
      clearTimeout(timer);
    };
  }, [visible, onHide]);

  // Если запись остановлена, закрываем подсказку
  useEffect(() => {
    if (!isRecording && visible) {
      onHide();
    }
  }, [isRecording, visible, onHide]);

  if (!visible) return null;
  
  return (
    <div className={`voice-record-hint ${isContinuing ? 'continuing' : ''}`}>
      <div className="hint-progress" style={{ width: `${progress}%` }} />
      {isContinuing ? 'Запись продолжается' : 'Нажмите повторно, чтобы завершить запись'}
    </div>
  );
};

export default VoiceRecordHint; 