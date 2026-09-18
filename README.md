# Мои финансы

Семейный учёт доходов, расходов, кредитов и вкладов.

- Сайт: Cloudflare Workers  
- Общие данные: Supabase  

## Локально

```bash
npm install
cp .env.example .env   # подставьте URL и anon key Supabase
npm run dev
```

Откройте http://localhost:5175/

## Облако (Supabase)

1. Создайте проект на https://supabase.com  
2. В SQL Editor выполните `supabase/schema.sql`  
3. Включите realtime для таблицы `app_state`  
4. Ключи: `.env` / `.env.production` (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`)

## Деплой

Push в GitHub → Cloudflare сам собирает и публикует.

## Установка на ПК (как приложение)

1. Откройте сайт в **Chrome** или **Edge** (не в режиме инкогнито).
2. Справа в адресной строке нажмите иконку установки **«Установить Мои финансы»**  
   или меню **⋯ → Установить приложение… / Cast and save → Install this site as an app**.
3. Подтвердите установку — появится ярлык на рабочем столе и в меню «Пуск» с иконкой приложения.
4. Приложение откроется в своём окне без вкладки браузера.

Если кнопки установки нет: обновите страницу после деплоя, проверьте что открыт именно боевой адрес (https), не localhost.
