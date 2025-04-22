import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';
import './App.css';
import { getAIResponse } from './components/utils/gpt';



function App() {
  const LOCAL_STORAGE_KEY = 'my-chats';
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [chats, setChats] = useState(() => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [{ id: 1, name: "new chat", messages: [] }];
  });
  const [selectedChatId, setSelectedChatId] = useState(1);

  const [isThinking, setIsThinking] = useState(false);
  


  useEffect(() => {
    if (window.Telegram && window.Telegram.WebApp) {
      const tg = window.Telegram.WebApp;

      tg.ready();   // Сообщаем Telegram, что Web App загружен
      tg.expand();  // Разворачиваем Web App на весь экран, предотвращая закрытие

      // Отключаем закрытие свайпом
      tg.onEvent('viewportChanged', () => {
        if (!tg.isExpanded) {
          tg.expand();
        }
      });

      // Добавляем кнопку Telegram
      tg.MainButton.setText("Отправить данные");
      tg.MainButton.show();

      tg.onEvent("mainButtonClicked", () => {
        tg.sendData(JSON.stringify({ message: "Привет от Mini App!" }));
      });
    } else {
      console.log("Запусти в Telegram, WebApp SDK не найден!");
    }
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  const handleNewChat = () => {
    const newChatId = Date.now();
    const newChat = { id: newChatId, name: "new chat", messages: [] };
    setChats(prev => [...prev, newChat]);
    setSelectedChatId(newChatId);
    setIsSidebarOpen(true);
  };

  const handleDeleteChat = (chatId) => {
    setChats(prev => prev.filter(chat => chat.id !== chatId));
    if (selectedChatId === chatId) {
      setSelectedChatId(null);
    }
  };

  const handleSelectChat = (chatId) => {
    setSelectedChatId(chatId);
    closeSidebar();
  };

  const handleSendMessage = async (text) => {
    if (!selectedChatId) return;
  
    const userMessage = { id: Date.now(), text, type: "user" };
  
    // Добавляем сообщение пользователя
    setChats(prev =>
      prev.map(chat => {
        if (chat.id === selectedChatId) {
          return { ...chat, messages: [...chat.messages, userMessage] };
        }
        return chat;
      })
    );
  
    // Показываем индикатор "AI думает..."
    setIsThinking(true);
  
    try {
      const aiText = await getAIResponse(text);
      const botMessage = { id: Date.now() + 1, text: aiText, type: "app" };
  
      setChats(prev =>
        prev.map(chat => {
          if (chat.id === selectedChatId) {
            return { ...chat, messages: [...chat.messages, botMessage] };
          }
          return chat;
        })
      );
    } catch (err) {
      console.error("Ошибка AI:", err);
    } finally {
      setIsThinking(false);
    }
  };
  

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(chats));
  }, [chats]);

  const selectedChat = chats.find(chat => chat.id === selectedChatId);

  return (
    <div className="app-container">
      <Header 
        onNewChat={handleNewChat} 
        toggleSidebar={toggleSidebar}
        chatName={selectedChat ? selectedChat.name : "My chat"}
      />
      
      <div 
        className={`sidebar-overlay ${isSidebarOpen ? "open" : ""}`} 
        onClick={closeSidebar}
      >
        <div 
          className="sidebar-wrapper" 
          onClick={(e) => e.stopPropagation()}
        >
          <Sidebar 
            chats={chats}
            onDeleteChat={handleDeleteChat}
            onSelectChat={handleSelectChat}
          />
        </div>
      </div>

      <ChatWindow 
        chat={selectedChat} 
        onSendMessage={handleSendMessage}
        isThinking={isThinking}
      />

    </div>
  );



  
}

export default App;
