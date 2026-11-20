// =================================================================
// IT & SOFTWARE ENGINEERING CODE REVIEW SPEAKING SCENARIOS
// Practical developer exercises: code explanations, PR diffs, architecture, and bug triage in English
// =================================================================

window.IT_CODE_SCENARIOS = [
  {
    "id": "code_001",
    "title": "Fix N+1 Query Bottleneck in User Dashboard",
    "category": "backend_db",
    "categoryName": "🗄️ Backend & Database",
    "context": "PR #142: You noticed that loading the admin dashboard fired over 200 SQL queries. Explain to your tech lead why you refactored this loop.",
    "language": "javascript",
    "beforeCode": "// ❌ BEFORE: N+1 query problem (200+ DB roundtrips)\nasync function getUsersWithOrders() {\n  const users = await db.query('SELECT * FROM users LIMIT 50');\n  \n  for (const user of users) {\n    // Firing a separate query for EVERY user inside the loop!\n    user.orders = await db.query(\n      'SELECT * FROM orders WHERE user_id = $1', \n      [user.id]\n    );\n  }\n  return users;\n}",
    "afterCode": "// ✅ AFTER: Single batch query with in-memory mapping (2 DB roundtrips)\nasync function getUsersWithOrders() {\n  const users = await db.query('SELECT * FROM users LIMIT 50');\n  const userIds = users.map(u => u.id);\n  \n  // Single batch fetch using WHERE IN\n  const allOrders = await db.query(\n    'SELECT * FROM orders WHERE user_id = ANY($1)', \n    [userIds]\n  );\n  \n  const ordersByUser = groupOrdersByUserId(allOrders);\n  return users.map(user => ({\n    ...user,\n    orders: ordersByUser[user.id] || []\n  }));\n}",
    "problemExplanation": "Fetching orders inside a loop triggers the classic N+1 query problem, creating massive network overhead and saturating DB connection pool.",
    "solutionExplanation": "Batch-fetching all related orders in a single SQL query using an array/IN clause and mapping them in-memory drops response time from 1.5s to 35ms.",
    "keyTerms": [
      {
        "en": "N+1 query problem",
        "ukr": "проблема N+1 запитів"
      },
      {
        "en": "database roundtrip",
        "ukr": "мережевий цикл звернення до БД"
      },
      {
        "en": "batch fetch",
        "ukr": "пакетна вибірка даних"
      },
      {
        "en": "in-memory mapping",
        "ukr": "зіставлення в оперативній пам'яті"
      },
      {
        "en": "connection pool exhaustion",
        "ukr": "виснаження пулу з'єднань БД"
      }
    ],
    "prepHint": "PREP: 1. State the problem (N+1 query bottleneck). 2. Explain the root cause (looping over queries). 3. Detail the fix (WHERE IN batching). 4. Highlight the outcome (latency dropped from 1.5s to 35ms).",
    "keywords": [
      "n+1",
      "query",
      "queries",
      "batch",
      "database",
      "roundtrip",
      "latency",
      "loop",
      "refactor",
      "overhead",
      "orders",
      "users"
    ],
    "deepDive": {
      "mechanics": "Every individual database query requires a separate TCP network roundtrip, including protocol serialization, SQL parsing, execution, and result transport. When executed sequentially inside a loop over 200 users, the application initiates 201 distinct network requests. This monopolizes database connection pool workers and introduces massive latency (~1.5s). Refactoring extracts all target user IDs into an array and fires a single batch query with an SQL WHERE IN / ANY($1) clause, subsequently reconstructing associations in memory via an O(1) hash map.",
      "interviewSignals": "Interviewers evaluate: 1) Awareness of the network latency penalty per database roundtrip; 2) Understanding of database connection pool saturation; 3) Algorithmic optimization from O(N) database roundtrips to O(1) coupled with in-memory hash map grouping.",
      "sampleAnswer": "In the legacy implementation, we were hitting a critical bottleneck caused by the N+1 query problem. Iterating over records sequentially fired over 200 separate database roundtrips, saturating our connection pool and spiking latency up to 1.5 seconds. To resolve this, I refactored the logic to extract all user IDs and execute a single batch query using an SQL WHERE IN clause. We then mapped the returned orders in memory using a hash map. Consequently, this eliminated the network overhead, reduced database load by 98%, and dropped response times down to 35 milliseconds."
    }
  },
  {
    "id": "code_002",
    "title": "Prevent Double-Spending with Atomic Transaction & Row Locking",
    "category": "fintech_concurrency",
    "categoryName": "💳 Concurrency & FinTech",
    "context": "Incident #89: Two simultaneous withdraw requests allowed a user's wallet to go negative. Explain why you introduced atomic transactions and row-level locking.",
    "language": "javascript",
    "beforeCode": "// ❌ BEFORE: Vulnerable to race conditions (non-atomic check-then-act)\nasync function withdraw(userId, amount) {\n  const account = await db.getAccount(userId);\n  \n  // If 2 requests arrive concurrently, both pass this check!\n  if (account.balance >= amount) {\n    const newBalance = account.balance - amount;\n    await db.updateBalance(userId, newBalance);\n    return { success: true };\n  }\n  throw new Error('Insufficient funds');\n}",
    "afterCode": "// ✅ AFTER: Atomic transaction with row-level locking (SELECT FOR UPDATE)\nasync function withdraw(userId, amount) {\n  return await db.transaction(async (trx) => {\n    // Lock the account row until transaction commits\n    const account = await trx('accounts')\n      .where({ id: userId })\n      .forUpdate()\n      .first();\n\n    if (account.balance < amount) {\n      throw new Error('Insufficient funds');\n    }\n\n    await trx('accounts')\n      .where({ id: userId })\n      .decrement('balance', amount);\n      \n    return { success: true };\n  });\n}",
    "problemExplanation": "A classic check-then-act race condition allowed concurrent requests to interleave and overdraft the account.",
    "solutionExplanation": "Wrapping the check and update inside an ACID transaction with pessimistic row-level locking (FOR UPDATE) guarantees serial execution and balance integrity.",
    "keyTerms": [
      {
        "en": "race condition",
        "ukr": "стан гонитви (конфлікт паралельності)"
      },
      {
        "en": "atomic transaction",
        "ukr": "атомарна транзакція"
      },
      {
        "en": "row-level locking",
        "ukr": "блокування на рівні рядка"
      },
      {
        "en": "pessimistic lock",
        "ukr": "песимістичне блокування"
      },
      {
        "en": "data integrity",
        "ukr": "цілісність даних"
      }
    ],
    "prepHint": "PREP: 1. Identify the race condition during concurrent withdrawals. 2. Explain why checking balance outside a transaction fails. 3. Detail the 'forUpdate' lock. 4. Emphasize financial data consistency.",
    "keywords": [
      "race condition",
      "atomic",
      "transaction",
      "lock",
      "locking",
      "balance",
      "concurrent",
      "concurrency",
      "integrity",
      "withdraw",
      "overdraft"
    ],
    "deepDive": {
      "mechanics": "This is a classic Time-of-Check to Time-of-Use (TOCTOU) race condition. When a user submits two concurrent withdrawal requests for $100 against a $100 balance, both requests read the initial balance concurrently, both pass the sufficiency check (balance >= 100), and both commit debit mutations, leaving the balance at -$100 (double spending). Applying SELECT FOR UPDATE acquires an exclusive row-level lock within an ACID transaction. The secondary transaction is forced to wait in queue until the first commits, whereupon it observes the updated zero balance and aborts cleanly.",
      "interviewSignals": "Key evaluation criteria: Understanding transaction isolation levels, identifying non-atomic read-modify-write cycles (TOCTOU), utilizing pessimistic row-level locking (SELECT FOR UPDATE), and enforcing financial domain invariants.",
      "sampleAnswer": "We encountered a critical double-spending vulnerability caused by a race condition during concurrent withdrawals. Because the balance check and balance mutation were not atomic, two concurrent requests read the same initial balance simultaneously, bypassing the funds check. To resolve this, I wrapped the withdrawal workflow in an ACID transaction and applied pessimistic row-level locking via SELECT FOR UPDATE. This enforces serial execution on the target account, preventing overdrafts and guaranteeing financial data integrity."
    }
  },
  {
    "id": "code_003",
    "title": "Fix Dangling Event Listener & Memory Leak in React Component",
    "category": "frontend_react",
    "categoryName": "⚛️ Frontend & React",
    "context": "PR #205: Users reported the single-page application getting slower over time. Explain why missing clean-up in useEffect caused memory leaks.",
    "language": "javascript",
    "beforeCode": "// ❌ BEFORE: Missing cleanup function on unmount\nfunction PriceTracker({ symbol }) {\n  const [price, setPrice] = useState(null);\n\n  useEffect(() => {\n    // Subscribing to socket stream\n    webSocketService.subscribe(symbol, (newPrice) => {\n      setPrice(newPrice);\n    });\n    // Missing return cleanup! Listener remains in memory forever!\n  }, [symbol]);\n\n  return <div>{symbol}: {price}</div>;\n}",
    "afterCode": "// ✅ AFTER: Cleanup callback properly detaches listener\nfunction PriceTracker({ symbol }) {\n  const [price, setPrice] = useState(null);\n\n  useEffect(() => {\n    const handlePriceUpdate = (newPrice) => setPrice(newPrice);\n    \n    webSocketService.subscribe(symbol, handlePriceUpdate);\n\n    // Clean-up callback executed on unmount or symbol change\n    return () => {\n      webSocketService.unsubscribe(symbol, handlePriceUpdate);\n    };\n  }, [symbol]);\n\n  return <div>{symbol}: {price}</div>;\n}",
    "problemExplanation": "Every time the component re-rendered or unmounted, old WebSocket listeners stayed subscribed, leaking memory and updating state on unmounted components.",
    "solutionExplanation": "Returning a cleanup function ensures the previous event listener is deregistered before a new one is attached or when the component unmounts.",
    "keyTerms": [
      {
        "en": "memory leak",
        "ukr": "витік оперативної пам'яті"
      },
      {
        "en": "dangling listener",
        "ukr": "завислий обробник подій"
      },
      {
        "en": "cleanup function",
        "ukr": "функція очищення (деструктор)"
      },
      {
        "en": "component unmount",
        "ukr": "розмонтування компонента"
      },
      {
        "en": "garbage collection",
        "ukr": "збирання сміття пам'яті"
      }
    ],
    "prepHint": "PREP: 1. Explain the symptom (browser tab slowing down). 2. Explain the bug (accumulating listeners in heap memory). 3. Describe the fix (unsubscribe in return callback). 4. Highlight healthy memory usage.",
    "keywords": [
      "memory leak",
      "listener",
      "cleanup",
      "unmount",
      "useeffect",
      "websocket",
      "subscribe",
      "unsubscribe",
      "garbage",
      "react"
    ],
    "deepDive": {
      "mechanics": "When a component mounts, window.addEventListener registers a callback reference on the global window object. If the component unmounts without an explicit cleanup function returned from useEffect, the global window continues to retain a strong reference to the callback and its lexical closure (including props and state). The V8 Mark-and-Sweep Garbage Collector cannot deallocate these retained objects, causing progressive heap memory growth, eventual browser tab sluggishness, and crashes.",
      "interviewSignals": "Senior checkboxes: Mastery of the useEffect lifecycle, understanding closures and strong reference chains, how the V8 Garbage Collector identifies unreachable objects, and why global listeners cause single-page application (SPA) memory leaks.",
      "sampleAnswer": "We identified a severe memory leak in our dashboard caused by dangling event listeners in a React component. Each time the component mounted, it attached a global resize listener to the window object without returning a cleanup function in the useEffect hook. Because window held strong references to the closure, the garbage collector could not deallocate the unmounted components, causing continuous heap memory growth. To fix this, I added an explicit cleanup callback with window.removeEventListener, allowing V8 to safely reclaim memory."
    }
  },
  {
    "id": "code_004",
    "title": "Debounce Search Input & Cancel Stale HTTP Requests",
    "category": "frontend_perf",
    "categoryName": "🌐 Frontend & Networking",
    "context": "PR #318: Typing 'javascript' in search triggered 10 rapid HTTP requests, causing out-of-order race conditions. Explain your solution.",
    "language": "javascript",
    "beforeCode": "// ❌ BEFORE: Firing fetch on every single keystroke\nfunction onSearchInputChange(e) {\n  const query = e.target.value;\n  // If user types 10 letters rapidly, 10 HTTP requests fly out!\n  // Slower earlier requests can overwrite newer faster requests!\n  fetch('/api/search?q=' + query)\n    .then(res => res.json())\n    .then(data => renderResults(data));\n}",
    "afterCode": "// ✅ AFTER: Debounce delay + AbortController cancellation\nlet debounceTimer = null;\nlet currentAbortController = null;\n\nfunction onSearchInputChange(e) {\n  const query = e.target.value.trim();\n  \n  clearTimeout(debounceTimer);\n  if (currentAbortController) {\n    currentAbortController.abort(); // Cancel previous in-flight request\n  }\n\n  debounceTimer = setTimeout(async () => {\n    if (!query) return renderResults([]);\n    currentAbortController = new AbortController();\n    \n    try {\n      const res = await fetch('/api/search?q=' + query, {\n        signal: currentAbortController.signal\n      });\n      const data = await res.json();\n      renderResults(data);\n    } catch (err) {\n      if (err.name !== 'AbortError') console.error(err);\n    }\n  }, 300); // 300ms pause before firing\n}",
    "problemExplanation": "Firing an API request per keystroke causes severe backend load and race conditions where older requests overwrite newer search results.",
    "solutionExplanation": "Combining a 300ms debounce timer with AbortController cancels stale in-flight requests and only queries the server when the user pauses typing.",
    "keyTerms": [
      {
        "en": "debouncing",
        "ukr": "дебаунсинг (затримка виконання до паузи)"
      },
      {
        "en": "in-flight request",
        "ukr": "запит, що наразі виконується в мережі"
      },
      {
        "en": "AbortController",
        "ukr": "механізм примусового скасування запиту"
      },
      {
        "en": "stale response",
        "ukr": "застаріла відповідь сервера"
      },
      {
        "en": "keystroke throttling",
        "ukr": "обмеження частоти натискань"
      }
    ],
    "prepHint": "PREP: 1. State why keystroke spamming breaks UX and backend. 2. Explain how debouncing delays execution. 3. Explain AbortController signal for cancellation. 4. Summarize bandwidth and consistency gains.",
    "keywords": [
      "debounce",
      "debouncing",
      "abortcontroller",
      "keystroke",
      "stale",
      "cancel",
      "search",
      "network",
      "race condition",
      "in-flight"
    ],
    "deepDive": {
      "mechanics": "Each user keystroke in an autocomplete field fires an input event. Typing 'javascript' in one second triggers 10 simultaneous HTTP requests. This produces two critical issues: 1) Backend API flooding; 2) Out-of-order network response race conditions, where a delayed response for 'j' arrives after 'javascript' and overwrites the UI with stale data. Debouncing delays the API trigger by 300ms until typing pauses, while AbortController actively cancels in-flight HTTP requests via an AbortSignal when a new query begins.",
      "interviewSignals": "Key signals: Differentiating debounce from throttle, preventing asynchronous response race conditions in search interfaces, and leveraging native browser standards like AbortController and AbortSignal.",
      "sampleAnswer": "The search autocomplete input was degrading backend performance by triggering an API call on every single keystroke. Furthermore, it introduced a race condition where stale HTTP responses could arrive out of order and overwrite the final search results. To fix this, I applied a 300-millisecond debounce function to buffer typing bursts, coupled with an AbortController to cancel in-flight requests when a new search query begins. This slashed network traffic by 85% and guaranteed that the UI only renders fresh, synchronized data."
    }
  },
  {
    "id": "code_005",
    "title": "Async Waterfall vs Parallel Execution with Promise.all",
    "category": "backend_perf",
    "categoryName": "⚡ Performance & Async",
    "context": "PR #88: The user profile endpoint had an 800ms latency. Explain how you eliminated sequential blocking calls.",
    "language": "javascript",
    "beforeCode": "// ❌ BEFORE: Sequential async waterfall (calls wait for each other)\nasync function getFullUserProfile(userId) {\n  // Each call takes ~250ms sequentially -> Total: 750ms!\n  const profile = await fetchProfile(userId);\n  const settings = await fetchSettings(userId);\n  const permissions = await fetchPermissions(userId);\n\n  return { profile, settings, permissions };\n}",
    "afterCode": "// ✅ AFTER: Parallel execution via Promise.all\nasync function getFullUserProfile(userId) {\n  // All 3 independent I/O calls execute concurrently in parallel!\n  // Total execution time equals the single slowest call (~260ms)!\n  const [profile, settings, permissions] = await Promise.all([\n    fetchProfile(userId),\n    fetchSettings(userId),\n    fetchPermissions(userId)\n  ]);\n\n  return { profile, settings, permissions };\n}",
    "problemExplanation": "Independent I/O operations were being awaited sequentially, causing an async waterfall and unnecessarily tripling total response latency.",
    "solutionExplanation": "Using Promise.all triggers all three requests concurrently, dropping wall-clock execution time to match only the single longest request.",
    "keyTerms": [
      {
        "en": "async waterfall",
        "ukr": "послідовний асинхронний водоспад"
      },
      {
        "en": "concurrent execution",
        "ukr": "паралельне / одночасне виконання"
      },
      {
        "en": "Promise.all",
        "ukr": "паралельне очікування промісів"
      },
      {
        "en": "I/O bound latency",
        "ukr": "затримка, обмежена швидкістю вводу-виводу"
      },
      {
        "en": "wall-clock time",
        "ukr": "фактичний астрономічний час виконання"
      }
    ],
    "prepHint": "PREP: 1. Point out the sequential bottleneck. 2. Explain that the requests are completely independent of each other. 3. Show how Promise.all executes them concurrently. 4. State the 3x latency reduction.",
    "keywords": [
      "promise.all",
      "waterfall",
      "sequential",
      "concurrent",
      "parallel",
      "latency",
      "async",
      "await",
      "independent",
      "io"
    ],
    "deepDive": {
      "mechanics": "Sequentially awaiting independent asynchronous operations produces an 'Async Waterfall', where each I/O call blocks until the prior one finishes. If profile lookup takes 300ms, orders 400ms, and notifications 300ms, cumulative latency reaches 1000ms. Because these datasets share no dependencies, they can execute concurrently via Promise.all. Total endpoint duration shrinks to the duration of the single slowest operation: max(300, 400, 300) = 400ms, yielding an immediate 2.5x speedup.",
      "interviewSignals": "Evaluators look for: Thorough grasp of the Node.js Event Loop and non-blocking I/O, parallelizing independent promises vs sequential awaits, and knowing error-handling trade-offs between Promise.all and Promise.allSettled.",
      "sampleAnswer": "In the legacy aggregation endpoint, we were suffering from an async waterfall bottleneck. By sequentially awaiting independent database calls for user profiles, orders, and notifications, the total response time was the cumulative sum of all queries, taking over one second. Because these datasets have no interdependencies, I refactored the method to fetch them concurrently using Promise.all. Consequently, latency dropped to the duration of the single slowest query, reducing total endpoint turnaround from one second down to 380 milliseconds."
    }
  },
  {
    "id": "code_006",
    "title": "Eliminate Hardcoded Secrets via Environment Variables & Validation",
    "category": "security_devops",
    "categoryName": "🛡️ Security & DevOps",
    "context": "Security Audit #41: API keys and database credentials were found in plain text in the repo. Explain your remediation PR.",
    "language": "javascript",
    "beforeCode": "// ❌ BEFORE: Hardcoded sensitive credentials in version control\nconst stripe = new Stripe('sk_live_9481239847192837192837');\nconst db = new Database({\n  host: 'db.production.internal',\n  user: 'admin',\n  password: 'SuperSecretProductionPassword2026!'\n});",
    "afterCode": "// ✅ AFTER: Loaded from environment variables with runtime validation\nimport { z } from 'zod';\n\nconst envSchema = z.object({\n  STRIPE_SECRET_KEY: z.string().startsWith('sk_'),\n  DB_HOST: z.string(),\n  DB_USER: z.string(),\n  DB_PASSWORD: z.string().min(16)\n});\n\n// Fail-fast on app startup if any secret is missing or malformed\nconst env = envSchema.parse(process.env);\n\nconst stripe = new Stripe(env.STRIPE_SECRET_KEY);\nconst db = new Database({\n  host: env.DB_HOST,\n  user: env.DB_USER,\n  password: env.DB_PASSWORD\n});",
    "problemExplanation": "Hardcoding credentials into source code poses severe security risks, makes secret rotation impossible, and leaks keys via git history.",
    "solutionExplanation": "Extracting secrets into environment variables combined with strict schema validation (Zod) ensures the app fails fast at boot if credentials are missing.",
    "keyTerms": [
      {
        "en": "hardcoded credentials",
        "ukr": "захардкоджені паролі/ключі"
      },
      {
        "en": "fail-fast validation",
        "ukr": "ранній збій при запуску при некоректній конфігурації"
      },
      {
        "en": "environment variables",
        "ukr": "змінні оточення"
      },
      {
        "en": "secret rotation",
        "ukr": "ротація (планова заміна) секретних ключів"
      },
      {
        "en": "zero-trust security",
        "ukr": "безпека за принципом нульової довіри"
      }
    ],
    "prepHint": "PREP: 1. State the vulnerability of committed keys. 2. Explain how process.env externalizes config. 3. Detail the fail-fast validation schema. 4. Emphasize security compliance and painless secret rotation.",
    "keywords": [
      "secrets",
      "credentials",
      "hardcoded",
      "environment",
      "env",
      "security",
      "zod",
      "validation",
      "fail-fast",
      "rotation"
    ],
    "deepDive": {
      "mechanics": "Hardcoding API secrets directly in source code is a critical vulnerability (CWE-798: Use of Hard-coded Credentials), vulnerable to git history leaks and scraper bots. Furthermore, missing environment variables can cause silent failures that surface unexpectedly at runtime. Zod implements a Fail-Fast pattern: it validates process.env during application boot. If any required credential is missing or malformed, the process immediately crashes with a descriptive schema error during build or startup, preventing broken deployments.",
      "interviewSignals": "Key signals: Adherence to Twelve-Factor App principles (strict separation of config from code), applying Fail-Fast initialization, secret lifecycle management (KMS / secret managers), and runtime schema validation.",
      "sampleAnswer": "Hardcoding third-party API credentials directly into source files presented a critical security vulnerability and violated twelve-factor application principles. Additionally, missing environment variables caused runtime crashes long after deployment. To fix this, I extracted all credentials into environment variables and introduced strict schema validation using Zod. The application now fails fast during startup if any required environment variable is missing, preventing secret leakage and securing deployment pipelines."
    }
  },
  {
    "id": "code_007",
    "title": "Replace Silent Error Swallowing with Structured Logging & Telemetry",
    "category": "observability",
    "categoryName": "📊 Reliability & Observability",
    "context": "Post-Mortem: Production payments failed silently for 4 hours because an empty catch block hid the stack trace. Explain your fix.",
    "language": "javascript",
    "beforeCode": "// ❌ BEFORE: Swallowing errors silently in empty catch block\nasync function processOrderPayment(orderId, amount) {\n  try {\n    await paymentGateway.charge(orderId, amount);\n  } catch (err) {\n    // 💀 Empty catch block! Error vanishes without any trace or metrics!\n    return null;\n  }\n}",
    "afterCode": "// ✅ AFTER: Structured JSON logging, telemetry metric, and error rethrow\nasync function processOrderPayment(orderId, amount) {\n  try {\n    const receipt = await paymentGateway.charge(orderId, amount);\n    metrics.increment('payment.success', { currency: 'USD' });\n    return receipt;\n  } catch (err) {\n    logger.error('Failed to process payment for order', {\n      orderId,\n      amount,\n      errorMessage: err.message,\n      errorCode: err.code,\n      stack: err.stack\n    });\n\n    metrics.increment('payment.failure', { reason: err.code || 'unknown' });\n    \n    // Throw custom domain error so calling controller can return 502/503\n    throw new PaymentProcessingException('Gateway transaction failed', { cause: err });\n  }\n}",
    "problemExplanation": "Empty catch blocks hide critical failures from engineers, leaving no logs, metrics, or alerts while silently leaving state corrupted.",
    "solutionExplanation": "Logging contextual metadata with stack traces, bumping telemetry counters, and propagating a typed domain exception enables instant alerting and observability.",
    "keyTerms": [
      {
        "en": "swallowed exception",
        "ukr": "проковтнута / прихована помилка"
      },
      {
        "en": "structured logging",
        "ukr": "структуроване логування (у форматі JSON)"
      },
      {
        "en": "observability & telemetry",
        "ukr": "спостережуваність та телеметрія системи"
      },
      {
        "en": "error propagation",
        "ukr": "прокидування помилки вгору за стеком"
      },
      {
        "en": "alerting threshold",
        "ukr": "поріг спрацьовування тривоги моніторингу"
      }
    ],
    "prepHint": "PREP: 1. Explain the danger of empty catch blocks. 2. Describe what happens when production fails silently. 3. Detail structured logging + metrics. 4. Explain how this restores observability for the on-call team.",
    "keywords": [
      "logging",
      "error",
      "catch",
      "swallow",
      "telemetry",
      "metrics",
      "observability",
      "exception",
      "alerting",
      "stack"
    ],
    "deepDive": {
      "mechanics": "Empty catch blocks (catch (e) {}) cause silent error swallowing. When critical failures occur (such as payment processing errors or JSON parse exceptions), the service swallows them and returns a deceptive 200 OK. Consequently, downstream workflows break, users complain, but observability dashboards in Sentry or Datadog show zero errors, making root cause debugging impossible. Structured JSON logging captures the full stack trace, contextual metadata, user IDs, and distributed trace IDs (trace_id) for centralized indexing in ELK or Grafana.",
      "interviewSignals": "Interviewers assess: System observability, understanding distributed tracing and trace_ids, the difference between unstructured console.log and structured JSON telemetry, and metrics like Mean Time to Resolution (MTTR) and SLA monitoring.",
      "sampleAnswer": "The service was silently swallowing critical exceptions with empty catch blocks, creating a severe observability blindspot where business transactions failed without generating alarms. To fix this, I replaced console logs with structured JSON telemetry via our logger. Every caught error now captures the full stack trace, contextual metadata, and a distributed trace ID, allowing our monitoring stack to trigger real-time alerts and slashing Mean Time to Resolution."
    }
  },
  {
    "id": "code_008",
    "title": "Fix SQL Injection Vulnerability with Parameterized Queries",
    "category": "cybersecurity",
    "categoryName": "🔒 Cybersecurity & SQL",
    "context": "Security Review: A search endpoint used raw string interpolation, allowing hackers to dump the database. Explain why parameterization solves this.",
    "language": "javascript",
    "beforeCode": "// ❌ BEFORE: Direct string concatenation (SQL Injection vulnerability!)\nasync function searchUsers(username) {\n  // If username = \"admin' OR '1'='1\", entire database is exposed!\n  const query = \"SELECT * FROM users WHERE username = '\" + username + \"'\";\n  return await db.query(query);\n}",
    "afterCode": "// ✅ AFTER: Parameterized / prepared statement\nasync function searchUsers(username) {\n  // Value passed separately from SQL command AST -> cannot execute as code!\n  const query = 'SELECT id, username, email FROM users WHERE username = $1';\n  return await db.query(query, [username]);\n}",
    "problemExplanation": "Concatenating unvalidated user input directly into SQL strings allows attackers to manipulate the query structure and execute arbitrary SQL commands.",
    "solutionExplanation": "Parameterized queries send the SQL command structure and parameters separately; the database treats user input strictly as literal values, never as executable SQL code.",
    "keyTerms": [
      {
        "en": "SQL injection",
        "ukr": "SQL-ін'єкція"
      },
      {
        "en": "parameterized query",
        "ukr": "параметризований запит"
      },
      {
        "en": "prepared statement",
        "ukr": "підготовлений вираз БД"
      },
      {
        "en": "input sanitization",
        "ukr": "очищення та валідація вхідних даних"
      },
      {
        "en": "arbitrary SQL execution",
        "ukr": "виконання довільних SQL команд"
      }
    ],
    "prepHint": "PREP: 1. Define SQL injection through raw concatenation. 2. Explain how an attacker injects quotes or OR clauses. 3. Explain how parameters separate code from data. 4. Mention column filtering (no SELECT *).",
    "keywords": [
      "sql injection",
      "parameterized",
      "query",
      "prepared",
      "sanitization",
      "security",
      "database",
      "vulnerability",
      "input",
      "database"
    ],
    "deepDive": {
      "mechanics": "String interpolation in SQL queries allows attackers to inject arbitrary SQL statements (e.g., ' OR '1'='1' --). The database engine compiles and executes the entire string as code. Parameterized queries (prepared statements) decouple the SQL query structure from untrusted user input. The database compiles the execution plan first and treats supplied parameters strictly as literal values, rendering SQL injection mathematically impossible regardless of payload content.",
      "interviewSignals": "Senior checkboxes: Familiarity with OWASP Top 10 (A03:2021 - Injection), understanding database query preparation and execution plans, knowing how modern ORMs handle parameter binding, and practicing defense-in-depth input validation.",
      "sampleAnswer": "The authentication endpoint was severely vulnerable to SQL injection due to raw string interpolation in the database query. An attacker could bypass authentication by injecting malicious SQL payloads. To secure this, I refactored the database call to use parameterized queries with placeholder bindings. By separating the SQL query plan from user input data, the database treats parameters strictly as literal values, completely neutralizing SQL injection risks."
    }
  },
  {
    "id": "code_009",
    "title": "Refactor Massive Switch Statement to Strategy Pattern",
    "category": "architecture_oop",
    "categoryName": "🏛️ Architecture & Clean Code",
    "context": "PR #512: The payment module had a 120-line switch statement that grew every time a new provider was added. Explain your OOP refactoring.",
    "language": "javascript",
    "beforeCode": "// ❌ BEFORE: Monster switch violating Open-Closed Principle (OCP)\nasync function executePayment(provider, amount, payload) {\n  switch (provider) {\n    case 'stripe':\n      // 30 lines of Stripe SDK calls...\n      break;\n    case 'paypal':\n      // 30 lines of PayPal OAuth & capture...\n      break;\n    case 'crypto':\n      // 40 lines of blockchain RPC calls...\n      break;\n    default:\n      throw new Error('Unsupported provider');\n  }\n}",
    "afterCode": "// ✅ AFTER: Strategy Pattern with dedicated provider classes\ninterface PaymentStrategy {\n  pay(amount: number, payload: object): Promise<Receipt>;\n}\n\nconst paymentStrategies: Record<string, PaymentStrategy> = {\n  stripe: new StripePaymentStrategy(),\n  paypal: new PaypalPaymentStrategy(),\n  crypto: new CryptoPaymentStrategy()\n};\n\nasync function executePayment(provider: string, amount: number, payload: object) {\n  const strategy = paymentStrategies[provider];\n  if (!strategy) {\n    throw new UnsupportedPaymentProviderException(provider);\n  }\n  return await strategy.pay(amount, payload);\n}",
    "problemExplanation": "A monolithic switch statement violates the Open-Closed Principle because adding a new payment vendor requires modifying the core function, risking regression bugs.",
    "solutionExplanation": "The Strategy pattern decouples provider implementations into isolated classes adhering to a shared interface, making the codebase extensible without touching existing code.",
    "keyTerms": [
      {
        "en": "Strategy Pattern",
        "ukr": "патерн 'Стратегія'"
      },
      {
        "en": "Open-Closed Principle (OCP)",
        "ukr": "принцип відкритості/закритості (SOLID)"
      },
      {
        "en": "tight coupling",
        "ukr": "жорстке / надмірне зачеплення коду"
      },
      {
        "en": "regression bug",
        "ukr": "регресійний дефект у робочому коді"
      },
      {
        "en": "extensibility",
        "ukr": "розширюваність архітектури"
      }
    ],
    "prepHint": "PREP: 1. Critique the growing switch statement. 2. Mention violation of SOLID Open-Closed Principle. 3. Describe polymorphic Strategy classes. 4. Highlight unit testability and easy onboarding of new vendors.",
    "keywords": [
      "strategy pattern",
      "switch",
      "open-closed",
      "ocp",
      "solid",
      "refactor",
      "polymorphism",
      "decouple",
      "architecture",
      "extensible"
    ],
    "deepDive": {
      "mechanics": "A monolithic switch statement or an extensive if-else ladder spanning hundreds of lines directly violates the Open/Closed Principle (SOLID): software entities should be open for extension, but closed for modification. Adding a new payment provider forces developers to modify shared legacy logic, risking cross-feature regressions and complicating unit tests. The Strategy Pattern encapsulates individual algorithms behind a unified interface registered in a lookup map, allowing new payment methods to be added without touching existing implementations.",
      "interviewSignals": "What interviewers look for: Concrete application of the Open/Closed Principle, replacing imperative switch ladders with polymorphism, unit test isolation per strategy, and design patterns that support team scalability.",
      "sampleAnswer": "Our payment processing logic was tightly coupled within a monolithic switch statement spanning hundreds of lines, directly violating the Open/Closed Principle. Adding a new payment provider required modifying shared legacy code and risked regressions. I refactored this into the Strategy Pattern, establishing an isolated strategy interface with a handler registry. New payment methods can now be plugged in independently without touching existing business logic, substantially improving maintainability and testability."
    }
  },
  {
    "id": "code_010",
    "title": "Offload High-Read Traffic with Redis Cache-Aside Pattern",
    "category": "distributed_systems",
    "categoryName": "⚡ Caching & Scalability",
    "context": "Tech Architecture RFC: Product catalog queries were crashing Postgres during Black Friday sales. Explain your caching strategy.",
    "language": "javascript",
    "beforeCode": "// ❌ BEFORE: Direct heavy database read on every HTTP request\napp.get('/api/products/:id', async (req, res) => {\n  // Complex multi-table JOIN query hitting Postgres 10,000 times/sec!\n  const product = await db.query(\n    'SELECT p.*, c.name, r.rating FROM products p JOIN categories c... WHERE p.id = $1',\n    [req.params.id]\n  );\n  res.json(product);\n});",
    "afterCode": "// ✅ AFTER: Redis Cache-Aside with 10-minute TTL & Cache Invalidation\napp.get('/api/products/:id', async (req, res) => {\n  const cacheKey = 'product:' + req.params.id;\n  \n  // 1. Check in-memory Redis cache\n  const cachedData = await redis.get(cacheKey);\n  if (cachedData) {\n    return res.json(JSON.parse(cachedData));\n  }\n\n  // 2. Cache miss -> Query DB once\n  const product = await db.query(\n    'SELECT p.*, c.name, r.rating FROM products p JOIN categories c... WHERE p.id = $1',\n    [req.params.id]\n  );\n\n  // 3. Populate Redis with 10-minute TTL (Time To Live)\n  if (product) {\n    await redis.set(cacheKey, JSON.stringify(product), 'EX', 600);\n  }\n\n  res.json(product);\n});",
    "problemExplanation": "Directly querying the relational database for static product descriptions under high concurrency exhausts connections and CPU.",
    "solutionExplanation": "The Cache-Aside pattern serves 98% of read traffic from high-speed in-memory Redis with a 10-minute TTL, shielding the database from overload.",
    "keyTerms": [
      {
        "en": "Cache-Aside pattern",
        "ukr": "патерн кешування 'Cache-Aside'"
      },
      {
        "en": "cache hit vs cache miss",
        "ukr": "попадання в кеш проти промаху кешу"
      },
      {
        "en": "TTL (Time To Live)",
        "ukr": "час життя запису в кеші"
      },
      {
        "en": "cache invalidation",
        "ukr": "інвалідація / скидання застарілого кешу"
      },
      {
        "en": "throughput scalability",
        "ukr": "масштабованість пропускної здатності"
      }
    ],
    "prepHint": "PREP: 1. State the database saturation during traffic spikes. 2. Walk through the Cache-Aside algorithm (read cache, if miss read DB, write cache). 3. Explain the TTL expiration strategy. 4. Emphasize millisecond response times.",
    "keywords": [
      "cache",
      "redis",
      "ttl",
      "cache-aside",
      "latency",
      "postgres",
      "concurrency",
      "invalidation",
      "hit",
      "miss",
      "database"
    ],
    "deepDive": {
      "mechanics": "Querying unindexed fields in tables with millions of records triggers a Sequential Full Table Scan, forcing the database engine to load data blocks from disk into memory, resulting in high latency and CPU spikes. The Cache-Aside pattern (Lazy Loading) first probes an in-memory Redis store (sub-2ms lookup). On a cache miss, the data is retrieved from PostgreSQL and saved back into Redis with an explicit Time-to-Live (TTL). The TTL ensures memory eviction and prevents stale data from persisting indefinitely.",
      "interviewSignals": "Evaluation criteria: Implementation of Cache-Aside, reading EXPLAIN ANALYZE execution plans (Seq Scan vs Index Scan), choosing appropriate TTL strategies, and configuring Redis memory eviction policies (e.g., allkeys-lru).",
      "sampleAnswer": "High read traffic on our catalog endpoint was causing database CPU spikes because every request performed a full table scan against Postgres. To optimize read throughput, I implemented the Cache-Aside pattern using Redis with a one-hour TTL. By checking memory cache before hitting the primary database, subsequent reads complete in under two milliseconds. This reduced database CPU utilization by 80% while ensuring stale cache entries naturally expire via the time-to-live configuration."
    }
  },
  {
    "id": "code_011",
    "title": "Migrate from In-Memory Array Slicing to DB Cursor Pagination",
    "category": "api_design",
    "categoryName": "📐 API Design & Performance",
    "context": "PR #633: Fetching transaction history took 3 seconds and consumed 250MB RAM on the server. Explain why you moved to cursor-based pagination.",
    "language": "javascript",
    "beforeCode": "// ❌ BEFORE: Fetching entire table into memory and slicing\napp.get('/api/transactions', async (req, res) => {\n  const page = parseInt(req.query.page) || 1;\n  const pageSize = 20;\n\n  // Loads all 100,000 records into Node.js memory just for 20 items!\n  const allRows = await db.query('SELECT * FROM transactions ORDER BY created_at DESC');\n  \n  const paged = allRows.slice((page - 1) * pageSize, page * pageSize);\n  res.json({ data: paged });\n});",
    "afterCode": "// ✅ AFTER: Database-level keyset / cursor pagination\napp.get('/api/transactions', async (req, res) => {\n  const limit = Math.min(parseInt(req.query.limit) || 20, 100);\n  const cursor = req.query.cursor; // Timestamp or ID of last seen item\n\n  const query = cursor\n    ? 'SELECT * FROM transactions WHERE created_at < $1 ORDER BY created_at DESC LIMIT $2'\n    : 'SELECT * FROM transactions ORDER BY created_at DESC LIMIT $1';\n    \n  const params = cursor ? [cursor, limit] : [limit];\n  const items = await db.query(query, params);\n\n  const nextCursor = items.length === limit ? items[items.length - 1].created_at : null;\n  res.json({ data: items, nextCursor });\n});",
    "problemExplanation": "Loading all 100,000 rows into Node.js RAM to return 20 items causes excessive memory allocation and slow response times.",
    "solutionExplanation": "Cursor-based pagination delegates filtering directly to the database indexed column, keeping payload and memory usage constant regardless of dataset size.",
    "keyTerms": [
      {
        "en": "cursor-based pagination",
        "ukr": "пагінація на основі курсора / keyset"
      },
      {
        "en": "memory footprint",
        "ukr": "обсяг використання оперативної пам'яті"
      },
      {
        "en": "heap allocation",
        "ukr": "виділення пам'яті в хіпі (купі)"
      },
      {
        "en": "index-backed query",
        "ukr": "запит, що спирається на індекс БД"
      },
      {
        "en": "O(1) memory complexity",
        "ukr": "константне споживання пам'яті O(1)"
      }
    ],
    "prepHint": "PREP: 1. Highlight the ridiculous memory waste of loading 100k rows. 2. Explain how cursor pagination queries only 'limit' items using index. 3. Explain nextCursor calculation. 4. Emphasize stable performance as data grows to millions.",
    "keywords": [
      "pagination",
      "cursor",
      "memory",
      "slice",
      "limit",
      "database",
      "index",
      "dataset",
      "heap",
      "offset"
    ],
    "deepDive": {
      "mechanics": "Executing an unconstrained SELECT query streams hundreds of thousands of rows across the network into Node.js heap memory. Slicing the array in application code (items.slice(0, 20)) triggers massive memory allocation and Garbage Collector pauses. Standard SQL OFFSET is equally inefficient at scale, as the database still scans and discards preceding rows. Cursor-based (Keyset) pagination queries records using an indexed boundary (WHERE created_at < $cursor ORDER BY created_at DESC LIMIT 20). Using B-Tree indexes, lookup executes in O(log N) with constant memory overhead.",
      "interviewSignals": "Key evaluation points: Offset pagination performance degradation vs Keyset/Cursor pagination, avoiding heap exhaustion in API gateways, understanding B-Tree index traversal, and achieving constant O(1) memory complexity.",
      "sampleAnswer": "The transaction history endpoint suffered from massive memory overhead because it retrieved the entire database table into Node.js heap memory before applying an in-memory array slice. As the table grew past one hundred thousand rows, this triggered high garbage collection pauses. I refactored this to use index-backed cursor pagination. By querying strictly for the requested batch using a timestamp cursor and a database limit, memory consumption remains constant at O(1) regardless of total records."
    }
  },
  {
    "id": "code_012",
    "title": "Enforce Idempotency in Payment Webhooks to Prevent Double Billing",
    "category": "api_reliability",
    "categoryName": "💳 Payments & Idempotency",
    "context": "Incident Post-Mortem: A payment webhook was retried 3 times by Stripe due to network timeouts, charging the customer thrice. Explain your fix.",
    "language": "javascript",
    "beforeCode": "// ❌ BEFORE: Non-idempotent webhook handler\napp.post('/webhooks/stripe', async (req, res) => {\n  const event = req.body;\n  \n  if (event.type === 'payment_intent.succeeded') {\n    // If Stripe retries this webhook, user gets credited 3 times!\n    await grantUserSubscription(event.data.object.customer);\n    await sendThankYouEmail(event.data.object.customer);\n  }\n  \n  res.sendStatus(200);\n});",
    "afterCode": "// ✅ AFTER: Idempotent handler backed by atomic Redis key check\napp.post('/webhooks/stripe', async (req, res) => {\n  const event = req.body;\n  const idempotencyKey = 'webhook_processed:' + event.id;\n\n  // Atomically set key if not exists (SET NX) with 24h expiration\n  const acquired = await redis.set(idempotencyKey, '1', 'NX', 'EX', 86400);\n  \n  if (!acquired) {\n    // Already processed or currently processing -> Acknowledge safely!\n    logger.info('Duplicate webhook detected, skipping processing', { eventId: event.id });\n    return res.status(200).json({ status: 'duplicate_ignored' });\n  }\n\n  try {\n    if (event.type === 'payment_intent.succeeded') {\n      await grantUserSubscription(event.data.object.customer);\n      await sendThankYouEmail(event.data.object.customer);\n    }\n    res.sendStatus(200);\n  } catch (err) {\n    // Release key on fatal failure to allow legitimate retry\n    await redis.del(idempotencyKey);\n    res.sendStatus(500);\n  }\n});",
    "problemExplanation": "Network retries deliver webhooks multiple times. Without idempotency, duplicate events execute business logic repeatedly, leading to financial loss.",
    "solutionExplanation": "Using an atomic Redis SET NX with the unique event ID guarantees exactly-once execution semantics and safely ignores duplicate retries.",
    "keyTerms": [
      {
        "en": "idempotency / idempotent",
        "ukr": "ідемпотентність (однаковий результат при повторі)"
      },
      {
        "en": "at-least-once delivery",
        "ukr": "гарантія доставки 'щонайменше один раз'"
      },
      {
        "en": "duplicate webhook",
        "ukr": "дублюючий вебхук"
      },
      {
        "en": "atomic SET NX",
        "ukr": "атомарне встановлення ключа лише за його відсутності"
      },
      {
        "en": "exactly-once execution",
        "ukr": "виконання суворо один раз"
      }
    ],
    "prepHint": "PREP: 1. Explain that external webhooks always use at-least-once delivery. 2. Describe the double-billing bug. 3. Explain how Redis SET NX acts as an atomic lock. 4. Summarize financial safety and peace of mind.",
    "keywords": [
      "idempotency",
      "idempotent",
      "webhook",
      "stripe",
      "duplicate",
      "redis",
      "retry",
      "set nx",
      "billing",
      "payment"
    ],
    "deepDive": {
      "mechanics": "External payment gateways (such as Stripe or PayPal) utilize at-least-once delivery guarantees. If an endpoint experiences network delays, the gateway retries the webhook multiple times. If the handler is non-idempotent, it executes business logic repeatedly (e.g., crediting user balances multiple times). To enforce idempotency, the handler leverages an atomic Redis SET key value NX EX command. Only the first arrival acquires the lock; all subsequent duplicate retries return null, are flagged as duplicates, and respond with 200 OK without re-running payment actions.",
      "interviewSignals": "Senior checkboxes: Understanding at-least-once vs exactly-once processing guarantees, the mathematical definition of idempotency, atomic distributed locking via SET NX, and protecting financial flows against double billing.",
      "sampleAnswer": "Payment webhooks from Stripe operate on at-least-once delivery guarantees. Due to intermittent network timeouts, Stripe retried webhook events, causing our non-idempotent endpoint to grant multiple subscriptions to the same customer. To enforce idempotency, I introduced an atomic Redis SET NX lock using the unique Stripe event ID. If the key already exists, the service recognizes the duplicate and acknowledges with 200 without re-executing business logic. This guarantees exactly-once processing semantics and prevents financial discrepancies."
    }
  },
  {
    "id": "code_013",
    "title": "Prevent Deadlocks in Concurrent Bank Transfers via Lock Ordering",
    "category": "transactions_concurrency",
    "categoryName": "🔒 Concurrency & Deadlocks",
    "context": "Incident Post-Mortem: High-frequency concurrent money transfers between users caused PostgreSQL deadlock exceptions ('deadlock detected - Process 4124 waits for ShareLock'). Explain how you fixed it.",
    "language": "javascript",
    "beforeCode": "// ❌ BEFORE: Lock order depends on who initiates the transfer\nasync function transferMoney(fromAccountId, toAccountId, amount) {\n  return await db.transaction(async (trx) => {\n    // If Alice sends to Bob (locks Alice, then Bob)\n    // AND Bob concurrently sends to Alice (locks Bob, then Alice)\n    // -> DEADLOCK DETECTED!\n    const from = await trx('accounts')\n      .where({ id: fromAccountId })\n      .forUpdate()\n      .first();\n      \n    const to = await trx('accounts')\n      .where({ id: toAccountId })\n      .forUpdate()\n      .first();\n\n    await trx('accounts').where({ id: fromAccountId }).decrement('balance', amount);\n    await trx('accounts').where({ id: toAccountId }).increment('balance', amount);\n  });\n}",
    "afterCode": "// ✅ AFTER: Deterministic lock ordering guarantees no circular waits\nasync function transferMoney(fromAccountId, toAccountId, amount) {\n  // Always acquire row locks in deterministic ascending ID order!\n  const [firstId, secondId] = fromAccountId < toAccountId \n    ? [fromAccountId, toAccountId] \n    : [toAccountId, fromAccountId];\n\n  return await db.transaction(async (trx) => {\n    // Both concurrent threads now attempt to lock the exact same account FIRST\n    const firstAccount = await trx('accounts').where({ id: firstId }).forUpdate().first();\n    const secondAccount = await trx('accounts').where({ id: secondId }).forUpdate().first();\n\n    const fromAccount = firstId === fromAccountId ? firstAccount : secondAccount;\n    if (fromAccount.balance < amount) {\n      throw new Error('Insufficient funds');\n    }\n\n    await trx('accounts').where({ id: fromAccountId }).decrement('balance', amount);\n    await trx('accounts').where({ id: toAccountId }).increment('balance', amount);\n  });\n}",
    "problemExplanation": "Concurrent transactions acquired row locks in arbitrary order, producing circular wait dependencies and database deadlocks.",
    "solutionExplanation": "Sorting account IDs before locking guarantees deterministic lock hierarchy, completely eliminating circular dependencies.",
    "keyTerms": [
      {
        "en": "deadlock / deadlock detected",
        "ukr": "взаємне блокування (дедлок)"
      },
      {
        "en": "lock order inversion",
        "ukr": "інверсія порядку блокувань"
      },
      {
        "en": "circular wait condition",
        "ukr": "умова циклічного очікування"
      },
      {
        "en": "deterministic locking order",
        "ukr": "детермінований порядок блокування"
      },
      {
        "en": "pessimistic row locking",
        "ukr": "песимістичне блокування рядків (FOR UPDATE)"
      }
    ],
    "prepHint": "PREP: 1. Explain the deadlock: Alice->Bob and Bob->Alice concurrently. 2. Highlight circular wait condition. 3. Show how sorting IDs enforces deterministic lock acquisition. 4. Conclude that deadlocks are mathematically impossible under strict lock ordering.",
    "keywords": [
      "deadlock",
      "lock",
      "order",
      "transfer",
      "circular",
      "concurrency",
      "transaction",
      "deterministic",
      "accounts"
    ],
    "deepDive": {
      "mechanics": "When two transactions execute concurrent transfers between identical accounts (Transaction 1: Alice -> Bob; Transaction 2: Bob -> Alice), T1 acquires an exclusive row lock on Alice and requests Bob, while T2 holds Bob and requests Alice. This establishes a circular wait condition (Coffman condition), resulting in a database deadlock (PostgreSQL error 40P01). The solution is deterministic lock ordering: sorting account IDs prior to lock acquisition ensures all transactions lock rows in an identical ascending sequence, making circular dependencies mathematically impossible.",
      "interviewSignals": "Interview signals: Explaining the 4 Coffman deadlock conditions (specifically circular wait), implementing deterministic resource acquisition order, and contrasting pessimistic locking (SELECT FOR UPDATE) with optimistic concurrency control.",
      "sampleAnswer": "In the previous implementation, high-volume concurrent transfers triggered database deadlocks due to lock order inversion. When two users simultaneously transferred funds to each other, the two transactions acquired row locks in opposite order, creating a classic circular wait condition. To eliminate this, I introduced deterministic lock ordering: we sort the account IDs so that any transaction touching those rows always acquires pessimistic locks in ascending order. Consequently, this completely prevents circular deadlocks and ensures serializability without transaction rollbacks."
    }
  },
  {
    "id": "code_014",
    "title": "Mitigate Cache Stampede (Thundering Herd) with Singleflight Mutex",
    "category": "caching_performance",
    "categoryName": "⚡ Caching & Stampede",
    "context": "Production Outage: When the homepage 'Featured Products' Redis cache expired on Black Friday, 8,000 concurrent requests all missed cache simultaneously and crushed PostgreSQL. Explain your solution.",
    "language": "javascript",
    "beforeCode": "// ❌ BEFORE: Naive cache-aside triggers Thundering Herd on TTL expiry\napp.get('/api/featured-products', async (req, res) => {\n  const cached = await redis.get('featured_products');\n  if (cached) return res.json(JSON.parse(cached));\n\n  // If 5,000 users hit this simultaneously when TTL expires,\n  // all 5,000 execute this heavy 500ms analytical query against the primary DB!\n  const products = await db.query('SELECT * FROM products WHERE is_featured = true ORDER BY sales_rank LIMIT 50');\n  \n  await redis.set('featured_products', JSON.stringify(products), 'EX', 300);\n  res.json(products);\n});",
    "afterCode": "// ✅ AFTER: Singleflight / Mutex lock deduplicates concurrent fetches\nconst singleflight = new Map(); // In-flight promise registry\n\napp.get('/api/featured-products', async (req, res) => {\n  const cacheKey = 'featured_products';\n  const cached = await redis.get(cacheKey);\n  if (cached) return res.json(JSON.parse(cached));\n\n  // If already being fetched by another worker, join its in-flight promise!\n  if (singleflight.has(cacheKey)) {\n    const products = await singleflight.get(cacheKey);\n    return res.json(products);\n  }\n\n  // First thread creates the promise and registers it\n  const fetchPromise = (async () => {\n    try {\n      const data = await db.query('SELECT * FROM products WHERE is_featured = true ORDER BY sales_rank LIMIT 50');\n      await redis.set(cacheKey, JSON.stringify(data), 'EX', 300);\n      return data;\n    } finally {\n      singleflight.delete(cacheKey); // Clean up registry\n    }\n  })();\n\n  singleflight.set(cacheKey, fetchPromise);\n  const products = await fetchPromise;\n  res.json(products);\n});",
    "problemExplanation": "When a popular cache key expires, thousands of concurrent requests all miss the cache simultaneously, bombarding the database in a thundering herd.",
    "solutionExplanation": "Singleflight mutex deduplicates concurrent calls so that only one worker queries the database while all other requests await the identical in-flight promise.",
    "keyTerms": [
      {
        "en": "cache stampede / thundering herd",
        "ukr": "навала на кеш (ефект раптової лавини запитів)"
      },
      {
        "en": "singleflight pattern",
        "ukr": "патерн singleflight (об'єднання однакових паралельних запитів)"
      },
      {
        "en": "in-flight promise",
        "ukr": "проміс, що перебуває в процесі виконання"
      },
      {
        "en": "cache miss storm",
        "ukr": "шторм промахів кешу"
      },
      {
        "en": "primary DB starvation",
        "ukr": "перевантаження (виснаження) основної бази даних"
      }
    ],
    "prepHint": "PREP: 1. Paint the picture: Black Friday, cache expires, 8,000 DB queries at once. 2. Define the 'Cache Stampede' / 'Thundering Herd' phenomenon. 3. Explain how the in-memory singleflight map collapses 8,000 queries into exactly 1. 4. Emphasize zero extra DB load on cache expiration.",
    "keywords": [
      "cache",
      "stampede",
      "thundering herd",
      "singleflight",
      "redis",
      "mutex",
      "promise",
      "database",
      "load",
      "ttl"
    ],
    "deepDive": {
      "mechanics": "Under high traffic, the moment a hot cache key reaches its Time-To-Live expiration, thousands of concurrent requests observe a cache miss simultaneously. Each thread independently executes the heavy backend query against the primary database, resulting in a Cache Stampede (Thundering Herd) that spikes database CPU to 100%. The Singleflight pattern tracks in-flight promises in an in-memory registry: only the first request queries PostgreSQL, while all concurrent callers subscribe to the identical pending promise, collapsing thousands of redundant queries into exactly one database roundtrip.",
      "interviewSignals": "Senior indicators: Identifying Cache Stampede / Thundering Herd vulnerabilities, understanding the Singleflight pattern, and discussing alternative mitigation strategies like Probabilistic Early Expiration (XFetch algorithm) or distributed mutexes.",
      "sampleAnswer": "During high-traffic spikes, the previous cache-aside implementation caused a severe cache stampede, also known as the thundering herd problem. The moment our Redis key expired, thousands of concurrent requests encountered a cache miss simultaneously and hammered PostgreSQL with analytical queries, driving CPU to 100%. To resolve this, I implemented the Singleflight pattern. By tracking active in-flight promises in an in-memory registry, only the very first request queries the database while all subsequent concurrent callers wait on that identical promise. This collapsed thousands of redundant queries into a single database roundtrip."
    }
  },
  {
    "id": "code_015",
    "title": "Prevent EMFILE Crashes by Limiting Unbounded Concurrency with p-limit",
    "category": "async_node",
    "categoryName": "⚡ Node.js & Concurrency",
    "context": "Production Bug: Bulk image resizing for 10,000 uploaded assets crashed the Node.js process with 'Error: EMFILE, too many open files'. Explain your fix.",
    "language": "javascript",
    "beforeCode": "// ❌ BEFORE: Unbounded concurrency floods OS file descriptors & network sockets\nasync function processBatchUploads(imagePaths) {\n  // If imagePaths has 10,000 items, Promise.all opens 10,000 file descriptors\n  // and 10,000 S3 upload sockets all at once!\n  // Result: OS throws EMFILE (too many open files) and Node.js crashes!\n  const results = await Promise.all(\n    imagePaths.map(async (path) => {\n      const resized = await sharp(path).resize(800).toBuffer();\n      return await s3.upload({ Key: path, Body: resized }).promise();\n    })\n  );\n  return results;\n}",
    "afterCode": "// ✅ AFTER: Bounded concurrency queue throttles active tasks (p-limit)\nimport pLimit from 'p-limit';\n\nasync function processBatchUploads(imagePaths) {\n  // Cap concurrent operations to 10 active tasks at any given moment\n  const limit = pLimit(10);\n\n  const tasks = imagePaths.map((path) => {\n    return limit(async () => {\n      const resized = await sharp(path).resize(800).toBuffer();\n      return await s3.upload({ Key: path, Body: resized }).promise();\n    });\n  });\n\n  // Executes all 10,000 items gracefully without exhausting OS file descriptors\n  return await Promise.all(tasks);\n}",
    "problemExplanation": "Calling Promise.all on huge arrays spawns thousands of simultaneous I/O operations, exhausting OS file descriptors and socket pools.",
    "solutionExplanation": "A concurrency limiter (p-limit) throttles active workers to a fixed pool size (e.g., 10), ensuring predictable resource consumption and zero EMFILE crashes.",
    "keyTerms": [
      {
        "en": "unbounded concurrency",
        "ukr": "необмежена конкурентність"
      },
      {
        "en": "EMFILE: too many open files",
        "ukr": "помилка вичерпання дескрипторів файлів ОС"
      },
      {
        "en": "concurrency throttling",
        "ukr": "дротлінг (обмеження) кількості активних операцій"
      },
      {
        "en": "resource starvation",
        "ukr": "голодування / вичерпання системних ресурсів"
      },
      {
        "en": "bounded worker queue",
        "ukr": "черга з фіксованим пулом воркерів"
      }
    ],
    "prepHint": "PREP: 1. Explain what happens when Promise.all is called on 10,000 tasks (EMFILE crash). 2. Explain file descriptors and socket limits. 3. Describe how p-limit throttles concurrency to 10 at a time. 4. Highlight zero downtime and deterministic memory usage.",
    "keywords": [
      "concurrency",
      "promise",
      "p-limit",
      "emfile",
      "throttle",
      "unbounded",
      "sharp",
      "socket",
      "files",
      "queue"
    ],
    "deepDive": {
      "mechanics": "Operating systems impose strict limits on open file descriptors and TCP sockets (ulimit -n, commonly 1024 or 4096). Passing a 10,000-item array directly into Promise.all attempts to open thousands of file handles and network sockets concurrently in a single event loop tick. The OS rejects requests with EMFILE: too many open files, crashing Node.js. A concurrency limiter (like p-limit) maintains an internal bounded queue: exactly N tasks execute simultaneously. As tasks complete, queued operations are dequeued, keeping memory and descriptor utilization strictly predictable.",
      "interviewSignals": "Interviewers look for: Understanding OS-level resource limits (file descriptors, sockets), the hazard of unbounded concurrency in Promise.all, queue-based throttling mechanisms, and ensuring deterministic system throughput.",
      "sampleAnswer": "In the legacy code, batch-processing thousands of image uploads triggered unhandled process crashes with EMFILE: too many open files. The issue was unbounded concurrency: passing a 10,000-item array directly into Promise.all attempted to open thousands of file descriptors and TCP sockets simultaneously, exceeding the operating system's ulimit threshold. To fix this, I introduced bounded concurrency using p-limit, throttling execution to 10 active tasks concurrently. This eliminated resource starvation, prevented socket exhaustion, and ensured stable throughput across our worker nodes."
    }
  },
  {
    "id": "code_016",
    "title": "Isolate Downstream Failure with the Circuit Breaker Pattern",
    "category": "distributed_systems",
    "categoryName": "🛡️ Resiliency & Microservices",
    "context": "Outage Incident: A 3rd-party logistics API began hanging for 60 seconds per call. Our microservices exhausted all worker threads waiting for timeouts and took down the entire checkout service. Explain your Circuit Breaker implementation.",
    "language": "javascript",
    "beforeCode": "// ❌ BEFORE: Naive external HTTP call blocks threads until timeout\napp.post('/api/checkout/shipping-rates', async (req, res) => {\n  try {\n    // If shipping provider slows down or hangs, each request occupies a server\n    // thread for 30s. 100 requests consume all available threads -> CASCADING FAILURE!\n    const response = await axios.post('https://api.shipping-partner.com/rates', req.body, {\n      timeout: 30000\n    });\n    res.json(response.data);\n  } catch (err) {\n    res.status(500).json({ error: 'Shipping rate calculation failed' });\n  }\n});",
    "afterCode": "// ✅ AFTER: Circuit Breaker fails fast and serves cached fallback rates\nimport CircuitBreaker from 'opossum';\n\nconst options = {\n  timeout: 3000,             // Fail if partner takes >3s\n  errorThresholdPercentage: 50, // Trip open if 50% of requests fail\n  resetTimeout: 10000        // Test health in Half-Open state after 10s\n};\n\nconst breaker = new CircuitBreaker(callShippingPartner, options);\n\n// Graceful fallback when circuit is OPEN\nbreaker.fallback(() => ({\n  rates: [{ method: 'Standard Flat Rate', price: 9.99, isEstimated: true }]\n}));\n\napp.post('/api/checkout/shipping-rates', async (req, res) => {\n  // If Circuit is OPEN, it fails fast in 1ms without calling the broken partner!\n  const rates = await breaker.fire(req.body);\n  res.json(rates);\n});",
    "problemExplanation": "When downstream dependencies hang, caller threads block indefinitely, causing thread pool exhaustion and cascading failures across the architecture.",
    "solutionExplanation": "The Circuit Breaker pattern trips OPEN upon repeated failures, failing fast in milliseconds and returning a graceful fallback without exhausting resources.",
    "keyTerms": [
      {
        "en": "circuit breaker pattern",
        "ukr": "патерн запобіжника (автовимикача)"
      },
      {
        "en": "cascading failure",
        "ukr": "каскадний збій системи"
      },
      {
        "en": "fail fast",
        "ukr": "принцип швидкої відмови (без зависання)"
      },
      {
        "en": "graceful fallback",
        "ukr": "плавний резервний сценарій (fallback)"
      },
      {
        "en": "half-open state",
        "ukr": "напіввідкритий стан (перевірка одужання)"
      }
    ],
    "prepHint": "PREP: 1. Describe how a slow 3rd party takes down the entire checkout service. 2. Explain the 3 states of a Circuit Breaker: Closed, Open, Half-Open. 3. Show how failing fast protects thread pools. 4. Point out the customer experience with the fallback flat rate.",
    "keywords": [
      "circuit breaker",
      "fallback",
      "cascading",
      "timeout",
      "downstream",
      "resiliency",
      "opossum",
      "fail fast",
      "half-open"
    ],
    "deepDive": {
      "mechanics": "In microservice architectures, when a downstream dependency (e.g., a third-party shipping API) degrades and hangs for 30-60 seconds, caller threads block waiting for timeouts. High incoming traffic rapidly exhausts server thread pools and socket buffers, triggering a cascading failure that takes down unrelated core services. The Circuit Breaker pattern acts as an automated safety switch: 1) Closed: Normal operation; 2) Open: When failure rates exceed a threshold (e.g., 50%), the breaker trips, failing fast in ~1ms and serving fallback responses without hitting the broken dependency; 3) Half-Open: Periodically sends trial requests to probe health before safely resetting.",
      "interviewSignals": "Senior checkboxes: Articulating the three states (Closed, Open, Half-Open), understanding Fail-Fast and resource preservation, designing graceful fallbacks, and preventing cascading failures in distributed environments.",
      "sampleAnswer": "Our checkout service suffered a critical cascading failure when an external shipping partner experienced degraded latency, leaving requests hanging for 30 seconds. This saturated our server's thread pool and made our entire checkout flow unresponsive. To decouple our platform from external outages, I implemented the Circuit Breaker pattern. When failures exceed the 50% threshold, the circuit trips to OPEN and fails fast in under one millisecond, returning a graceful fallback rate. After a reset window, it transitions to HALF-OPEN to safely probe downstream health. This isolated our system from external downtime and maintained a seamless user checkout experience."
    }
  },
  {
    "id": "code_017",
    "title": "Solve Distributed Dual-Writes with the Transactional Outbox Pattern",
    "category": "microservices_events",
    "categoryName": "📨 Distributed Systems & Events",
    "context": "Data Inconsistency Audit: In our Order Service, after inserting an order into PostgreSQL, the subsequent Kafka publish failed due to network jitter. Orders were billed but shipping events never fired. Explain your Outbox fix.",
    "language": "javascript",
    "beforeCode": "// ❌ BEFORE: Dual-write hazard across DB and Message Broker\nasync function createOrder(orderData) {\n  // Step 1: Save order to database\n  const order = await db('orders').insert(orderData).returning('*');\n\n  // Step 2: Publish event to Kafka\n  // BUG: If Kafka is down or network drops here, DB is committed but event is lost forever!\n  // Result: Customer paid, but warehouse never ships the item!\n  await kafkaProducer.send({\n    topic: 'order-created',\n    messages: [{ key: order.id, value: JSON.stringify(order) }]\n  });\n\n  return order;\n}",
    "afterCode": "// ✅ AFTER: Transactional Outbox commits order and event in ONE atomic ACID transaction\nasync function createOrder(orderData) {\n  return await db.transaction(async (trx) => {\n    // 1. Insert order\n    const [order] = await trx('orders').insert(orderData).returning('*');\n\n    // 2. Insert event payload into outbox table IN THE EXACT SAME TRANSACTION\n    await trx('outbox_events').insert({\n      aggregate_type: 'Order',\n      aggregate_id: order.id,\n      event_type: 'OrderCreated',\n      payload: JSON.stringify(order),\n      status: 'PENDING'\n    });\n\n    // An external Change Data Capture (CDC / Debezium) or reliable background worker\n    // polls outbox_events and publishes to Kafka with at-least-once delivery!\n    return order;\n  });\n}",
    "problemExplanation": "Performing two writes to different storage systems (DB and Kafka) without distributed coordination inevitably produces data inconsistencies when one call fails.",
    "solutionExplanation": "The Transactional Outbox pattern writes the event into an outbox table within the same ACID database transaction, ensuring atomic consistency before publishing.",
    "keyTerms": [
      {
        "en": "transactional outbox pattern",
        "ukr": "патерн транзакційного outbox (вихідної скриньки)"
      },
      {
        "en": "dual-write problem",
        "ukr": "проблема подвійного запису"
      },
      {
        "en": "eventual consistency",
        "ukr": "узгодженість у кінцевому підсумку"
      },
      {
        "en": "Change Data Capture (CDC)",
        "ukr": "захоплення змін даних (CDC / Debezium)"
      },
      {
        "en": "atomic commit across boundaries",
        "ukr": "атомарна фіксація на межі систем"
      }
    ],
    "prepHint": "PREP: 1. Explain the dual-write dilemma: DB succeeds, Kafka fails. 2. Highlight why 2-phase commits (2PC) are avoided in cloud. 3. Detail how the outbox table shares the ACID boundary. 4. Describe how Debezium or a polling worker delivers the event with zero loss.",
    "keywords": [
      "outbox",
      "kafka",
      "transaction",
      "dual-write",
      "cdc",
      "debezium",
      "acid",
      "event",
      "microservices",
      "consistency"
    ],
    "deepDive": {
      "mechanics": "Updating a local database and publishing an event to a message broker (Kafka or RabbitMQ) across separate calls introduces a dual-write hazard. Because these operations do not share an atomic transaction boundary, network blips or unexpected server restarts between steps cause irrecoverable inconsistencies: the database commits, but the event is lost forever. Distributed Two-Phase Commit (2PC) is avoided in modern cloud environments due to high latency and blocking locks. The Transactional Outbox pattern stores the outbound event inside an outbox table within the exact same ACID database transaction. A Change Data Capture (CDC) worker (such as Debezium) then streams these records to Kafka with at-least-once delivery guarantees.",
      "interviewSignals": "Key evaluation points: Clear articulation of the Dual-Write problem, understanding why 2PC/XA transactions do not scale in cloud architectures, Change Data Capture (CDC) mechanics, and achieving eventual consistency.",
      "sampleAnswer": "In our event-driven architecture, we identified a critical dual-write hazard: writing to PostgreSQL and subsequently publishing to Kafka in separate operations caused data desynchronization whenever Kafka experienced network blips. Orders were committed to the database, but downstream fulfillment events were lost. To eliminate this inconsistency without the performance penalty of two-phase commits, I adopted the Transactional Outbox pattern. We persist the event directly into an outbox table within the same atomic ACID database transaction. A dedicated Change Data Capture connector then streams these events to Kafka with at-least-once delivery guarantees, ensuring guaranteed eventual consistency."
    }
  },
  {
    "id": "code_018",
    "title": "Eliminate Node.js Heap Out-Of-Memory with Stream Backpressure",
    "category": "streams_memory",
    "categoryName": "💾 Streams & Memory Management",
    "context": "Production Incident: Exporting a 2.5 GB user activity log to CSV crashed the server with 'JavaScript heap out of memory'. Explain your streaming refactor.",
    "language": "javascript",
    "beforeCode": "// ❌ BEFORE: Buffering entire 2.5GB file in RAM blows up the V8 heap limit\napp.get('/api/export-logs', async (req, res) => {\n  // Loads 5,000,000 records into JavaScript array memory at once!\n  const logs = await db.query('SELECT * FROM activity_logs'); \n  \n  let csv = 'id,user_id,action,timestamp\\n';\n  for (const log of logs) {\n    csv += `${log.id},${log.user_id},${log.action},${log.timestamp}\\n`;\n  }\n\n  // Node.js process crashes here: \"Allocation failed - JavaScript heap out of memory\"\n  res.setHeader('Content-Type', 'text/csv');\n  res.send(csv);\n});",
    "afterCode": "// ✅ AFTER: Node.js Streams with automatic backpressure pipe chunks directly\nimport { pipeline } from 'stream/promises';\nimport { Transform } from 'stream';\n\napp.get('/api/export-logs', async (req, res) => {\n  res.setHeader('Content-Type', 'text/csv');\n  res.setHeader('Content-Disposition', 'attachment; filename=\"logs.csv\"');\n\n  // Stream records directly from database cursor chunk-by-chunk\n  const dbStream = db.queryStream('SELECT * FROM activity_logs');\n\n  const csvTransformer = new Transform({\n    objectMode: true,\n    transform(log, encoding, callback) {\n      callback(null, `${log.id},${log.user_id},${log.action},${log.timestamp}\\n`);\n    }\n  });\n\n  // pipeline handles error cleanup and pauses upstream query when client buffer fills (backpressure)\n  // Memory usage stays under 30MB throughout the entire 2.5GB export!\n  await pipeline(dbStream, csvTransformer, res);\n});",
    "problemExplanation": "Buffering multi-gigabyte datasets in Node.js RAM exceeds the V8 heap limit (typically 1.4GB - 2GB) and triggers unrecoverable process crashes.",
    "solutionExplanation": "Using Node.js Streams and the pipeline utility streams data chunk-by-chunk with automatic backpressure, capping memory footprint at ~30MB.",
    "keyTerms": [
      {
        "en": "heap out of memory",
        "ukr": "переповнення пам'яті купи (heap OOM)"
      },
      {
        "en": "stream backpressure",
        "ukr": "зворотний тиск у потоках (backpressure)"
      },
      {
        "en": "chunk-by-chunk processing",
        "ukr": "почанкхова (блокова) обробка даних"
      },
      {
        "en": "bounded memory footprint",
        "ukr": "обмежений фіксований обсяг RAM"
      },
      {
        "en": "pipeline utility",
        "ukr": "утиліта pipeline для надійного зв'язування потоків"
      }
    ],
    "prepHint": "PREP: 1. Explain the V8 default heap limit (~1.5GB) and why loading 2.5GB crashes Node.js. 2. Contrast buffer vs stream chunking. 3. Explain how backpressure pauses the DB cursor when client socket is slow. 4. Boast about constant 30MB RAM usage for infinite data size.",
    "keywords": [
      "stream",
      "backpressure",
      "memory",
      "heap",
      "pipeline",
      "oom",
      "chunks",
      "buffer",
      "transform",
      "v8"
    ],
    "deepDive": {
      "mechanics": "The Node.js V8 engine enforces a default heap memory ceiling (typically 1.4GB - 2GB). Querying millions of records and concatenating them into a giant string in memory causes rapid heap exhaustion, crashing the process with 'Allocation failed - JavaScript heap out of memory'. Node.js Streams process data chunk-by-chunk (typically 16-64KB buffers). Crucially, the Backpressure mechanism regulates flow: if a slow network client cannot consume data as fast as the database generates it, the output buffer fills up, and the stream automatically signals the database cursor to pause reading until the buffer drains, keeping RAM strictly capped at ~30MB regardless of dataset size.",
      "interviewSignals": "What interviewers evaluate: Understanding V8 heap limits, defining stream backpressure (how the consumer throttles the producer), and utilizing stream.pipeline for safe error cleanup over legacy stream.pipe.",
      "sampleAnswer": "Our reporting service suffered critical production crashes due to JavaScript heap out of memory errors whenever users exported large datasets. The legacy implementation was loading millions of records into memory simultaneously, blowing past the default V8 heap limit of 1.4 gigabytes. To resolve this, I refactored the endpoint to utilize Node.js Streams with the pipeline utility. We stream records directly from the database cursor chunk-by-chunk through a Transform stream straight into the HTTP response. Crucially, the built-in backpressure mechanism automatically throttles data reads whenever the network socket buffer is full. Consequently, our memory footprint remains strictly capped under 30 megabytes regardless of whether we export two megabytes or fifty gigabytes."
    }
  }
];

window.IT_PRO_PHRASES = [
  {
    "category": "Explaining Why You Edited Code",
    "icon": "🛠️",
    "phrases": [
      {
        "en": "The rationale behind this refactor is to...",
        "ukr": "Основна причина цього рефакторингу полягає в тому, щоб..."
      },
      {
        "en": "In the previous implementation, we were hitting a bottleneck where...",
        "ukr": "У попередній версії ми впиралися у вузьке місце, де..."
      },
      {
        "en": "Under the hood, this leverages a hash map to reduce time complexity from O(n²) to O(n).",
        "ukr": "Під капотом це використовує хеш-таблицю, щоб знизити складність з O(n²) до O(n)."
      },
      {
        "en": "To mitigate the race condition, I wrapped the operation in an atomic transaction.",
        "ukr": "Щоб усунути стан гонитви, я огорнув операцію в атомарну транзакцію."
      },
      {
        "en": "This decouples the business logic from the transport layer.",
        "ukr": "Це відокремлює бізнес-логіку від транспортного шару."
      }
    ]
  },
  {
    "category": "Describing Bugs & Root Causes",
    "icon": "🐛",
    "phrases": [
      {
        "en": "The root cause was an unhandled promise rejection under heavy load.",
        "ukr": "Першопричиною була необроблена помилка промісу під великим навантаженням."
      },
      {
        "en": "We observed a severe memory leak caused by dangling event listeners.",
        "ukr": "Ми помітили серйозний витік пам'яті через завислі обробники подій."
      },
      {
        "en": "Because the state mutation was synchronous, it triggered an infinite re-render loop.",
        "ukr": "Оскільки мутація стану була синхронною, вона викликала нескінченний цикл рендеру."
      },
      {
        "en": "The endpoint was vulnerable to SQL injection due to raw string interpolation.",
        "ukr": "Ендпоінт був вразливий до SQL-ін'єкції через пряму конкатенацію рядків."
      }
    ]
  },
  {
    "category": "Trade-offs & Architectural Decisions",
    "icon": "⚖️",
    "phrases": [
      {
        "en": "There is a minor memory overhead, but in return we gain substantial read throughput.",
        "ukr": "Є незначні витрати пам'яті, проте натомість ми отримуємо істотний приріст швидкості читання."
      },
      {
        "en": "We need to account for edge cases such as network timeouts or empty payloads.",
        "ukr": "Нам необхідно враховувати граничні випадки, такі як таймаути мережі або порожні дані."
      },
      {
        "en": "This is a temporary stopgap solution until we migrate to the new microservice.",
        "ukr": "Це тимчасове рішення (костиль/заплатка), поки ми не перейдемо на новий мікросервіс."
      },
      {
        "en": "It provides graceful degradation in case the primary database becomes unresponsive.",
        "ukr": "Це забезпечує плавне зниження функціональності, якщо основна БД перестане відповідати."
      }
    ]
  },
  {
    "category": "Daily Standup & PR Updates",
    "icon": "🎙️",
    "phrases": [
      {
        "en": "Yesterday I investigated the latency spike on production and deployed a hotfix.",
        "ukr": "Учора я розслідував стрибок затримки на продакшені та розгорнув терміновий фікс."
      },
      {
        "en": "Today I'm working on the cursor-based pagination and writing integration tests.",
        "ukr": "Сьогодні я займаюся пагінацією на курсорах та пишу інтеграційні тести."
      },
      {
        "en": "I'm currently blocked on the third-party API credentials from the DevOps team.",
        "ukr": "Наразі мене блокує очікування доступів до API від DevOps команди."
      },
      {
        "en": "Once CI passes and code review is approved, this will be ready for staging deployment.",
        "ukr": "Як тільки CI пройде успішно і PR затвердять, це буде готово до деплою на стейджинг."
      }
    ]
  }
];
