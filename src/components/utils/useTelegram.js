import { useEffect, useState } from 'react';

export const useTelegram = () => {
  const [tg, setTg] = useState(null);

  useEffect(() => {
    console.log('useEffect in useTelegram running');
    const webApp = window.Telegram?.WebApp;
    console.log('window.Telegram?.WebApp:', webApp);

    if (webApp?.ready) {
      console.log('WebApp is ready. Initializing...');
      webApp.ready();
      webApp.expand();

      webApp.onEvent('viewportChanged', () => {
        if (!webApp.isExpanded) webApp.expand();
      });

      // Добавляем данные пользователя
      const userData = webApp.initDataUnsafe?.user;
      console.log('User data from WebApp (ready state):', userData);

      setTg({
        ...webApp,
        user: userData
      });

      return () => {
        webApp.offEvent('viewportChanged');
      };
    } else if (typeof window !== 'undefined' && process.env.NODE_ENV === "development") {
       console.log("⚠️ Telegram SDK не найден или не готов (запущено вне Telegram Mini App в режиме разработки)");
        // Для разработки создаем моковые данные без данных пользователя, чтобы App.jsx мог обработать это как "гость"
        setTg({
          // Минимальные моковые данные для имитации WebApp
          initDataUnsafe: {}, // нет данных пользователя
          user: null, // явно указываем, что пользователя нет
          ready: () => console.log('Mock WebApp.ready() called'),
          expand: () => console.log('Mock WebApp.expand() called'),
          onEvent: (event, handler) => console.log(`Mock WebApp.onEvent('${event}') registered`),
          offEvent: (event, handler) => console.log(`Mock WebApp.offEvent('${event}') unregistered`),
          MainButton: {
            setText: (text) => console.log(`Mock MainButton.setText('${text}')`),
            setParams: (params) => console.log('Mock MainButton.setParams:', params),
            show: () => console.log('Mock MainButton.show()'),
            hide: () => console.log('Mock MainButton.hide()'),
          },
          BackButton: {
            show: () => console.log('Mock BackButton.show()'),
            hide: () => console.log('Mock BackButton.hide()'),
          },
          isExpanded: true,
          viewportHeight: window.innerHeight,
          viewportStableHeight: window.innerHeight,
          themeParams: {},
          colorScheme: 'light',
        });
    } else {
        console.log('Telegram WebApp SDK не найден или не готов. Нет моковых данных для продакшена.');
        // В продакшен режиме, если SDK не готов, оставляем tg как null или пустой объект
        // Установим user в null, чтобы App.jsx корректно отобразил "гость"
         setTg({ user: null });
    }
  }, []);

  return tg;
};
