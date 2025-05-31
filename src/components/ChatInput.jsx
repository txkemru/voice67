import React, { useState, useRef, useEffect } from 'react';
import './ChatInput.css';
import VoiceRecordHint from './VoiceRecordHint';

const ChatInput = ({ onSend, onExportPDF, messages }) => {
  const textareaRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const [text, setText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [showModeMenu, setShowModeMenu] = useState(false);
  const [menuClosing, setMenuClosing] = useState(false);
  const [isFirstStop, setIsFirstStop] = useState(false);
  const [showEmptyChatHint, setShowEmptyChatHint] = useState(false);

  const modes = {
    "Обычный": `Ты — живой, дружелюбный и умный ассистент. Когда тебе рассказывают идею, проект или презентацию, ты:
  1. Благодаришь и выражаешь искренний энтузиазм (например: «Спасибо за отличный рассказ! 🎉»).
  2. Кратко пересказываешь основную мысль в 2–3 предложениях, чтобы убедиться, что всё понял(а).
  3. Формулируешь сразу 3–5 уточняющих вопросов, которые помогают автору думать глубже.
  
  Не упоминай, что ты ИИ. Пиши по-дружески, но по делу. Эмодзи — по желанию, но не жёстко.`,
    
    "Эксперт": `Ты — эксперт и прагматичный ментор в области ИТ и презентаций. Твоя задача — дать развёрнутый, но честный анализ в четырёх шагах:
  1. **Оценка подачи** (1–2 предложения о чёткости структуры и логике).
  2. **Сильные стороны** (3 ключевых момента, что выполнено отлично).
  3. **Зоны для доработки** (2–3 критических замечания без «сухости», чётко почему важно).
  4. **Рекомендации + вопросы** (3 конкретных совета или вопроса, которые помогут автору подготовиться к любым возражениям).
  
  Стиль — деловой и прямолинейный, без эмодзи, но с поддержкой. Говори как преподаватель-эксперт: требовательно, но справедливо.`
  };

  const [modeName, setModeName] = useState('Эксперт');
  const [systemPrompt, setSystemPrompt] = useState(modes["Эксперт"]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + 'px';
    }
  }, [text]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      setIsFirstStop(false);

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const formData = new FormData();
        formData.append('file', blob, 'voice.webm');

        try {
          const resp = await fetch('https://gpt-backend-76n9.onrender.com/transcribe', {
            method: 'POST',
            body: formData,
          });

          const data = await resp.json();
          if (data.text) {
            setText(prev => prev + ' ' + data.text);
          }
        } catch (err) {
          console.error('Ошибка Whisper:', err);
        }

        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Ошибка доступа к микрофону:', err);
    }
  };

  const stopRecording = () => {
    if (!isFirstStop) {
      setShowHint(true);
      setIsFirstStop(true);
      return;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    setIsFirstStop(false);
    setShowHint(false);
  };

  const handleHideHint = () => {
    setShowHint(false);
    setIsFirstStop(false);
  };

  const handleSend = () => {
    if (text.trim()) {
      onSend(text.trim(), systemPrompt);
      setText('');
    }
  };

  const handleKeyDown = e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleModeMenu = () => {
    if (showModeMenu) {
      setMenuClosing(true);
      setTimeout(() => {
        setShowModeMenu(false);
        setMenuClosing(false);
      }, 300);
    } else {
      setShowModeMenu(true);
      setMenuClosing(false);
    }
  };
  
  const selectMode = (name) => {
    setMenuClosing(true);
    setTimeout(() => {
      setModeName(name);
      setSystemPrompt(modes[name]);
      setShowModeMenu(false);
      setMenuClosing(false);
    }, 300);
  };

  const handleFocus = () => {
    setTimeout(() => {
      window.scrollTo(0, document.body.scrollHeight);
    }, 400);
  };

  const handleExportPDF = () => {
    onExportPDF();
  };

  return (
    <div className="chat-input-wrapper" style={{position: 'relative'}}>
      <VoiceRecordHint visible={showHint} onHide={handleHideHint} isRecording={isRecording} />
      <textarea
        ref={textareaRef}
        className="chat-textarea"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Введите сообщение..."
        rows={1}
        onFocus={handleFocus}
      />
      <div className="chat-input-toolbar">
        <div className="left-buttons">
          <button 
            className={`mode-btn ${showModeMenu ? 'open' : ''}`}
            onClick={toggleModeMenu}
          >
            <span className="mode-icon-wrapper" style={{display:'flex',alignItems:'center',marginRight:3,marginLeft:-2}}>
              <svg className="mode-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 4V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
            {modeName}
          </button>
          <div className={`mode-menu ${showModeMenu ? 'open' : ''} ${menuClosing ? 'closing' : ''}`}>
            {Object.keys(modes).map(name => (
              <div key={name} onClick={() => selectMode(name)}>
                {name}
              </div>
            ))}
          </div>
          <button 
            className="mode-btn" 
            onClick={handleExportPDF}
          >
            <span className="pdf-icon-wrapper">
              <svg className="pdf-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="4" y="2" width="16" height="20" rx="3" stroke="currentColor" strokeWidth="2"/>
                <path d="M8 6h8M8 10h8M8 14h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </span>
            PDF
          </button>
        </div>
        <div className="right-buttons">
          {isRecording ? (
            <button className="icon-btn recording" onClick={stopRecording} aria-label="Стоп запись">
              <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="12" fill="currentColor" />
                <rect x="8" y="8" width="8" height="8" fill="currentColor" />
              </svg>
            </button>
          ) : text.trim() === '' ? (
            <button className="icon-btn" onClick={startRecording} aria-label="Запись">
              <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 14C13.66 14 15 12.66 15 11V5C15 3.34 13.66 2 12 2C10.34 2 9 3.34 9 5V11C9 12.66 10.34 14 12 14ZM19 11C19 14.31 16.31 17 13 17H11C7.69 17 5 14.31 5 11H7C7 13.21 8.79 15 11 15H13C15.21 15 17 13.21 17 11H19ZM12 22C10.34 22 9 20.66 9 19H15C15 20.66 13.66 22 12 22Z" />
              </svg>
            </button>
          ) : (
            <button className="icon-btn" onClick={handleSend} aria-label="Отправить">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 19V5M5 12L12 5L19 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatInput;
