import React from 'react';
import ChatInput from './ChatInput';
import './ChatWindow.css';
import placeholderGif from './images/placeholder.gif';

function ChatWindow({ chat, onSendMessage, isThinking }) {
  if (!chat) {
    return (
      <div className="chat-window no-chat">
        <div className="no-chat-content">
          <img
            src={placeholderGif}
            alt="Анимация"
            className="no-chat-animation"
          />
          <div className="no-chat-text">
            Выберите чат, или создайте новый
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-window">
      <div className="messages">
        {chat.messages && chat.messages.length > 0 ? (
          chat.messages.map((msg) => (
            <div key={msg.id} className={`message ${msg.type}`}>
              {msg.text}
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
      <ChatInput onSend={onSendMessage} />
    </div>
  );
}

export default ChatWindow;
