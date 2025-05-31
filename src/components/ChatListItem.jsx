import React, { useState } from 'react';
import './ChatListItem.css';
import ChatMenu from './ChatMenu';

const ChatListItem = ({ chatId, chatName, onDelete, onSelect, onRename, onExportPDF, pendingDelete }) => {
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState(chatName);

  const handleRename = () => {
    if (newName.trim() && newName !== chatName) {
      onRename(chatId, newName);
    }
    setIsRenaming(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleRename();
    } else if (e.key === 'Escape') {
      setIsRenaming(false);
      setNewName(chatName);
    }
  };

  const shortenedName = chatName.split(' ').slice(0, 5).join(' ') + (chatName.split(' ').length > 5 ? '…' : '');

  return (
    <li className={`chat-list-item${pendingDelete ? ' pending-delete' : ''}`}>
      <div className={`chat-list-item-header${pendingDelete ? ' pending-delete' : ''}`} onClick={() => onSelect(chatId)}>
        {isRenaming ? (
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onBlur={handleRename}
            onKeyDown={handleKeyPress}
            autoFocus
            className="chat-rename-input"
          />
        ) : (
          <span className="chat-list-item-title">{shortenedName}</span>
        )}
        <ChatMenu
          onRename={() => setIsRenaming(true)}
          onDelete={() => onDelete(chatId)}
          onExportPDF={onExportPDF}
        />
      </div>
      {pendingDelete && (
        <div className="pending-delete-bar">
          <div className="pending-delete-progress" />
          <div className="pending-delete-text">Нажмите повторно, чтобы отменить удаление</div>
        </div>
      )}
    </li>
  );
};

export default ChatListItem;
