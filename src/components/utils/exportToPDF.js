import jsPDF from 'jspdf';
import 'jspdf-autotable';
import roboto from '../../assets/fonts/roboto-medium';

export function exportChatToPDF(chat) {
  if (!chat) return;

  const doc = new jsPDF();
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 20;
  const maxWidth = pageW - (margin * 2);
  const lineHeight = 8; // Высота одной строки текста

  // 👇 Регистрируем шрифт
  doc.addFileToVFS('Roboto-Medium.ttf', roboto);
  doc.addFont('Roboto-Medium.ttf', 'Roboto', 'normal');
  doc.setFont('Roboto');

  // 👇 Титульная страница
  doc.setFontSize(24);
  doc.text('Стенограмма чата', pageW / 2, pageH / 2 - 20, { align: 'center' });

  doc.setFontSize(16);
  doc.text(`Чат: ${chat.name}`, pageW / 2, pageH / 2 + 0, { align: 'center' });
  doc.text(`Дата: ${new Date().toLocaleDateString('ru-RU')}`, pageW / 2, pageH / 2 + 12, { align: 'center' });

  doc.addPage();

  // 👇 Содержимое чата
  let y = margin;
  doc.setFontSize(16);
  doc.text(`Чат: ${chat.name}`, margin, y);
  y += 15;

  chat.messages.forEach(msg => {
    // Добавляем отступ между сообщениями
    y += 10;

    // Добавляем роль отправителя и текст сообщения как один блок
    doc.setFontSize(11);
    doc.setFont('Roboto', 'normal');

    // Формируем полный текст сообщения с ролью
    const role = msg.type === 'user' ? 'Вы:' : 'Ассистент:';
    const fullText = `${role}\n${msg.text}`;

    // Разбиваем текст на строки с учетом максимальной ширины
    const lines = doc.splitTextToSize(fullText, maxWidth);
    
    // Выводим текст построчно с проверкой переноса страницы
    lines.forEach(line => {
      // Проверяем, поместится ли текущая строка на текущей странице
      if (y + lineHeight > pageH - margin) {
        doc.addPage();
        y = margin; // Начинаем с верхнего отступа на новой странице
      }

      doc.text(line, margin, y);
      y += lineHeight; // Увеличиваем Y на высоту строки
    });
  });

  // 👇 Нумерация страниц
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(10);
    doc.setFont('Roboto', 'normal');
    doc.text(
      `Страница ${i} из ${pageCount}`,
      pageW - margin,
      pageH - margin,
      { align: 'right' }
    );
  }

  // 👇 Сохраняем с нормальным названием
  const safeName = chat.name?.replace(/[\\/:*?"<>|]/g, '') || 'chat';
  const fileName = `${safeName}.pdf`;

  // Создаем blob и скачиваем
  const blob = doc.output('blob');
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Новая функция для отправки чата боту для PDF
export async function sendChatToBotForPDF(chat, telegramId) {
  try {
    await fetch('https://evil-words-teach.loca.lt/send_pdf', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat: chat.messages,      // массив сообщений
        telegram_id: telegramId   // id пользователя Telegram
      })
    });
    alert('PDF будет отправлен вам в Telegram!');
  } catch (e) {
    alert('Ошибка при отправке PDF. Попробуйте позже.');
  }
}
