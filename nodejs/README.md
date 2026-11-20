# Backend Path — Strong Junior Edition (`копія`)

Рефакторнута версія курсу без зайвого CS/DevOps оверхеду — фокус суворо на вимоги **Strong Junior Node.js / TypeScript** (і бонусну зв'язку з **Go**).

- **Основний маршрут:** 16 модулів, 38 уроків (~160–226 год з практикою і проєктами замість 316–454 год).
- **React-гілка:** 6 уроків бази під API (+ орієнтир на TanStack Query, React Hook Form + Zod).
- **Підсилення під вакансію:** 2 практичні модулі (`SSE / WebSockets + Node ↔ Go API` та `Черги: BullMQ / Redis / RabbitMQ`).
- **Порівняння змін:** дивись [`ROADMAP-CHANGES.md`](./ROADMAP-CHANGES.md).

## Запуск сайту

Рекомендований runtime — Node.js 24+ (або 26 LTS). У Windows запусти [`start.bat`](./start.bat) у цій папці — сайт відкриється на `http://127.0.0.1:5174/` (звичний порт і браузерне збереження цієї версії).

```sh
npm ci
npm run dev
```

## Перевірки

```sh
npm test
npm run content:check
npm run build
```

## Нічний режим Recall

Відкрий сайт через start.bat у тому самому браузері, де вже проходив уроки. Після повідомлення «Прогрес синхронізовано» Recall зможе продовжити з цього місця. Прогрес сайту зберігається в %LOCALAPPDATA%\Backend Path\progress-v1.json і працює незалежно від Recall.

Recall використовує готові dist/ і dist-server/recall.cjs. Після редагування курсу запускай npm run build. Лабораторні та критерії залишаються на звичних сторінках. Кнопка «Практика в редакторі» дає повернутись до уроку з трея.
