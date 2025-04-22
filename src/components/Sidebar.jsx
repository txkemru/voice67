import React, { useState, useEffect } from 'react';
import ChatListItem from './ChatListItem';
import './Sidebar.css';

function Sidebar({ chats = [], onDeleteChat, onSelectChat }) {
  const [searchTerm, setSearchTerm] = useState('');

  // Фильтрация по сообщениям
  const filteredChats = chats.filter(chat =>
    chat.messages?.some(msg =>
      msg.text.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // ⬇️ Переключение темы
  const handleToggleTheme = () => {
    const isDark = document.body.classList.toggle('dark');
    sessionStorage.setItem('theme', isDark ? 'dark' : 'light');
  };

  // ⬇️ Установка сохранённой темы при загрузке
  useEffect(() => {
    const savedTheme = sessionStorage.getItem('theme');
    if (savedTheme === 'dark') {
      document.body.classList.add('dark');
    }
  }, []);

  return (
    <aside className="sidebar">
      <div className="sidebar-header">Чаты</div>

      <div className="sidebar-search">
        <input
          type="text"
          placeholder="Поиск по чатам..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <ul className="chat-list">
        {(searchTerm ? filteredChats : chats).map(chat => (
          <ChatListItem 
            key={chat.id} 
            chatId={chat.id}
            chatName={chat.name}
            onDelete={onDeleteChat}
            onSelect={onSelectChat}
          />
        ))}
      </ul>

      <div className="sidebar-footer">
        <button onClick={handleToggleTheme}>Тема</button>
        <button>Информация</button>
      </div>
    </aside>
  );
}

export default Sidebar;
