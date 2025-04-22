import React from 'react';
import './ChatHeader.css';

const ChatHeader = ({ chatName, onDelete }) => {
  return (
    <div className="chat-header">
      <div className="chat-title">{chatName}</div>
      <button className="delete-chat-btn" onClick={onDelete}>
        &#10005;
      </button>
    </div>
  );
};

export default ChatHeader;
