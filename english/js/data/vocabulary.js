// =================================================================
// 100% ENGLISH TOPIC-BASED VOCABULARY & PRACTICE ENGINE
// 5 Curated Topics, Exactly 12 High-Impact Words per Topic,
// Exactly 24 Tests per Topic (2 per word, shuffled, typing or multiple-choice).
// =================================================================

if (typeof window === 'undefined') {
  global.window = global;
}

window.TOPIC_VOCABULARY = [
  {
    "id": "topic_1",
    "title": "Topic 1: System Performance & High-Load Architecture",
    "description": "Crucial vocabulary for discussing latency, memory, scaling, and database bottlenecks.",
    "badge": "⚡ Performance",
    "words": [
      {
        "id": "w_bottleneck",
        "word": "bottleneck",
        "transcription": "[ˈbɒtl.nek]",
        "pos": "noun",
        "level": "C1",
        "definition": "A point of congestion in a system that occurs when workloads arrive too quickly for a given component to process, throttling overall throughput.",
        "collocations": [
          "performance bottleneck",
          "hit a bottleneck",
          "identify the bottleneck",
          "I/O bottleneck"
        ],
        "examples": [
          "Database queries without proper indexes will inevitably become the primary bottleneck of your backend.",
          "Our profiling tools revealed a severe CPU bottleneck in the cryptographic verification module.",
          "Batching network requests eliminated the communication bottleneck between our services."
        ],
        "challenges": [
          {
            "id": "ch_bottleneck_1",
            "prompt": "When thousands of concurrent requests hit unindexed tables, the database server became the system's primary _____.",
            "targetWord": "bottleneck",
            "hint": "Noun: Point of congestion that restricts total flow or speed",
            "options": [
              "bottleneck",
              "deadlock",
              "overhead",
              "latency"
            ],
            "explanation": "'Bottleneck' refers to a narrow point that limits overall capacity or execution speed."
          },
          {
            "id": "ch_bottleneck_2",
            "prompt": "Our profiling revealed that synchronous disk writes were creating an unexpected performance _____ during peak hours.",
            "targetWord": "bottleneck",
            "hint": "Noun: A constraint or choke point that slows down execution",
            "options": [
              "bottleneck",
              "throughput",
              "redundant",
              "starvation"
            ],
            "explanation": "A performance bottleneck constricts throughput and throttles overall execution velocity."
          }
        ]
      },
      {
        "id": "w_latency",
        "word": "latency",
        "transcription": "[ˈleɪ.tən.si]",
        "pos": "noun",
        "level": "C1",
        "definition": "The delay between a stimulus and a response; in computing, the time elapsed between initiating a request and receiving the result.",
        "collocations": [
          "network latency",
          "low latency",
          "reduce latency",
          "latency spike"
        ],
        "examples": [
          "By deploying edge servers closer to users, we dramatically dropped roundtrip latency.",
          "High network latency degraded the real-time gaming experience for international players.",
          "Caching database results in Redis reduced API response latency from 800ms down to 15ms."
        ],
        "challenges": [
          {
            "id": "ch_latency_1",
            "prompt": "Moving our caching layer to memory dropped our average API response _____ from 450ms down to 12ms.",
            "targetWord": "latency",
            "hint": "Noun: The time delay between sending a request and receiving a response",
            "options": [
              "latency",
              "throughput",
              "concurrency",
              "backpressure"
            ],
            "explanation": "'Latency' specifically measures time delay (often in milliseconds) in data transmission or execution."
          },
          {
            "id": "ch_latency_2",
            "prompt": "Cross-region database replication introduced noticeable network _____, causing slight delays in data synchronization.",
            "targetWord": "latency",
            "hint": "Noun: Measurable delay in communication or processing",
            "options": [
              "latency",
              "overhead",
              "mitigate",
              "deadlock"
            ],
            "explanation": "Network latency is the physical transit delay over geographic distances."
          }
        ]
      },
      {
        "id": "w_throughput",
        "word": "throughput",
        "transcription": "[ˈθruː.pʊt]",
        "pos": "noun",
        "level": "C1",
        "definition": "The amount of data or number of tasks processed successfully by a system within a specific period of time.",
        "collocations": [
          "high throughput",
          "maximize throughput",
          "transaction throughput",
          "network throughput"
        ],
        "examples": [
          "Apache Kafka is specifically architected for extremely high message throughput.",
          "Optimizing our SQL connection pool increased overall payment throughput by 40%.",
          "There is often an architectural trade-off between ultra-low latency and maximum batch throughput."
        ],
        "challenges": [
          {
            "id": "ch_throughput_1",
            "prompt": "By processing messages in parallel worker threads, we increased our processing _____ to 50,000 events per second.",
            "targetWord": "throughput",
            "hint": "Noun: The quantity of work or data processed in a given time frame",
            "options": [
              "throughput",
              "latency",
              "starvation",
              "overhead"
            ],
            "explanation": "'Throughput' measures the volume of successful processing operations per unit of time."
          },
          {
            "id": "ch_throughput_2",
            "prompt": "Under intense user load, system _____ remained stable without dropping any incoming transactions.",
            "targetWord": "throughput",
            "hint": "Noun: Volume of successful transactions over time",
            "options": [
              "throughput",
              "backpressure",
              "deadlock",
              "redundant"
            ],
            "explanation": "Throughput reflects the rate of completed transactions."
          }
        ]
      },
      {
        "id": "w_concurrency",
        "word": "concurrency",
        "transcription": "[kənˈkʌr.ən.si]",
        "pos": "noun",
        "level": "C1",
        "definition": "The ability of a system to execute multiple computational tasks or processes in overlapping time periods without corrupting state.",
        "collocations": [
          "high concurrency",
          "concurrency control",
          "manage concurrency",
          "concurrency issue"
        ],
        "examples": [
          "Handling high concurrency requires robust locking mechanisms to prevent race conditions.",
          "Go routines provide lightweight concurrency with minimal memory overhead.",
          "Testing our application under simulated concurrency helped detect synchronization bugs before release."
        ],
        "challenges": [
          {
            "id": "ch_concurrency_1",
            "prompt": "When designing online ticket reservations, handling high _____ is vital to prevent two users from buying the exact same seat.",
            "targetWord": "concurrency",
            "hint": "Noun: Multiple operations executing or overlapping in time simultaneously",
            "options": [
              "concurrency",
              "overhead",
              "deterministic",
              "starvation"
            ],
            "explanation": "'Concurrency' deals with managing multiple simultaneous access requests safely."
          },
          {
            "id": "ch_concurrency_2",
            "prompt": "Without proper synchronization, concurrent database updates will inevitably lead to race conditions under heavy _____.",
            "targetWord": "concurrency",
            "hint": "Noun: Overlapping execution of parallel requests",
            "options": [
              "concurrency",
              "latency",
              "backpressure",
              "mitigate"
            ],
            "explanation": "High concurrency exposes race conditions when shared state lacks synchronization."
          }
        ]
      },
      {
        "id": "w_backpressure",
        "word": "backpressure",
        "transcription": "[ˈbækˌpreʃ.ər]",
        "pos": "noun",
        "level": "C1",
        "definition": "A resistance or feedback mechanism in a data pipeline that signals an upstream producer to slow down when the downstream consumer is overwhelmed.",
        "collocations": [
          "apply backpressure",
          "handle backpressure",
          "stream backpressure",
          "backpressure mechanism"
        ],
        "examples": [
          "Node.js streams implement automatic backpressure to prevent filling RAM when writing to slow network sockets.",
          "Without backpressure, rapid message producers will cause consumer worker queues to run out of memory.",
          "Reactive streams provide standardized backpressure signaling across distributed systems."
        ],
        "challenges": [
          {
            "id": "ch_backpressure_1",
            "prompt": "Because the mobile client was on a slow 3G connection, the stream applied _____ to pause database reads.",
            "targetWord": "backpressure",
            "hint": "Noun: Mechanism to throttle upstream data production when the consumer is overwhelmed",
            "options": [
              "backpressure",
              "deadlock",
              "starvation",
              "throughput"
            ],
            "explanation": "'Backpressure' tells the producer to pause so memory buffers do not overflow."
          },
          {
            "id": "ch_backpressure_2",
            "prompt": "Our message consumer utilizes _____ to notify the broker to stop pushing new events until the active batch finishes.",
            "targetWord": "backpressure",
            "hint": "Noun: Upstream resistance signaling in data streams",
            "options": [
              "backpressure",
              "latency",
              "redundant",
              "bottleneck"
            ],
            "explanation": "Backpressure prevents fast producers from exhausting consumer buffers."
          }
        ]
      },
      {
        "id": "w_idempotent",
        "word": "idempotent",
        "transcription": "[ˌaɪ.dəmˈpoʊ.tənt]",
        "pos": "adjective",
        "level": "C1",
        "definition": "Describing an operation that produces the exact same outcome whether executed once or repeatedly.",
        "collocations": [
          "idempotent endpoint",
          "idempotent operation",
          "ensure idempotency",
          "idempotent consumer"
        ],
        "examples": [
          "HTTP PUT and DELETE requests are designed to be idempotent according to REST standards.",
          "To handle payment webhook retries without double-charging customers, the processing logic must be idempotent.",
          "Using unique idempotency keys guarantees that duplicate requests do not create duplicate records."
        ],
        "challenges": [
          {
            "id": "ch_idempotent_1",
            "prompt": "Because network timeouts cause Stripe to retry webhooks, our payment handler must be strictly _____ to avoid double billing.",
            "targetWord": "idempotent",
            "hint": "Adjective: Producing the exact same result no matter how many times executed",
            "options": [
              "idempotent",
              "deterministic",
              "redundant",
              "suboptimal"
            ],
            "explanation": "An 'idempotent' operation safely executes multiple times with identical results."
          },
          {
            "id": "ch_idempotent_2",
            "prompt": "An API endpoint is considered _____ if making ten identical calls produces the exact same server state as making one.",
            "targetWord": "idempotent",
            "hint": "Adjective: Immune to unintended side effects on repeated execution",
            "options": [
              "idempotent",
              "monolithic",
              "immutable",
              "ephemeral"
            ],
            "explanation": "Idempotence guarantees safe re-execution without duplicated mutations."
          }
        ]
      },
      {
        "id": "w_deadlock",
        "word": "deadlock",
        "transcription": "[ˈded.lɒk]",
        "pos": "noun",
        "level": "C1",
        "definition": "A state in which two or more competing actions are each waiting for the other to finish, preventing any of them from proceeding.",
        "collocations": [
          "encounter a deadlock",
          "deadlock detection",
          "resolve a deadlock",
          "prevent deadlocks"
        ],
        "examples": [
          "The database engine detected a deadlock between two concurrent balance transfers and aborted one of them.",
          "Always acquiring row locks in a consistent order eliminates the possibility of a deadlock.",
          "Thread deadlocks are notoriously difficult to reproduce in local development environments."
        ],
        "challenges": [
          {
            "id": "ch_deadlock_1",
            "prompt": "Transaction A locked record 1 and waited for record 2, while Transaction B locked record 2 and waited for record 1, triggering a _____.",
            "targetWord": "deadlock",
            "hint": "Noun: A situation where two processes block each other perpetually",
            "options": [
              "deadlock",
              "bottleneck",
              "latency",
              "starvation"
            ],
            "explanation": "A 'deadlock' happens when two processes enter a mutual circular wait."
          },
          {
            "id": "ch_deadlock_2",
            "prompt": "Strictly ordering lock acquisition by ascending resource IDs guarantees that a system will never enter a _____.",
            "targetWord": "deadlock",
            "hint": "Noun: Mutual blocking condition in concurrent systems",
            "options": [
              "deadlock",
              "backpressure",
              "overhead",
              "redundant"
            ],
            "explanation": "Deterministic lock ordering breaks the circular wait condition necessary for a deadlock."
          }
        ]
      },
      {
        "id": "w_overhead",
        "word": "overhead",
        "transcription": "[ˈoʊ.vərˌhed]",
        "pos": "noun",
        "level": "B2",
        "definition": "The extra computational time, memory, or bandwidth required to perform a specific management task beyond the actual payload execution.",
        "collocations": [
          "memory overhead",
          "minimal overhead",
          "computational overhead",
          "reduce overhead"
        ],
        "examples": [
          "Serializing complex JSON structures introduces significant CPU overhead in high-frequency trading.",
          "Using connection pools eliminates the recurring network overhead of TCP handshakes.",
          "The security encryption added less than 2% latency overhead to incoming web requests."
        ],
        "challenges": [
          {
            "id": "ch_overhead_1",
            "prompt": "Re-establishing a new database connection for every incoming HTTP request generates tremendous network and CPU _____.",
            "targetWord": "overhead",
            "hint": "Noun: Extra, indirect cost in resources or processing time",
            "options": [
              "overhead",
              "throughput",
              "concurrency",
              "starvation"
            ],
            "explanation": "'Overhead' refers to secondary operational costs required to maintain a service."
          },
          {
            "id": "ch_overhead_2",
            "prompt": "Using lightweight binary protocols like Protobuf dramatically reduces network payload _____ compared to verbose XML.",
            "targetWord": "overhead",
            "hint": "Noun: Unnecessary or auxiliary resource consumption",
            "options": [
              "overhead",
              "latency",
              "deadlock",
              "bottleneck"
            ],
            "explanation": "Protocol overhead is the auxiliary byte cost beyond the core payload."
          }
        ]
      },
      {
        "id": "w_mitigate",
        "word": "mitigate",
        "transcription": "[ˈmɪt.ɪ.ɡeɪt]",
        "pos": "verb",
        "level": "C1",
        "definition": "To make something bad, dangerous, or painful less severe, harmful, or serious.",
        "collocations": [
          "mitigate risks",
          "mitigate impact",
          "mitigate the bottleneck",
          "effective mitigation"
        ],
        "examples": [
          "Implementing automatic rate limiting helps mitigate the severity of Distributed Denial of Service (DDoS) attacks.",
          "We added redundant power supplies to mitigate the risk of hardware outages in the data center.",
          "Refactoring the slow loop to a batch query mitigated the database connection saturation."
        ],
        "challenges": [
          {
            "id": "ch_mitigate_1",
            "prompt": "To _____ the impact of sudden traffic spikes on Black Friday, our infrastructure automatically scales out server instances.",
            "targetWord": "mitigate",
            "hint": "Verb: To lessen the severity, damage, or risk of an adverse condition",
            "options": [
              "mitigate",
              "orchestrate",
              "decouple",
              "scrutinize"
            ],
            "explanation": "To 'mitigate' means to alleviate or reduce the severity of a problem."
          },
          {
            "id": "ch_mitigate_2",
            "prompt": "Introducing circuit breakers helped _____ the danger of cascading failures across our microservice ecosystem.",
            "targetWord": "mitigate",
            "hint": "Verb: Reduce the severity or probability of damage",
            "options": [
              "mitigate",
              "compromise",
              "leverage",
              "provision"
            ],
            "explanation": "Mitigating a risk reduces its potential harm to the platform."
          }
        ]
      },
      {
        "id": "w_redundant",
        "word": "redundant",
        "transcription": "[rɪˈdʌn.dənt]",
        "pos": "adjective",
        "level": "B2",
        "definition": "1. Not or no longer needed or useful; superfluous. 2. (In engineering) Duplicated as a backup in case of failure.",
        "collocations": [
          "redundant hardware",
          "eliminate redundant queries",
          "redundant code",
          "redundant backup"
        ],
        "examples": [
          "Our refactor eliminated over two hundred redundant database roundtrips on the dashboard.",
          "Critical flight control systems maintain three redundant computers running in parallel for safety.",
          "Code cleanup removed redundant checks that had already been validated at the gateway level."
        ],
        "challenges": [
          {
            "id": "ch_redundant_1",
            "prompt": "The previous code called the database inside a loop, executing hundreds of _____ queries for the same company profile.",
            "targetWord": "redundant",
            "hint": "Adjective: Unnecessary, repetitive, or superfluous",
            "options": [
              "redundant",
              "idempotent",
              "immutable",
              "deterministic"
            ],
            "explanation": "'Redundant' queries perform repeated, unnecessary fetching of already accessible data."
          },
          {
            "id": "ch_redundant_2",
            "prompt": "In mission-critical infrastructure, deploying a _____ secondary database ensures immediate failover if the primary crashes.",
            "targetWord": "redundant",
            "hint": "Adjective: Serving as a duplicate backup system",
            "options": [
              "redundant",
              "monolithic",
              "suboptimal",
              "stale"
            ],
            "explanation": "Redundant systems provide failover backup to guarantee high availability."
          }
        ]
      },
      {
        "id": "w_starvation",
        "word": "starvation",
        "transcription": "[stɑːrˈveɪ.ʃən]",
        "pos": "noun",
        "level": "C1",
        "definition": "A condition in concurrent computing where a runnable thread or process is perpetually denied necessary resources (CPU, threads, locks) to make progress.",
        "collocations": [
          "thread starvation",
          "resource starvation",
          "prevent starvation",
          "CPU starvation"
        ],
        "examples": [
          "High-priority tasks flooded the scheduler, causing thread starvation for lower-priority background jobs.",
          "Fair queuing algorithms prevent socket starvation by distributing available bandwidth evenly.",
          "Holding database locks for prolonged periods led to connection pool starvation."
        ],
        "challenges": [
          {
            "id": "ch_starvation_1",
            "prompt": "Because high-priority jobs continually monopolized all worker threads, the email dispatch queue suffered from severe _____.",
            "targetWord": "starvation",
            "hint": "Noun: Continuous deprivation of required computing resources",
            "options": [
              "starvation",
              "throughput",
              "concurrency",
              "deadlock"
            ],
            "explanation": "Resource 'starvation' occurs when processes cannot acquire resources due to greedy competitors."
          },
          {
            "id": "ch_starvation_2",
            "prompt": "A slow third-party API occupied all incoming HTTP worker threads, causing thread _____ for normal user requests.",
            "targetWord": "starvation",
            "hint": "Noun: Deprivation of available system threads or memory",
            "options": [
              "starvation",
              "backpressure",
              "mitigate",
              "latency"
            ],
            "explanation": "Thread starvation makes the server unresponsive to legitimate traffic."
          }
        ]
      },
      {
        "id": "w_deterministic",
        "word": "deterministic",
        "transcription": "[dɪˌtɜːr.mɪˈnɪs.tɪk]",
        "pos": "adjective",
        "level": "C1",
        "definition": "Describing an algorithm or system that always produces the exact same output when given the exact same initial state and inputs.",
        "collocations": [
          "deterministic behavior",
          "deterministic ordering",
          "deterministic algorithm",
          "non-deterministic"
        ],
        "examples": [
          "Sorting account IDs before locking guarantees deterministic lock acquisition order.",
          "Pure functions are strictly deterministic because they depend only on their arguments and produce no side effects.",
          "Non-deterministic tests that fail intermittently are a major headache for continuous integration pipelines."
        ],
        "challenges": [
          {
            "id": "ch_deterministic_1",
            "prompt": "To prevent deadlocks during concurrent fund transfers, we enforce a _____ lock order by always sorting user IDs first.",
            "targetWord": "deterministic",
            "hint": "Adjective: Completely predictable and invariable in outcome for a given input",
            "options": [
              "deterministic",
              "idempotent",
              "redundant",
              "ephemeral"
            ],
            "explanation": "A 'deterministic' order ensures that locking always occurs in the exact same sequence."
          },
          {
            "id": "ch_deterministic_2",
            "prompt": "Automated unit tests must be completely _____; running them ten times in a row should always yield identical results.",
            "targetWord": "deterministic",
            "hint": "Adjective: Reliably repeatable with no random or ambiguous variance",
            "options": [
              "deterministic",
              "monolithic",
              "suboptimal",
              "reluctant"
            ],
            "explanation": "Deterministic tests guarantee consistency without random flakes."
          }
        ]
      }
    ]
  },
  {
    "id": "topic_2",
    "title": "Topic 2: Architectural Patterns & Code Quality",
    "description": "Vocabulary for software engineering, design patterns, refactoring, and modular systems.",
    "badge": "🏛️ Architecture",
    "words": [
      {
        "id": "w_decouple",
        "word": "decouple",
        "transcription": "[diːˈkʌp.əl]",
        "pos": "verb",
        "level": "C1",
        "definition": "To separate, disconnect, or isolate components so that changes to one do not directly force modifications in another.",
        "collocations": [
          "decouple components",
          "decouple business logic",
          "tightly decoupled",
          "decouple from database"
        ],
        "examples": [
          "Using message queues allows us to decouple the order processing service from the shipping partner API.",
          "We decoupled the UI presentation layer from the data fetching hooks to make unit testing trivial.",
          "Tightly coupled architectures are difficult to maintain because changes cascade unpredictably."
        ],
        "challenges": [
          {
            "id": "ch_decouple_1",
            "prompt": "Introducing an event bus allowed us to _____ the notification service from the core authentication engine.",
            "targetWord": "decouple",
            "hint": "Verb: To separate or isolate dependencies between components",
            "options": [
              "decouple",
              "orchestrate",
              "refactor",
              "mitigate"
            ],
            "explanation": "To 'decouple' means to remove direct dependencies between software components."
          },
          {
            "id": "ch_decouple_2",
            "prompt": "The primary motivation behind the repository pattern is to _____ business rules from specific database query implementations.",
            "targetWord": "decouple",
            "hint": "Verb: Disconnect or detach independent concerns",
            "options": [
              "decouple",
              "compromise",
              "scrutinize",
              "provision"
            ],
            "explanation": "Decoupling business logic from database drivers promotes testability and flexibility."
          }
        ]
      },
      {
        "id": "w_refactor",
        "word": "refactor",
        "transcription": "[riːˈfæk.tər]",
        "pos": "verb",
        "level": "B2",
        "definition": "To restructure existing computer code without changing its external functional behavior, improving its readability, architecture, or performance.",
        "collocations": [
          "refactor the codebase",
          "refactor into modules",
          "major refactor",
          "refactor for performance"
        ],
        "examples": [
          "I refactored the monolithic 400-line controller into small, reusable domain services.",
          "Before adding new features to legacy payment modules, we spent two days refactoring test coverage.",
          "Refactoring the database layer to batch queries dropped page latency by 90%."
        ],
        "challenges": [
          {
            "id": "ch_refactor_1",
            "prompt": "Rather than adding another messy if-else condition, the senior engineer decided to _____ the logic into the Strategy Pattern.",
            "targetWord": "refactor",
            "hint": "Verb: Restructure and clean code without changing external behavior",
            "options": [
              "refactor",
              "decouple",
              "orchestrate",
              "benchmark"
            ],
            "explanation": "To 'refactor' means to rewrite and improve code structure while preserving functionality."
          },
          {
            "id": "ch_refactor_2",
            "prompt": "We spent the current sprint trying to _____ our legacy authentication module to eliminate technical debt.",
            "targetWord": "refactor",
            "hint": "Verb: Clean up and modernize internal code architecture",
            "options": [
              "refactor",
              "mitigate",
              "leverage",
              "scrutinize"
            ],
            "explanation": "Refactoring addresses technical debt without altering end-user features."
          }
        ]
      },
      {
        "id": "w_orchestrate",
        "word": "orchestrate",
        "transcription": "[ˈɔːr.kə.streɪt]",
        "pos": "verb",
        "level": "C1",
        "definition": "To arrange, manage, or coordinate multiple elements or automated services to achieve a unified, desired outcome.",
        "collocations": [
          "orchestrate workflows",
          "orchestrate microservices",
          "container orchestration",
          "carefully orchestrate"
        ],
        "examples": [
          "Kubernetes is designed to automate and orchestrate container deployment, scaling, and networking.",
          "Temporal workflows orchestrate complex multi-step financial transactions across distributed microservices.",
          "The CI/CD pipeline orchestrates automated testing, security scanning, and production deployment."
        ],
        "challenges": [
          {
            "id": "ch_orchestrate_1",
            "prompt": "We used Kubernetes to deploy and _____ hundreds of Docker container instances across cloud clusters.",
            "targetWord": "orchestrate",
            "hint": "Verb: Coordinate and manage complex multi-part systems",
            "options": [
              "orchestrate",
              "decouple",
              "refactor",
              "streamline"
            ],
            "explanation": "To 'orchestrate' means to coordinate and direct various automated services or containers."
          },
          {
            "id": "ch_orchestrate_2",
            "prompt": "A centralized Saga coordinator was implemented to _____ distributed rollback actions if an order failed mid-flight.",
            "targetWord": "orchestrate",
            "hint": "Verb: Coordinate step-by-step actions across systems",
            "options": [
              "orchestrate",
              "mitigate",
              "compromise",
              "benchmark"
            ],
            "explanation": "Orchestrating distributed transactions ensures all steps complete or rollback reliably."
          }
        ]
      },
      {
        "id": "w_resilience",
        "word": "resilience",
        "transcription": "[rɪˈzɪl.jəns]",
        "pos": "noun",
        "level": "C1",
        "definition": "The capacity of a system to withstand, adapt to, and recover quickly from unexpected failures or stress conditions.",
        "collocations": [
          "system resilience",
          "build resilience",
          "network resilience",
          "high resilience"
        ],
        "examples": [
          "Adding circuit breakers and automatic retries significantly improved the overall resilience of our API.",
          "Chaos engineering intentionally injects server outages to test infrastructure resilience.",
          "Data replication across multiple geographical regions ensures business resilience during datacenter blackouts."
        ],
        "challenges": [
          {
            "id": "ch_resilience_1",
            "prompt": "Deploying multi-region database backups with automatic failover drastically improved our platform's _____ during cloud outages.",
            "targetWord": "resilience",
            "hint": "Noun: The ability to withstand shocks and recover quickly from failures",
            "options": [
              "resilience",
              "overhead",
              "abstraction",
              "latency"
            ],
            "explanation": "'Resilience' is the architectural quality of enduring and recovering from failures."
          },
          {
            "id": "ch_resilience_2",
            "prompt": "Chaos engineering tests our application's _____ by randomly shutting down production microservices to observe recovery.",
            "targetWord": "resilience",
            "hint": "Noun: Fault tolerance and recovery capacity under stress",
            "options": [
              "resilience",
              "concurrency",
              "telemetry",
              "scalability"
            ],
            "explanation": "Resilience ensures systems recover gracefully when critical components fail."
          }
        ]
      },
      {
        "id": "w_abstraction",
        "word": "abstraction",
        "transcription": "[æbˈstræk.ʃən]",
        "pos": "noun",
        "level": "B2",
        "definition": "The practice of hiding complex implementation details behind a clean, simplified interface.",
        "collocations": [
          "clean abstraction",
          "leaky abstraction",
          "layer of abstraction",
          "high-level abstraction"
        ],
        "examples": [
          "An ORM provides an abstraction layer that allows engineers to query databases without writing raw SQL.",
          "Beware of leaky abstractions that force you to understand underlying low-level driver bugs.",
          "Interfaces in TypeScript allow developers to define clear behavioral abstractions."
        ],
        "challenges": [
          {
            "id": "ch_abstraction_1",
            "prompt": "The file storage service provides a clean _____ so developers can save files without knowing whether they live on S3 or local disk.",
            "targetWord": "abstraction",
            "hint": "Noun: A simplified interface that hides complex low-level implementation details",
            "options": [
              "abstraction",
              "telemetry",
              "resilience",
              "overhead"
            ],
            "explanation": "An 'abstraction' conceals underlying complexities behind an accessible interface."
          },
          {
            "id": "ch_abstraction_2",
            "prompt": "When an ORM fails to hide complex SQL locking behaviors, engineers complain about a leaky _____.",
            "targetWord": "abstraction",
            "hint": "Noun: Conceptual interface or layer that simplifies details",
            "options": [
              "abstraction",
              "starvation",
              "concurrency",
              "bottleneck"
            ],
            "explanation": "A leaky abstraction fails to fully insulate the user from underlying lower-level mechanics."
          }
        ]
      },
      {
        "id": "w_monolithic",
        "word": "monolithic",
        "transcription": "[ˌmɒn.əˈlɪθ.ɪk]",
        "pos": "adjective",
        "level": "C1",
        "definition": "Describing a large, single-tiered software application in which user interface, business logic, and database access are unified into one single codebase.",
        "collocations": [
          "monolithic architecture",
          "monolithic application",
          "break down a monolithic",
          "monolithic switch statement"
        ],
        "examples": [
          "The company struggled with hour-long build times because their entire product was built as a single monolithic repository.",
          "Refactoring the monolithic switch statement into isolated strategy classes made adding new payment methods trivial.",
          "Starting with a well-structured monolithic architecture is often wiser than premature microservice decomposition."
        ],
        "challenges": [
          {
            "id": "ch_monolithic_1",
            "prompt": "As the engineering team expanded to 200 developers, the single _____ codebase became too difficult to deploy independently.",
            "targetWord": "monolithic",
            "hint": "Adjective: Built as a single, indivisible, unified system or codebase",
            "options": [
              "monolithic",
              "idempotent",
              "ephemeral",
              "immutable"
            ],
            "explanation": "A 'monolithic' system combines all functionality into a single interconnected codebase."
          },
          {
            "id": "ch_monolithic_2",
            "prompt": "Replacing the giant _____ 500-line switch statement with the Strategy Pattern isolated each provider's implementation.",
            "targetWord": "monolithic",
            "hint": "Adjective: Massive, rigid, and unified in single block",
            "options": [
              "monolithic",
              "deterministic",
              "redundant",
              "stale"
            ],
            "explanation": "A monolithic block of procedural code concentrates multiple concerns into one unmaintainable unit."
          }
        ]
      },
      {
        "id": "w_telemetry",
        "word": "telemetry",
        "transcription": "[təˈlem.ə.tri]",
        "pos": "noun",
        "level": "C1",
        "definition": "The automated collection and transmission of operational data (metrics, logs, traces) from remote systems for monitoring and analysis.",
        "collocations": [
          "system telemetry",
          "collect telemetry",
          "telemetry pipeline",
          "real-time telemetry"
        ],
        "examples": [
          "OpenTelemetry has become the industry standard framework for instrumenting microservice telemetry.",
          "Analyzing application telemetry helped the team pinpoint the memory leak within minutes of deployment.",
          "Without comprehensive telemetry, debugging production anomalies is essentially guesswork."
        ],
        "challenges": [
          {
            "id": "ch_telemetry_1",
            "prompt": "Our monitoring stack continuously collects CPU, memory, and error _____ from all production Kubernetes pods.",
            "targetWord": "telemetry",
            "hint": "Noun: Automated operational metrics, logs, and diagnostic data",
            "options": [
              "telemetry",
              "abstraction",
              "throughput",
              "concurrency"
            ],
            "explanation": "'Telemetry' encompasses runtime metrics, logs, and distributed traces used to observe system state."
          },
          {
            "id": "ch_telemetry_2",
            "prompt": "Distributed tracing _____ allowed us to follow a single customer's checkout request across six different internal services.",
            "targetWord": "telemetry",
            "hint": "Noun: Observability and diagnostic operational data",
            "options": [
              "telemetry",
              "overhead",
              "resilience",
              "deadlock"
            ],
            "explanation": "Tracing telemetry visualizes request propagation across distributed nodes."
          }
        ]
      },
      {
        "id": "w_fallback",
        "word": "fallback",
        "transcription": "[ˈfɔːl.bæk]",
        "pos": "noun",
        "level": "B2",
        "definition": "An alternative plan, cached data, or secondary mechanism utilized when the primary option fails.",
        "collocations": [
          "graceful fallback",
          "fallback mechanism",
          "provide a fallback",
          "default fallback"
        ],
        "examples": [
          "When the live currency exchange API went down, our service served cached rates as a graceful fallback.",
          "The Circuit Breaker returns a static fallback response in under 2ms whenever downstream services trip open.",
          "Always ensure that offline mode provides a reasonable fallback for mobile users."
        ],
        "challenges": [
          {
            "id": "ch_fallback_1",
            "prompt": "When the primary AI recommendation engine failed to reply within 200ms, our API served a static list of popular items as a _____.",
            "targetWord": "fallback",
            "hint": "Noun: A backup solution or default plan used upon primary failure",
            "options": [
              "fallback",
              "bottleneck",
              "telemetry",
              "abstraction"
            ],
            "explanation": "A 'fallback' provides an acceptable default or degraded result when the primary system fails."
          },
          {
            "id": "ch_fallback_2",
            "prompt": "Implementing a graceful _____ ensures that users can still browse cached catalog data even during database downtime.",
            "targetWord": "fallback",
            "hint": "Noun: Alternative secondary mechanism for error tolerance",
            "options": [
              "fallback",
              "starvation",
              "overhead",
              "concurrency"
            ],
            "explanation": "A graceful fallback maintains user experience despite backend outages."
          }
        ]
      },
      {
        "id": "w_benchmark",
        "word": "benchmark",
        "transcription": "[ˈbentʃ.mɑːrk]",
        "pos": "noun / verb",
        "level": "B2",
        "definition": "A standard test or set of tests used to measure and compare the speed, throughput, or efficiency of software or hardware.",
        "collocations": [
          "run a benchmark",
          "industry benchmark",
          "benchmark performance",
          "benchmark results"
        ],
        "examples": [
          "We ran automated benchmarks to verify that the new serialization library was actually faster.",
          "Our performance benchmarks demonstrated a 3x speedup after switching from Node 18 to Node 22.",
          "Never optimize code based on assumptions; always benchmark before and after refactoring."
        ],
        "challenges": [
          {
            "id": "ch_benchmark_1",
            "prompt": "Before accepting the pull request, the tech lead asked us to run a _____ comparing query execution times before and after indexing.",
            "targetWord": "benchmark",
            "hint": "Noun: Standardized performance evaluation test",
            "options": [
              "benchmark",
              "telemetry",
              "fallback",
              "resilience"
            ],
            "explanation": "A 'benchmark' provides quantifiable metrics to evaluate performance improvements."
          },
          {
            "id": "ch_benchmark_2",
            "prompt": "Our load testing tool was configured to _____ how many concurrent checkout transactions the cluster could sustain.",
            "targetWord": "benchmark",
            "hint": "Verb: To test and measure system performance systematically",
            "options": [
              "benchmark",
              "decouple",
              "mitigate",
              "orchestrate"
            ],
            "explanation": "To benchmark means to evaluate system performance against rigorous standards."
          }
        ]
      },
      {
        "id": "w_stale",
        "word": "stale",
        "transcription": "[steɪl]",
        "pos": "adjective",
        "level": "B2",
        "definition": "No longer fresh, accurate, or up-to-date; outmoded or superseded by newer data.",
        "collocations": [
          "stale data",
          "stale cache",
          "stale closures",
          "prevent stale reads"
        ],
        "examples": [
          "Without proper cache invalidation, users will continue seeing stale account balances.",
          "React hooks can accidentally capture stale state values if dependencies are omitted from the array.",
          "The browser displayed stale search results because network responses arrived out of chronological order."
        ],
        "challenges": [
          {
            "id": "ch_stale_1",
            "prompt": "Because the Redis cache key lacked an automated invalidation event, customers were seeing _____ product prices from yesterday.",
            "targetWord": "stale",
            "hint": "Adjective: Outdated, obsolete, or no longer matching the source of truth",
            "options": [
              "stale",
              "immutable",
              "monolithic",
              "idempotent"
            ],
            "explanation": "'Stale' data represents an obsolete cached state that has not incorporated recent updates."
          },
          {
            "id": "ch_stale_2",
            "prompt": "Omitting state variables from the useEffect dependency array causes React to execute callbacks with a _____ closure.",
            "targetWord": "stale",
            "hint": "Adjective: Retaining old or outdated variable values",
            "options": [
              "stale",
              "deterministic",
              "redundant",
              "ephemeral"
            ],
            "explanation": "A stale closure captures and references obsolete variable snapshots."
          }
        ]
      },
      {
        "id": "w_immutable",
        "word": "immutable",
        "transcription": "[ɪˈmjuː.tə.bəl]",
        "pos": "adjective",
        "level": "C1",
        "definition": "Unchanging over time or unable to be modified after creation.",
        "collocations": [
          "immutable data",
          "immutable infrastructure",
          "immutable state",
          "pure immutable"
        ],
        "examples": [
          "In Redux and React, treating state as immutable prevents unexpected mutation bugs.",
          "Immutable infrastructure means replacing virtual servers entirely on deploy rather than patching them in place.",
          "Strings in JavaScript and Python are strictly immutable; operations on them return new string instances."
        ],
        "challenges": [
          {
            "id": "ch_immutable_1",
            "prompt": "In modern cloud deployments, servers are treated as _____ infrastructure: instead of updating running servers, we spin up fresh images.",
            "targetWord": "immutable",
            "hint": "Adjective: Unchangeable after initial creation",
            "options": [
              "immutable",
              "stale",
              "monolithic",
              "redundant"
            ],
            "explanation": "'Immutable' infrastructure guarantees consistency by deploying clean, unmodifiable instances."
          },
          {
            "id": "ch_immutable_2",
            "prompt": "Treating application state as _____ makes debugging easier because variables can never be silently mutated by side effects.",
            "targetWord": "immutable",
            "hint": "Adjective: Unable to be altered or overwritten in place",
            "options": [
              "immutable",
              "idempotent",
              "deterministic",
              "ephemeral"
            ],
            "explanation": "Immutable data structures eliminate state mutation side effects."
          }
        ]
      },
      {
        "id": "w_scalability",
        "word": "scalability",
        "transcription": "[ˌskeɪ.ləˈbɪl.ə.ti]",
        "pos": "noun",
        "level": "B2",
        "definition": "The capability of a system, network, or process to handle a growing amount of work or to be readily enlarged to accommodate that growth.",
        "collocations": [
          "horizontal scalability",
          "vertical scalability",
          "ensure scalability",
          "limit scalability"
        ],
        "examples": [
          "Stateless microservices offer superior horizontal scalability compared to stateful session servers.",
          "Relational databases often hit scalability limits when write volume exceeds single-node capacity.",
          "Designing for scalability early saves engineering teams from expensive architectural rewrites later."
        ],
        "challenges": [
          {
            "id": "ch_scalability_1",
            "prompt": "By removing session state from our backend servers, we unlocked effortless horizontal _____ across auto-scaling cloud instances.",
            "targetWord": "scalability",
            "hint": "Noun: The ability of a system to expand and handle increased workload",
            "options": [
              "scalability",
              "abstraction",
              "telemetry",
              "overhead"
            ],
            "explanation": "'Scalability' defines how effectively a platform accommodates increasing volume."
          },
          {
            "id": "ch_scalability_2",
            "prompt": "A database architecture that relies on global table locks will inevitably hit severe _____ bottlenecks under millions of writes.",
            "targetWord": "scalability",
            "hint": "Noun: Capacity to grow and perform under increased traffic",
            "options": [
              "scalability",
              "resilience",
              "concurrency",
              "starvation"
            ],
            "explanation": "Global locks destroy database write scalability."
          }
        ]
      }
    ]
  },
  {
    "id": "topic_3",
    "title": "Topic 3: Workplace Communication & Strategic Decision-Making",
    "description": "Essential professional vocabulary for engineering meetings, PR reviews, trade-offs, and negotiations.",
    "badge": "💼 Communication",
    "words": [
      {
        "id": "w_tradeoff",
        "word": "trade-off",
        "transcription": "[ˈtreɪd.ɒf]",
        "pos": "noun",
        "level": "B2",
        "definition": "A balance achieved between two desirable but mutually incompatible features; a compromise.",
        "collocations": [
          "architectural trade-off",
          "acceptable trade-off",
          "evaluate trade-offs",
          "inevitable trade-off"
        ],
        "examples": [
          "There is a fundamental trade-off between strict ACID consistency and low latency in distributed databases.",
          "Adding indexes speeds up SQL queries, but the trade-off is slower INSERT performance and higher disk storage.",
          "As a tech lead, your primary job is weighing trade-offs and communicating them clearly to stakeholders."
        ],
        "challenges": [
          {
            "id": "ch_tradeoff_1",
            "prompt": "Choosing Redis caching speeds up API responses, but the engineering _____ is having to manage cache invalidation complexity.",
            "targetWord": "trade-off",
            "hint": "Noun: A compromise or balancing act between two competing priorities",
            "options": [
              "trade-off",
              "constraint",
              "consensus",
              "scrutiny"
            ],
            "explanation": "A 'trade-off' represents sacrificing one benefit to gain another desirable attribute."
          },
          {
            "id": "ch_tradeoff_2",
            "prompt": "In software architecture, every design decision involves an inevitable _____ between delivery speed and technical debt.",
            "targetWord": "trade-off",
            "hint": "Noun: Balance between mutually exclusive benefits",
            "options": [
              "trade-off",
              "compromise",
              "leverage",
              "paradox"
            ],
            "explanation": "Engineering trade-offs dictate optimal architectural decisions."
          }
        ]
      },
      {
        "id": "w_constraint",
        "word": "constraint",
        "transcription": "[kənˈstreɪnt]",
        "pos": "noun",
        "level": "C1",
        "definition": "A limitation or restriction that limits what is possible or permissible.",
        "collocations": [
          "budget constraint",
          "time constraint",
          "technical constraint",
          "under constraints"
        ],
        "examples": [
          "Operating under strict memory constraints forced us to stream data instead of buffering it.",
          "The legacy database schema was the primary constraint preventing us from shipping the new feature on time.",
          "Every distributed system must navigate the constraints imposed by the CAP theorem."
        ],
        "challenges": [
          {
            "id": "ch_constraint_1",
            "prompt": "Because the embedded device had strict memory _____, we were limited to utilizing no more than 64 megabytes of RAM.",
            "targetWord": "constraint",
            "hint": "Noun: A boundary, restriction, or limitation on resources",
            "options": [
              "constraint",
              "consensus",
              "compromise",
              "scrutiny"
            ],
            "explanation": "A 'constraint' defines a mandatory limit within which a system must operate."
          },
          {
            "id": "ch_constraint_2",
            "prompt": "Tight regulatory _____ required all sensitive health data to be encrypted both at rest and in transit.",
            "targetWord": "constraint",
            "hint": "Noun: Mandatory legal or technical limitation",
            "options": [
              "constraint",
              "trade-off",
              "leverage",
              "ambivalent"
            ],
            "explanation": "Regulatory constraints establish binding requirements on system design."
          }
        ]
      },
      {
        "id": "w_consensus",
        "word": "consensus",
        "transcription": "[kənˈsen.səs]",
        "pos": "noun",
        "level": "C1",
        "definition": "A general agreement reached among a group of people; in distributed systems, agreement on a data value among distributed nodes.",
        "collocations": [
          "reach a consensus",
          "distributed consensus",
          "general consensus",
          "lack of consensus"
        ],
        "examples": [
          "After an hour of architectural debate, the senior engineers reached a consensus on adopting GraphQL.",
          "The Raft and Paxos algorithms solve the distributed consensus problem in fault-tolerant clusters.",
          "Without team consensus on code style guidelines, pull reviews will become contentious and slow."
        ],
        "challenges": [
          {
            "id": "ch_consensus_1",
            "prompt": "After reviewing the benchmark results, the engineering team finally reached a _____ to migrate our services to Go.",
            "targetWord": "consensus",
            "hint": "Noun: Widespread mutual agreement across a group or team",
            "options": [
              "consensus",
              "trade-off",
              "scrutiny",
              "constraint"
            ],
            "explanation": "Reaching a 'consensus' means all participants agree on a common course of action."
          },
          {
            "id": "ch_consensus_2",
            "prompt": "In distributed databases, the Raft protocol ensures that all cluster nodes maintain _____ regarding the current transaction log.",
            "targetWord": "consensus",
            "hint": "Noun: Agreement across distributed computer nodes",
            "options": [
              "consensus",
              "compromise",
              "leverage",
              "reluctant"
            ],
            "explanation": "Distributed consensus ensures nodes agree on state even across network failures."
          }
        ]
      },
      {
        "id": "w_leverage",
        "word": "leverage",
        "transcription": "[ˈlev.ər.ɪdʒ]",
        "pos": "verb / noun",
        "level": "C1",
        "definition": "To utilize an existing asset, technology, or advantage to achieve maximum benefit and efficiency.",
        "collocations": [
          "leverage existing tools",
          "leverage the cloud",
          "gain leverage",
          "leverage open source"
        ],
        "examples": [
          "Rather than inventing our own authentication crypto, we should leverage well-tested industry libraries.",
          "We leveraged Redis sorted sets to build a lightning-fast real-time leaderboard in just two hours.",
          "Startups leverage cloud-managed databases to avoid the overhead of dedicated database administrators."
        ],
        "challenges": [
          {
            "id": "ch_leverage_1",
            "prompt": "To accelerate time-to-market, the startup chose to _____ open-source frameworks rather than writing a custom engine from scratch.",
            "targetWord": "leverage",
            "hint": "Verb: To use an existing resource or strength for strategic advantage",
            "options": [
              "leverage",
              "scrutinize",
              "compromise",
              "streamline"
            ],
            "explanation": "To 'leverage' means to take advantage of existing capabilities to maximize results."
          },
          {
            "id": "ch_leverage_2",
            "prompt": "Our search autocomplete feature was able to _____ existing in-memory hash maps to respond in sub-millisecond times.",
            "targetWord": "leverage",
            "hint": "Verb: Utilize effectively for performance gain",
            "options": [
              "leverage",
              "mitigate",
              "orchestrate",
              "decouple"
            ],
            "explanation": "Leveraging in-memory data structures delivers maximum query efficiency."
          }
        ]
      },
      {
        "id": "w_streamline",
        "word": "streamline",
        "transcription": "[ˈstriːm.laɪn]",
        "pos": "verb",
        "level": "B2",
        "definition": "To make an organization, process, or system more efficient and effective by simplifying or eliminating redundant steps.",
        "collocations": [
          "streamline the process",
          "streamline deployment",
          "streamline workflow",
          "streamline onboarding"
        ],
        "examples": [
          "Automating our continuous deployment pipeline streamlined the process of shipping bug fixes to production.",
          "We streamlined the user onboarding flow from eight steps down to three, boosting signup conversions by 30%.",
          "Consolidating three different monitoring tools into Datadog streamlined our incident triage."
        ],
        "challenges": [
          {
            "id": "ch_streamline_1",
            "prompt": "Introducing single-click deployments helped _____ our release process and reduced human errors on Friday afternoons.",
            "targetWord": "streamline",
            "hint": "Verb: Make a workflow simpler, faster, and more efficient",
            "options": [
              "streamline",
              "scrutinize",
              "compromise",
              "leverage"
            ],
            "explanation": "To 'streamline' means to eliminate friction and unnecessary delays in a procedure."
          },
          {
            "id": "ch_streamline_2",
            "prompt": "The engineering manager wanted to _____ pull request reviews by adopting automated linting and formatting bots.",
            "targetWord": "streamline",
            "hint": "Verb: Simplify and accelerate operational workflows",
            "options": [
              "streamline",
              "decouple",
              "refactor",
              "mitigate"
            ],
            "explanation": "Streamlining PR reviews speeds up team delivery velocity."
          }
        ]
      },
      {
        "id": "w_compromise",
        "word": "compromise",
        "transcription": "[ˈkɒm.prə.maɪz]",
        "pos": "noun / verb",
        "level": "B2",
        "definition": "1. An agreement reached by mutual concession. 2. To expose to danger, vulnerability, or violation of security.",
        "collocations": [
          "security compromise",
          "reach a compromise",
          "compromise data integrity",
          "unacceptable compromise"
        ],
        "examples": [
          "A hacker compromised the staging database after finding an exposed API key in a public commit.",
          "We reached a sensible compromise between code perfection and meeting our product launch deadline.",
          "Never compromise security best practices just to shave a few days off development time."
        ],
        "challenges": [
          {
            "id": "ch_compromise_1",
            "prompt": "Failing to sanitize user input allowed an attacker to execute SQL injection and _____ the entire customer database.",
            "targetWord": "compromise",
            "hint": "Verb: To breach security or expose to danger/vulnerability",
            "options": [
              "compromise",
              "scrutinize",
              "streamline",
              "leverage"
            ],
            "explanation": "In security, to 'compromise' a system means to breach or penetrate its defenses."
          },
          {
            "id": "ch_compromise_2",
            "prompt": "The release date was a pragmatic _____ between product management's aggressive roadmap and the engineering team's quality standards.",
            "targetWord": "compromise",
            "hint": "Noun: Mutual settlement involving reciprocal concessions",
            "options": [
              "compromise",
              "consensus",
              "constraint",
              "trade-off"
            ],
            "explanation": "A compromise reconciles differing priorities through mutual adjustments."
          }
        ]
      },
      {
        "id": "w_ambivalent",
        "word": "ambivalent",
        "transcription": "[æmˈbɪv.ə.lənt]",
        "pos": "adjective",
        "level": "C1",
        "definition": "Having mixed, contradictory, or simultaneous opposing feelings or thoughts about something.",
        "collocations": [
          "feel ambivalent",
          "ambivalent attitude",
          "ambivalent response",
          "remain ambivalent"
        ],
        "examples": [
          "I feel ambivalent about adopting microservices; they solve team autonomy but introduce massive networking complexity.",
          "The team was ambivalent about the new framework because its documentation was sparse despite its high performance.",
          "Users were ambivalent about the UI redesign, with half praising the dark mode and half criticizing the navigation."
        ],
        "challenges": [
          {
            "id": "ch_ambivalent_1",
            "prompt": "The tech lead was _____ about migrating to GraphQL: it solves mobile overfetching, but adds significant caching complexity.",
            "targetWord": "ambivalent",
            "hint": "Adjective: Experiencing mixed or conflicting opinions simultaneously",
            "options": [
              "ambivalent",
              "reluctant",
              "feasible",
              "inevitable"
            ],
            "explanation": "'Ambivalent' describes holding contradictory views on a technology or choice."
          },
          {
            "id": "ch_ambivalent_2",
            "prompt": "Engineers remained _____ about the return-to-office mandate, appreciating team camaraderie but dreading daily commutes.",
            "targetWord": "ambivalent",
            "hint": "Adjective: Pulled in both directions by conflicting pros and cons",
            "options": [
              "ambivalent",
              "deterministic",
              "immutable",
              "comprehensive"
            ],
            "explanation": "Being ambivalent means seeing valid conflicting points on both sides."
          }
        ]
      },
      {
        "id": "w_reluctant",
        "word": "reluctant",
        "transcription": "[rɪˈlʌk.tənt]",
        "pos": "adjective",
        "level": "B2",
        "definition": "Unwilling, hesitant, or disinclined to take an action.",
        "collocations": [
          "reluctant to change",
          "reluctant to adopt",
          "understandably reluctant",
          "reluctant approval"
        ],
        "examples": [
          "The legacy team was reluctant to adopt Kubernetes because they were already comfortable with virtual machines.",
          "Management was reluctant to approve the rewrite until we proved the performance benefits with concrete benchmarks.",
          "Developers are often reluctant to touch old legacy code that lacks automated test coverage."
        ],
        "challenges": [
          {
            "id": "ch_reluctant_1",
            "prompt": "The security team was _____ to grant root access to external contractor developers without mandatory background checks.",
            "targetWord": "reluctant",
            "hint": "Adjective: Hesitant or unwilling to proceed with an action",
            "options": [
              "reluctant",
              "ambivalent",
              "feasible",
              "inevitable"
            ],
            "explanation": "'Reluctant' signifies resistance or unwillingness to proceed."
          },
          {
            "id": "ch_reluctant_2",
            "prompt": "Engineers are naturally _____ to modify fragile monolithic code when there are no automated unit tests to catch regressions.",
            "targetWord": "reluctant",
            "hint": "Adjective: Cautiously hesitant or disinclined",
            "options": [
              "reluctant",
              "deterministic",
              "stale",
              "suboptimal"
            ],
            "explanation": "Developers feel reluctant to edit untested code due to fear of breaking production."
          }
        ]
      },
      {
        "id": "w_inevitable",
        "word": "inevitable",
        "transcription": "[ɪnˈev.ɪ.tə.bəl]",
        "pos": "adjective",
        "level": "B2",
        "definition": "Certain to happen; unavoidable.",
        "collocations": [
          "inevitable outcome",
          "inevitable result",
          "practically inevitable",
          "inevitable delay"
        ],
        "examples": [
          "In distributed cloud systems, hardware failures and network partitions are inevitable.",
          "As traffic multiplied ten times over, the database outage became inevitable due to the missing indexes.",
          "Occasional production bugs are an inevitable reality of fast-moving software development teams."
        ],
        "challenges": [
          {
            "id": "ch_inevitable_1",
            "prompt": "When running thousands of hard drives in a large datacenter, disk failures are not an exception—they are mathematically _____.",
            "targetWord": "inevitable",
            "hint": "Adjective: Certain to occur; completely unavoidable",
            "options": [
              "inevitable",
              "feasible",
              "reluctant",
              "ambivalent"
            ],
            "explanation": "'Inevitable' means an event cannot be avoided and is bound to happen."
          },
          {
            "id": "ch_inevitable_2",
            "prompt": "Without automated CI testing, shipping breaking regressions to production will be an _____ consequence of rapid releases.",
            "targetWord": "inevitable",
            "hint": "Adjective: Unavoidable and guaranteed over time",
            "options": [
              "inevitable",
              "deterministic",
              "redundant",
              "immutable"
            ],
            "explanation": "Skipping automated tests makes regression bugs inevitable."
          }
        ]
      },
      {
        "id": "w_feasible",
        "word": "feasible",
        "transcription": "[ˈfiː.zə.bəl]",
        "pos": "adjective",
        "level": "C1",
        "definition": "Possible to do easily or conveniently; practical and achievable within existing constraints.",
        "collocations": [
          "technically feasible",
          "economically feasible",
          "feasible solution",
          "barely feasible"
        ],
        "examples": [
          "Rebuilding the entire mobile app in one week is simply not feasible given our current team size.",
          "A proof-of-concept confirmed that running WebAssembly inside the browser was technically feasible.",
          "We need to evaluate whether migrating our multi-terabyte dataset with zero downtime is feasible."
        ],
        "challenges": [
          {
            "id": "ch_feasible_1",
            "prompt": "Before committing to the client's aggressive two-month deadline, the tech lead evaluated whether the proposal was technically _____.",
            "targetWord": "feasible",
            "hint": "Adjective: Realistic, viable, and achievable within constraints",
            "options": [
              "feasible",
              "inevitable",
              "ambivalent",
              "reluctant"
            ],
            "explanation": "'Feasible' means practically doable and realistic given time and resources."
          },
          {
            "id": "ch_feasible_2",
            "prompt": "Our spike investigation proved that streaming video over WebSockets was entirely _____ on modern cellular networks.",
            "targetWord": "feasible",
            "hint": "Adjective: Viable and practical in implementation",
            "options": [
              "feasible",
              "immutable",
              "monolithic",
              "deterministic"
            ],
            "explanation": "Feasibility confirms that an engineering proposal can work in practice."
          }
        ]
      },
      {
        "id": "w_comprehensive",
        "word": "comprehensive",
        "transcription": "[ˌkɒm.prɪˈhen.sɪv]",
        "pos": "adjective",
        "level": "C1",
        "definition": "Complete and including everything that is necessary; broad in scope and content.",
        "collocations": [
          "comprehensive guide",
          "comprehensive test suite",
          "comprehensive documentation",
          "comprehensive audit"
        ],
        "examples": [
          "Our pull request was approved quickly because it included comprehensive unit and integration tests.",
          "The security team conducted a comprehensive audit of our cloud IAM permissions.",
          "A comprehensive post-mortem report outlines the timeline, root cause, and remediation steps of an incident."
        ],
        "challenges": [
          {
            "id": "ch_comprehensive_1",
            "prompt": "Writing a _____ suite of automated integration tests gives developers confidence to refactor legacy code safely.",
            "targetWord": "comprehensive",
            "hint": "Adjective: Thorough, all-inclusive, and complete in scope",
            "options": [
              "comprehensive",
              "feasible",
              "reluctant",
              "ambivalent"
            ],
            "explanation": "'Comprehensive' tests cover edge cases, happy paths, and error scenarios exhaustively."
          },
          {
            "id": "ch_comprehensive_2",
            "prompt": "The onboarding documentation was so _____ that new software engineers were able to deploy code on their first day.",
            "targetWord": "comprehensive",
            "hint": "Adjective: Exhaustive, detailed, and thorough",
            "options": [
              "comprehensive",
              "redundant",
              "immutable",
              "stale"
            ],
            "explanation": "Comprehensive documentation covers all operational steps without missing details."
          }
        ]
      },
      {
        "id": "w_scrutiny",
        "word": "scrutiny",
        "transcription": "[ˈskruː.tɪ.ni]",
        "pos": "noun",
        "level": "C1",
        "definition": "Critical observation, detailed examination, or close inspection.",
        "collocations": [
          "under close scrutiny",
          "withstand scrutiny",
          "subject to scrutiny",
          "intense scrutiny"
        ],
        "examples": [
          "Changes to core payment flows are subjected to intense scrutiny by at least two senior engineers.",
          "Our cryptography implementation must withstand public scrutiny from open-source security researchers.",
          "Under close scrutiny, the candidate's code showed a deep understanding of memory management."
        ],
        "challenges": [
          {
            "id": "ch_scrutiny_1",
            "prompt": "Because our software handles sensitive banking records, every pull request undergoes strict peer _____ prior to merge.",
            "targetWord": "scrutiny",
            "hint": "Noun: Rigorous, careful examination or critical evaluation",
            "options": [
              "scrutiny",
              "consensus",
              "constraint",
              "compromise"
            ],
            "explanation": "'Scrutiny' means close, detailed, and critical examination."
          },
          {
            "id": "ch_scrutiny_2",
            "prompt": "The startup's accounting algorithms came under regulatory _____ after reporting suspicious financial discrepancies.",
            "targetWord": "scrutiny",
            "hint": "Noun: Intensive audit or critical investigation",
            "options": [
              "scrutiny",
              "trade-off",
              "leverage",
              "resilience"
            ],
            "explanation": "Under scrutiny, systems are tested and analyzed for hidden flaws."
          }
        ]
      }
    ]
  },
  {
    "id": "topic_4",
    "title": "Topic 4: Advanced Reasoning & Problem Solving (IELTS / C1 Academic)",
    "description": "Sophisticated vocabulary for debate, logic, essay writing, and academic analysis.",
    "badge": "🧠 Advanced C1",
    "words": [
      {
        "id": "w_paradox",
        "word": "paradox",
        "transcription": "[ˈpær.ə.dɒks]",
        "pos": "noun",
        "level": "C1",
        "definition": "A statement or situation that appears self-contradictory or absurd on the surface, but upon closer examination proves to express a truth.",
        "collocations": [
          "apparent paradox",
          "resolve a paradox",
          "present a paradox",
          "paradox of choice"
        ],
        "examples": [
          "The paradox of automation is that as machines become more competent, human operators become less practiced.",
          "It is an intriguing paradox that giving users more choices often leads to lower satisfaction and indecision.",
          "Working remotely created a paradox: employees communicated more frequently but felt more isolated."
        ],
        "challenges": [
          {
            "id": "ch_paradox_1",
            "prompt": "The '_____ of choice' explains why giving consumers fifty options often leads to anxiety and indecision rather than happiness.",
            "targetWord": "paradox",
            "hint": "Noun: An apparently contradictory statement that reveals a deeper truth",
            "options": [
              "paradox",
              "nuance",
              "dichotomy",
              "scrutiny"
            ],
            "explanation": "A 'paradox' expresses contradictory elements that coexist and reveal an insight."
          },
          {
            "id": "ch_paradox_2",
            "prompt": "It seems like a _____ that adding more programmers to a late software project only makes it later.",
            "targetWord": "paradox",
            "hint": "Noun: Counterintuitive reality that contradicts initial assumptions",
            "options": [
              "paradox",
              "constraint",
              "consensus",
              "compromise"
            ],
            "explanation": "Brooks's Law presents a classic software engineering paradox."
          }
        ]
      },
      {
        "id": "w_nuance",
        "word": "nuance",
        "transcription": "[ˈnjuː.ɑːns]",
        "pos": "noun",
        "level": "C1",
        "definition": "A subtle difference in meaning, expression, sound, or opinion.",
        "collocations": [
          "subtle nuance",
          "appreciate the nuance",
          "capture the nuance",
          "lack of nuance"
        ],
        "examples": [
          "Senior engineers appreciate the subtle nuance between eventual consistency and strong consistency.",
          "Social media debates often lack nuance, reducing complex geopolitical issues to simplistic soundbites.",
          "Translating poetry requires capturing emotional nuance rather than literal word-for-word equivalences."
        ],
        "challenges": [
          {
            "id": "ch_nuance_1",
            "prompt": "An inexperienced developer sees all databases as the same, but an architect understands the subtle _____ between different storage engines.",
            "targetWord": "nuance",
            "hint": "Noun: A subtle distinction or fine shade of difference",
            "options": [
              "nuance",
              "paradox",
              "dichotomy",
              "overhead"
            ],
            "explanation": "'Nuance' refers to subtle distinctions that distinguish closely related options."
          },
          {
            "id": "ch_nuance_2",
            "prompt": "Senior interviewers listen closely to whether a candidate can explain the architectural _____ of different caching strategies.",
            "targetWord": "nuance",
            "hint": "Noun: Subtle details, caveats, and fine distinctions",
            "options": [
              "nuance",
              "starvation",
              "consensus",
              "compromise"
            ],
            "explanation": "Explaining nuances demonstrates mastery of trade-offs."
          }
        ]
      },
      {
        "id": "w_counterproductive",
        "word": "counterproductive",
        "transcription": "[ˌkaʊn.tər.prəˈdʌk.tɪv]",
        "pos": "adjective",
        "level": "C1",
        "definition": "Having the opposite of the desired effect; hindering rather than helping progress.",
        "collocations": [
          "prove counterproductive",
          "counterproductive measure",
          "ultimately counterproductive",
          "highly counterproductive"
        ],
        "examples": [
          "Micromanaging senior engineers is counterproductive because it kills initiative and slows down velocity.",
          "Premature optimization is counterproductive: it wastes hours on code that isn't even a bottleneck.",
          "Working 80 hours a week is counterproductive because exhaustion leads to catastrophic bugs."
        ],
        "challenges": [
          {
            "id": "ch_counterproductive_1",
            "prompt": "Spending three weeks optimizing a function that executes once a month is completely _____ when core checkout APIs are failing.",
            "targetWord": "counterproductive",
            "hint": "Adjective: Producing the opposite of the desired result; harmful to efficiency",
            "options": [
              "counterproductive",
              "indispensable",
              "suboptimal",
              "exponential"
            ],
            "explanation": "'Counterproductive' work actively undermines real progress despite good intentions."
          },
          {
            "id": "ch_counterproductive_2",
            "prompt": "Forcing engineers to write documentation before writing a single line of prototype code proved highly _____.",
            "targetWord": "counterproductive",
            "hint": "Adjective: Impeding progress rather than promoting it",
            "options": [
              "counterproductive",
              "ubiquitous",
              "paramount",
              "arbitrary"
            ],
            "explanation": "Bureaucratic roadblocks are counterproductive to creative problem solving."
          }
        ]
      },
      {
        "id": "w_profound",
        "word": "profound",
        "transcription": "[prəˈfaʊnd]",
        "pos": "adjective",
        "level": "C1",
        "definition": "Very great, intense, or having deep intellectual insight and far-reaching effects.",
        "collocations": [
          "profound impact",
          "profound insight",
          "profound change",
          "profound implications"
        ],
        "examples": [
          "The advent of generative AI is having a profound impact on the software development lifecycle.",
          "Reading the source code of the Linux kernel gave me a profound understanding of operating systems.",
          "Moving from a monolith to microservices had profound cultural implications for the organization."
        ],
        "challenges": [
          {
            "id": "ch_profound_1",
            "prompt": "The introduction of cloud computing caused a _____ shift in how companies budget and deploy IT infrastructure.",
            "targetWord": "profound",
            "hint": "Adjective: Deep, significant, and far-reaching in consequence",
            "options": [
              "profound",
              "suboptimal",
              "arbitrary",
              "ephemeral"
            ],
            "explanation": "'Profound' implies deep, significant, and transformative impact."
          },
          {
            "id": "ch_profound_2",
            "prompt": "Understanding how memory garbage collection operates under the hood offers _____ insights into performance tuning.",
            "targetWord": "profound",
            "hint": "Adjective: Deep and intellectually insightful",
            "options": [
              "profound",
              "counterproductive",
              "ubiquitous",
              "immutable"
            ],
            "explanation": "Deep technical comprehension yields profound engineering insights."
          }
        ]
      },
      {
        "id": "w_suboptimal",
        "word": "suboptimal",
        "transcription": "[ˌsʌbˈɒp.tɪ.məl]",
        "pos": "adjective",
        "level": "C1",
        "definition": "Below the highest standard or quality; less than ideal.",
        "collocations": [
          "suboptimal performance",
          "suboptimal choice",
          "suboptimal solution",
          "prove suboptimal"
        ],
        "examples": [
          "Using synchronous HTTP requests inside a loop is a suboptimal design that causes high latency.",
          "While storing images directly in SQL tables works for small toys, it is suboptimal for production scale.",
          "The temporary hack solved the bug, but everyone agreed the architecture remained suboptimal."
        ],
        "challenges": [
          {
            "id": "ch_suboptimal_1",
            "prompt": "Storing five gigabytes of user uploads directly inside PostgreSQL BLOB columns is a _____ architecture compared to using cloud object storage.",
            "targetWord": "suboptimal",
            "hint": "Adjective: Less than ideal; inferior in design or performance",
            "options": [
              "suboptimal",
              "indispensable",
              "paramount",
              "exponential"
            ],
            "explanation": "'Suboptimal' describes an approach that works but is noticeably inferior to best practices."
          },
          {
            "id": "ch_suboptimal_2",
            "prompt": "Running multiple heavy analytical queries on the live primary database resulted in a _____ user experience on our public storefront.",
            "targetWord": "suboptimal",
            "hint": "Adjective: Below standard quality or efficiency",
            "options": [
              "suboptimal",
              "profound",
              "ubiquitous",
              "deterministic"
            ],
            "explanation": "Degraded performance produces a suboptimal customer experience."
          }
        ]
      },
      {
        "id": "w_indispensable",
        "word": "indispensable",
        "transcription": "[ˌɪn.dɪˈspen.sə.bəl]",
        "pos": "adjective",
        "level": "C1",
        "definition": "Absolutely necessary; essential and impossible to manage without.",
        "collocations": [
          "indispensable tool",
          "indispensable asset",
          "prove indispensable",
          "indispensable part"
        ],
        "examples": [
          "Git has become an indispensable version control tool for modern engineering teams worldwide.",
          "His deep institutional knowledge made him an indispensable member of the infrastructure group.",
          "Comprehensive automated testing is indispensable if you want to ship releases continuously."
        ],
        "challenges": [
          {
            "id": "ch_indispensable_1",
            "prompt": "Reliable automated continuous integration pipelines have become an _____ component of professional engineering workflows.",
            "targetWord": "indispensable",
            "hint": "Adjective: Absolutely essential; impossible to do without",
            "options": [
              "indispensable",
              "suboptimal",
              "arbitrary",
              "counterproductive"
            ],
            "explanation": "'Indispensable' indicates something essential that cannot be replaced or omitted."
          },
          {
            "id": "ch_indispensable_2",
            "prompt": "A senior architect who understands both distributed systems and business strategy is an _____ asset to a growing company.",
            "targetWord": "indispensable",
            "hint": "Adjective: Crucial, vital, and irreplaceable",
            "options": [
              "indispensable",
              "ephemeral",
              "monolithic",
              "stale"
            ],
            "explanation": "Indispensable individuals or tools are central to operational success."
          }
        ]
      },
      {
        "id": "w_ubiquitous",
        "word": "ubiquitous",
        "transcription": "[juːˈbɪk.wɪ.təs]",
        "pos": "adjective",
        "level": "C1",
        "definition": "Present, appearing, or found everywhere at the same time.",
        "collocations": [
          "ubiquitous presence",
          "become ubiquitous",
          "ubiquitous technology",
          "ubiquitous computing"
        ],
        "examples": [
          "Smartphones have become so ubiquitous that life without instant internet access seems unthinkable.",
          "JSON has achieved ubiquitous adoption as the standard data interchange format for modern APIs.",
          "Docker containers are now ubiquitous across modern enterprise software development."
        ],
        "challenges": [
          {
            "id": "ch_ubiquitous_1",
            "prompt": "RESTful JSON APIs have become so _____ that almost every modern web and mobile application relies on them.",
            "targetWord": "ubiquitous",
            "hint": "Adjective: Omnipresent, widespread, and found everywhere",
            "options": [
              "ubiquitous",
              "counterproductive",
              "suboptimal",
              "arbitrary"
            ],
            "explanation": "'Ubiquitous' means universally present across the industry or world."
          },
          {
            "id": "ch_ubiquitous_2",
            "prompt": "With the rise of smartphones, wireless internet connectivity has become virtually _____ in metropolitan cities.",
            "targetWord": "ubiquitous",
            "hint": "Adjective: Universally accessible and found everywhere",
            "options": [
              "ubiquitous",
              "immutable",
              "ephemeral",
              "reluctant"
            ],
            "explanation": "Ubiquitous connectivity is available across all environments."
          }
        ]
      },
      {
        "id": "w_paramount",
        "word": "paramount",
        "transcription": "[ˈpær.ə.maʊnt]",
        "pos": "adjective",
        "level": "C1",
        "definition": "More important than anything else; supreme in rank or significance.",
        "collocations": [
          "of paramount importance",
          "paramount concern",
          "remain paramount",
          "paramount priority"
        ],
        "examples": [
          "In healthcare and banking applications, data security and patient privacy are of paramount importance.",
          "Delivering a bug-free experience during our Black Friday sale was our paramount objective.",
          "Speed of recovery is paramount when an outage occurs on payment processing gateways."
        ],
        "challenges": [
          {
            "id": "ch_paramount_1",
            "prompt": "When handling credit card transactions, maintaining compliance with PCI-DSS security standards is of _____ importance.",
            "targetWord": "paramount",
            "hint": "Adjective: Supreme, topmost, and more critical than all other considerations",
            "options": [
              "paramount",
              "counterproductive",
              "suboptimal",
              "arbitrary"
            ],
            "explanation": "'Paramount' means of the utmost importance, taking precedence over everything else."
          },
          {
            "id": "ch_paramount_2",
            "prompt": "Ensuring zero data loss during our multi-region database migration remained the team's _____ objective.",
            "targetWord": "paramount",
            "hint": "Adjective: Utmost and highest priority",
            "options": [
              "paramount",
              "ubiquitous",
              "ephemeral",
              "stale"
            ],
            "explanation": "A paramount objective supersedes all secondary goals."
          }
        ]
      },
      {
        "id": "w_arbitrary",
        "word": "arbitrary",
        "transcription": "[ˈɑːr.bɪ.trer.i]",
        "pos": "adjective",
        "level": "C1",
        "definition": "Based on random choice or personal whim, rather than any system, reason, or logical rule.",
        "collocations": [
          "arbitrary decision",
          "arbitrary value",
          "seem arbitrary",
          "purely arbitrary"
        ],
        "examples": [
          "Hardcoding an arbitrary timeout of 5000ms caused flakiness on slower mobile network connections.",
          "API rate limits should be calculated based on server capacity, not chosen arbitrarily.",
          "Without clear criteria, performance review ratings will feel completely arbitrary to employees."
        ],
        "challenges": [
          {
            "id": "ch_arbitrary_1",
            "prompt": "Setting the cache TTL to 42 minutes was a completely _____ choice made by an engineer without looking at data update patterns.",
            "targetWord": "arbitrary",
            "hint": "Adjective: Random or baseless, lacking systematic logic or justification",
            "options": [
              "arbitrary",
              "paramount",
              "indispensable",
              "profound"
            ],
            "explanation": "'Arbitrary' implies decisions made on random whim rather than data-driven logic."
          },
          {
            "id": "ch_arbitrary_2",
            "prompt": "Engineers questioned the _____ code review rule that banned all switch statements regardless of context.",
            "targetWord": "arbitrary",
            "hint": "Adjective: Unreasonable or based on personal prejudice rather than merit",
            "options": [
              "arbitrary",
              "ubiquitous",
              "immutable",
              "exponential"
            ],
            "explanation": "Arbitrary rules lack rational justification."
          }
        ]
      },
      {
        "id": "w_unprecedented",
        "word": "unprecedented",
        "transcription": "[ʌnˈpres.ɪ.den.tɪd]",
        "pos": "adjective",
        "level": "C1",
        "definition": "Never done, experienced, or known before in human or recorded history.",
        "collocations": [
          "unprecedented scale",
          "unprecedented growth",
          "unprecedented speed",
          "at an unprecedented rate"
        ],
        "examples": [
          "The viral launch attracted ten million users in 48 hours, creating an unprecedented load on our infrastructure.",
          "Generative AI models are processing natural language at an unprecedented level of sophistication.",
          "The global pandemic triggered an unprecedented surge in remote work technology adoption."
        ],
        "challenges": [
          {
            "id": "ch_unprecedented_1",
            "prompt": "When the game launched globally, server clusters experienced an _____ spike of 2 million concurrent connections in ten minutes.",
            "targetWord": "unprecedented",
            "hint": "Adjective: Never seen, experienced, or recorded before",
            "options": [
              "unprecedented",
              "counterproductive",
              "suboptimal",
              "arbitrary"
            ],
            "explanation": "'Unprecedented' denotes an event or scale that has never occurred in the past."
          },
          {
            "id": "ch_unprecedented_2",
            "prompt": "Modern neural networks are capable of generating working code at _____ speed compared to manual typing.",
            "targetWord": "unprecedented",
            "hint": "Adjective: Exceeding all previous historical benchmarks",
            "options": [
              "unprecedented",
              "paramount",
              "ubiquitous",
              "stale"
            ],
            "explanation": "Unprecedented speed breaks all prior historical records."
          }
        ]
      },
      {
        "id": "w_dichotomy",
        "word": "dichotomy",
        "transcription": "[daɪˈkɒt.ə.mi]",
        "pos": "noun",
        "level": "C1",
        "definition": "A division or contrast between two things that are represented as being entirely opposed or distinct.",
        "collocations": [
          "false dichotomy",
          "sharp dichotomy",
          "dichotomy between",
          "explore the dichotomy"
        ],
        "examples": [
          "Framing software engineering as a dichotomy between speed and quality is a false dilemma; good tests enable both.",
          "The debate explored the dichotomy between centralized cloud control and decentralized edge computing.",
          "There is a growing dichotomy in tech between specialized domain experts and full-stack generalists."
        ],
        "challenges": [
          {
            "id": "ch_dichotomy_1",
            "prompt": "Claiming that developers must choose between writing tests or shipping features presents a false _____.",
            "targetWord": "dichotomy",
            "hint": "Noun: Division into two mutually exclusive and contradictory categories",
            "options": [
              "dichotomy",
              "paradox",
              "nuance",
              "consensus"
            ],
            "explanation": "A 'false dichotomy' incorrectly portrays a situation as having only two polarized opposites."
          },
          {
            "id": "ch_dichotomy_2",
            "prompt": "The philosophical _____ between individual privacy and collective surveillance is a central debate in modern cybersecurity.",
            "targetWord": "dichotomy",
            "hint": "Noun: Sharp contrast between two opposing principles",
            "options": [
              "dichotomy",
              "constraint",
              "trade-off",
              "scrutiny"
            ],
            "explanation": "A dichotomy highlights two fundamentally opposed stances."
          }
        ]
      },
      {
        "id": "w_exponential",
        "word": "exponential",
        "transcription": "[ˌek.spəˈnen.ʃəl]",
        "pos": "adjective",
        "level": "B2",
        "definition": "Increasing or growing at a constantly accelerating rate proportional to the current amount.",
        "collocations": [
          "exponential growth",
          "exponential increase",
          "exponential decay",
          "exponential complexity"
        ],
        "examples": [
          "Without memoization, the naive recursive Fibonacci algorithm exhibits exponential time complexity O(2^N).",
          "Our cloud computing bill saw exponential growth as user adoption skyrocketed across international markets.",
          "Exponential backoff is a crucial algorithm for pacing API retries after server connection failures."
        ],
        "challenges": [
          {
            "id": "ch_exponential_1",
            "prompt": "When retry algorithms fail to use _____ backoff, repeated retries will overwhelm and crash recovering servers.",
            "targetWord": "exponential",
            "hint": "Adjective: Growing or multiplying at an accelerating, non-linear rate",
            "options": [
              "exponential",
              "suboptimal",
              "arbitrary",
              "indispensable"
            ],
            "explanation": "'Exponential backoff' doubles the wait interval after each subsequent failure."
          },
          {
            "id": "ch_exponential_2",
            "prompt": "A nested loop within another nested loop over unstructured arrays causes _____ execution time as inputs grow.",
            "targetWord": "exponential",
            "hint": "Adjective: Compounding rapidly at a power curve",
            "options": [
              "exponential",
              "ubiquitous",
              "immutable",
              "paramount"
            ],
            "explanation": "Exponential time complexity leads to system freeze on large datasets."
          }
        ]
      }
    ]
  },
  {
    "id": "topic_5",
    "title": "Topic 5: Cloud Infrastructure & Resilience",
    "description": "Specialized vocabulary for cloud DevOps, high-availability clusters, failover, and distributed state.",
    "badge": "☁️ Cloud & DevOps",
    "words": [
      {
        "id": "w_provision",
        "word": "provision",
        "transcription": "[prəˈvɪʒ.ən]",
        "pos": "verb",
        "level": "B2",
        "definition": "To set up, configure, and allocate computing resources, virtual machines, or infrastructure for immediate operation.",
        "collocations": [
          "provision resources",
          "auto-provision",
          "provision infrastructure",
          "dynamically provision"
        ],
        "examples": [
          "Terraform allows teams to provision entire cloud environments using declarative Infrastructure as Code.",
          "When traffic spikes, the orchestrator automatically provisions additional worker nodes within seconds.",
          "Manually provisioning virtual servers is error-prone and has been replaced by automated pipelines."
        ],
        "challenges": [
          {
            "id": "ch_provision_1",
            "prompt": "We use Terraform to automatically _____ virtual machines, load balancers, and security groups in AWS.",
            "targetWord": "provision",
            "hint": "Verb: To set up, configure, and allocate cloud computing infrastructure",
            "options": [
              "provision",
              "replicate",
              "partition",
              "disrupt"
            ],
            "explanation": "To 'provision' means to allocate and initialize compute or storage resources."
          },
          {
            "id": "ch_provision_2",
            "prompt": "The auto-scaler was configured to _____ new container pods whenever CPU utilization exceeded 75%.",
            "targetWord": "provision",
            "hint": "Verb: Allocate and instantiate computing capacity on demand",
            "options": [
              "provision",
              "degrade",
              "saturate",
              "audit"
            ],
            "explanation": "Provisioning instances handles dynamic traffic surges."
          }
        ]
      },
      {
        "id": "w_failover",
        "word": "failover",
        "transcription": "[ˈfeɪlˌoʊ.vər]",
        "pos": "noun",
        "level": "C1",
        "definition": "An automated backup operational mode in which the functions of a failed primary system component are assumed by a secondary system.",
        "collocations": [
          "automatic failover",
          "trigger a failover",
          "seamless failover",
          "failover mechanism"
        ],
        "examples": [
          "When the primary database server lost power, automatic failover promoted the read replica to primary in 30 seconds.",
          "We tested disaster recovery failover during our annual maintenance window without dropping customer traffic.",
          "DNS failover automatically reroutes traffic to a secondary datacenter if health checks fail."
        ],
        "challenges": [
          {
            "id": "ch_failover_1",
            "prompt": "When the primary PostgreSQL node became unresponsive, the orchestrator executed an automatic _____ to the standby replica.",
            "targetWord": "failover",
            "hint": "Noun: Automatic switching from a failed component to a standby backup",
            "options": [
              "failover",
              "threshold",
              "partition",
              "saturation"
            ],
            "explanation": "'Failover' is the automated transfer of control to a standby instance upon primary failure."
          },
          {
            "id": "ch_failover_2",
            "prompt": "High availability architectures rely on seamless _____ to maintain 99.99% uptime during hardware outages.",
            "targetWord": "failover",
            "hint": "Noun: Backup redundancy switchover mechanism",
            "options": [
              "failover",
              "ephemeral",
              "degradation",
              "disruption"
            ],
            "explanation": "Automated failover guarantees business continuity."
          }
        ]
      },
      {
        "id": "w_isolation",
        "word": "isolation",
        "transcription": "[ˌaɪ.səˈleɪ.ʃən]",
        "pos": "noun",
        "level": "C1",
        "definition": "1. The separation of processes or resources to prevent interference. 2. The 'I' in ACID: ensuring concurrent transactions execute without interfering with one another.",
        "collocations": [
          "transaction isolation",
          "tenant isolation",
          "process isolation",
          "isolation level"
        ],
        "examples": [
          "In multi-tenant SaaS platforms, strict tenant data isolation is necessary to prevent data leakage.",
          "PostgreSQL supports multiple transaction isolation levels, including Read Committed and Serializable.",
          "Docker containers provide process isolation by leveraging Linux kernel namespaces and cgroups."
        ],
        "challenges": [
          {
            "id": "ch_isolation_1",
            "prompt": "Setting the transaction _____ level to Serializable eliminates phantom reads, but incurs higher lock contention.",
            "targetWord": "isolation",
            "hint": "Noun: Degree to which concurrent transactions or systems are kept independent and separated",
            "options": [
              "isolation",
              "saturation",
              "propagation",
              "failover"
            ],
            "explanation": "Transaction 'isolation' controls how concurrent operations see each other's mutations."
          },
          {
            "id": "ch_isolation_2",
            "prompt": "Containers enforce memory and CPU _____ so that a crashed process cannot bring down neighboring microservices.",
            "targetWord": "isolation",
            "hint": "Noun: Separation of computing resources to avoid interference",
            "options": [
              "isolation",
              "threshold",
              "degradation",
              "partition"
            ],
            "explanation": "Resource isolation prevents noisy neighbor issues."
          }
        ]
      },
      {
        "id": "w_ephemeral",
        "word": "ephemeral",
        "transcription": "[ɪˈfem.ər.əl]",
        "pos": "adjective",
        "level": "C1",
        "definition": "Lasting for a very short time; transient, temporary, and non-persistent.",
        "collocations": [
          "ephemeral storage",
          "ephemeral container",
          "ephemeral key",
          "ephemeral state"
        ],
        "examples": [
          "Kubernetes pods are ephemeral by design: they can be destroyed, restarted, or rescheduled at any moment.",
          "Never store persistent user files on the local filesystem of an ephemeral Docker container.",
          "Serverless AWS Lambda functions run in ephemeral execution environments that spin down after idle timeouts."
        ],
        "challenges": [
          {
            "id": "ch_ephemeral_1",
            "prompt": "Because container filesystems are strictly _____, any files saved locally will vanish the moment the pod restarts.",
            "targetWord": "ephemeral",
            "hint": "Adjective: Short-lived, temporary, and non-permanent in nature",
            "options": [
              "ephemeral",
              "immutable",
              "monolithic",
              "deterministic"
            ],
            "explanation": "'Ephemeral' storage vanishes when the compute instance stops running."
          },
          {
            "id": "ch_ephemeral_2",
            "prompt": "Cryptographic protocols generate an _____ session key that is used once and immediately destroyed after the call.",
            "targetWord": "ephemeral",
            "hint": "Adjective: Transient and discarded after temporary use",
            "options": [
              "ephemeral",
              "stale",
              "redundant",
              "suboptimal"
            ],
            "explanation": "Ephemeral keys enhance security by minimizing exposure windows."
          }
        ]
      },
      {
        "id": "w_replicate",
        "word": "replicate",
        "transcription": "[ˈrep.lɪ.keɪt]",
        "pos": "verb",
        "level": "B2",
        "definition": "To copy, duplicate, or reproduce data or a bug reliably across systems.",
        "collocations": [
          "replicate data",
          "replicate the bug",
          "replicate across regions",
          "master-replica"
        ],
        "examples": [
          "We replicate database writes across three availability zones to ensure zero data loss during regional outages.",
          "Before writing a patch, the QA engineer was asked to replicate the race condition on a staging server.",
          "Read-heavy systems replicate data to multiple read replicas to distribute query traffic."
        ],
        "challenges": [
          {
            "id": "ch_replicate_1",
            "prompt": "To handle millions of read requests without overwhelming the primary database, we _____ data across five read replicas.",
            "targetWord": "replicate",
            "hint": "Verb: To duplicate or copy data across multiple storage nodes",
            "options": [
              "replicate",
              "provision",
              "partition",
              "disrupt"
            ],
            "explanation": "To 'replicate' data means maintaining synchronized copies across servers."
          },
          {
            "id": "ch_replicate_2",
            "prompt": "A bug report is actionable only when developers can reliably _____ the unexpected behavior locally.",
            "targetWord": "replicate",
            "hint": "Verb: Reproduce or recreate a scenario or issue",
            "options": [
              "replicate",
              "saturate",
              "degrade",
              "audit"
            ],
            "explanation": "Replicating an issue is the prerequisite for fixing it."
          }
        ]
      },
      {
        "id": "w_propagation",
        "word": "propagation",
        "transcription": "[ˌprɒp.əˈɡeɪ.ʃən]",
        "pos": "noun",
        "level": "C1",
        "definition": "The transmission, spreading, or traveling of data, signals, or changes through a network or system.",
        "collocations": [
          "DNS propagation",
          "event propagation",
          "propagation delay",
          "signal propagation"
        ],
        "examples": [
          "After updating our nameservers, global DNS propagation took approximately four hours to complete.",
          "In distributed architectures, there is always a slight propagation delay before all read replicas reflect updates.",
          "Stopping DOM event propagation prevents child button clicks from firing parent container handlers."
        ],
        "challenges": [
          {
            "id": "ch_propagation_1",
            "prompt": "Changing our domain IP address required waiting for global DNS _____ across internet service providers.",
            "targetWord": "propagation",
            "hint": "Noun: The spreading or transmission of data changes through a distributed network",
            "options": [
              "propagation",
              "saturation",
              "isolation",
              "failover"
            ],
            "explanation": "'Propagation' describes how updates travel and become visible across a distributed network."
          },
          {
            "id": "ch_propagation_2",
            "prompt": "Eventual consistency systems incur a brief _____ delay between an event publication and downstream cache invalidation.",
            "targetWord": "propagation",
            "hint": "Noun: Transmission transit time across distributed components",
            "options": [
              "propagation",
              "threshold",
              "degradation",
              "partition"
            ],
            "explanation": "Propagation delays account for the latency window in eventual consistency."
          }
        ]
      },
      {
        "id": "w_threshold",
        "word": "threshold",
        "transcription": "[ˈθreʃ.hoʊld]",
        "pos": "noun",
        "level": "B2",
        "definition": "The point or level at which something begins, changes, or triggers a specific action.",
        "collocations": [
          "cross a threshold",
          "error threshold",
          "alert threshold",
          "set a threshold"
        ],
        "examples": [
          "When CPU utilization crossed the 80% threshold, our auto-scaler automatically spawned new server instances.",
          "The Circuit Breaker trips open if the error rate exceeds a 50% failure threshold within ten seconds.",
          "Setting alerting thresholds too low results in alert fatigue for on-call engineers."
        ],
        "challenges": [
          {
            "id": "ch_threshold_1",
            "prompt": "Our monitoring tool sends an emergency PagerDuty alert whenever 5xx server errors exceed the 1% _____.",
            "targetWord": "threshold",
            "hint": "Noun: A boundary or level that triggers an automated reaction or alert",
            "options": [
              "threshold",
              "saturation",
              "isolation",
              "propagation"
            ],
            "explanation": "A 'threshold' is a predefined metric value that activates an alert or scaling action."
          },
          {
            "id": "ch_threshold_2",
            "prompt": "If the failure rate remains below the designated _____, the Circuit Breaker stays in the Closed operational state.",
            "targetWord": "threshold",
            "hint": "Noun: Limit or triggering boundary value",
            "options": [
              "threshold",
              "failover",
              "partition",
              "disruption"
            ],
            "explanation": "The failure threshold determines when protective circuits open."
          }
        ]
      },
      {
        "id": "w_saturation",
        "word": "saturation",
        "transcription": "[ˌsætʃ.əˈreɪ.ʃən]",
        "pos": "noun",
        "level": "C1",
        "definition": "The state or degree to which something is completely filled or loaded to maximum capacity, unable to absorb more.",
        "collocations": [
          "resource saturation",
          "connection pool saturation",
          "network saturation",
          "reach saturation"
        ],
        "examples": [
          "Failing to close database connections led to complete pool saturation, causing all subsequent queries to timeout.",
          "Bandwidth saturation during the DDoS attack prevented legitimate customers from accessing the website.",
          "The USE method monitors systems by evaluating Utilization, Saturation, and Errors for every resource."
        ],
        "challenges": [
          {
            "id": "ch_saturation_1",
            "prompt": "When unclosed queries exhausted all 100 database connections, the connection pool reached complete _____.",
            "targetWord": "saturation",
            "hint": "Noun: The state of being 100% full to capacity with no headroom left",
            "options": [
              "saturation",
              "threshold",
              "isolation",
              "propagation"
            ],
            "explanation": "Resource 'saturation' means a pool or queue has zero remaining capacity."
          },
          {
            "id": "ch_saturation_2",
            "prompt": "High disk I/O _____ caused read requests to queue up, degrading server response times from 20ms to 4 seconds.",
            "targetWord": "saturation",
            "hint": "Noun: Maximum capacity utilization causing queue buildup",
            "options": [
              "saturation",
              "failover",
              "partition",
              "ephemeral"
            ],
            "explanation": "I/O saturation leads to severe queue delays."
          }
        ]
      },
      {
        "id": "w_degradation",
        "word": "degradation",
        "transcription": "[ˌdeɡ.rəˈdeɪ.ʃən]",
        "pos": "noun",
        "level": "C1",
        "definition": "The condition or process of declining to a lower quality, reduced functionality, or slower speed.",
        "collocations": [
          "graceful degradation",
          "performance degradation",
          "experience degradation",
          "prevent degradation"
        ],
        "examples": [
          "Graceful degradation ensures that if the search engine goes down, users can still view product categories.",
          "We observed severe performance degradation during the daily batch database backup.",
          "Thermal throttling causes CPU clock degradation to prevent physical chip damage from overheating."
        ],
        "challenges": [
          {
            "id": "ch_degradation_1",
            "prompt": "Designing for graceful _____ ensures that if the third-party recommendation service fails, the page still loads core product info.",
            "targetWord": "degradation",
            "hint": "Noun: Transition to a reduced or partially functional operational state",
            "options": [
              "degradation",
              "saturation",
              "isolation",
              "threshold"
            ],
            "explanation": "'Graceful degradation' allows partial system operation when secondary features fail."
          },
          {
            "id": "ch_degradation_2",
            "prompt": "A slow memory leak in the Node.js process triggered gradual performance _____ over the course of three days.",
            "targetWord": "degradation",
            "hint": "Noun: Progressive loss of speed, responsiveness, or quality",
            "options": [
              "degradation",
              "propagation",
              "failover",
              "partition"
            ],
            "explanation": "Performance degradation reflects worsening response times."
          }
        ]
      },
      {
        "id": "w_partition",
        "word": "partition",
        "transcription": "[pɑːrˈtɪʃ.ən]",
        "pos": "noun / verb",
        "level": "C1",
        "definition": "1. A division of a database or disk into distinct segments. 2. A network disruption separating nodes in a distributed cluster (network partition).",
        "collocations": [
          "network partition",
          "database partition",
          "partition tolerance",
          "partition the dataset"
        ],
        "examples": [
          "The CAP theorem states that a distributed system cannot simultaneously guarantee consistency and availability under a network partition.",
          "We partitioned our massive user table by creation year to keep B-Tree indexes small and fast.",
          "Kafka topics are divided into partitions to enable parallel consumption across worker groups."
        ],
        "challenges": [
          {
            "id": "ch_partition_1",
            "prompt": "According to the CAP theorem, when a network _____ separates two datacenters, the system must choose between consistency and availability.",
            "targetWord": "partition",
            "hint": "Noun: A communication breakdown that splits a cluster into disconnected subsets",
            "options": [
              "partition",
              "saturation",
              "threshold",
              "degradation"
            ],
            "explanation": "A 'network partition' prevents nodes from communicating with each other across regions."
          },
          {
            "id": "ch_partition_2",
            "prompt": "To handle billions of event records, we configured PostgreSQL to _____ the transactions table by calendar month.",
            "targetWord": "partition",
            "hint": "Verb: Divide a large dataset or disk into smaller manageable chunks",
            "options": [
              "partition",
              "provision",
              "replicate",
              "disrupt"
            ],
            "explanation": "Table partitioning divides massive tables into manageable chunks."
          }
        ]
      },
      {
        "id": "w_audit",
        "word": "audit",
        "transcription": "[ˈɔː.dɪt]",
        "pos": "noun / verb",
        "level": "B2",
        "definition": "A systematic, independent inspection and verification of a system, code, or security controls.",
        "collocations": [
          "security audit",
          "audit log",
          "conduct an audit",
          "pass the audit"
        ],
        "examples": [
          "Our fintech service maintains an immutable audit log recording every balance modification with timestamp and user ID.",
          "Independent security firms conduct annual penetration testing audits on our cloud infrastructure.",
          "An audit of unused AWS resources identified thousands of dollars in redundant compute costs."
        ],
        "challenges": [
          {
            "id": "ch_audit_1",
            "prompt": "For compliance with SOC 2 regulations, all administrative actions must be permanently recorded in an immutable _____ trail.",
            "targetWord": "audit",
            "hint": "Noun: Systematic inspection trail and record of actions",
            "options": [
              "audit",
              "threshold",
              "partition",
              "failover"
            ],
            "explanation": "An 'audit' log records security-relevant events for verification and compliance."
          },
          {
            "id": "ch_audit_2",
            "prompt": "Before launching the public cryptocurrency wallet, the team hired a top cybersecurity firm to _____ the smart contracts.",
            "targetWord": "audit",
            "hint": "Verb: Systematically inspect and verify code for security vulnerabilities",
            "options": [
              "audit",
              "replicate",
              "provision",
              "degrade"
            ],
            "explanation": "Auditing software validates security posture before deployment."
          }
        ]
      },
      {
        "id": "w_disruption",
        "word": "disruption",
        "transcription": "[dɪsˈrʌp.ʃən]",
        "pos": "noun",
        "level": "B2",
        "definition": "Interruption or disturbance to an ongoing system, process, or market.",
        "collocations": [
          "service disruption",
          "cause disruption",
          "minimize disruption",
          "market disruption"
        ],
        "examples": [
          "Deploying database schema migrations using Blue-Green releases minimized service disruption for end users.",
          "A power failure at the Frankfurt datacenter caused a minor service disruption for European customers.",
          "Good architects design self-healing systems that absorb unexpected disruptions without human intervention."
        ],
        "challenges": [
          {
            "id": "ch_disruption_1",
            "prompt": "Performing zero-downtime rolling deployments allowed us to update production services without causing any customer _____.",
            "targetWord": "disruption",
            "hint": "Noun: Interruption, outage, or disturbance to ongoing service",
            "options": [
              "disruption",
              "saturation",
              "threshold",
              "isolation"
            ],
            "explanation": "Minimizing 'disruption' preserves uptime and user workflows."
          },
          {
            "id": "ch_disruption_2",
            "prompt": "A severed transatlantic fiber optic cable caused significant network _____ for international banking APIs.",
            "targetWord": "disruption",
            "hint": "Noun: Breakdown or disturbance in network connectivity",
            "options": [
              "disruption",
              "propagation",
              "failover",
              "partition"
            ],
            "explanation": "Network disruptions interrupt normal communications."
          }
        ]
      }
    ]
  }
];

// Flattened list for backwards-compatibility with general vocabulary storage
window.VOCABULARY_DATA = window.TOPIC_VOCABULARY.flatMap(topic => {
  return topic.words.map(w => ({
    id: w.id,
    word: w.word,
    transcription: w.transcription,
    level: w.level,
    category: topic.id,
    categoryTitle: topic.title,
    pos: w.pos,
    definition: w.definition,
    collocations: w.collocations,
    examples: w.examples,
    ukr: w.definition, // English definition for English-first immersion
    whereToUse: w.definition,
    example: w.examples[0],
    challenges: w.challenges
  }));
});
