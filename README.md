# Tattoo Lelik — объединённый сайт

Это первый сайт, объединённый с Node.js сервером.

## Что внутри
- исходный дизайн первого сайта;
- ваши изображения;
- галерея;
- форма записи;
- отзывы;
- Node.js сервер;
- загрузка референсов;
- сохранение заявок;
- возможность уведомлений ВКонтакте.

## Запуск

Откройте папку в Visual Studio Code и выполните:

```bash
npm install
```

Создайте `.env` из `.env.example`.

Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

macOS/Linux:

```bash
cp .env.example .env
```

Запуск:

```bash
npm start
```

Откройте в браузере:

```text
http://localhost:3000
```

## VK

В `.env` заполните:

```env
VK_GROUP_TOKEN=ВАШ_ТОКЕН
VK_ADMIN_ID=ВАШ_ЧИСЛОВОЙ_VK_ID
VK_API_VERSION=5.199
ADMIN_KEY=СЛОЖНЫЙ_СЕКРЕТНЫЙ_КЛЮЧ
```

Не публикуйте `.env` и не отправляйте токен в чат.

Заявки сохраняются в `data/appointments.json`.
Референсы сохраняются в папке `uploads/`.
