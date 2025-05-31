import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';
import './App.css';
import { getAIResponse } from './components/utils/gpt';
import { useTelegram } from './components/utils/useTelegram';
import InfoModal from './components/InfoModal';
import emojiGif from './components/images/emoji.gif';
import DevModal from './components/DevModal';
import { exportChatToPDF, sendChatToBotForPDF } from './components/utils/exportToPDF';
import WelcomeModal from './components/WelcomeModal';
import SplashScreen from './components/SplashScreen';

function App() {
  const LOCAL_STORAGE_KEY = 'my-chats';
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [chats, setChats] = useState(() => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [{ id: 1, name: "new chat", messages: [] }];
  });
  const [selectedChatId, setSelectedChatId] = useState(1);

  const [isThinking, setIsThinking] = useState(false);
  const tg = useTelegram();
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showDevModal, setShowDevModal] = useState(false);
  const [forceUpdate, setForceUpdate] = useState(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState(() => {
    return !localStorage.getItem('welcomeModalShown');
  });
  const [showSplash, setShowSplash] = useState(true);
  const [isDark, setIsDark] = useState(() => document.body.classList.contains('dark'));
  const [pendingDeleteId, setPendingDeleteId] = useState(null);
  const pendingDeleteTimer = useRef(null);

  // Получаем имя пользователя из Telegram WebApp
  let userName = 'гость';
  try {
    const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user;
    if (tgUser) {
      userName = tgUser.first_name || (tgUser.username ? '@' + tgUser.username : 'гость');
    }
  } catch {}

  // Применяем сохранённую тему до рендера App
  const savedTheme = localStorage.getItem('theme') || sessionStorage.getItem('theme');
  if (savedTheme === 'dark') {
    document.body.classList.add('dark');
  } else if (savedTheme === 'light') {
    document.body.classList.remove('dark');
  }

  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (!tg) return;
  
    const preload = new Image();
    preload.src = emojiGif;
  
    tg.ready();
    tg.expand();
  
    tg.onEvent('viewportChanged', () => {
      if (!tg.isExpanded) tg.expand();
    });
  
    tg.MainButton.setText("Информация");
    tg.MainButton.setParams({
      color: "#2481cc",
      text_color: "#ffffff"
    });
    tg.MainButton.show();
  
    const colors = ["#2481cc", "#00b894", "#7c4dff", "#ff6f61"];
    let i = 0;
  
    const animateColor = () => {
      const start = colors[i % colors.length];
      const end = colors[(i + 1) % colors.length];
      let step = 0;
      const steps = 30;
      const interval = setInterval(() => {
        step++;
        const t = step / steps;
        const currentColor = lerpColor(start, end, t);
        tg.MainButton.setParams({
          color: currentColor,
          text_color: "#ffffff"
        });
        if (step >= steps) {
          clearInterval(interval);
          i++;
          setTimeout(animateColor, 100);
        }
      }, 50);
    };
  
    animateColor();
  
    const handler = () => {
      console.log("[INFO] Telegram MainButton clicked");
      setShowInfoModal(true);
    };
  
    tg.onEvent("mainButtonClicked", () => {
      requestAnimationFrame(() => {
        setShowInfoModal(true);
        setForceUpdate(prev => !prev);
      });
    });
  
    return () => {
      tg.offEvent("mainButtonClicked", handler);
      tg.offEvent("viewportChanged");
    };
  
    function lerpColor(a, b, t) {
      const A = hexToRgb(a);
      const B = hexToRgb(b);
      const R = Math.round(A.r + (B.r - A.r) * t);
      const G = Math.round(A.g + (B.g - A.g) * t);
      const Bc = Math.round(A.b + (B.b - A.b) * t);
      return `#${toHex(R)}${toHex(G)}${toHex(Bc)}`;
    }
  
    function hexToRgb(hex) {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result
        ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16),
          }
        : { r: 0, g: 0, b: 0 };
    }
  
    function toHex(c) {
      const hex = c.toString(16);
      return hex.length === 1 ? "0" + hex : hex;
    }

    // Следим за сменой темы
    const observer = new MutationObserver(() => {
      setIsDark(document.body.classList.contains('dark'));
    });
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
  }, []);

  // SplashScreen hide after 3s (всегда)
  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 3000);
    return () => clearTimeout(timer);
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
    if (pendingDeleteId === chatId) {
      // Если уже pending — отменяем
      clearTimeout(pendingDeleteTimer.current);
      setPendingDeleteId(null);
      return;
    }
    setPendingDeleteId(chatId);
    pendingDeleteTimer.current = setTimeout(() => {
      setChats(prev => prev.filter(chat => chat.id !== chatId));
      if (selectedChatId === chatId) setSelectedChatId(null);
      setPendingDeleteId(null);
    }, 3000);
  };

  const handleCancelDelete = (chatId) => {
    if (pendingDeleteId === chatId) {
      clearTimeout(pendingDeleteTimer.current);
      setPendingDeleteId(null);
    }
  };

  const handleSelectChat = (chatId) => {
    setSelectedChatId(chatId);
    closeSidebar();
  };

  const handleRenameChat = (chatId, newName) => {
    setChats(prev =>
      prev.map(chat =>
        chat.id === chatId
          ? { ...chat, name: newName }
          : chat
      )
    );
  };

  const handleSendMessage = async (text, systemPrompt = "Ты — дружелюбный помощник.") => {
    if (!selectedChatId) return;

    const currentChat = chats.find(c => c.id === selectedChatId);
    const isNewChat = currentChat.name === "new chat";

    let newChatName = currentChat.name;
    if (isNewChat) {
      const titlePrompt = `Ты — ассистент для генерации коротких названий чатов. Придумай заголовок из 3–5 слов.`;
      try {
        const aiTitle = await getAIResponse(text, titlePrompt);
        newChatName = aiTitle.trim().slice(0, 50);
      } catch (e) {
        console.error("Ошибка генерации названия чата:", e);
        newChatName = text.split(' ').slice(0, 5).join(' ') + (text.split(' ').length > 5 ? '…' : '');
      }
    }

    const userMessage = { id: Date.now(), text, type: "user" };
    setChats(prev =>
      prev.map(chat =>
        chat.id === selectedChatId
          ? { ...chat, name: newChatName, messages: [...chat.messages, userMessage] }
          : chat
      )
    );

    setIsThinking(true);

    try {
      const aiText = await getAIResponse(text, systemPrompt);
      const botMessage = { id: Date.now() + 1, text: aiText, type: "app" };
      setChats(prev =>
        prev.map(chat =>
          chat.id === selectedChatId
            ? { ...chat, messages: [...chat.messages, botMessage] }
            : chat
        )
      );
    } catch (err) {
      console.error("Ошибка AI:", err);
    } finally {
      setIsThinking(false);
    }
  };

  const handleExportPDF = () => {
    if (selectedChat) {
      exportChatToPDF(selectedChat);
    }
  };

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(chats));
  }, [chats]);

  const selectedChat = chats.find(chat => chat.id === selectedChatId);

  const handleCloseWelcomeModal = () => {
    setShowWelcomeModal(false);
    localStorage.setItem('welcomeModalShown', '1');
  };

  return (
    <>
      <SplashScreen visible={showSplash} isDark={isDark} userName={userName} />
      <div className="app-container" style={{filter: showSplash ? 'blur(2px)' : 'none', pointerEvents: showSplash ? 'none' : 'auto', transition: 'filter 0.7s'}}>
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
              onRenameChat={handleRenameChat}
              onOpenDeveloper={() => setShowDevModal(true)}
              onOpenWelcomeModal={() => setShowWelcomeModal(true)}
              pendingDeleteId={pendingDeleteId}
              onCancelDelete={handleCancelDelete}
            />
          </div>
        </div>

        <ChatWindow 
          chat={selectedChat} 
          onSendMessage={handleSendMessage}
          isThinking={isThinking}
          onExportPDF={handleExportPDF}
        />

        <InfoModal visible={showInfoModal} onClose={() => setShowInfoModal(false)} />
        <DevModal visible={showDevModal} onClose={() => setShowDevModal(false)} />
        <WelcomeModal visible={showWelcomeModal} onClose={handleCloseWelcomeModal} />
      </div>
    </>
  );
}

export default App;
