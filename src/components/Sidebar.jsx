import React, { useState, useEffect } from 'react';
import ChatListItem from './ChatListItem';
import './Sidebar.css';
import FooterMenu from './FooterMenu';
import ThemeIcon from './ThemeIcon';

function Sidebar({ chats = [], onDeleteChat, onSelectChat, onRenameChat, onOpenDeveloper, onOpenWelcomeModal, pendingDeleteId, onCancelDelete, onOpenInfoModal }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDarkTheme, setIsDarkTheme] = useState(() => {
    return document.body.classList.contains('dark');
  });

  // Фильтрация по сообщениям
  const filteredChats = chats.filter(chat => {
    const inName = chat.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const inMessages = chat.messages?.some(msg =>
      msg.text.toLowerCase().includes(searchTerm.toLowerCase())
    );
    return inName || inMessages;
  });
  
  

  // ⬇️ Переключение темы
  const handleToggleTheme = () => {
    setIsDarkTheme(!isDarkTheme);
    document.body.classList.toggle('dark');
    localStorage.setItem('theme', document.body.classList.contains('dark') ? 'dark' : 'light');
  };

  // ⬇️ Установка сохранённой темы при загрузке
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
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
            onSelect={pendingDeleteId === chat.id ? () => onCancelDelete(chat.id) : onSelectChat}
            onRename={onRenameChat}
            onExportPDF={() => {
              const selectedChat = chats.find(c => c.id === chat.id);
              if (selectedChat) {
                import('./utils/exportToPDF').then(({ exportChatToPDF }) => {
                  exportChatToPDF(selectedChat);
                });
              }
            }}
            pendingDelete={pendingDeleteId === chat.id}
          />
        ))}
      </ul>
  
      <div className="sidebar-footer">
        <FooterMenu 
          onOpenDevModal={onOpenDeveloper}
          onOpenWelcomeModal={onOpenWelcomeModal}
        />
        <button 
          className="theme-toggle-button-sidebar" 
          onClick={onOpenInfoModal}
          style={{display:'flex',alignItems:'center',gap:8,justifyContent:'center'}}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 16v-4M12 8h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span>Информация</span>
        </button>
        <button 
          className="theme-toggle-button-sidebar" 
          onClick={handleToggleTheme} 
          style={{display:'flex',alignItems:'center',gap:8,justifyContent:'center'}}
        >
          <ThemeIcon isDark={isDarkTheme} />
          <span>Сменить тему</span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
