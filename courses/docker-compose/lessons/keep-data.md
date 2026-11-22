Перевір на власному записі, що іменований том переживає видалення контейнера.

## Запиши рядок і створи контейнери заново

Запусти SQL нижче в Adminer. Можна також відкрити `psql` командою `docker compose exec db psql -U recall -d practice`.

```sql
CREATE TABLE IF NOT EXISTS notes (body text);
INSERT INTO notes VALUES ('compose practice');
SELECT body FROM notes;
```

Вийди з `psql` через `\q`, якщо виконував SQL там. У папці з `compose.yaml` виконай:

```sh
docker compose down
docker compose up -d
```

Знову підключись і виконай `SELECT body FROM notes;`. Рядок має бути на місці. PostgreSQL зберігає його в каталозі `/var/lib/postgresql/data`, куди підключений том `db-data`.

Закінчивши практику, зупини локальний стек командою `docker compose down`. Наступного навчального дня відкрий «Повторення», щоб відповісти на короткі питання з пам’яті.
