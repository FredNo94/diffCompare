# Diff Compare

Веб-приложение для сравнения двух вариантов текста или JSON (например, аналитика из Fiddler при разных настройках виджетов).

## Локальный запуск

Открой `index.html` в браузере или подними локальный сервер:

```bash
npx serve .
```

## Деплой на Vercel и GitHub

### 1. Репозиторий на GitHub

1. Создай новый репозиторий на [github.com](https://github.com/new) (например, `diffCompare`).
2. Не добавляй README, .gitignore и лицензию — они уже есть в проекте.

3. В папке проекта выполни:

```bash
git init
git add .
git commit -m "Initial commit: Diff Compare app"
git branch -M main
git remote add origin https://github.com/ТВОЙ_ЛОГИН/diffCompare.git
git push -u origin main
```

Подставь свой логин GitHub вместо `ТВОЙ_ЛОГИН` и при необходимости измени URL репозитория.

### 2. Деплой на Vercel

1. Зайди на [vercel.com](https://vercel.com) и войди через GitHub.
2. Нажми **Add New…** → **Project**.
3. Выбери репозиторий `diffCompare` и нажми **Import**.
4. Оставь настройки по умолчанию (Root Directory: `.`, Framework: Other) и нажми **Deploy**.

После деплоя Vercel даст ссылку вида `https://diff-compare-xxx.vercel.app`. При каждом `git push` в `main` будет автоматически собираться и выкатываться новая версия.

### 3. Свой домен (по желанию)

В проекте на Vercel: **Settings** → **Domains** — добавь свой домен и настрой DNS по инструкции.
