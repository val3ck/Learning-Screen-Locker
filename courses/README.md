# Курси Recall

Поклади курс в окрему папку під `courses/` поруч із `SQL-Recall.bat`. У Recall відкрий «Курси» й натисни «Оновити список». За приклад візьми `docker-compose/`.

```powershell
npm.cmd --prefix recall run courses:validate
```

Можна передати абсолютний шлях до іншої папки-каталогу після `--`. Валідатор покаже папку, ID уроку або активності й проблемне поле.

У `course.json` вкажи `version: 1`, `id`, `title`, `description` та `lessons` у бажаному порядку. ID курсу має збігатися з назвою папки. Для кожного уроку вкажи `id`, `title`, локальний `body` і `activities`. У Markdown підтримуються абзаци, заголовки, списки з дефісами та блоки коду. Залишай ID незмінними, коли перейменовуєш або переставляєш уроки.

Доступні `choice` з `options` і `answer` та `text` зі списком `accepted`. Обидва види мають `id`, `prompt` і `feedback`. Встанови `recall: true`, щоб зарахована вправа з’явилася на повторенні наступного навчального дня. Відповіді у `text` чутливі до регістру, зайві пробіли ігноруються.

Пілот підтримує ручний запуск. Команди з уроку показуються як текст для практики у власному терміналі.

Матеріали Docker Compose спираються на [мережі Compose](https://docs.docker.com/compose/how-tos/networking/), [порядок запуску](https://docs.docker.com/compose/how-tos/startup-order/) та [іменовані томи](https://docs.docker.com/reference/compose-file/volumes/).
