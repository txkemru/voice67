import os
import logging
from aiogram import Bot, Dispatcher, types
from aiogram.types import WebAppInfo, ReplyKeyboardMarkup, KeyboardButton, InlineKeyboardMarkup, InlineKeyboardButton
from aiogram.utils import executor
from aiogram.dispatcher.filters import Text
from dotenv import load_dotenv
from fastapi import FastAPI, Request
import uvicorn
# from fpdf import FPDF # Удаляем импорт FPDF
import asyncio
import threading
import base64
import json
import uuid # Импортируем uuid для генерации уникальных ID

# Загрузка переменных окружения
load_dotenv()

# Проверка наличия необходимых переменных окружения
required_env_vars = ['BOT_TOKEN', 'ADMIN_ID']
missing_vars = [var for var in required_env_vars if not os.getenv(var)]

if missing_vars:
    raise ValueError(f"Отсутствуют необходимые переменные окружения: {', '.join(missing_vars)}")

# Настройка логирования
logging.basicConfig(level=logging.INFO)

# Инициализация бота и диспетчера
bot = Bot(token=os.getenv('BOT_TOKEN'))
dp = Dispatcher(bot)

# ID администратора
ADMIN_ID = int(os.getenv('ADMIN_ID'))

# Файл для хранения обратной связи
FEEDBACK_FILE = 'feedback_data.json'

# Словарь для хранения обратной связи (загружается из файла)
feedback_data = {}

# Функция для загрузки обратной связи из файла
def load_feedback():
    global feedback_data
    if os.path.exists(FEEDBACK_FILE):
        with open(FEEDBACK_FILE, 'r', encoding='utf-8') as f:
            try:
                feedback_data = json.load(f)
            except json.JSONDecodeError:
                feedback_data = {}

# Функция для сохранения обратной связи в файл
def save_feedback():
    global feedback_data
    with open(FEEDBACK_FILE, 'w', encoding='utf-8') as f:
        json.dump(feedback_data, f, indent=4, ensure_ascii=False)

# Словарь для хранения состояний админа (для ответа на отзывы)
admin_states = {}

# Клавиатура для пользователей
def get_user_keyboard():
    keyboard = ReplyKeyboardMarkup(resize_keyboard=True)
    keyboard.add(KeyboardButton("📱 Открыть приложение", web_app=WebAppInfo(url="https://laughingly-innovative-gelding.cloudpub.ru/")))
    keyboard.add(KeyboardButton("📝 Оставить отзыв"), KeyboardButton("❓ Помощь"))
    return keyboard

# Клавиатура для админа
def get_admin_keyboard():
    keyboard = ReplyKeyboardMarkup(resize_keyboard=True)
    keyboard.add(KeyboardButton("📊 Статистика"), KeyboardButton("📨 Обратная связь"))
    keyboard.add(KeyboardButton("📱 Открыть приложение", web_app=WebAppInfo(url="https://laughingly-innovative-gelding.cloudpub.ru/")))
    return keyboard

# Обработчик команды /start
@dp.message_handler(commands=['start'])
async def cmd_start(message: types.Message):
    user_id = message.from_user.id
    if user_id == ADMIN_ID:
        # При старте для админа сбрасываем состояние ответа
        if user_id in admin_states and admin_states[user_id]['state'] == 'awaiting_reply':
            del admin_states[user_id]
            await message.answer("Режим ответа отменен.", reply_markup=get_admin_keyboard())
        else:
            await message.answer(
                "👋 Привет, администратор!\n\n"
                "Вы можете управлять ботом и просматривать обратную связь.",
                reply_markup=get_admin_keyboard()
            )
    else:
        await message.answer(
            "👋 Добро пожаловать в Support Bot!\n\n"
            "Я помогу вам с использованием приложения SpeechAI Assistant.\n"
            "Выберите нужный пункт меню:",
            reply_markup=get_user_keyboard()
        )

# Обработчик кнопки "Оставить отзыв"
@dp.message_handler(Text(equals="📝 Оставить отзыв"))
async def feedback_start(message: types.Message):
    user_id = message.from_user.id
    # Проверяем, если пользователь уже оставил отзыв и он ожидает обработки
    existing_feedback = next((f for f in feedback_data.values() if f['user_id'] == user_id and f['status'] == 'waiting'), None)
    if existing_feedback:
        await message.answer("У вас уже есть активный отзыв, который ожидает рассмотрения.")
        return

    feedback_data[user_id] = {"state": "waiting_feedback_content"} # Изменяем состояние
    await message.answer(
        "Пожалуйста, напишите ваш отзыв или предложение по улучшению приложения.\n"
        "Вы можете отправить текст или голосовое сообщение."
    )

# Обработчик текстовых сообщений
@dp.message_handler(content_types=['text'])
async def handle_text(message: types.Message):
    user_id = message.from_user.id
    
    # Если админ отвечает на отзыв
    if user_id == ADMIN_ID and user_id in admin_states and admin_states[user_id]['state'] == 'awaiting_reply':
        # Проверяем, не является ли сообщение командой отмены
        if message.text == '/cancel_reply':
            del admin_states[user_id]
            await message.answer("Режим ответа отменен.")
            return

        feedback_id = admin_states[user_id]['feedback_id']
        if feedback_id in feedback_data:
            feedback_user_id = feedback_data[feedback_id]['user_id']
            try:
                await bot.send_message(
                    feedback_user_id,
                    f"✉️ Ответ на ваш отзыв:\n{message.text}"
                )
                await message.answer("✅ Ответ отправлен пользователю.")
                # Optionally mark as processed
                # feedback_data[feedback_id]['status'] = 'processed'
                # save_feedback()
            except Exception as e:
                logging.error(f"Ошибка при отправке ответа пользователю {feedback_user_id}: {e}")
                await message.answer("❌ Ошибка при отправке ответа.")
            finally:
                del admin_states[user_id] # Сбрасываем состояние после отправки
        else:
            await message.answer("Не найден отзыв для ответа.")
        return

    # Если это админские команды
    if user_id == ADMIN_ID:
        if message.text == "📊 Статистика":
            total_feedback = len(feedback_data)
            waiting_feedback = sum(1 for f in feedback_data.values() if f.get('status') == 'waiting')
            processed_feedback = total_feedback - waiting_feedback
            await message.answer(
                f"📊 Статистика обратной связи:\n"
                f"Всего отзывов: {total_feedback}\n"
                f"Ожидают обработки: {waiting_feedback}\n"
                f"Обработано: {processed_feedback}"
            )
        elif message.text == "📨 Обратная связь":
            await send_feedback_list(message)
        return

    # Если пользователь оставляет текстовый отзыв
    if user_id in feedback_data and feedback_data[user_id]["state"] == "waiting_feedback_content":
        feedback_id = str(uuid.uuid4()) # Генерируем уникальный ID
        feedback_data[feedback_id] = {
            "id": feedback_id,
            "user_id": user_id,
            "username": message.from_user.username,
            "full_name": message.from_user.full_name,
            "type": "text",
            "feedback": message.text,
            "status": "waiting",
            "timestamp": message.date.timestamp()
        }
        del feedback_data[user_id] # Удаляем временное состояние ожидания
        save_feedback() # Сохраняем после добавления

        await message.answer("✅ Спасибо за ваш отзыв! Мы обязательно его рассмотрим.")
        
        # Уведомление админу
        admin_notification = (
            f"🔔 Новый отзыв (текст) от {message.from_user.full_name} (@{message.from_user.username}):\n"
            f"{message.text}\n"
            f"ID отзыва: {feedback_id}"
        )
        # Добавляем inline клавиатуру для админа
        admin_keyboard = InlineKeyboardMarkup()
        admin_keyboard.add(InlineKeyboardButton("Ответить", callback_data=f'reply_{feedback_id}'))
        admin_keyboard.add(InlineKeyboardButton("Пометить как обработанный", callback_data=f'process_{feedback_id}'))

        await bot.send_message(
            ADMIN_ID,
            admin_notification,
            reply_markup=admin_keyboard
        )

# Обработчик голосовых сообщений для обратной связи
@dp.message_handler(content_types=['voice'])
async def handle_voice(message: types.Message):
    user_id = message.from_user.id
    
    # Если пользователь оставляет голосовой отзыв
    if user_id in feedback_data and feedback_data[user_id]["state"] == "waiting_feedback_content":
        feedback_id = str(uuid.uuid4()) # Генерируем уникальный ID
        # Сохраняем информацию о голосовом сообщении
        feedback_data[feedback_id] = {
            "id": feedback_id,
            "user_id": user_id,
            "username": message.from_user.username,
            "full_name": message.from_user.full_name,
            "type": "voice",
            "feedback": "Голосовое сообщение", # Здесь сохраняем пометку, само аудио пересылается
            "file_id": message.voice.file_id, # Сохраняем file_id голосового сообщения
            "status": "waiting",
            "timestamp": message.date.timestamp()
        }
        del feedback_data[user_id] # Удаляем временное состояние ожидания
        save_feedback() # Сохраняем после добавления

        await message.answer("✅ Спасибо за ваш голосовой отзыв! Мы обязательно его рассмотрим.")
        
        # Уведомление админу
        admin_notification = (
            f"🔔 Новый отзыв (голос) от {message.from_user.full_name} (@{message.from_user.username}):\n"
            f"ID отзыва: {feedback_id}"
        )
        # Добавляем inline клавиатуру для админа
        admin_keyboard = InlineKeyboardMarkup()
        admin_keyboard.add(InlineKeyboardButton("Ответить", callback_data=f'reply_{feedback_id}'))
        admin_keyboard.add(InlineKeyboardButton("Пометить как обработанный", callback_data=f'process_{feedback_id}'))

        # Пересылаем голосовое сообщение админу
        await bot.forward_message(
            ADMIN_ID,
            message.chat.id,
            message.message_id
        )
        # Отправляем уведомление с кнопками после пересылки голосового
        await bot.send_message(
             ADMIN_ID,
             admin_notification,
             reply_markup=admin_keyboard
        )

# Функция для отправки списка отзывов админу
async def send_feedback_list(message: types.Message):
    waiting_feedbacks = {k: v for k, v in feedback_data.items() if v.get('status') == 'waiting'}
    if not waiting_feedbacks:
        await message.answer("Нет новых отзывов, ожидающих обработки.")
        return

    await message.answer(f"📬 Отзывы, ожидающие обработки ({len(waiting_feedbacks)}):")

    for feedback_id, feedback in waiting_feedbacks.items():
        user_info = f"{feedback.get('full_name', 'Неизвестно')} (@{feedback.get('username', 'нет юзернейма')})"
        feedback_preview = feedback.get('feedback', '[без текста]')[:100] + '...' if len(feedback.get('feedback', '')) > 100 else feedback.get('feedback', '[без текста]')
        feedback_type = "Текст" if feedback.get('type') == 'text' else "Голос"

        admin_keyboard = InlineKeyboardMarkup()
        admin_keyboard.add(InlineKeyboardButton("Ответить", callback_data=f'reply_{feedback_id}'))
        admin_keyboard.add(InlineKeyboardButton("Пометить как обработанный", callback_data=f'process_{feedback_id}'))
        # Для голосовых сообщений можно добавить кнопку для прослушивания, если это необходимо
        # if feedback_type == "Голос":
        #     admin_keyboard.add(InlineKeyboardButton("Прослушать голос", callback_data=f'listen_{feedback_id}'))

        await message.answer(
            f"--- Отзыв ID: {feedback_id} ({feedback_type}) ---\n"
            f"От: {user_info}\n"
            f"Текст/тип: {feedback_preview}",
            reply_markup=admin_keyboard
        )

# Обработчик inline кнопок
@dp.callback_query_handler(lambda c: c.data and (c.data.startswith('reply_') or c.data.startswith('process_')))
async def process_callback_buttons(callback_query: types.CallbackQuery):
    # Проверяем, что запрос от админа
    if callback_query.from_user.id != ADMIN_ID:
        await callback_query.answer("У вас нет прав на это действие.")
        return

    data = callback_query.data.split('_')
    action = data[0]
    feedback_id = data[1]

    if feedback_id not in feedback_data:
        await callback_query.answer("Отзыв не найден или уже удален.")
        # Возможно, стоит удалить кнопки из предыдущего сообщения
        try:
            await bot.edit_message_reply_markup(
                chat_id=callback_query.message.chat.id,
                message_id=callback_query.message.message_id,
                reply_markup=None
            )
        except:
            pass # Игнорируем ошибку, если сообщение уже изменено/удалено
        return

    feedback = feedback_data[feedback_id]

    if action == 'reply':
        # Переходим в состояние ожидания ответа от админа
        admin_states[ADMIN_ID] = {'state': 'awaiting_reply', 'feedback_id': feedback_id}
        # Добавляем кнопку отмены
        cancel_markup = ReplyKeyboardMarkup(resize_keyboard=True, one_time_keyboard=True)
        cancel_button = "/cancel_reply"
        cancel_markup.add(cancel_button)
        await bot.send_message(ADMIN_ID, f"✍️ Введите ответ для отзыва ID {feedback_id}:\nДля отмены введите /cancel_reply", reply_markup=cancel_markup)
        await callback_query.answer("Ожидаю ваш ответ...")

    elif action == 'process':
        feedback['status'] = 'processed'
        save_feedback()
        await callback_query.answer("✅ Отзыв помечен как обработанный.")
        # Обновляем сообщение, убирая кнопки или меняя их
        try:
            # Находим сообщение админа с этим отзывом, чтобы его обновить
            # Это может быть сложно, если отзывов много и админ их листает.
            # Пока просто убираем кнопки из сообщения, на которое нажали.
            await bot.edit_message_reply_markup(
                chat_id=callback_query.message.chat.id,
                message_id=callback_query.message.message_id,
                reply_markup=None
            )
            # Можно добавить пометку в тексте сообщения
            # await bot.edit_message_text(
            #     chat_id=callback_query.message.chat.id,
            #     message_id=callback_query.message.message_id,
            #     text=callback_query.message.text + "\n\n✅ ОБРАБОТАНО"
            # )
        except Exception as e:
             logging.error(f"Ошибка при обновлении сообщения отзыва {feedback_id}: {e}")
             # Если не удалось изменить сообщение (например, оно слишком старое), просто отправляем новое
             await bot.send_message(ADMIN_ID, f"✅ Отзыв ID {feedback_id} помечен как обработанный.")


# Обработчик кнопки "Помощь"
@dp.message_handler(Text(equals="❓ Помощь"))
async def help_command(message: types.Message):
    help_text = (
        "🤖 Помощь по использованию приложения:\n\n"
        "1. Для голосового ввода используйте микрофон (Android/ПК)\n"
        "2. Для смены темы используйте кнопку в меню\n"
        "3. Для сохранения чата используйте функцию PDF\n\n"
        "Если у вас возникли проблемы или есть предложения по улучшению, "
        "используйте кнопку 'Оставить отзыв'"
    )
    await message.answer(help_text)

# Обработчик данных от веб-приложения
@dp.message_handler(content_types=['web_app_data'])
async def web_app_handler(message: types.Message):
    try:
        data = json.loads(message.web_app_data.data)
        if data.get('type') == 'pdf':
            # Декодируем PDF из base64
            pdf_data = base64.b64decode(data['data'])
            filename = data.get('filename', 'chat.pdf')
            
            # Сохраняем временный файл
            temp_file = f"temp_{filename}"
            with open(temp_file, 'wb') as f:
                f.write(pdf_data)
            
            # Отправляем файл пользователю
            with open(temp_file, 'rb') as f:
                await bot.send_document(
                    message.chat.id,
                    f,
                    caption=f"Ваш PDF-файл с чатом: {filename}"
                )
            
            # Удаляем временный файл
            os.remove(temp_file)
    except Exception as e:
        logging.error(f"Ошибка при обработке данных от веб-приложения: {e}")
        await message.answer("Произошла ошибка при создании PDF. Пожалуйста, попробуйте еще раз.")

app = FastAPI()

def run_fastapi():
    # Проверяем, есть ли другие маршруты в FastAPI, если нет, возможно, FastAPI не нужен
    if app.routes:
        uvicorn.run(app, host="0.0.0.0", port=8080)
    else:
        logging.info("FastAPI приложение не содержит маршрутов. Не запускаем uvicorn.")

if __name__ == '__main__':
    load_feedback() # Загружаем отзывы при запуске
    # Запускаем FastAPI в отдельном потоке, только если есть маршруты
    if app.routes:
        threading.Thread(target=run_fastapi, daemon=True).start()

    print("✅ Бот запущен и работает!")
    executor.start_polling(dp, skip_updates=True)
