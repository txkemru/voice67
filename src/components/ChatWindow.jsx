import React, { useState } from 'react';
import ChatInput from './ChatInput';
import './ChatWindow.css';
import placeholderGif from './images/placeholder.gif';

// Функция для преобразования Markdown в HTML
const markdownToHtml = (text) => {
  // Заменяем **текст** на <strong>текст</strong>
  return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
};

function ChatWindow({ chat, onSendMessage, isThinking, onExportPDF }) {
  const [copiedId, setCopiedId] = useState(null);
  const [spokenId, setSpokenId] = useState(null);

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 5000);
  };

  if (!chat) {
    return (
      <div className="chat-window no-chat">
        <div className="no-chat-content">
          <img src={placeholderGif} alt="Анимация" className="no-chat-animation" />
          <div className="no-chat-text">Выберите чат, или создайте новый</div>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-window">
      <div className="messages">
        {chat.messages && chat.messages.length > 0 ? (
          chat.messages.map(msg => (
            <div key={msg.id} className={`message ${msg.type}`}>
              {/* Текст сообщения с поддержкой Markdown */}
              <div 
                className="message-text"
                dangerouslySetInnerHTML={{ __html: markdownToHtml(msg.text) }}
              />

              {/* Кнопка копирования или метка */}
              <div className="message-actions">
                {copiedId === msg.id ? (
                  <span className="copied-label">Скопировано!</span>
                ) : (
                  <button
                    className="copy-btn"
                    onClick={() => handleCopy(msg.text, msg.id)}
                  >
                    Копировать
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="no-messages">Нет сообщений</div>
        )}

        {isThinking && (
          <div className="message app typing-indicator">
            AI думает<span className="dots">.</span>
          </div>
        )}
      </div>

      <ChatInput
        onSend={(text, mode) => onSendMessage(text, mode)}
        onExportPDF={onExportPDF}
      />
    </div>
  );
}

export default ChatWindow;
