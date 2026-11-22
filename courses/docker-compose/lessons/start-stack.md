Docker Compose запускає кілька пов’язаних сервісів з одного YAML. У цьому курсі `db` зберігає дані, а `adminer` дає простий вебінтерфейс до бази.

## Підготуй конфігурацію

Потрібен запущений Docker Desktop. Створи окрему папку `compose-practice` і збережи в ній `compose.yaml`.

```yaml
services:
  db:
    image: postgres:17
    environment:
      POSTGRES_USER: recall
      POSTGRES_PASSWORD: recall-practice
      POSTGRES_DB: practice
    volumes:
      - db-data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD", "pg_isready", "-U", "recall", "-d", "practice"]
      interval: 5s
      timeout: 3s
      retries: 10
  adminer:
    image: adminer:4
    ports:
      - "127.0.0.1:8080:8080"
    depends_on:
      db:
        condition: service_healthy

volumes:
  db-data:
```

## Запусти і перевір

Відкрий термінал у папці з YAML. Перший запуск завантажить образи.

```sh
docker compose config --quiet
docker compose up -d
docker compose ps
```

Відкрий у браузері `http://127.0.0.1:8080`. У формі Adminer обери PostgreSQL. Сервер — `db`, користувач — `recall`, пароль — `recall-practice`, база — `practice`. Це облікові дані лише для локальної вправи.

Браузер звертається до порту на твоєму ПК. Adminer звертається до `db` за іменем сервісу всередині мережі Compose.
