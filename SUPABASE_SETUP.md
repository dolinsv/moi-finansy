# Облако данных (Supabase)

Приложение хранит семейные данные в таблице `app_state` и синхронизирует
телефон и ПК в реальном времени.

## 1. Создайте проект

1. Откройте https://supabase.com → New project
2. Запомните регион (любой), задайте пароль БД (сохраните себе)

## 2. Создайте таблицу

SQL Editor → New query → вставьте содержимое файла `supabase/schema.sql` → Run

## 3. Ключи

Project Settings → API:
- Project URL → `VITE_SUPABASE_URL`
- anon public → `VITE_SUPABASE_ANON_KEY`

## 4. Локально

Скопируйте `.env.example` в `.env` и подставьте значения.
Перезапустите `npm run dev`.

## 5. Cloudflare

Workers & Pages → moi-finansy → Settings → Variables and Secrets
(или Build variables):

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Затем сделайте новый deploy (или push в GitHub).
