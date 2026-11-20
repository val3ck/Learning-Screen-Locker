# Що змінено в `копія` (Strong Junior → Mid Node.js/TS + Go видання)

Базовий курс (`../backend-course`) мав **23 модулі / 62 уроки** та оцінку **300–450 годин**. У ньому було забагато CS-грінду й самописних велосипедів, а в проміжному рефакторингу — перекіс, коли назви обіцяли бойовий стек, а всередині лишалися лише мікро-вправи.

У фінальній версії `копія` **прибрано зайвий баласт (19 модулів / 46 уроків, ~160–226 годин бази)** і **оновлено як лекції, так і реальні лабораторні** під бойовий стек Strong Junior / Lower-Mid.

---

## 1. Що ВИРІЗАНО (низьке ROI на старті)

1. **`structures` (4 → 1 урок):** прибрано ручний бінарний пошук, кільцевий буфер із ручним ущільненням та BFS на 1500 вершин. Лишилися `Map`, `Set` та Big O (уникнення $O(n^2)$ у API).
2. **`node` (4 → 2 уроки):** прибрано низькорівневий атомарний запис файлів і `StringDecoder` streams (добирається за потреби по доці); лишилися `HTTP` та `process.env`/модулі.
3. **`security` (4 → 2 уроки):** прибрано самописний `scrypt$32768$...` парсер і ручний URL allowlist (у проді це `argon2`/`bcrypt` + `helmet`/`cors`).
4. **`testing` (3 → 2 уроки):** прибрано зайвий урок про рефакторинг старого каталогу; лишилися `unit` + `HTTP integration (Supertest)`.
5. **`reliability` (3 → 2 уроки):** прибрано ручний HMAC webhook-парсер; лишилися Redis cache-aside та черги/ідемпотентність.
6. **`operations` (4 → 1 урок):** прибрано граф CI у JS, математику гістограм та самописний SHA-256 snapshot; лишився Docker/config + реальні інфра-файли.
7. **`advanced` (6 → 2 прикладні модулі):** прибрано DDD/CQRS, Mongo/Elasticsearch/вектори, Kubernetes/Terraform, RAG/LLM. Перероблено в **Підсилення (Go + Черги)**.

---

## 2. Що реально ПРОКАЧАНО (лекції + пакети + лабораторні)

- **Встановлено й запінено в [`src/lib/labs.ts`](./src/lib/labs.ts):** `zod`, `jose`, `class-validator`, `class-transformer`, `@nestjs/platform-express` (також пофіксовано баг, через який `@types/react` сунувся в чисті бекенд `.ts` лаби).
- **Реально переписані лабораторні (перевіряються через `npm run labs:verify`):**
  1. `typescript-narrowing`: реальна валідація **`Zod`** (`ProfileSchema`, `.safeParse`, `z.infer`, strip зайвих полів).
  2. `nest-validation`: реальний **`NestJS` HTTP-додаток + `BookingsController` + `CreateBookingDto` з `class-validator`/`class-transformer` + глобальний `ValidationPipe`** та HTTP-тести на `201`/`400`.
  3. `security-sessions`: реальні **JWT через `jose`** (`SignJWT` / `jwtVerify`, жорсткий `HS256`, перевірка `exp`/`iss`/`sub` та миттєве відкликання через `jti`).
  4. `operations-containers`: у завантажуваний архів додано реальний **`docker-compose.yml`** (`api + postgres + redis` з healthchecks), **`.github/workflows/ci.yml`** і структуроване JSON-логування в `server.mjs` з `x-request-id`.
  5. `protocols-transports`: реальна інтеграція **SSE + клієнт `Node.js ↔ Go` API (`fetchGoJobs`) із `AbortSignal.timeout` та `Zod`-валідацією контракту**.
- **Поглиблено ключові `.mdx`-лекції (замість коротких тез — готові робочі патерни):**
  - `typescript-narrowing`, `express-contracts` (Zod + OpenAPI + keyset cursor), `persistence-orm` (Prisma міграції, `$transaction`, N+1),
  - `nest-modules`, `nest-validation` (`ValidationPipe` + `@nestjs/swagger`), `nest-lifecycle` (порядок шарів + shutdown),
  - `security-sessions` (`argon2` + `helmet` + `HttpOnly` refresh rotation), `security-authorization` (IDOR/BOLA + tenant isolation),
  - `testing-integration` (`Supertest` + `Testcontainers`), `reliability-cache` (`ioredis` + stampede), `reliability-jobs` (`BullMQ` + `Transactional Outbox`),
  - `operations-containers` (multi-stage `Dockerfile`, `Compose`, `pino` з `redact`, GitHub Actions),
  - `react-forms` (`React Hook Form + Zod`), `react-requests` (`TanStack Query`), `protocols-transports` (`@Sse` + Node↔Go), `events-delivery` (`BullMQ` + `RabbitMQ` + DLQ), `career-capstone` (повний blueprint випускного проєкту + питання захисту).
