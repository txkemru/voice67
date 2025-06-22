[EN](./README.md) | [RU](./README.ru.md)

# Diploma Project: AI Assistant Telegram Bot

This repository contains the source code for a diploma project. The project is a complex system consisting of a Telegram chat-bot, a backend service for AI processing, and a Telegram Mini App for the user interface.

## About The Project

This project is an AI-powered assistant integrated into Telegram. It's designed to provide users with a seamless experience, combining a conversational bot with a rich user interface through a Telegram Mini App. The backend handles the logic and integration with AI models (presumably GPT), while the frontend provides an intuitive way to interact with the assistant's features.

## Project Structure

The project is organized into the following directories:

-   `Chat-bot/`: A Telegram bot built with Python and `aiogram`. It serves as the main entry point for users interacting with the service via chat.
-   `gpt-backend/`: A Node.js backend service built with `Express.js`. It handles API requests, processes data, and likely integrates with a GPT service.
-   `my-telegram-diplom-app/`: A React-based Telegram Mini App that provides a rich user interface within the Telegram app.

## Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

Make sure you have the following software installed on your machine:

-   [Python 3.10+](https://www.python.org/downloads/)
-   [Node.js v16+](https://nodejs.org/)
-   `pip` for Python packages
-   `npm` for Node.js packages

### Installation

1.  **Clone the repo**
    ```sh
    git clone https://github.com/txkemru/voice67.git
    cd voice67
    ```

2.  **Setup the Python Chat-bot**
    ```sh
    cd Chat-bot
    pip install -r requirements.txt
    # You will also need to create a .env file with your Telegram Bot token
    #
    # Example .env file:
    # TOKEN="YOUR_TELEGRAM_BOT_TOKEN"
    cd ..
    ```

3.  **Setup the Node.js Backend**
    ```sh
    cd gpt-backend
    npm install
    # You might need a .env file here for API keys or other configurations
    cd ..
    ```

4.  **Setup the React Telegram Mini App**
    ```sh
    cd my-telegram-diplom-app
    npm install
    ```

## Usage

1.  **Start the Backend Service:**
    ```sh
    cd gpt-backend
    npm start
    ```

2.  **Start the Telegram Bot:**
    ```sh
    cd Chat-bot
    python bot.py
    ```

3.  **Run the Frontend App (for development):**
    ```sh
    cd my-telegram-diplom-app
    npm run dev
    ```

## Contact

Created by **Vladimir Pushkov**

-   Telegram: [@txkem](https://t.me/txkem)
-   Project Repository: [https://github.com/txkemru/voice67](https://github.com/txkemru/voice67)

---

I will now create the Russian version of the README in a separate file. 