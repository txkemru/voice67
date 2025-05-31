import { useEffect, useState } from 'react';
import { WebApp } from '@twa-dev/sdk';

export const useTelegram = () => {
  const [tg, setTg] = useState(null);

  useEffect(() => {
    // Проверка доступности Telegram SDK и объекта window
    if (typeof window !== 'undefined' && WebApp?.ready) {
      WebApp.ready();
      WebApp.expand();

      // Разворачиваем снова, если свернуто
      WebApp.onEvent('viewportChanged', () => {
        if (!WebApp.isExpanded) WebApp.expand();
      });

      setTg(WebApp);

      return () => {
        WebApp.offEvent('viewportChanged');
      };
    } else {
      // Только в режиме разработки
      if (process.env.NODE_ENV === "development") {
        console.log("⚠️ Telegram SDK не найден (запущено вне Telegram Mini App)");
      }
    }
  }, []);

  return tg;
};
