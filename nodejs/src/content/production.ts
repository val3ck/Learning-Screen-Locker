import type { Lesson } from './schema';

export const productionLessons: Lesson[] = [
  {
    "id": "nest-modules",
    "moduleId": "nest",
    "title": "Модулі, провайдери та DI",
    "summary": "Побудувати Nest-модуль із замінюваною залежністю.",
    "lectureMinutes": 15,
    "practiceMinutes": 45,
    "goals": [
      "Побудувати Nest-модуль із замінюваною залежністю.",
      "TestingModule повертає сервіс."
    ],
    "task": "Реалізуй PricingModule: UAH=50, EUR=2. Сервіс рахує вартість невідʼємної цілої кількості й відхиляє невідому валюту.",
    "steps": [
      "Оголоси токен RATES.",
      "Зареєструй провайдер і експортуй сервіс.",
      "Перевір overrideProvider."
    ],
    "hints": [
      "Інтерфейс зникає у runtime.",
      "Передай токен через @Inject.",
      "Перевір нуль окремо від невідомої валюти."
    ],
    "criteria": [
      "TestingModule повертає сервіс.",
      "Заміна провайдера змінює тариф.",
      "Невалідна кількість відхиляється."
    ],
    "mistakes": [
      "new у контролері обходить контейнер.",
      "Повторна реєстрація може розділити стан."
    ],
    "reviewQuestions": [
      "Чому інтерфейс не є токеном?",
      "Для чого exports?"
    ],
    "extensions": [
      "Додай асинхронний useFactory і тест його помилки.",
      "Реалізуй репозиторій тарифів за токеном і дві незалежні конфігурації."
    ],
    "sources": [
      {
        "title": "Модулі, провайдери та DI — документація",
        "url": "https://docs.nestjs.com/providers"
      }
    ],
    "quiz": {
      "kind": "choice",
      "question": "Що дозволяє замінювати залежність?",
      "options": [
        "Глобальна змінна",
        "Токен і провайдер",
        "Новий імпорт у кожному методі"
      ],
      "answer": 1,
      "explanation": "Контейнер звʼязує стабільний токен із реалізацією."
    },
    "lab": {
      "language": "ts",
      "starter": "import 'reflect-metadata';\nimport {Inject,Injectable,Module} from '@nestjs/common';\nexport const RATES=Symbol('rates');\n@Injectable()\nexport class PricingService {\n constructor(@Inject(RATES) private rates:Record<string,number>){}\n total(currency:string,count:number){throw new Error('Implement pricing');}\n}\n@Module({providers:[],exports:[]})\nexport class PricingModule {}\n",
      "solution": "import 'reflect-metadata';\nimport {Inject,Injectable,Module} from '@nestjs/common';\nexport const RATES=Symbol('rates');\n@Injectable()\nexport class PricingService {\n constructor(@Inject(RATES) private rates:Record<string,number>){}\n total(currency:string,count:number){\n  if(!Number.isInteger(count)||count<0)throw new Error('count');\n  const rate=this.rates[currency];if(rate===undefined)throw new Error('currency');\n  return rate*count;\n }\n}\n@Module({providers:[PricingService,{provide:RATES,useValue:{UAH:50,EUR:2}}],exports:[PricingService]})\nexport class PricingModule {}\n",
      "tests": "test('real module and dependency replacement',async()=>{\n const {Test}=await import('@nestjs/testing');\n const a=await Test.createTestingModule({imports:[subject.PricingModule]}).compile();\n try{const service=a.get(subject.PricingService);\n assert.equal(service.total('UAH',3),150);assert.equal(service.total('EUR',0),0);\n assert.throws(()=>service.total('USD',1),/currency/);assert.throws(()=>service.total('UAH',-1),/count/);assert.throws(()=>service.total('UAH',1.5),/count/);\n }finally{await a.close();}\n const b=await Test.createTestingModule({imports:[subject.PricingModule]}).overrideProvider(subject.RATES).useValue({UAH:7}).compile();\n try{assert.equal(b.get(subject.PricingService).total('UAH',2),14);}finally{await b.close();}\n});",
      "dependencies": {
        "@nestjs/common": "^11.1.0",
        "@nestjs/core": "^11.1.0",
        "@nestjs/testing": "^11.1.0",
        "reflect-metadata": "^0.2.2",
        "rxjs": "^7.8.2"
      }
    }
  },
  {
    "id": "nest-validation",
    "moduleId": "nest",
    "title": "DTO, ValidationPipe та Swagger",
    "summary": "Автоматично перевіряти HTTP-вхід на рівні NestJS через class-validator і ValidationPipe.",
    "lectureMinutes": 20,
    "practiceMinutes": 50,
    "goals": [
      "Описати DTO з декораторами class-validator і class-transformer.",
      "Налаштувати глобальний ValidationPipe (whitelist, forbidNonWhitelisted, transform).",
      "Підняти справжній NestJS контролер і перевірити HTTP 201 та 400."
    ],
    "task": "Реалізуй CreateBookingDto, BookingsController (@Post /bookings) та createValidationApp(). slotId має обрізати пробіли й не бути порожнім; seats — ціле число від 1 до 5. Глобальний ValidationPipe повинен відхиляти зайві поля та невалідні типи статусом 400.",
    "steps": [
      "Додай декоратори @Transform, @IsString, @IsNotEmpty, @IsInt, @Min(1), @Max(5) у CreateBookingDto.",
      "Створи BookingsController з @Controller('bookings') і @Post() методом, що приймає @Body() dto: CreateBookingDto.",
      "У createValidationApp() підніми TestModule, підключи глобальний ValidationPipe та виклич app.init()."
    ],
    "hints": [
      "Не забудь import 'reflect-metadata' першим рядком, інакше Nest не побачить тип DTO.",
      "Не вмикай enableImplicitConversion: true, якщо хочеш відхиляти рядок '2' замість числа 2.",
      "whitelist: true + forbidNonWhitelisted: true повертають 400 на зайві поля на кшталт admin: true."
    ],
    "criteria": [
      "Коректний POST /bookings повертає 201 з обрізаним slotId і seats.",
      "Порожній slotId, seats='2', seats=0 або seats=6 дають HTTP 400.",
      "Зайве поле admin: true відхиляється з HTTP 400."
    ],
    "mistakes": [
      "Забути forbidNonWhitelisted: true, через що клієнт не знає про відкинуті поля.",
      "Плутати DTO-валідацію форми запиту з бізнес-перевіркою вільності слоту в БД."
    ],
    "reviewQuestions": [
      "Чим відрізняються whitelist і forbidNonWhitelisted?",
      "Як @nestjs/swagger використовує ті ж DTO для автогенерації OpenAPI?"
    ],
    "extensions": [
      "Додай @ApiProperty до CreateBookingDto і змонтуй Swagger UI на /docs.",
      "Напиши глобальний AllExceptionsFilter, який стандартизує всі 400/404/500 у єдиний JSON-контракт із requestId."
    ],
    "sources": [
      {
        "title": "NestJS Validation",
        "url": "https://docs.nestjs.com/techniques/validation"
      },
      {
        "title": "NestJS OpenAPI (Swagger)",
        "url": "https://docs.nestjs.com/openapi/introduction"
      }
    ],
    "quiz": {
      "kind": "choice",
      "question": "Яка опція ValidationPipe повертає 400 Bad Request, якщо клієнт передав незадеклароване в DTO поле?",
      "options": [
        "transform: true",
        "forbidNonWhitelisted: true (разом із whitelist: true)",
        "disableErrorMessages: true"
      ],
      "answer": 1,
      "explanation": "Сам whitelist лише тихо вирізає зайві поля; разом із forbidNonWhitelisted запит явно відхиляється зі статусом 400."
    },
    "lab": {
      "language": "ts",
      "dependencies": {
        "@nestjs/common": "^11.1.0",
        "@nestjs/core": "^11.1.0",
        "@nestjs/platform-express": "^11.1.0",
        "@nestjs/testing": "^11.1.0",
        "class-transformer": "0.5.1",
        "class-validator": "0.15.1",
        "reflect-metadata": "^0.2.2",
        "rxjs": "^7.8.2"
      },
      "starter": "import 'reflect-metadata';\nimport { Body, Controller, INestApplication, Post, ValidationPipe } from '@nestjs/common';\nimport { Transform } from 'class-transformer';\nimport { IsInt, IsNotEmpty, IsString, Max, Min } from 'class-validator';\n\nexport class CreateBookingDto {\n  slotId!: string;\n  seats!: number;\n}\n\n@Controller('bookings')\nexport class BookingsController {\n  @Post()\n  create(@Body() dto: CreateBookingDto) {\n    return dto;\n  }\n}\n\nexport async function createValidationApp(): Promise<INestApplication> {\n  throw new Error('Підніми NestJS app із ValidationPipe');\n}\n",
      "solution": "import 'reflect-metadata';\nimport { Body, Controller, INestApplication, Post, ValidationPipe } from '@nestjs/common';\nimport { Transform } from 'class-transformer';\nimport { IsInt, IsNotEmpty, IsString, Max, Min } from 'class-validator';\n\nexport class CreateBookingDto {\n  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value))\n  @IsString()\n  @IsNotEmpty()\n  slotId!: string;\n\n  @IsInt()\n  @Min(1)\n  @Max(5)\n  seats!: number;\n}\n\n@Controller('bookings')\nexport class BookingsController {\n  @Post()\n  create(@Body() dto: CreateBookingDto) {\n    return { slotId: dto.slotId, seats: dto.seats };\n  }\n}\n\nexport async function createValidationApp(): Promise<INestApplication> {\n  const { Test } = await import('@nestjs/testing');\n  const mod = await Test.createTestingModule({ controllers: [BookingsController] }).compile();\n  const app = mod.createNestApplication();\n  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));\n  await app.init();\n  return app;\n}\n",
      "tests": "test('real NestJS HTTP ValidationPipe rejects bad payloads and trims DTO', async () => {\n  const app = await subject.createValidationApp();\n  await app.listen(0, '127.0.0.1');\n  const base = await app.getUrl();\n  const post = (body: unknown) => fetch(`${base}/bookings`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });\n  try {\n    const ok = await post({ slotId: ' morning ', seats: 2 });\n    assert.equal(ok.status, 201);\n    assert.deepEqual(await ok.json(), { slotId: 'morning', seats: 2 });\n    const edge = await post({ slotId: 'x', seats: 5 });\n    assert.equal(edge.status, 201);\n    for (const bad of [{}, { slotId: '   ', seats: 1 }, { slotId: 'x', seats: '2' }, { slotId: 'x', seats: 0 }, { slotId: 'x', seats: 6 }, { slotId: 'x', seats: 1.5 }, { slotId: 'x', seats: 2, admin: true }]) {\n      const res = await post(bad);\n      assert.equal(res.status, 400, `Expected 400 for ${JSON.stringify(bad)}`);\n    }\n  } finally {\n    await app.close();\n  }\n});\n"
    }
  },
  {
    "id": "nest-lifecycle",
    "moduleId": "nest",
    "title": "Життєвий цикл запиту й сервісу",
    "summary": "Розрізняти guards, pipes, interceptors, filters і коректне завершення.",
    "lectureMinutes": 15,
    "practiceMinutes": 45,
    "goals": [
      "Розрізняти guards, pipes, interceptors, filters і коректне завершення.",
      "Кожен close викликається раз."
    ],
    "task": "Напиши createShutdown(resources), що повертає stop(). Закривай ресурси послідовно у зворотному порядку; збирай помилки; повторні виклики не дублюють close.",
    "steps": [
      "Збережи одну promise.",
      "Обійди копію масиву з кінця.",
      "Продовжуй після помилки."
    ],
    "hints": [
      "Присвой promise до await.",
      "Promise.all не зберігає порядок завершення.",
      "Повертай помилки для логування."
    ],
    "criteria": [
      "Кожен close викликається раз.",
      "Помилка не заважає іншим ресурсам.",
      "Порядок зворотний."
    ],
    "mistakes": [
      "Порожній catch приховує збій.",
      "Закриття БД до завершення HTTP ламає запити."
    ],
    "reviewQuestions": [
      "Чим guard відрізняється від pipe?",
      "Навіщо ідемпотентність завершення?"
    ],
    "extensions": [
      "Підключи модель до OnApplicationShutdown і перевір активний HTTP-запит.",
      "Додай граничний час і звіт про ресурси, що не завершилися."
    ],
    "sources": [
      {
        "title": "Життєвий цикл запиту й сервісу — документація",
        "url": "https://docs.nestjs.com/fundamentals/lifecycle-events"
      }
    ],
    "quiz": {
      "kind": "choice",
      "question": "Де перевірити роль до контролера?",
      "options": [
        "Guard",
        "Pipe",
        "JSON-серіалізатор"
      ],
      "answer": 0,
      "explanation": "Guard приймає рішення про доступ."
    },
    "lab": {
      "language": "js",
      "starter": "export function createShutdown(resources){return async()=>{throw new Error(\"Implement shutdown\");};}",
      "solution": "export function createShutdown(resources){\n let pending;\n return function stop(){\n  if(!pending)pending=(async()=>{const errors=[];\n   for(const resource of [...resources].reverse()){\n    try{await resource.close();}catch(error){errors.push(error);}\n   }return errors;\n  })();return pending;\n };\n}",
      "tests": "test('ordered resilient idempotent shutdown',async()=>{\n const calls=[];const failure=new Error('queue');\n const stop=subject.createShutdown([{close:async()=>{calls.push('db');}},{close:async()=>{calls.push('queue');throw failure;}},{close:async()=>{calls.push('http');}}]);\n const [a,b]=await Promise.all([stop(),stop()]);assert.deepEqual(calls,['http','queue','db']);assert.deepEqual(a,[failure]);assert.strictEqual(a,b);\n await stop();assert.equal(calls.length,3);assert.deepEqual(await subject.createShutdown([])(),[]);\n});"
    }
  },
  {
    "id": "security-sessions",
    "moduleId": "security",
    "title": "JWT (jose), HttpOnly cookies та відкликання",
    "summary": "Видавати й криптографічно перевіряти JWT із jti, строком життя та відкликанням.",
    "lectureMinutes": 20,
    "practiceMinutes": 45,
    "goals": [
      "Підписувати та перевіряти JWT через бібліотеку jose з фіксованим алгоритмом HS256.",
      "Перевіряти claims (sub, iss, exp) та підтримувати відкликання через jti."
    ],
    "task": "Реалізуй createTokenService({ secret, issuer, ttlSeconds, now }) на бібліотеці jose. issueAccessToken(userId, roles) повертає { token, jti }; verifyAccessToken(token) повертає { userId, jti, roles }, перевіряє підпис/issuer/exp/jti; revoke(jti) робить токен недійсним.",
    "steps": [
      "Перевір секрет (мін. 32 символи) і кодуй його через TextEncoder.",
      "У issueAccessToken згенеруй jti через randomUUID та підпиши SignJWT з alg: HS256.",
      "У verifyAccessToken виклич jwtVerify з algorithms: ['HS256'], issuer і currentDate, потім перевір jti у Set відкликаних."
    ],
    "hints": [
      "Ніколи не довіряй alg з заголовка токена: передавай algorithms: ['HS256'] явно.",
      "currentDate: new Date(now()) у jwtVerify дозволяє детерміновано тестувати exp без setTimeout.",
      "Після виходу або зміни пароля зберігай відкликаний jti у Redis із TTL до закінчення exp."
    ],
    "criteria": [
      "Валідний JWT перевіряється та повертає userId, jti, roles.",
      "Прострочений, підроблений, alg: none чи виданий іншим issuer токен відхиляються.",
      "Відкликаний за jti токен більше не приймається навіть до спливу exp."
    ],
    "mistakes": [
      "Декодувати Base64 payload без перевірки криптографічного підпису.",
      "Видавати довгоживучий JWT без механізму відкликання або refresh rotation."
    ],
    "reviewQuestions": [
      "Чому access JWT роблять коротким (5–15 хв), а refresh тримають у HttpOnly cookie?",
      "Як організувати відкликання JWT між кількома інстансами NestJS?"
    ],
    "extensions": [
      "Додай сервіс хешування паролів через argon2 (або scrypt) та cookie-обмін refresh токена з ротацією в PostgreSQL/Redis.",
      "Підключи helmet() та строгий CORS allowlist у Express/NestJS застосунок."
    ],
    "sources": [
      {
        "title": "jose JWT documentation",
        "url": "https://github.com/panva/jose"
      },
      {
        "title": "OWASP JSON Web Token Cheat Sheet",
        "url": "https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_for_Java_Cheat_Sheet.html"
      }
    ],
    "quiz": {
      "kind": "choice",
      "question": "Чи досить декодувати JWT через atob або JSON.parse?",
      "options": [
        "Так",
        "Ні, обовʼязково перевіряти підпис, дозволений alg і claims (exp, iss)",
        "Так, якщо токен передається в Authorization: Bearer"
      ],
      "answer": 1,
      "explanation": "Декодування лише читає Base64; будь-хто може підробити payload без перевірки підпису."
    },
    "lab": {
      "language": "ts",
      "dependencies": {
        "jose": "6.2.17"
      },
      "starter": "import { SignJWT, jwtVerify } from 'jose';\nimport { randomUUID } from 'node:crypto';\n\nexport type TokenClaims = { userId: string; jti: string; roles: string[] };\n\nexport function createTokenService(options: { secret: string; issuer?: string; ttlSeconds: number; now?: () => number }) {\n  throw new Error('Реалізуй JWT сервіс на jose');\n}\n",
      "solution": "import { SignJWT, jwtVerify } from 'jose';\nimport { randomUUID } from 'node:crypto';\n\nexport type TokenClaims = { userId: string; jti: string; roles: string[] };\n\nexport function createTokenService({ secret, issuer = 'booking-api', ttlSeconds, now = Date.now }: { secret: string; issuer?: string; ttlSeconds: number; now?: () => number }) {\n  if (typeof secret !== 'string' || secret.length < 32) throw new Error('weak_secret');\n  if (!Number.isSafeInteger(ttlSeconds) || ttlSeconds <= 0) throw new Error('invalid_ttl');\n  const key = new TextEncoder().encode(secret);\n  const revoked = new Set<string>();\n  return {\n    async issueAccessToken(userId: string, roles: string[]): Promise<{ token: string; jti: string }> {\n      if (typeof userId !== 'string' || !userId.trim() || !Array.isArray(roles)) throw new Error('invalid_subject');\n      const jti = randomUUID();\n      const iat = Math.floor(now() / 1000);\n      const token = await new SignJWT({ roles: [...roles] })\n        .setProtectedHeader({ alg: 'HS256' })\n        .setSubject(userId)\n        .setIssuer(issuer)\n        .setJti(jti)\n        .setIssuedAt(iat)\n        .setExpirationTime(iat + ttlSeconds)\n        .sign(key);\n      return { token, jti };\n    },\n    async verifyAccessToken(token: string): Promise<TokenClaims> {\n      const { payload } = await jwtVerify(token, key, { issuer, algorithms: ['HS256'], currentDate: new Date(now()) });\n      if (typeof payload.sub !== 'string' || typeof payload.jti !== 'string' || !Array.isArray(payload.roles) || revoked.has(payload.jti)) {\n        throw new Error('unauthorized');\n      }\n      return { userId: payload.sub, jti: payload.jti, roles: payload.roles.map(String) };\n    },\n    revoke(jti: string): void {\n      revoked.add(jti);\n    },\n  };\n}\n",
      "tests": "test('JWT issue, expiry, tamper rejection and jti revocation', async () => {\n  let clock = 1_700_000_000_000;\n  const secret = 'super-secret-signing-key-32-chars-min';\n  const svc = subject.createTokenService({ secret, issuer: 'app', ttlSeconds: 60, now: () => clock });\n  const issued = await svc.issueAccessToken('user-1', ['user']);\n  const verified = await svc.verifyAccessToken(issued.token);\n  assert.deepEqual(verified, { userId: 'user-1', jti: issued.jti, roles: ['user'] });\n  const tampered = issued.token.slice(0, -4) + 'AAAA';\n  await assert.rejects(() => svc.verifyAccessToken(tampered));\n  const unsignedHeader = Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64url');\n  const forgedPayload = Buffer.from(JSON.stringify({ sub: 'admin', iss: 'app', roles: ['admin'], jti: '1', exp: 1_700_000_999 })).toString('base64url');\n  await assert.rejects(() => svc.verifyAccessToken(`${unsignedHeader}.${forgedPayload}.`));\n  clock += 60_000;\n  await assert.rejects(() => svc.verifyAccessToken(issued.token));\n  const fresh = await svc.issueAccessToken('user-2', ['admin']);\n  svc.revoke(fresh.jti);\n  await assert.rejects(() => svc.verifyAccessToken(fresh.token));\n});\n"
    }
  },
  {
    "id": "security-authorization",
    "moduleId": "security",
    "title": "Ролі, власники та tenant",
    "summary": "Застосовувати правила до кожного ресурсу й забороняти невідомі дії.",
    "lectureMinutes": 15,
    "practiceMinutes": 45,
    "goals": [
      "Відокремлювати перевірену ідентичність від дозволу на конкретну дію.",
      "Застосовувати правила ролі, власника й tenant до кожного ресурсу.",
      "Забороняти невідомі дії та неповні дані за замовчуванням."
    ],
    "task": "Напиши canAccess(actor,document,action). Один tenant: власник та editor читають/редагують; admin також видаляє. Власник без admin не видаляє. Невідомі дії заборонені.",
    "steps": [
      "Склади матрицю actor × document × action з очікуваним результатом.",
      "Спершу відхили відсутні дані та чужий tenant, потім невідому дію.",
      "Застосуй правила власника, editor і admin; запусти негативні тести."
    ],
    "hints": [
      "Admin також обмежений tenant.",
      "ownerId із payload недовірений.",
      "Повертай boolean в усіх гілках."
    ],
    "criteria": [
      "Чужий tenant недоступний.",
      "Власник не видаляє без admin.",
      "Невідома дія повертає false."
    ],
    "mistakes": [
      "Роль не замінює перевірку ресурсу.",
      "Одного контролера недостатньо для всіх шляхів виклику."
    ],
    "reviewQuestions": [
      "Чому guard не замінює перевірку власника?",
      "Коли доречний 404?"
    ],
    "extensions": [
      "Інтегруй policy у два маршрути й batch-операцію.",
      "Додай аудит відмов без витоку сесії чи контенту."
    ],
    "sources": [
      {
        "title": "Ролі, власники та tenant — документація",
        "url": "https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html"
      }
    ],
    "quiz": {
      "kind": "choice",
      "question": "Editor tenant A знає ID документа B.",
      "options": [
        "Дозволити",
        "Відмовити через tenant",
        "Дозволити GET"
      ],
      "answer": 1,
      "explanation": "Межа організації незалежна від ролі."
    },
    "lab": {
      "language": "js",
      "starter": "export function canAccess(actor,document,action){return true;}",
      "solution": "export function canAccess(actor,document,action){\n if(!actor||!document||typeof actor.id!=='string'||!actor.id||typeof actor.tenantId!=='string'||!actor.tenantId||actor.tenantId!==document.tenantId||!Array.isArray(actor.roles))return false;\n if(!['read','update','delete'].includes(action))return false;\n if(actor.roles.includes('admin'))return true;if(action==='delete')return false;\n return actor.roles.includes('editor')||document.ownerId===actor.id;\n}",
      "tests": "test('ownership and tenant isolation',()=>{\n const d={ownerId:'a',tenantId:'one'},a={id:'a',tenantId:'one',roles:[]},b={id:'b',tenantId:'one',roles:[]};\n assert.equal(subject.canAccess(a,d,'read'),true);assert.equal(subject.canAccess(a,d,'update'),true);assert.equal(subject.canAccess(a,d,'delete'),false);\n assert.equal(subject.canAccess(b,d,'read'),false);assert.equal(subject.canAccess({...b,roles:['editor']},d,'update'),true);assert.equal(subject.canAccess({...b,roles:['admin']},d,'delete'),true);\n assert.equal(subject.canAccess({...b,tenantId:'two',roles:['admin']},d,'read'),false);\n assert.equal(subject.canAccess(a,d,'publish'),false);assert.equal(subject.canAccess(null,d,'read'),false);assert.equal(subject.canAccess(a,null,'read'),false);\n});\ntest('unknown actions and incomplete actor fail closed',()=>{\n const document={ownerId:'a',tenantId:'one'}, admin={id:'a',tenantId:'one',roles:['admin']};\n for(const action of ['publish','',null]) assert.equal(subject.canAccess(admin,document,action),false);\n assert.equal(subject.canAccess({...admin,tenantId:'two'},document,'delete'),false);\n assert.equal(subject.canAccess({...admin,roles:null},document,'read'),false);\n assert.equal(subject.canAccess({...admin,id:''},document,'read'),false);\n});"
    }
  },
  {
    "id": "testing-unit",
    "moduleId": "testing",
    "title": "Unit-тести та детерміновані сценарії",
    "summary": "Перевіряти бізнес-поведінку, межі й відмови незалежно від зовнішніх ресурсів.",
    "lectureMinutes": 15,
    "practiceMinutes": 45,
    "goals": [
      "Перевіряти бізнес-поведінку, межі й відмови незалежно від зовнішніх ресурсів.",
      "Тести перевіряють результат, а не приватні виклики."
    ],
    "task": "Виправ quote(lines,discountPercent). Ціна в цілих копійках, quantity — додатне ціле, discountPercent — ціле 0–100. Поверни {subtotal,discount,total}; округлюй знижку один раз для всього subtotal через Math.round. Додай власний тест на порожній кошик.",
    "steps": [
      "Сформулюй поведінку до зміни реалізації.",
      "Розділи valid, boundary, invalid сценарії.",
      "Запусти тест і перевір, що він відтворює помилку."
    ],
    "hints": [
      "Перевір цілі копійки через Number.isSafeInteger.",
      "100% знижка дає нуль.",
      "Округлення кожного рядка змінює контракт."
    ],
    "criteria": [
      "Тести перевіряють результат, а не приватні виклики.",
      "Негативні ціни, дробові кількості й невалідні знижки відхиляються.",
      "Порожній кошик повертає нулі."
    ],
    "mistakes": [
      "Тест без await може завершитися до помилки.",
      "Перевірка тільки одного щасливого прикладу пропускає межі."
    ],
    "reviewQuestions": [
      "Що робить тест детермінованим?",
      "Коли mock корисний, а коли приховує проблему?"
    ],
    "extensions": [
      "Перенеси сценарії в Jest test.each та додай перевірку async rejects.",
      "Додай property-перевірки: total не відʼємний, total+discount=subtotal, вхід не змінюється."
    ],
    "sources": [
      {
        "title": "Unit-тести та детерміновані сценарії — документація",
        "url": "https://jestjs.io/docs/getting-started"
      }
    ],
    "quiz": {
      "kind": "choice",
      "question": "Що краще перевіряє unit-тест?",
      "options": [
        "Назву приватного методу",
        "Спостережуваний результат і контракт",
        "Кількість рядків функції"
      ],
      "answer": 1,
      "explanation": "Рефакторинг може змінити реалізацію без зміни поведінки."
    },
    "lab": {
      "language": "js",
      "starter": "export function quote(lines,discountPercent){\n const subtotal=lines.reduce((sum,line)=>sum+line.price*line.quantity,0);\n return {subtotal,discount:discountPercent,total:subtotal-discountPercent};\n}",
      "solution": "export function quote(lines,discountPercent){\n if(!Array.isArray(lines)||!Number.isInteger(discountPercent)||discountPercent<0||discountPercent>100)throw new Error('invalid_quote');\n let subtotal=0;\n for(const line of lines){\n  if(!line||!Number.isSafeInteger(line.price)||line.price<0||!Number.isSafeInteger(line.quantity)||line.quantity<=0)throw new Error('invalid_quote');\n  const next=subtotal+line.price*line.quantity;if(!Number.isSafeInteger(next))throw new Error('invalid_quote');subtotal=next;\n }\n const discount=Math.round(subtotal*discountPercent/100);\n return {subtotal,discount,total:subtotal-discount};\n}",
      "tests": "test('quote behavior, rounding and bad input',()=>{\n const lines=[{price:101,quantity:3},{price:200,quantity:1}];\n assert.deepEqual(subject.quote(lines,10),{subtotal:503,discount:50,total:453});\n assert.deepEqual(subject.quote([],0),{subtotal:0,discount:0,total:0});assert.equal(subject.quote(lines,100).total,0);\n assert.deepEqual(lines,[{price:101,quantity:3},{price:200,quantity:1}]);\n for(const bad of [-1,101,1.5,NaN])assert.throws(()=>subject.quote(lines,bad),/invalid_quote/);\n for(const bad of [{price:-1,quantity:1},{price:1,quantity:0},{price:1,quantity:1.2},{price:Number.MAX_SAFE_INTEGER,quantity:2}])assert.throws(()=>subject.quote([bad],0),/invalid_quote/);\n});"
    }
  },
  {
    "id": "testing-integration",
    "moduleId": "testing",
    "title": "Інтеграційні та контрактні перевірки",
    "summary": "Перевірити справжній HTTP-ланцюжок із контрольованим репозиторієм.",
    "lectureMinutes": 15,
    "practiceMinutes": 45,
    "goals": [
      "Перевірити справжній HTTP-ланцюжок із контрольованим репозиторієм.",
      "Запит проходить реальний Express routing і JSON serialization."
    ],
    "task": "Реалізуй createApp(repository). GET /items/:id приймає id із малих латинських літер, цифр і дефіса, довжиною 1–36. Невалідний ID →400 {error:\"invalid_id\"}, відсутній запис →404 {error:\"not_found\"}, збій →500 {error:\"internal_error\"}. Успіх повертає лише id і name.",
    "steps": [
      "Створи app factory без listen.",
      "Інʼєктуй репозиторій.",
      "Відділи validation, not found і unexpected error."
    ],
    "hints": [
      "Supertest працює з Express app.",
      "Не повертай повідомлення помилки бази клієнтові.",
      "Валідація має відбутися до виклику репозиторію."
    ],
    "criteria": [
      "Запит проходить реальний Express routing і JSON serialization.",
      "Невалідний ID не викликає сховище.",
      "Внутрішні поля не витікають у відповідь."
    ],
    "mistakes": [
      "Mock самого контролера обходить те, що потрібно перевірити.",
      "Незакритий сервер або connection pool залишає runner активним."
    ],
    "reviewQuestions": [
      "Яку межу перевіряє цей тест?",
      "Що ще має перевірити контракт із реальною PostgreSQL?"
    ],
    "extensions": [
      "Підключи PostgreSQL через Testcontainers і перевір міграції, readiness, rollback та release.",
      "Збережи OpenAPI-контракт і додай перевірку, що всі відповіді маршруту йому відповідають."
    ],
    "sources": [
      {
        "title": "Інтеграційні та контрактні перевірки — документація",
        "url": "https://testcontainers.com/guides/getting-started-with-testcontainers-for-nodejs/"
      }
    ],
    "quiz": {
      "kind": "choice",
      "question": "Чи доводить тест із Map, що SQL-запит правильний?",
      "options": [
        "Так",
        "Ні, потрібен тест реального DB adapter",
        "Лише якщо є Supertest"
      ],
      "answer": 1,
      "explanation": "HTTP-тест із fake repository не виконує SQL."
    },
    "lab": {
      "language": "js",
      "starter": "import express from 'express';\nexport function createApp(repository){return express();}",
      "solution": "import express from 'express';\nexport function createApp(repository){\n const app=express();\n app.get('/items/:id',async(req,res)=>{\n  if(!/^[a-z0-9-]{1,36}$/.test(req.params.id)){res.status(400).json({error:'invalid_id'});return;}\n  try{const item=await repository.find(req.params.id);\n   if(!item){res.status(404).json({error:'not_found'});return;}\n   res.json({id:item.id,name:item.name});\n  }catch{res.status(500).json({error:'internal_error'});}\n });\n return app;\n}",
      "tests": "test('HTTP contract with controlled repository',async()=>{\n const request=(await import('supertest')).default;let calls=0;\n const app=subject.createApp({async find(id){calls++;if(id==='broken')throw new Error('password=secret');return id==='one'?{id,name:'Book',internalSecret:'hidden'}:null;}});\n assert.deepEqual((await request(app).get('/items/one').expect(200)).body,{id:'one',name:'Book'});\n assert.deepEqual((await request(app).get('/items/missing').expect(404)).body,{error:'not_found'});\n const before=calls;assert.deepEqual((await request(app).get('/items/INVALID').expect(400)).body,{error:'invalid_id'});assert.equal(calls,before);\n assert.deepEqual((await request(app).get('/items/broken').expect(500)).body,{error:'internal_error'});\n});",
      "dependencies": {
        "express": "^5.1.0",
        "supertest": "^7.1.0"
      },
      "instructions": "Default-тест використовує справжній Express і fake repository без зовнішньої БД. Для DB adapter додай окремий інтеграційний тест із Testcontainers: запусти PostgreSQLContainer, дочекайся start(), застосуй міграцію, виконай сценарій і закрий pool та container у finally. Docker потрібен лише для цього розширення."
    }
  },
  {
    "id": "reliability-cache",
    "moduleId": "reliability",
    "title": "Кешування, TTL та інвалідація",
    "summary": "Реалізувати cache-aside з контрольованою свіжістю й захистом від одночасних промахів.",
    "lectureMinutes": 15,
    "practiceMinutes": 45,
    "goals": [
      "Реалізувати cache-aside з контрольованою свіжістю й захистом від одночасних промахів.",
      "Повторні читання до TTL не звертаються до load."
    ],
    "task": "Напиши createCache({load,now,ttlMs}) з get(key), invalidate(key). Кешуй також null. Одночасні get одного ключа ділять одне завантаження. Після invalidate старий запит не має повторно заповнити кеш. Помилки не кешуються.",
    "steps": [
      "Відділи cache та in-flight promises.",
      "Перевір TTL інʼєктованим годинником.",
      "Познач покоління ключа при invalidate."
    ],
    "hints": [
      "null може бути закешованим результатом.",
      "finally має прибирати лише свою promise.",
      "Перевір покоління перед записом завантаженого значення."
    ],
    "criteria": [
      "Повторні читання до TTL не звертаються до load.",
      "Одночасний miss викликає load один раз.",
      "Помилка та інвалідація не залишають старий результат."
    ],
    "mistakes": [
      "TTL не гарантує актуальність після запису в БД.",
      "Ключ без tenant може змішати дані різних користувачів."
    ],
    "reviewQuestions": [
      "Хто є джерелом істини?",
      "Що стається при invalidate під час load?"
    ],
    "extensions": [
      "Перенеси cache-aside в Redis із tenant-aware keys та метриками hit/miss.",
      "Відтвори cache stampede між двома інстансами та порівняй stale-while-revalidate з розподіленою координацією."
    ],
    "sources": [
      {
        "title": "Кешування, TTL та інвалідація — документація",
        "url": "https://redis.io/docs/latest/develop/use-cases/cache-aside/nodejs/"
      }
    ],
    "quiz": {
      "kind": "choice",
      "question": "Що гарантує TTL?",
      "options": [
        "Значення завжди найновіше",
        "Верхню межу строку збереження запису в цьому кеші",
        "Відсутність одночасних miss"
      ],
      "answer": 1,
      "explanation": "Запис у джерелі може змінитися раніше за TTL."
    },
    "lab": {
      "language": "js",
      "starter": "export function createCache(options){throw new Error(\"Implement cache\");}",
      "solution": "export function createCache({load,now=Date.now,ttlMs}){\n if(!Number.isFinite(ttlMs)||ttlMs<=0)throw new Error('ttl');\n const cache=new Map(),pending=new Map(),versions=new Map();\n return {\n  get(key){\n   const hit=cache.get(key);if(hit&&now()<hit.expiresAt)return Promise.resolve(hit.value);\n   if(pending.has(key))return pending.get(key);\n   const version=versions.get(key)||0;\n   const promise=Promise.resolve().then(()=>load(key)).then(value=>{\n    if((versions.get(key)||0)===version)cache.set(key,{value,expiresAt:now()+ttlMs});return value;\n   }).finally(()=>{if(pending.get(key)===promise)pending.delete(key);});\n   pending.set(key,promise);return promise;\n  },\n  invalidate(key){versions.set(key,(versions.get(key)||0)+1);cache.delete(key);pending.delete(key);}\n };\n}",
      "tests": "test('TTL, single-flight, null and failure',async()=>{\n let now=0,calls=0;const cache=subject.createCache({now:()=>now,ttlMs:10,load:async key=>{calls++;return key==='missing'?null:calls;}});\n assert.deepEqual(await Promise.all([cache.get('x'),cache.get('x')]),[1,1]);assert.equal(calls,1);\n now=9;assert.equal(await cache.get('x'),1);now=10;assert.equal(await cache.get('x'),2);\n await cache.get('missing');await cache.get('missing');assert.equal(calls,3);\n let attempts=0;const flaky=subject.createCache({ttlMs:10,load:async()=>{if(++attempts===1)throw new Error('down');return 7;}});\n await assert.rejects(()=>flaky.get('x'),/down/);assert.equal(await flaky.get('x'),7);\n});\ntest('invalidation fences an old in-flight fill',async()=>{\n let release;let calls=0;const cache=subject.createCache({ttlMs:100,load:()=>{calls++;return calls===1?new Promise(resolve=>{release=resolve;}):Promise.resolve('new');}});\n const old=cache.get('x');await Promise.resolve();cache.invalidate('x');\n assert.equal(await cache.get('x'),'new');release('old');assert.equal(await old,'old');assert.equal(await cache.get('x'),'new');assert.equal(calls,2);\n});"
    }
  },
  {
    "id": "reliability-jobs",
    "moduleId": "reliability",
    "title": "Черги, повтори та ідемпотентність",
    "summary": "Захистити бізнес-ефект від повторної доставки й зрозуміти межі однопроцесної моделі.",
    "lectureMinutes": 15,
    "practiceMinutes": 45,
    "goals": [
      "Захистити бізнес-ефект від повторної доставки й зрозуміти межі однопроцесної моделі.",
      "Duplicate delivery повертає перший результат."
    ],
    "task": "Реалізуй createJobProcessor(effect). process(job) приймає {id,accountId,amount}, де amount — додатне ціле. Один id з тим самим payload виконує effect лише раз, з іншим payload — conflict. Паралельні виклики серіалізуються; помилка effect дозволяє повтор. Це однопроцесна симуляція.",
    "steps": [
      "Валідуй job до побічного ефекту.",
      "Збережи результат і fingerprint за id.",
      "Серіалізуй concurrent process та не блокуй чергу після rejection."
    ],
    "hints": [
      "Перехопи rejection лише для внутрішнього tail.",
      "Receipt записується після успішного effect.",
      "Зовнішній effect і receipt у production мають бути атомарними або узгодженими через outbox."
    ],
    "criteria": [
      "Duplicate delivery повертає перший результат.",
      "Повторений id з іншим payload відхиляється.",
      "Тимчасова помилка дозволяє наступну спробу."
    ],
    "mistakes": [
      "In-memory Map зникає після crash.",
      "attempts:3 означає три виконання загалом, а не три повтори після першого."
    ],
    "reviewQuestions": [
      "Чому acknowledgment не гарантує рівно один ефект?",
      "Що змінити, якщо effect успішний, але receipt не записався?"
    ],
    "extensions": [
      "Перенеси effect і receipt в одну PostgreSQL-транзакцію з UNIQUE(job_id).",
      "Підключи BullMQ, відтвори crash після commit до acknowledgment і доведи відсутність подвійного списання."
    ],
    "sources": [
      {
        "title": "Черги, повтори та ідемпотентність — документація",
        "url": "https://docs.bullmq.io/patterns/idempotent-jobs"
      }
    ],
    "quiz": {
      "kind": "choice",
      "question": "Worker зробив commit і впав до acknowledgment. Що можливе?",
      "options": [
        "Повторна доставка тієї ж роботи",
        "Черга автоматично відкочує БД",
        "Повтор неможливий"
      ],
      "answer": 0,
      "explanation": "Потрібна ідемпотентна бізнес-операція з durable deduplication."
    },
    "lab": {
      "language": "js",
      "starter": "export function createJobProcessor(effect){throw new Error(\"Implement jobs\");}",
      "solution": "export function createJobProcessor(effect){\n const receipts=new Map();let tail=Promise.resolve();\n return function process(job){\n  const result=tail.then(async()=>{\n   if(!job||typeof job.id!=='string'||!job.id||typeof job.accountId!=='string'||!job.accountId||!Number.isSafeInteger(job.amount)||job.amount<=0)throw new Error('invalid_job');\n   const fingerprint=JSON.stringify([job.accountId,job.amount]);const previous=receipts.get(job.id);\n   if(previous){if(previous.fingerprint!==fingerprint)throw new Error('conflict');return previous.value;}\n   const value=await effect({...job});receipts.set(job.id,{fingerprint,value});return value;\n  });tail=result.catch(()=>{});return result;\n };\n}",
      "tests": "test('duplicate delivery, conflict and retry',async()=>{\n let effects=0;const process=subject.createJobProcessor(async job=>{effects++;return {accountId:job.accountId,amount:job.amount};});\n const job={id:'j1',accountId:'a',amount:10};const result=await Promise.all([process(job),process(job),process(job)]);\n assert.equal(effects,1);assert.deepEqual(result[0],result[1]);await assert.rejects(()=>process({...job,amount:20}),/conflict/);\n await assert.rejects(()=>process({...job,id:'bad',amount:0}),/invalid_job/);\n let attempts=0;const flaky=subject.createJobProcessor(async()=>{if(++attempts===1)throw new Error('temporary');return 'ok';});\n await assert.rejects(()=>flaky(job),/temporary/);assert.equal(await flaky(job),'ok');assert.equal(await flaky(job),'ok');assert.equal(attempts,2);\n});",
      "instructions": "Модель серіалізує всі роботи в одному процесі та зберігає receipts у Map. Вона не забезпечує durable exactly-once і не закриває crash між effect та записом receipt. У production виконай бізнес-зміну й INSERT receipt в одній БД-транзакції або застосуй outbox/idempotent API. Для Redis: docker run --rm -p 6379:6379 redis:7-alpine; readiness — redis-cli ping; після тестів зупини контейнер."
    }
  },
  {
    "id": "operations-containers",
    "moduleId": "operations",
    "title": "Linux, Docker та конфігурація",
    "summary": "Запускати відтворюваний процес із явною конфігурацією й health check.",
    "lectureMinutes": 15,
    "practiceMinutes": 45,
    "goals": [
      "Запускати відтворюваний процес із явною конфігурацією й health check.",
      "Невалідна конфігурація завершує запуск явно."
    ],
    "task": "Реалізуй readConfig(env). PORT за замовчуванням 3000; явно заданий PORT — лише десятковий рядок цілого 1–65535. NODE_ENV: development/test/production, default development. Поверни {port,environment}; помилки — invalid_config. Потім збудуй наданий Dockerfile.",
    "steps": [
      "Відділи читання конфігурації від запуску сервера.",
      "Перевір порожнє значення та діапазон.",
      "Збудуй образ і перевір /healthz."
    ],
    "hints": [
      "Number(\"\") дає 0, тому перевір формат.",
      "Контейнер слухає 0.0.0.0, не лише loopback.",
      "EXPOSE не публікує порт на host."
    ],
    "criteria": [
      "Невалідна конфігурація завершує запуск явно.",
      "Default і крайні порти перевірені.",
      "Контейнер відповідає на healthz після readiness."
    ],
    "mistakes": [
      "ENV із секретом у Dockerfile залишає його в образі.",
      "Контейнер не є віртуальною машиною з окремим ядром."
    ],
    "reviewQuestions": [
      "Чим image відрізняється від container?",
      "Що означає health check, а що readiness?"
    ],
    "extensions": [
      "Додай PostgreSQL у Compose з pg_isready, volume і явними startup retries клієнта.",
      "Перенеси реальний TS-сервіс у multi-stage build із npm ci, runtime-only залежностями та graceful shutdown."
    ],
    "sources": [
      {
        "title": "Linux, Docker та конфігурація — документація",
        "url": "https://docs.docker.com/get-started/docker-concepts/the-basics/what-is-a-container/"
      }
    ],
    "quiz": {
      "kind": "choice",
      "question": "Що робить EXPOSE 3000?",
      "options": [
        "Публікує порт на host",
        "Документує порт образу",
        "Відкриває firewall"
      ],
      "answer": 1,
      "explanation": "Для host mapping потрібен -p або ports у Compose."
    },
    "lab": {
      "language": "js",
      "starter": "export function readConfig(env){return {port:Number(env.PORT),environment:env.NODE_ENV};}",
      "solution": "export function readConfig(env){\n const raw=env.PORT===undefined?'3000':env.PORT;\n const environment=env.NODE_ENV===undefined?'development':env.NODE_ENV;\n if(typeof raw!=='string'||!/^\\d+$/.test(raw)||!['development','test','production'].includes(environment))throw new Error('invalid_config');\n const port=Number(raw);if(!Number.isInteger(port)||port<1||port>65535)throw new Error('invalid_config');\n return {port,environment};\n}",
      "tests": "test('configuration defaults and boundaries',()=>{\n assert.deepEqual(subject.readConfig({}),{port:3000,environment:'development'});\n assert.deepEqual(subject.readConfig({PORT:'65535',NODE_ENV:'production'}),{port:65535,environment:'production'});\n assert.equal(subject.readConfig({PORT:'1'}).port,1);\n for(const PORT of ['','0','65536','3.5','1e3',' 3000 ',null])assert.throws(()=>subject.readConfig({PORT}),/invalid_config/);\n assert.throws(()=>subject.readConfig({NODE_ENV:'prod'}),/invalid_config/);\n});",
      "files": {
        "Dockerfile": "FROM node:24-alpine\nWORKDIR /app\nCOPY exercise.mjs server.mjs ./\nENV NODE_ENV=production\nEXPOSE 3000\nUSER node\nHEALTHCHECK --interval=10s --timeout=3s CMD node -e \"fetch('http://127.0.0.1:3000/healthz').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))\"\nCMD [\"node\",\"server.mjs\"]\n",
        "docker-compose.yml": "services:\n  api:\n    build: .\n    ports:\n      - \"3000:3000\"\n    environment:\n      PORT: \"3000\"\n      NODE_ENV: production\n      DATABASE_URL: postgres://app:secret@postgres:5432/app\n      REDIS_URL: redis://redis:6379\n    depends_on:\n      postgres:\n        condition: service_healthy\n      redis:\n        condition: service_healthy\n  postgres:\n    image: postgres:17-alpine\n    environment:\n      POSTGRES_USER: app\n      POSTGRES_PASSWORD: secret\n      POSTGRES_DB: app\n    volumes:\n      - pg_data:/var/lib/postgresql/data\n    healthcheck:\n      test: [\"CMD-SHELL\", \"pg_isready -U app -d app\"]\n      interval: 5s\n      timeout: 3s\n      retries: 5\n  redis:\n    image: redis:7-alpine\n    healthcheck:\n      test: [\"CMD\", \"redis-cli\", \"ping\"]\n      interval: 5s\n      timeout: 3s\n      retries: 5\nvolumes:\n  pg_data:\n",
        ".github/workflows/ci.yml": "name: CI\non:\n  push:\n    branches: [main]\n  pull_request:\njobs:\n  verify:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - uses: actions/setup-node@v4\n        with:\n          node-version: 24\n          cache: npm\n      - run: npm ci\n      - run: npm test\n      - run: docker build -t app-ci .\n",
        "server.mjs": "import { createServer } from 'node:http';\nimport { randomUUID } from 'node:crypto';\nimport { readConfig } from './exercise.mjs';\nconst config = readConfig(process.env);\nconst server = createServer((req, res) => {\n  const requestId = req.headers['x-request-id'] || randomUUID();\n  res.setHeader('content-type', 'application/json');\n  res.setHeader('x-request-id', String(requestId));\n  if (req.url === '/healthz') {\n    res.end(JSON.stringify({ status: 'ok' }));\n  } else {\n    res.statusCode = 404;\n    res.end(JSON.stringify({ error: 'not_found' }));\n  }\n  console.log(JSON.stringify({ level: 'info', ts: new Date().toISOString(), requestId, method: req.method, url: req.url, status: res.statusCode }));\n});\nserver.listen(config.port, '0.0.0.0');\nprocess.on('SIGTERM', () => { server.close(() => process.exit(0)); setTimeout(() => process.exit(1), 10000).unref(); });\n",
        ".dockerignore": "node_modules\n.git\n*.log\n"
      },
      "instructions": "Після npm test: docker build -t backend-config-lab . ; docker run --rm --name backend-config-lab -p 3000:3000 backend-config-lab . Readiness: запити GET http://127.0.0.1:3000/healthz мають повернути 200; docker inspect --format \"{{.State.Health.Status}}\" backend-config-lab показує healthy після health interval. Cleanup: docker stop backend-config-lab. Docker потрібен лише для контейнерної частини."
    }
  },
{
  "id": "career-delivery",
  "moduleId": "career",
  "title": "Доставка зміни: README, PR і рев’ю",
  "summary": "Команда має зрозуміти проблему, перевірити рішення і відтворити запуск.",
  "lectureMinutes": 15,
  "practiceMinutes": 45,
  "goals": [
    "Описати зміну через поведінку та доказ.",
    "Зібрати перевірки перед передачею коду.",
    "Знайти ризики в коді помічника за тестами та контрактом."
  ],
  "task": "Реалізуй redactLog(event): рекурсивно прибери password, token, secret з об’єктів і масивів, збережи кореляційні поля й не змінюй ввід.",
  "steps": [
    "Визнач список чутливих ключів без залежності від регістру.",
    "Рекурсивно скопіюй структуру з очищеними значеннями.",
    "Додай README з прикладом безпечного лога й тести."
  ],
  "hints": [
    "Почни з Array.isArray та перевірки простого об’єкта.",
    "Ключ порівнюй у нижньому регістрі.",
    "Створи новий об’єкт замість зміни оригіналу."
  ],
  "criteria": [
    "Вкладені секрети й масиви очищуються.",
    "Кореляційні поля залишаються.",
    "Початковий об’єкт не змінюється."
  ],
  "mistakes": [
    "Очищати лише верхній рівень.",
    "Логувати весь HTTP body при авторизації."
  ],
  "reviewQuestions": [
    "Що має бути в описі PR?",
    "Як перевірити чужий або AI-згенерований код?"
  ],
  "extensions": [
    "Напиши README для власного API з командою чистого запуску та сценарієм відмови бази.",
    "Проведи рев’ю навчальної зміни: спочатку знайди проблему без тесту, потім доведи її регресійним тестом."
  ],
  "sources": [
    {
      "title": "OWASP: Logging cheat sheet",
      "url": "https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html"
    },
    {
      "title": "GitHub: About pull requests",
      "url": "https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/about-pull-requests"
    }
  ],
  "quiz": {
    "kind": "choice",
    "question": "Що підтверджує, що виправлення справді усунуло баг?",
    "options": [
      "Лише опис зміни",
      "Тест, який падає на старій поведінці й проходить після виправлення",
      "Кількість змінених файлів"
    ],
    "answer": 1,
    "explanation": "Регресійний тест зв’язує проблему з вимірюваною новою поведінкою."
  },
  "lab": {
    "language": "js",
    "starter": "export function redactLog(event){throw new Error('Реалізуй очищення');}\n",
    "solution": "export function redactLog(event){const sensitive=/^(password|token|secret)$/i;function clean(value){if(Array.isArray(value))return value.map(clean);if(value&&typeof value==='object'){const out={};for(const [key,item] of Object.entries(value))out[key]=sensitive.test(key)?'[REDACTED]':clean(item);return out;}return value;}return clean(event);}\n",
    "tests": "test('nested redaction without mutation',()=>{const input={requestId:'r1',user:{password:'p',name:'A'},items:[{Token:'t'}],secret:'s'};const original=JSON.stringify(input);assert.deepEqual(subject.redactLog(input),{requestId:'r1',user:{password:'[REDACTED]',name:'A'},items:[{Token:'[REDACTED]'}],secret:'[REDACTED]'});assert.equal(JSON.stringify(input),original);assert.equal(subject.redactLog(null),null);});"
  }
},
{
  "id": "career-capstone",
  "moduleId": "career",
  "title": "Фінальна робота: захист бронювання",
  "summary": "З’єднай контракт, транзакції, доступ, тести та зрозумілий технічний захист.",
  "lectureMinutes": 15,
  "practiceMinutes": 45,
  "goals": [
    "Захистити інваріант бронювання під час повтору.",
    "Відмовити без належного доступу.",
    "Пояснити тести, межі й шлях розгортання."
  ],
  "task": "Реалізуй book(userId,slotId,key,store): транзакційно перевір повтор за ключем, резервуй вільний слот і зберігай результат. Різний slot для того самого ключа — conflict.",
  "steps": [
    "Валідовуй userId, slotId та key до транзакції.",
    "У tx перевір існуючий запит; поверни його для точного повтору.",
    "Резервуй слот і запиши результат до завершення tx."
  ],
  "hints": [
    "Стабільний idempotency key представляє одну логічну спробу.",
    "Метод tx.reserve має бути атомарним у реальному сховищі.",
    "Дані повтору порівняй до повернення існуючого бронювання."
  ],
  "criteria": [
    "Повтор того самого запиту не створює друге бронювання.",
    "Зайнятий слот і конфлікт ключа відхиляються.",
    "Транзакційний порт застосовується до всіх операцій."
  ],
  "mistakes": [
    "Робити check-then-write поза транзакцією.",
    "Вважати Map у процесі захистом між інстансами."
  ],
  "reviewQuestions": [
    "Який інваріант захищає база?",
    "Що поверне сервер після повторної доставки?"
  ],
  "extensions": [
    "Реалізуй PostgreSQL-адаптер з unique(slot_id), unique(user_id,key) і конкурентними інтеграційними тестами.",
    "Додай NestJS HTTP-шар, власність ресурсу, OpenAPI, Docker Compose, CI, README і технічний захист."
  ],
  "sources": [
    {
      "title": "PostgreSQL: Transaction isolation",
      "url": "https://www.postgresql.org/docs/current/transaction-iso.html"
    },
    {
      "title": "Node-postgres: Transactions",
      "url": "https://node-postgres.com/features/transactions"
    },
    {
      "title": "NestJS documentation",
      "url": "https://docs.nestjs.com/"
    }
  ],
  "quiz": {
    "kind": "choice",
    "question": "Що захищає від двох успішних конкурентних бронювань одного слота?",
    "options": [
      "Перевірка в Map процесу",
      "Транзакція та constraint у базі",
      "Вимкнена кнопка в React"
    ],
    "answer": 1,
    "explanation": "Інваріант треба забезпечити там, де одночасні запити змінюють спільні дані — у базі."
  },
  "lab": {
    "language": "js",
    "starter": "export async function book(userId,slotId,key,store){throw new Error('Реалізуй бронювання');}\n",
    "solution": "export async function book(userId,slotId,key,store){if(![userId,slotId,key].every(x=>typeof x==='string'&&x.trim()))throw new Error('invalid_request');return store.transaction(async tx=>{const prior=await tx.findRequest(userId,key);if(prior){if(prior.slotId!==slotId)throw new Error('idempotency_conflict');return prior;}const saved=await tx.reserve(slotId,userId);if(!saved)throw new Error('slot_taken');const booking={id:slotId+':'+userId,userId,slotId};await tx.saveRequest(userId,key,booking);return booking;});}\n",
    "tests": "test('idempotent booking, slot conflict and validation',async()=>{let reservations=new Map(),requests=new Map(),calls=0;const store={async transaction(fn){calls++;const slots=new Map(reservations),reqs=new Map(requests);const result=await fn({findRequest:async(u,k)=>reqs.get(u+':'+k),reserve:async(s,u)=>{if(slots.has(s))return false;slots.set(s,u);return true;},saveRequest:async(u,k,b)=>reqs.set(u+':'+k,b)});reservations=slots;requests=reqs;return result;}};const first=await subject.book('a','slot1','k1',store);assert.deepEqual(first,{id:'slot1:a',userId:'a',slotId:'slot1'});assert.deepEqual(await subject.book('a','slot1','k1',store),first);await assert.rejects(()=>subject.book('b','slot1','k2',store),/slot_taken/);await assert.rejects(()=>subject.book('a','slot2','k1',store),/idempotency_conflict/);const before=calls;await assert.rejects(()=>subject.book('','slot2','k2',store),/invalid_request/);assert.equal(calls,before);});"
  }
}
];
