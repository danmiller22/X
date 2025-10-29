# XtraLease Trailer Video Form — GitHub Pages Only

Только GitHub. Без серверов. Весь код статический.

## Как работает
- Пользователь авторизуется в Google (OAuth, scope `drive.file`).
- Видео загружается в его Google Drive по **resumable upload** прямо из браузера.
- Файл становится «Доступен по ссылке».
- Страница отправляет в Telegram сообщение с ссылкой. **Токен бота и chat_id** берутся из:
  - параметров URL `?t=<BOT_TOKEN>&c=<CHAT_ID>` **или**
  - окна «Настройки» (при вводе вручную).

> Важно: бот-токен, переданный через URL или введённый на странице, виден клиенту. Это неизбежно без бэкенда.

## Подготовка
1. В Google Cloud Console создайте OAuth Client ID (Web). Разрешённые источники: домен GitHub Pages вашего репо.
2. Включите API Google Drive.
3. В Telegram создайте бота через @BotFather и получите токен. Узнайте свой chat_id.

## Запуск на GitHub Pages
- Залейте содержимое репозитория.
- Включите Pages на ветке `main` (или используйте прилагаемый workflow).

## Использование
- Откройте страницу с параметрами:  
  `https://<username>.github.io/<repo>/?t=123456:ABC-DEF...&c=5720447582`
- Нажмите **Войти в Google**.
- Заполните поля. Загрузите один файл-видео.
- Дождитесь статуса «Отправлено / Sent». Сообщение придёт в Telegram с публичной ссылкой.

## Ограничения
- Без бэкенда нельзя скрыть Telegram токен от клиента.
- Водителю для загрузки потребуется Google-аккаунт. Иначе OAuth не сработает.

## Поля формы и сообщение
Сообщение в Telegram (RU+EN):
```
TRUCK: {truck_number}
TRAILER: {trailer_number}
PICKUP_AT: {typed_datetime}
VIDEO: https://drive.google.com/file/d/{fileId}/view
ORDER: Front → Right → Rear → Left
SOURCE: XtraLease form
```
