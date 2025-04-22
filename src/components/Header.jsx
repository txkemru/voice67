import React from 'react';
import './Header.css';

function Header({ onNewChat, toggleSidebar, chatName }) {
  return (
    <header className="header">
      <button className="menu-btn" onClick={toggleSidebar}>&#9776;</button>
      <div className="app-title">{chatName ? chatName : "Мой чат"}</div>
      <button className="new-chat-btn" onClick={onNewChat}>+</button>
      
    </header>
  );
}

export default Header;
