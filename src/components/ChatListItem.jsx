import React from 'react';
import './ChatListItem.css';

function ChatListItem({ chatId, chatName, onDelete, onSelect }) {
  const shortenedName = chatName.split(' ').slice(0, 5).join(' ') + (chatName.split(' ').length > 5 ? '…' : '');

  return (
    <li className="chat-list-item">
      <div className="chat-list-item-header">
        <div className="chat-list-item-title" onClick={() => onSelect(chatId)}>
          {shortenedName}
        </div>
        <button className="delete-btn" onClick={() => onDelete(chatId)}>
          ✖
        </button>
      </div>
    </li>
  );
}

export default ChatListItem;
