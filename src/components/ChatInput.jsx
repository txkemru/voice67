// src/components/ChatInput.jsx
import React, { useState, useRef, useEffect } from 'react';
import './ChatInput.css';

// Вытаскиваем из process.env
const OPENAI_API_KEY = process.env.REACT_APP_OPENAI_API_KEY;

const ChatInput = ({ onSend }) => {
  const [text, setText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const textareaRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // Автоматическая высота
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + 'px';
    }
  }, [text]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      mediaRecorderRef.current = mr;
      audioChunksRef.current = [];

      mr.ondataavailable = e => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mr.onstop = async () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const formData = new FormData();
        formData.append('file', blob, 'voice.webm');
        formData.append('model', 'whisper-1');

        try {
          const resp = await fetch('https://api.openai.com/v1/audio/transcriptions', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${OPENAI_API_KEY}`
            },
            body: formData
          });
          if (!resp.ok) {
            console.error('Whisper API error status:', resp.status);
            return;
          }
          const data = await resp.json();
          if (data.text) setText(data.text);
        } catch (err) {
          console.error('Ошибка отправки в Whisper:', err);
        }
      };

      mr.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Ошибка доступа к микрофону:', err);
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  const handleSend = () => {
    if (text.trim()) {
      onSend(text.trim());
      setText('');
    }
  };

  const handleKeyDown = e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="chat-input">
      <div className="textarea-container">
        <textarea
          ref={textareaRef}
          rows="1"
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Спросите что-нибудь…"
        />
      </div>

      {isRecording ? (
        <button className="send-btn" onClick={stopRecording} aria-label="Стоп запись">⏹</button>
      ) : text.trim() === '' ? (
        <button className="send-btn" onClick={startRecording} aria-label="Запись">🎤</button>
      ) : (
        <button className="send-btn" onClick={handleSend} aria-label="Отправить">⬆️</button>
      )}
    </div>
  );
};

export default ChatInput;
