// ============================================================================
// GUIDED ENGLISH MASTERY ROADMAP (B1 ➔ C2 SENIOR TECH FLUENCY)
// Complete 6-Stage, 36-Milestone Interactive Skill Tree & Interactive Practice Arena
// ============================================================================

const ROADMAP_DATA = {
  stages: [
  {
    "id": "stage_1",
    "number": 1,
    "title": "Stage 1: Syntax Architecture & Time Geometry",
    "level": "A2 ➔ B1 Foundations",
    "description": "Eliminate native Ukrainian word-order interference, master verb timing, and establish bulletproof technical sentence structures.",
    "badge": "Stage 1",
    "color": "#38bdf8",
    "milestones": [
      {
        "id": "m_1_1",
        "stageId": "stage_1",
        "number": "1.1",
        "title": "The SVOMPT Golden Law",
        "category": "Syntax Order",
        "icon": "📐",
        "estimatedTime": "25 mins",
        "xp": 60,
        "level": "A2 ➔ B1",
        "tagline": "Master the strict English word order hierarchy: Subject + Verb + Object + Manner + Place + Time.",
        "whyItMatters": "Ukrainian allows flexible word order due to case inflections. English relies more strongly on word order, alongside verb forms, prepositions and context. A neutral sentence pattern helps make technical updates clear.",
        "learnContent": {
          "summary": "SVOMPT is a useful neutral pattern: Subject + Verb + Object + Manner + Place + Time. Adverbs can also occur before the main verb, and place/time ordering can vary with emphasis.",
          "formula": "Subject ➔ Verb ➔ Object ➔ Manner ➔ Place ➔ Time",
          "rules": [
            "For a clear neutral sentence, keep the verb and object together: 'I deployed the code carefully'. 'I carefully deployed the code' is also natural.",
            "Place often precedes time in neutral descriptions: 'We met at the office yesterday'. 'We met yesterday at the office' is also grammatical with a different emphasis.",
            "Fronting time is allowed only for narrative framing: 'Yesterday, we deployed the hotfix.'"
          ],
          "badVsGood": {
            "bad": "We discussed thoroughly yesterday the architecture in our room.",
            "good": "We discussed the architecture thoroughly in our room yesterday.",
            "explanation": "Verb 'discussed' must stay with object 'the architecture'. Manner 'thoroughly' comes next, followed by place 'in our room', and time 'yesterday' anchors the end."
          },
          "ukrainianTrap": "In Ukrainian, you can say 'Ми вчора ретельно обговорили архітектуру'. In English, inserting adverbs between verb and object ('discussed thoroughly the architecture') is a direct grammar violation."
        },
        "interactivePractice": {
          "sentenceBuilder": {
            "prompt": "Arrange in strict SVOMPT order: 'Our team / refactored / the legacy authentication service / cleanly / in production / yesterday.'",
            "words": [
              "Our team",
              "refactored",
              "the legacy authentication service",
              "cleanly",
              "in production",
              "yesterday"
            ],
            "target": "Our team refactored the legacy authentication service cleanly in production yesterday",
            "hint": "Remember: Who (Subject) + Action (Verb) + What (Object) + How (Manner) + Where (Place) + When (Time)."
          },
          "inputDrill": {
            "sentenceBefore": "The DevOps engineer deployed",
            "missingWord": "the microservice securely",
            "sentenceAfter": "to the cluster this morning.",
            "hint": "Verb 'deployed' needs direct object first, then manner adverb 'securely'.",
            "explanation": "You must keep 'the microservice' (object) attached to 'deployed', immediately followed by 'securely' (manner)."
          },
          "deepQuiz": {
            "question": "Which sentence adheres strictly to professional English syntax?",
            "options": [
              "We reviewed thoroughly yesterday in the conference room all pull requests.",
              "We reviewed all pull requests thoroughly in the conference room yesterday.",
              "We yesterday reviewed thoroughly all pull requests in the conference room.",
              "We reviewed in the conference room yesterday all pull requests thoroughly."
            ],
            "correctIndex": 1,
            "explanation": "Option 2 follows SVOMPT perfectly: Subject (We) + Verb (reviewed) + Object (all pull requests) + Manner (thoroughly) + Place (in the conference room) + Time (yesterday)."
          },
          "speakingSimulation": {
            "prompt": "Explain to your team what you refactored yesterday using SVOMPT.",
            "collocations": [
              "refactored the module cleanly",
              "deployed to staging yesterday",
              "tested the endpoints thoroughly"
            ],
            "sampleNativeAnswer": "Yesterday morning, I refactored the caching layer cleanly in the staging environment before running the load tests."
          }
        },
        "checklist": [
          {
            "id": "c_m_1_1_1",
            "text": "Study the The SVOMPT Golden Law formula & contrastive rules"
          },
          {
            "id": "c_m_1_1_2",
            "text": "Complete the interactive Sentence Builder & Input Drill"
          },
          {
            "id": "c_m_1_1_3",
            "text": "Pass the deep technical challenge quiz with 100% accuracy"
          }
        ],
        "actionTarget": {
          "tab": "practice",
          "practiceMode": "sentences",
          "title": "Sentence Builder Arena",
          "buttonText": "🧩 Launch Sentence Builder"
        },
        "targetVocabulary": [
          {
            "term": "the microservice securely",
            "pos": "Direct Object + Manner Adverb",
            "definition": "Object noun phrase + manner adverb strictly attached to the transitive verb 'deployed'.",
            "example": "The DevOps engineer deployed the microservice securely to the cluster this morning.",
            "usageTip": "Never split the transitive verb from its object: avoid 'deployed securely the microservice'."
          },
          {
            "term": "refactored cleanly",
            "pos": "Verb + Manner Adverb",
            "definition": "Restructuring code to eliminate complexity without breaking functional contracts.",
            "example": "Our team refactored the legacy authentication service cleanly in production yesterday.",
            "usageTip": "Place adverbs of manner immediately after the object or at the clause boundary."
          },
          {
            "term": "thoroughly in the conference room",
            "pos": "Manner + Place",
            "definition": "Adverb of manner followed by the location prepositional phrase.",
            "example": "We reviewed all pull requests thoroughly in the conference room yesterday.",
            "usageTip": "Follow the SVOMPT hierarchy: Manner precedes Place, and Place precedes Time."
          },
          {
            "term": "in production yesterday",
            "pos": "Place + Time",
            "definition": "Environment location anchored by the terminal temporal timestamp.",
            "example": "We deployed the hotfix in production yesterday evening.",
            "usageTip": "Time anchors the very end of the clause unless fronted for narrative framing."
          }
        ]
      },
      {
        "id": "m_1_2",
        "stageId": "stage_1",
        "number": "1.2",
        "title": "Past Simple vs Present Perfect: The Marichka Principle",
        "category": "Tense Architecture",
        "icon": "⏱️",
        "estimatedTime": "30 mins",
        "xp": 65,
        "level": "A2 ➔ B1",
        "tagline": "Understand calendar timestamps (Past Simple) vs current system status & fresh outcomes (Present Perfect).",
        "whyItMatters": "Saying 'I solved the bug yesterday' (Past Simple) communicates a finished historical event. Saying 'I have resolved the bug' (Present Perfect) communicates that the bug is fixed right now and ready for review. Confusing them causes misunderstanding in status updates.",
        "learnContent": {
          "summary": "Past Simple requires a specific or implied finished time window (yesterday, in sprint 4, 10 minutes ago). Present Perfect connects the past to the present without a finished time marker (already, yet, just, recently, so far).",
          "formula": "Past Simple = V2 / did not + V1 | Present Perfect = have/has + V3",
          "rules": [
            "Never use Present Perfect with specific past time markers: 'I have finished it yesterday' ❌ ➔ 'I finished it yesterday' ✅.",
            "Use Present Perfect for current status updates: 'We have provisioned the new database instances.'",
            "In questions, 'Did you run tests?' asks about a past session; 'Have you run tests?' asks if test results are available now."
          ],
          "badVsGood": {
            "bad": "I have created the pull request two hours ago, but nobody reviewed it yet.",
            "good": "I created the pull request two hours ago, but nobody has reviewed it yet.",
            "explanation": "'Two hours ago' is a specific finished past timestamp (requires Past Simple 'created'). 'Yet' refers to status up to the present; Present Perfect is a natural choice here. Past Simple with yet is also common in American English."
          },
          "ukrainianTrap": "Ukrainian uses the past tense 'зробив' for both situations ('Я зробив це вчора' vs 'Я вже зробив це'). In English, the presence of current relevance fundamentally alters the tense family."
        },
        "interactivePractice": {
          "sentenceBuilder": {
            "prompt": "Assemble the status update: 'Our DevOps team / has already mitigated / the vulnerability / across all production nodes.'",
            "words": [
              "Our DevOps team",
              "has already mitigated",
              "the vulnerability",
              "across all production nodes"
            ],
            "target": "Our DevOps team has already mitigated the vulnerability across all production nodes",
            "hint": "Subject + auxiliary verb + adverb + past participle + object + location."
          },
          "inputDrill": {
            "sentenceBefore": "We",
            "missingWord": "have already merged",
            "sentenceAfter": "the hotfix, so you can pull the latest main branch now.",
            "hint": "Use Present Perfect of 'merge' with 'already'.",
            "explanation": "Because the outcome directly affects what the colleague can do now, Present Perfect ('have already merged') is the correct choice."
          },
          "deepQuiz": {
            "question": "Which sentence is grammatically correct in a daily standup meeting?",
            "options": [
              "I have deployed the release yesterday at 5 PM.",
              "I deployed the release yesterday at 5 PM, and QA has already verified it.",
              "I have already deploy the release yesterday.",
              "I did deployed the release, but QA didn't verified it yet."
            ],
            "correctIndex": 1,
            "explanation": "Option 2 correctly pairs Past Simple ('deployed') with the past timestamp 'yesterday at 5 PM', and Present Perfect ('has already verified') with the current status marker 'already'."
          },
          "speakingSimulation": {
            "prompt": "Give a 30-second standup update: state one task you finished yesterday and one result you have achieved today.",
            "collocations": [
              "finished the schema migration yesterday",
              "have implemented the rate limiter",
              "haven't received QA feedback yet"
            ],
            "sampleNativeAnswer": "Yesterday, I completed the schema migration for user profiles, and so far today, I have implemented the rate-limiting middleware on the API gateway."
          }
        },
        "checklist": [
          {
            "id": "c_m_1_2_1",
            "text": "Study the Past Simple vs Present Perfect: The Marichka Principle formula & contrastive rules"
          },
          {
            "id": "c_m_1_2_2",
            "text": "Complete the interactive Sentence Builder & Input Drill"
          },
          {
            "id": "c_m_1_2_3",
            "text": "Pass the deep technical challenge quiz with 100% accuracy"
          }
        ],
        "actionTarget": {
          "tab": "grammar",
          "practiceMode": "marichka",
          "title": "Past vs Perfect Matrix",
          "buttonText": "⚡ Open Marichka Matrix"
        },
        "targetVocabulary": [
          {
            "term": "have already merged",
            "pos": "Present Perfect Verb Phrase",
            "definition": "Action completed at an unspecified past moment with direct relevance to current status.",
            "example": "We have already merged the hotfix, so you can pull the latest main branch now.",
            "usageTip": "Do not pair Present Perfect with specific finished past timestamps like 'yesterday' or 'at 3 PM'."
          },
          {
            "term": "completed the migration yesterday",
            "pos": "Past Simple + Finished Timestamp",
            "definition": "Historical finished action tied to a completed calendar window.",
            "example": "Yesterday, I completed the schema migration for user profiles.",
            "usageTip": "Use Past Simple whenever a specific calendar time or finished event is stated."
          },
          {
            "term": "mitigated the vulnerability",
            "pos": "Technical Collocation",
            "definition": "Eliminating or reducing a security vulnerability to an acceptable threshold.",
            "example": "Our DevOps team has already mitigated the vulnerability across all production nodes.",
            "usageTip": "Standard cybersecurity terminology for resolving CVE exposures."
          },
          {
            "term": "connection pool exhaustion",
            "pos": "Architecture Noun Phrase",
            "definition": "Failure state where all database connections are occupied, starving new queries.",
            "example": "Repeated unindexed queries caused severe connection pool exhaustion.",
            "usageTip": "Use 'exhaustion' or 'starvation' rather than informal 'running out of connections'."
          }
        ]
      },
      {
        "id": "m_1_3",
        "stageId": "stage_1",
        "number": "1.3",
        "title": "Active vs Passive Voice in Architecture Docs & Commits",
        "category": "Technical Style",
        "icon": "📝",
        "estimatedTime": "25 mins",
        "xp": 60,
        "level": "A2 ➔ B1",
        "tagline": "Learn when to take engineering ownership (Active) and when to focus on the system state (Passive).",
        "whyItMatters": "Junior engineers overuse passive voice to avoid taking responsibility or mimic bad academic texts ('Errors were found'). Senior engineers use active voice for ownership and clear causality ('We identified a race condition') and passive voice when the actor is irrelevant ('Tokens are encrypted with AES-256').",
        "learnContent": {
          "summary": "Active voice highlights the actor and action (Subject + Verb + Object). Passive voice highlights the recipient of the action (Object + be + V3 + by Actor). Use active for commit messages and ownership; use passive for architectural specifications and security properties.",
          "formula": "Active: Subject + Verb + Object | Passive: Object + be + V3",
          "rules": [
            "Git commits use active imperative: 'Fix race condition in session handler' (not 'Race condition was fixed').",
            "Security specs use passive: 'Passwords are salted and hashed using bcrypt before storage.'",
            "Incident postmortems use active for team ownership: 'We misconfigured the firewall rule during deployment.'"
          ],
          "badVsGood": {
            "bad": "The database was crashed by us because queries were badly written by the team.",
            "good": "Unindexed queries overwhelmed the database and triggered connection pool exhaustion.",
            "explanation": "Active voice with system components as subjects clearly identifies cause and effect without clumsy passive constructions."
          },
          "ukrainianTrap": "Ukrainian developers frequently translate 'було зроблено' as passive voice everywhere. In modern technical English, direct, concise active verbs are preferred for clarity."
        },
        "interactivePractice": {
          "sentenceBuilder": {
            "prompt": "Construct the architecture specification: 'Sensitive authentication tokens / are encrypted / with AES-GCM-256 / before / being stored in Redis.'",
            "words": [
              "Sensitive authentication tokens",
              "are encrypted",
              "with AES-GCM-256",
              "before",
              "being stored in Redis"
            ],
            "target": "Sensitive authentication tokens are encrypted with AES-GCM-256 before being stored in Redis",
            "hint": "Passive subject + passive verb 'are encrypted' + instrument + time clause."
          },
          "inputDrill": {
            "sentenceBefore": "To prevent unauthorized tampering, all incoming webhooks",
            "missingWord": "are verified",
            "sentenceAfter": "using HMAC cryptographic signatures.",
            "hint": "Passive present simple of 'verify' for plural 'webhooks'.",
            "explanation": "System rules use Present Passive ('are verified') because the focus is on the state of the webhooks, not who authored the verification."
          },
          "deepQuiz": {
            "question": "Which sentence follows the standard Git commit convention?",
            "options": [
              "Bug in authentication was resolved by adding null check.",
              "Added null check to resolve authentication bug.",
              "Add null check to resolve null pointer exception in auth service.",
              "Authentication bug has been resolved."
            ],
            "correctIndex": 2,
            "explanation": "Git commits require imperative active voice: 'Add null check...' (tells what the commit does when applied)."
          },
          "speakingSimulation": {
            "prompt": "Describe a security feature of your application using both active and passive voice appropriately.",
            "collocations": [
              "are hashed and salted",
              "we enforce multi-factor authentication",
              "payloads are decrypted at the ingress gateway"
            ],
            "sampleNativeAnswer": "We enforce multi-factor authentication on all admin endpoints, and user credentials are encrypted at rest using KMS-managed keys."
          }
        },
        "checklist": [
          {
            "id": "c_m_1_3_1",
            "text": "Study the Active vs Passive Voice in Architecture Docs & Commits formula & contrastive rules"
          },
          {
            "id": "c_m_1_3_2",
            "text": "Complete the interactive Sentence Builder & Input Drill"
          },
          {
            "id": "c_m_1_3_3",
            "text": "Pass the deep technical challenge quiz with 100% accuracy"
          }
        ],
        "actionTarget": {
          "tab": "practice",
          "practiceMode": "errors",
          "title": "Error Hunter",
          "buttonText": "🎯 Spot Passive Errors"
        },
        "targetVocabulary": [
          {
            "term": "are verified",
            "pos": "Present Simple Passive",
            "definition": "Passive voice expressing a continuous architectural property or security rule.",
            "example": "To prevent unauthorized tampering, all incoming webhooks are verified using HMAC signatures.",
            "usageTip": "Use passive voice in specifications where the actor is secondary to the system property."
          },
          {
            "term": "sensitive authentication tokens",
            "pos": "Noun Phrase",
            "definition": "Cryptographic tokens (JWT, OAuth bearer) that grant authenticated API access.",
            "example": "Sensitive authentication tokens are encrypted with AES-GCM-256 before storage.",
            "usageTip": "Treat as plural noun phrase; verbs must conjugate as plural ('are encrypted')."
          },
          {
            "term": "overwhelmed the database",
            "pos": "Active Transitive Predicate",
            "definition": "Active voice assigning direct causal responsibility to system components.",
            "example": "Unindexed queries overwhelmed the database and triggered connection timeouts.",
            "usageTip": "Use active voice to express direct causality in postmortems and commit summaries."
          },
          {
            "term": "encrypted with AES-GCM-256",
            "pos": "Passive Participle + Instrument",
            "definition": "Authenticated symmetric cipher encryption applied to data payloads.",
            "example": "All customer records are encrypted with AES-GCM-256 at rest.",
            "usageTip": "Use preposition 'with' for algorithms/instruments, 'by' for authors/actors."
          }
        ]
      },
      {
        "id": "m_1_4",
        "stageId": "stage_1",
        "number": "1.4",
        "title": "Prepositions of Time, Infrastructure & Scope",
        "category": "Prepositions & Nuance",
        "icon": "📍",
        "estimatedTime": "25 mins",
        "xp": 55,
        "level": "A2 ➔ B1",
        "tagline": "Master precision with 'at', 'on', 'in', 'by', 'within', and 'throughout' across infrastructure contexts.",
        "whyItMatters": "Saying 'in the server' vs 'on the server', or 'by Friday' vs 'until Friday' causes real project miscommunications. 'By Friday' means deadline before Friday; 'until Friday' means continuous action stopping on Friday.",
        "learnContent": {
          "summary": "Infrastructure: 'on a server/node/instance', 'in a database/container/memory', 'at an endpoint/URL'. Time: 'by' = deadline (not later than), 'within' = timeframe window, 'at' = exact timestamp, 'on' = day/date, 'in' = month/year/duration.",
          "formula": "on the server | in the container/DB | at the endpoint | by the deadline",
          "rules": [
            "Never say 'in the server'; say 'on the server' (virtual/physical host).",
            "Say 'in memory', 'in the database', 'in the cache' (enclosed data storage).",
            "'By 5 PM' means at or before 5 PM. 'Until 5 PM' means continuing continuously up to 5 PM."
          ],
          "badVsGood": {
            "bad": "We will deploy in the production server until Monday within 10 AM.",
            "good": "We will deploy to the production server by Monday at 10 AM.",
            "explanation": "'To/on' is used for servers; 'by' denotes the final deadline; 'at' designates exact clock time."
          },
          "ukrainianTrap": "Ukrainian uses 'на' or 'до' interchangeably, leading developers to say 'We need this until tomorrow' when they actually mean 'by tomorrow'."
        },
        "interactivePractice": {
          "sentenceBuilder": {
            "prompt": "Build the SLA commitment sentence: 'All background jobs / must complete / within five seconds / on every worker node / by midnight.'",
            "words": [
              "All background jobs",
              "must complete",
              "within five seconds",
              "on every worker node",
              "by midnight"
            ],
            "target": "All background jobs must complete within five seconds on every worker node by midnight",
            "hint": "Subject + verb + duration window (within) + host (on) + deadline (by)."
          },
          "inputDrill": {
            "sentenceBefore": "The microservice stores session state",
            "missingWord": "in memory",
            "sentenceAfter": "rather than persisting it to disk.",
            "hint": "Which preposition precedes 'memory' for RAM storage?",
            "explanation": "RAM storage is conceptually an internal environment, so we use 'in memory'."
          },
          "deepQuiz": {
            "question": "The client asks: 'When can we expect the security patch deployed?' What is the correct response for a deadline?",
            "options": [
              "We will deploy the patch until 4:00 PM.",
              "We will deploy the patch by 4:00 PM today.",
              "We will deploy the patch on 4:00 PM.",
              "We will deploy the patch inside 4:00 PM."
            ],
            "correctIndex": 1,
            "explanation": "'By 4:00 PM' indicates that the deployment will be completed no later than 4:00 PM."
          },
          "speakingSimulation": {
            "prompt": "Set expectations with a project manager regarding an infrastructure upgrade timeline.",
            "collocations": [
              "deployed on the staging cluster",
              "resolved by the end of the sprint",
              "processed within 200 milliseconds"
            ],
            "sampleNativeAnswer": "The migration script will execute on the primary database by 6:00 PM, and all queries should execute within 15 milliseconds."
          }
        },
        "checklist": [
          {
            "id": "c_m_1_4_1",
            "text": "Study the Prepositions of Time, Infrastructure & Scope formula & contrastive rules"
          },
          {
            "id": "c_m_1_4_2",
            "text": "Complete the interactive Sentence Builder & Input Drill"
          },
          {
            "id": "c_m_1_4_3",
            "text": "Pass the deep technical challenge quiz with 100% accuracy"
          }
        ],
        "actionTarget": {
          "tab": "practice",
          "practiceMode": "quizzes",
          "title": "Grammar Quizzes",
          "buttonText": "🎯 Test Preposition Accuracy"
        },
        "targetVocabulary": [
          {
            "term": "in memory",
            "pos": "Prepositional Collocation",
            "definition": "Stored in volatile RAM rather than persisted to persistent disk storage.",
            "example": "The microservice stores session state in memory rather than persisting it to disk.",
            "usageTip": "Always use 'in memory' (never 'on memory' or 'inside memory')."
          },
          {
            "term": "on every worker node",
            "pos": "Prepositional Infrastructure Collocation",
            "definition": "Operating across physical or virtual compute host instances.",
            "example": "All background jobs must complete within five seconds on every worker node.",
            "usageTip": "Use 'on the server / on the node / on the host' (never 'in the server')."
          },
          {
            "term": "by midnight",
            "pos": "Preposition of Deadline",
            "definition": "At or before the specified deadline boundary.",
            "example": "The security patch must be deployed across all regions by midnight.",
            "usageTip": "'By' means not later than; 'until' means continuous action stopping at that time."
          },
          {
            "term": "within five seconds",
            "pos": "Preposition of Duration / SLA Window",
            "definition": "Execution completed before the elapsed time threshold expires.",
            "example": "All payment webhooks must respond with HTTP 200 within five seconds.",
            "usageTip": "Use 'within' for SLA timeout guarantees and latency budgets."
          }
        ]
      },
      {
        "id": "m_1_5",
        "stageId": "stage_1",
        "number": "1.5",
        "title": "Direct vs Indirect Questions in Technical Collaboration",
        "category": "Spoken Collaboration",
        "icon": "❓",
        "estimatedTime": "25 mins",
        "xp": 60,
        "level": "A2 ➔ B1",
        "tagline": "Transform blunt interrogatives into polite, collaborative technical inquiries with indirect syntax.",
        "whyItMatters": "Blunt direct questions like 'Where is the documentation?' or 'Why did you change this?' sound aggressive or accusatory in English. Senior engineers use indirect framing: 'Could you clarify where the documentation is located?' or 'I was wondering what the rationale was for this change.'",
        "learnContent": {
          "summary": "Indirect questions embed an inquiry inside an introductory phrase ('Could you tell me...', 'Do you know if...', 'I was wondering whether...'). Crucially, the word order returns to affirmative (Subject + Verb), with NO auxiliary 'do/does/did'.",
          "formula": "Polite Intro + question word/if + Subject + Verb",
          "rules": [
            "Never invert subject and verb in the embedded clause: 'Do you know where is the API?' ❌ ➔ 'Do you know where the API is?' ✅.",
            "Drop auxiliary 'did' and conjugate the main verb: 'Can you tell me how did you fix it?' ❌ ➔ 'Can you tell me how you fixed it?' ✅.",
            "Use 'whether' or 'if' for yes/no inquiries: 'Do you know if the build succeeded?'"
          ],
          "badVsGood": {
            "bad": "Why you did not include the unit tests in this PR?",
            "good": "Could you help me understand why the unit tests were omitted in this PR?",
            "explanation": "Indirect framing turns an interrogation into a collaborative, constructive request for context."
          },
          "ukrainianTrap": "In Ukrainian, intonation alone signals a question. In English, direct questions require auxiliary inversion, and indirect questions require reverting back to declarative order. Double inversion is a very common bug."
        },
        "interactivePractice": {
          "sentenceBuilder": {
            "prompt": "Form the polite indirect inquiry: 'Could you please clarify / how / the gateway handles / expired JWT tokens?'",
            "words": [
              "Could you please clarify",
              "how",
              "the gateway handles",
              "expired JWT tokens?"
            ],
            "target": "Could you please clarify how the gateway handles expired JWT tokens?",
            "hint": "Polite stem + question word 'how' + Subject 'the gateway' + Verb 'handles' + Object."
          },
          "inputDrill": {
            "sentenceBefore": "Do you happen to know where",
            "missingWord": "the configuration file is stored",
            "sentenceAfter": "on this environment?",
            "hint": "Declarative word order: subject + verb (no inversion).",
            "explanation": "In indirect questions, the clause is affirmative: 'where [the configuration file] [is stored]'."
          },
          "deepQuiz": {
            "question": "Which of the following is the most professional way to ask a colleague about a failing endpoint?",
            "options": [
              "Why is failing this endpoint right now?",
              "Could you check why is the endpoint failing?",
              "Could you clarify why the endpoint is currently failing?",
              "Tell me why did the endpoint fail yesterday."
            ],
            "correctIndex": 2,
            "explanation": "Option 3 uses polite introductory framing with correct affirmative word order ('why the endpoint is currently failing')."
          },
          "speakingSimulation": {
            "prompt": "Ask your lead during a PR review why a specific third-party library was chosen over the in-house utility.",
            "collocations": [
              "I was wondering what guided the decision",
              "could you walk me through the trade-offs",
              "I'd appreciate some context on"
            ],
            "sampleNativeAnswer": "I was wondering if you could walk me through the decision to introduce this third-party library rather than extending our existing utility."
          }
        },
        "checklist": [
          {
            "id": "c_m_1_5_1",
            "text": "Study the Direct vs Indirect Questions in Technical Collaboration formula & contrastive rules"
          },
          {
            "id": "c_m_1_5_2",
            "text": "Complete the interactive Sentence Builder & Input Drill"
          },
          {
            "id": "c_m_1_5_3",
            "text": "Pass the deep technical challenge quiz with 100% accuracy"
          }
        ],
        "actionTarget": {
          "tab": "practice",
          "practiceMode": "sentences",
          "title": "Sentence Builder",
          "buttonText": "🧩 Assemble Indirect Inquiries"
        },
        "targetVocabulary": [
          {
            "term": "the configuration file is stored",
            "pos": "Indirect Affirmative Word Order",
            "definition": "Subject + verb clause embedded inside an indirect inquiry without inversion.",
            "example": "Do you happen to know where the configuration file is stored on this environment?",
            "usageTip": "Never invert subject and verb in indirect questions: avoid 'where is stored the file'."
          },
          {
            "term": "could you please clarify",
            "pos": "Diplomatic Inquiry Formula",
            "definition": "Polite senior engineering opening to request technical context without aggression.",
            "example": "Could you please clarify how the gateway handles expired JWT tokens?",
            "usageTip": "Replaces blunt questions like 'Why does the gateway crash?' with collaborative phrasing."
          },
          {
            "term": "walk me through the rationale",
            "pos": "Collaborative Request Collocation",
            "definition": "Asking a colleague to explain the architectural trade-offs behind a decision.",
            "example": "I'd appreciate it if you could walk me through the rationale for choosing this library.",
            "usageTip": "Professional code review idiom signaling curiosity rather than objection."
          },
          {
            "term": "handles expired JWT tokens",
            "pos": "Predicate Phrase",
            "definition": "System behavior when receiving an expired JSON Web Token.",
            "example": "Could you clarify how the ingress controller handles expired JWT tokens?",
            "usageTip": "Notice singular third-person 'handles' matching subject 'the gateway'."
          }
        ]
      },
      {
        "id": "m_1_6",
        "stageId": "stage_1",
        "number": "1.6",
        "title": "Comparatives & Quantifiers in Performance Tuning",
        "category": "Metrics & Benchmarks",
        "icon": "📊",
        "estimatedTime": "25 mins",
        "xp": 60,
        "level": "A2 ➔ B1",
        "tagline": "Quantify benchmarks accurately: 'twice as fast', 'orders of magnitude lower', 'substantially less overhead'.",
        "whyItMatters": "Phrases like 'This is more better fast' or 'It takes two times less time' sound amateur. Native technical discourse uses precise comparative structures: 'twice as fast', 'reduces latency by 45%', 'orders of magnitude more scalable'.",
        "learnContent": {
          "summary": "Multipliers: 'twice as fast as', 'three times faster than', 'half the memory footprint'. Comparisons of degree: 'substantially', 'significantly', 'considerably', 'marginally'. Negative comparisons: 'far less resource-intensive'.",
          "formula": "X times + comparative (-er/more) + than | by [percentage/amount]",
          "rules": [
            "Never say 'two times more fast'; say 'twice as fast' or 'two times faster'.",
            "Avoid 'two times less time'; say 'half the time' or 'a 50% reduction in execution time'.",
            "Use 'orders of magnitude' to describe 10x, 100x, or 1000x architectural improvements."
          ],
          "badVsGood": {
            "bad": "The new query is more much fast and takes two times less CPU.",
            "good": "The refactored query is substantially faster and consumes half the CPU cycles.",
            "explanation": "'Substantially faster' and 'half the CPU cycles' are idiomatic, mathematically precise senior engineering descriptions."
          },
          "ukrainianTrap": "Ukrainian speakers directly translate 'у два рази менше' as 'two times less', which confuses English speakers. Use 'half as much', 'a 50% decrease', or 'cut by half'."
        },
        "interactivePractice": {
          "sentenceBuilder": {
            "prompt": "Construct the benchmark report: 'The new caching mechanism / delivers / three times higher throughput / than / the legacy implementation.'",
            "words": [
              "The new caching mechanism",
              "delivers",
              "three times higher throughput",
              "than",
              "the legacy implementation"
            ],
            "target": "The new caching mechanism delivers three times higher throughput than the legacy implementation",
            "hint": "Subject + verb + multiplier comparative phrase + than + baseline."
          },
          "inputDrill": {
            "sentenceBefore": "By introducing batch fetching, we made the checkout flow",
            "missingWord": "twice as fast",
            "sentenceAfter": "and reduced database trips significantly.",
            "hint": "Two words: multiplier 'twice' + 'as fast'.",
            "explanation": "'Twice as fast' is the standard, natural comparative idiom for a 2x performance speedup."
          },
          "deepQuiz": {
            "question": "Which sentence describes a 50% reduction in query latency most professionally?",
            "options": [
              "The query latency is two times lesser now.",
              "The query latency has been cut in half, dropping from 200ms to 100ms.",
              "We made the query two times more little slow.",
              "The query is half times less latency."
            ],
            "correctIndex": 1,
            "explanation": "'Has been cut in half, dropping from X to Y' is precise, professional, and clear to technical leadership."
          },
          "speakingSimulation": {
            "prompt": "Present the performance gains of your latest PR to the engineering manager.",
            "collocations": [
              "orders of magnitude faster",
              "cut memory consumption by half",
              "substantially lower p99 latency"
            ],
            "sampleNativeAnswer": "After replacing the linear search with an indexed map lookup, p99 response times dropped by 70%, and memory usage was cut in half."
          }
        },
        "checklist": [
          {
            "id": "c_m_1_6_1",
            "text": "Study the Comparatives & Quantifiers in Performance Tuning formula & contrastive rules"
          },
          {
            "id": "c_m_1_6_2",
            "text": "Complete the interactive Sentence Builder & Input Drill"
          },
          {
            "id": "c_m_1_6_3",
            "text": "Pass the deep technical challenge quiz with 100% accuracy"
          }
        ],
        "actionTarget": {
          "tab": "practice",
          "practiceMode": "sentences",
          "title": "Practice Arena",
          "buttonText": "🧩 Assemble Comparative Benchmarks"
        },
        "targetVocabulary": [
          {
            "term": "twice as fast",
            "pos": "Multiplier Comparative Idiom",
            "definition": "Two times faster (a 50% reduction in execution time or double throughput).",
            "example": "By introducing batch fetching, we made the checkout flow twice as fast.",
            "usageTip": "Never say 'two times more fast'; say 'twice as fast' or 'two times faster'."
          },
          {
            "term": "three times higher throughput",
            "pos": "Quantified Metric Comparative",
            "definition": "Achieving 300% requests per second compared to the previous baseline.",
            "example": "The new caching mechanism delivers three times higher throughput than the legacy code.",
            "usageTip": "Use 'three times higher / three times greater' for throughput and bandwidth."
          },
          {
            "term": "cut in half",
            "pos": "Idiomatic Reduction Expression",
            "definition": "Decreased by exactly fifty percent.",
            "example": "The query latency has been cut in half, dropping from 200ms to 100ms.",
            "usageTip": "Replaces awkward non-native phrasing like 'it became two times less time'."
          },
          {
            "term": "orders of magnitude lower",
            "pos": "Exponential Scale Comparative",
            "definition": "A 10x, 100x, or 1000x architectural performance improvement.",
            "example": "Memory consumption is orders of magnitude lower following the hash map refactoring.",
            "usageTip": "Use 'orders of magnitude' to highlight dramatic algorithmic breakthroughs."
          }
        ]
      }
    ]
  },
  {
    "id": "stage_2",
    "number": 2,
    "title": "Stage 2: High-Load Performance & Technical Vocabulary",
    "level": "B1 ➔ B2 Engineering Core",
    "description": "Master deep backend terminology: N+1 query batching, garbage collection, memory leaks, latency vs throughput, and caching topologies.",
    "badge": "Stage 2",
    "color": "#10b981",
    "milestones": [
      {
        "id": "m_2_1",
        "stageId": "stage_2",
        "number": "2.1",
        "title": "The N+1 Query Disaster & Batch Data Fetching",
        "category": "Database Optimization",
        "icon": "⚡",
        "estimatedTime": "30 mins",
        "xp": 75,
        "level": "B1 ➔ B2",
        "tagline": "Articulate the N+1 database trap, round-trip overhead, and single-batch fetching solutions fluently in English.",
        "whyItMatters": "The N+1 query problem is the #1 database question in backend interviews and code reviews. Explaining it as 'we did trips to the database' sounds simplistic. Using 'round-trips', 'eager loading', 'single batch fetch', and 'connection pool exhaustion' demonstrates true senior depth.",
        "learnContent": {
          "summary": "An N+1 problem occurs when an application executes 1 initial query to fetch parent records, followed by N subsequent queries to fetch child records individually in a loop. The solution is eager loading or batch fetching using SQL 'IN (...)' clauses or JOIN operations.",
          "formula": "1 Parent Query + N Child Queries ➔ 1 Consolidated Batch Fetch",
          "rules": [
            "Say 'round-trips to the database' (not 'trips' or 'database jumpings').",
            "Say 'eager loading' or 'batch fetch' (not 'fast loading').",
            "Explain the risk: 'exhausting the database connection pool under concurrent load'."
          ],
          "badVsGood": {
            "bad": "Before my code, we were stuck into N+1 problem that caused database to load very much by doing trips. I did it in one call.",
            "good": "Previously, the application suffered from the N+1 query anti-pattern, executing individual round-trips for each user. I refactored the data layer to perform a single batch fetch using an eager JOIN.",
            "explanation": "Senior technical vocabulary replaces vague colloquialisms ('trips', 'load very much') with precise systems engineering terminology."
          },
          "ukrainianTrap": "Ukrainian developers often describe database traffic as 'ходіння в базу' or 'робити запити'. Translating this literally as 'doing trips to the database' sounds unidiomatic. Use 'database round-trips' or 'eagerly fetching data in a single consolidated query'."
        },
        "interactivePractice": {
          "sentenceBuilder": {
            "prompt": "Assemble the code review explanation: 'By replacing the looped queries / with a single batch fetch, / we eliminated redundant database round-trips / and prevented connection pool exhaustion.'",
            "words": [
              "By replacing the looped queries",
              "with a single batch fetch,",
              "we eliminated redundant database round-trips",
              "and prevented connection pool exhaustion"
            ],
            "target": "By replacing the looped queries with a single batch fetch, we eliminated redundant database round-trips and prevented connection pool exhaustion",
            "hint": "Method clause + comma + main clause + coordinate conjunction clause."
          },
          "inputDrill": {
            "sentenceBefore": "To resolve the N+1 bottleneck, we configured our ORM to use",
            "missingWord": "eager loading",
            "sentenceAfter": "instead of lazily fetching child records inside the loop.",
            "hint": "Two words: the opposite of lazy loading.",
            "explanation": "'Eager loading' pre-fetches associated models in advance to eliminate secondary round-trips."
          },
          "deepQuiz": {
            "question": "What is the primary danger of the N+1 query problem in a high-traffic production service?",
            "options": [
              "It corrupts database transactions and causes syntax exceptions.",
              "It generates excessive network round-trips, starving the database connection pool.",
              "It forces the compiler to re-evaluate type definitions.",
              "It disables CPU level-1 caching on the backend node."
            ],
            "correctIndex": 1,
            "explanation": "Multiple round-trips create severe latency and rapidly exhaust available database connections when request volume surges."
          },
          "speakingSimulation": {
            "prompt": "Simulate explaining your PR refactoring the N+1 problem in an English interview.",
            "collocations": [
              "eliminated redundant round-trips",
              "eagerly loaded associated entities",
              "prevented connection pool starvation",
              "batch fetch via an IN clause"
            ],
            "sampleNativeAnswer": "In the legacy implementation, we were executing an initial query followed by N individual database queries inside a loop. Under high concurrency, this caused connection pool exhaustion. I refactored the handler to execute a single batch query with an IN clause, reducing latency by over 80%."
          }
        },
        "checklist": [
          {
            "id": "c_m_2_1_1",
            "text": "Study the The N+1 Query Disaster & Batch Data Fetching formula & contrastive rules"
          },
          {
            "id": "c_m_2_1_2",
            "text": "Complete the interactive Sentence Builder & Input Drill"
          },
          {
            "id": "c_m_2_1_3",
            "text": "Pass the deep technical challenge quiz with 100% accuracy"
          }
        ],
        "actionTarget": {
          "tab": "speaking",
          "practiceMode": "code_001",
          "title": "Explain N+1 Code Refactoring",
          "buttonText": "🎙️ Speak on N+1 Scenario"
        },
        "targetVocabulary": [
          {
            "term": "eager loading",
            "pos": "ORM Data Access Pattern",
            "definition": "Pre-fetching associated child records in a single query rather than on-demand in a loop.",
            "example": "To resolve the N+1 bottleneck, we configured our ORM to use eager loading.",
            "usageTip": "The direct opposite of lazy loading; prevents N+1 query proliferation."
          },
          {
            "term": "database round-trips",
            "pos": "Systems Network Collocation",
            "definition": "Full network cycles of sending a query from the application server and receiving data from DB.",
            "example": "By replacing looped queries with a single batch fetch, we eliminated redundant database round-trips.",
            "usageTip": "Use 'round-trips' instead of colloquial 'trips to the database' or 'goings to base'."
          },
          {
            "term": "single batch fetch",
            "pos": "Data Architecture Collocation",
            "definition": "Consolidating multiple individual requests into one query using SQL IN (...) or JOIN.",
            "example": "We consolidated twenty queries into a single batch fetch, cutting latency by 80%.",
            "usageTip": "Essential term when describing SQL query optimization during technical interviews."
          },
          {
            "term": "connection pool starvation",
            "pos": "High-Load Infrastructure State",
            "definition": "Depletion of available database connections causing incoming requests to queue and timeout.",
            "example": "Under peak concurrency, redundant round-trips triggered database connection pool starvation.",
            "usageTip": "Use 'pool exhaustion' or 'pool starvation' to describe database resource depletion."
          }
        ]
      },
      {
        "id": "m_2_2",
        "stageId": "stage_2",
        "number": "2.2",
        "title": "Memory Leaks, Garbage Collection & Event Loop Starvation",
        "category": "Runtime Internals",
        "icon": "🧠",
        "estimatedTime": "30 mins",
        "xp": 75,
        "level": "B1 ➔ B2",
        "tagline": "Describe heap growth, uncollected object references, event-loop blocking, and profiling strategies.",
        "whyItMatters": "Runtime performance issues are critical in high-concurrency Node.js, Go, or Java backends. Explaining why memory grows uncontrollably or why the event loop stalls requires precise terms like 'unreleased event listeners', 'heap profiling', 'garbage collection pauses', and 'CPU-bound task offloading'.",
        "learnContent": {
          "summary": "A memory leak occurs when allocated memory is no longer needed by the application but cannot be reclaimed by the Garbage Collector (GC) because live references persist. In single-threaded runtimes like Node.js, synchronous CPU-intensive tasks starve the event loop, causing request timeouts.",
          "formula": "Dangling References ➔ Retained Heap Size Growth ➔ Frequent GC Pauses ➔ Out-Of-Memory (OOM) Crash",
          "rules": [
            "Say 'memory leak' (not 'memory losing' or 'RAM dropping').",
            "Say 'reclaim memory' or 'sweep unreachable objects' (not 'clean memory').",
            "Say 'starving the event loop' (not 'stopping the node loop')."
          ],
          "badVsGood": {
            "bad": "The app has memory losing because some objects stay in memory and garbage cleaner cannot delete them, so server stops.",
            "good": "The application suffered from an insidious memory leak caused by dangling event listeners. The garbage collector was unable to reclaim the unreachable heap space, eventually triggering an OOM crash.",
            "explanation": "'Dangling event listeners', 'reclaim unreachable heap space', and 'OOM crash' accurately convey the technical mechanism."
          },
          "ukrainianTrap": "Saying 'збирач сміття видаляє об'єкти' leads to literal translations like 'garbage cleaner deletes objects'. The proper terminology is 'the Garbage Collector marks and sweeps unreachable references'."
        },
        "interactivePractice": {
          "sentenceBuilder": {
            "prompt": "Construct the incident postmortem statement: 'Dangling event listeners / prevented the Garbage Collector / from reclaiming memory, / ultimately triggering / an Out-Of-Memory termination.'",
            "words": [
              "Dangling event listeners",
              "prevented the Garbage Collector",
              "from reclaiming memory,",
              "ultimately triggering",
              "an Out-Of-Memory termination"
            ],
            "target": "Dangling event listeners prevented the Garbage Collector from reclaiming memory, ultimately triggering an Out-Of-Memory termination",
            "hint": "Subject + transitive verb + object + participle phrase + adverbial outcome."
          },
          "inputDrill": {
            "sentenceBefore": "Performing synchronous cryptographic hashing on the main thread will",
            "missingWord": "starve the event loop",
            "sentenceAfter": "and block incoming HTTP requests.",
            "hint": "Four words: verb 'starve' + 'the event loop'.",
            "explanation": "Long-running synchronous computations prevent the event loop from processing I/O events, known as 'starving the event loop'."
          },
          "deepQuiz": {
            "question": "What is the primary cause of a memory leak in a managed runtime like V8 (Node.js) or the JVM?",
            "options": [
              "The operating system denies access to additional swap space.",
              "Unused objects remain reachable through persistent global references or uncleaned listeners.",
              "The network socket timeout drops to zero.",
              "Microtasks are executed in parallel on separate CPU cores."
            ],
            "correctIndex": 1,
            "explanation": "Garbage collectors only free objects that are unreachable from GC roots. Retained references prevent deallocation, creating a memory leak."
          },
          "speakingSimulation": {
            "prompt": "Explain to your team how you diagnosed and resolved a memory leak in production.",
            "collocations": [
              "analyzed heap snapshots",
              "identified dangling references",
              "deregistered event listeners",
              "stabilized RSS memory consumption"
            ],
            "sampleNativeAnswer": "After noticing steady growth in container memory usage, I captured heap snapshots under load. The analysis revealed thousands of uncleaned WebSocket event listeners retaining customer session objects. Deregistering them on disconnect immediately stabilized the heap."
          }
        },
        "checklist": [
          {
            "id": "c_m_2_2_1",
            "text": "Study the Memory Leaks, Garbage Collection & Event Loop Starvation formula & contrastive rules"
          },
          {
            "id": "c_m_2_2_2",
            "text": "Complete the interactive Sentence Builder & Input Drill"
          },
          {
            "id": "c_m_2_2_3",
            "text": "Pass the deep technical challenge quiz with 100% accuracy"
          }
        ],
        "actionTarget": {
          "tab": "practice",
          "practiceMode": "sentences",
          "title": "Practice Arena",
          "buttonText": "🧩 Assemble Runtime Diagnostics"
        },
        "targetVocabulary": [
          {
            "term": "starve the event loop",
            "pos": "Runtime Asynchronous Idiom",
            "definition": "Executing CPU-intensive synchronous work that blocks the event loop from processing I/O.",
            "example": "Performing synchronous cryptographic hashing on the main thread will starve the event loop.",
            "usageTip": "Key concept in Node.js and async Python/Go concurrency architecture."
          },
          {
            "term": "dangling event listeners",
            "pos": "Memory Leak Noun Phrase",
            "definition": "Subscribed event callbacks that are never deregistered, retaining objects in heap memory.",
            "example": "Dangling event listeners prevented the Garbage Collector from reclaiming memory.",
            "usageTip": "The most common source of memory leaks in JavaScript and UI applications."
          },
          {
            "term": "reclaim unreachable heap space",
            "pos": "Garbage Collection Collocation",
            "definition": "The memory management process of identifying and deallocating discarded objects.",
            "example": "The Garbage Collector was unable to reclaim unreachable heap space due to circular references.",
            "usageTip": "Use 'reclaim memory' or 'sweep unreachable objects' rather than 'clean memory'."
          },
          {
            "term": "Out-Of-Memory (OOM) termination",
            "pos": "OS Kernel Incident Term",
            "definition": "Kernel terminating a process when the container or host exceeds allocated RAM limits.",
            "example": "Unbounded memory growth eventually triggered an Out-Of-Memory termination by the Linux OOM-killer.",
            "usageTip": "Standard site reliability engineering phrase for crash-looping containers."
          }
        ]
      },
      {
        "id": "m_2_3",
        "stageId": "stage_2",
        "number": "2.3",
        "title": "Latency vs Throughput & Concurrency vs Parallelism",
        "category": "System Metrics",
        "icon": "📈",
        "estimatedTime": "30 mins",
        "xp": 70,
        "level": "B1 ➔ B2",
        "tagline": "Differentiate critical performance metrics: p95/p99 latency, RPS throughput, and execution models.",
        "whyItMatters": "Conflating latency (time per request) with throughput (requests per second), or concurrency (handling multiple tasks in overlapping periods) with parallelism (executing multiple tasks simultaneously on multi-core hardware) is a fatal giveaway of junior comprehension in system design.",
        "learnContent": {
          "summary": "Latency is the duration required to complete a single unit of work (often measured in percentiles: p50, p95, p99). Throughput is the volume of work completed per time unit (RPS/QPS). Concurrency is about dealing with a lot of things at once (structure); parallelism is about doing a lot of things at once (execution).",
          "formula": "Latency = Time/Request | Throughput = Requests/Second (RPS)",
          "rules": [
            "Never rely solely on average latency; always evaluate tail latency (p95, p99).",
            "High throughput does not guarantee low latency: a pipeline can process 50k RPS while individual requests queue for 2 seconds.",
            "Concurrency can run on a single core via context switching; parallelism strictly requires multiple physical execution cores."
          ],
          "badVsGood": {
            "bad": "The speed of our server is very good because it has big parallelism and small average ping.",
            "good": "Our service sustains high throughput of 15,000 requests per second while maintaining a p99 latency well under 45 milliseconds.",
            "explanation": "Replaces ambiguous terms ('speed', 'big parallelism', 'ping') with industry-standard metrics: sustained throughput and percentile latency."
          },
          "ukrainianTrap": "Ukrainian engineers often use 'швидкість' as a catch-all term for bandwidth, latency, and throughput. In English, you must separate 'throughput' from 'latency'."
        },
        "interactivePractice": {
          "sentenceBuilder": {
            "prompt": "Assemble the SLA guarantee: 'Although the system / sustains 20,000 requests per second, / our primary focus / remains optimizing p99 tail latency.'",
            "words": [
              "Although the system",
              "sustains 20,000 requests per second,",
              "our primary focus",
              "remains optimizing p99 tail latency"
            ],
            "target": "Although the system sustains 20,000 requests per second, our primary focus remains optimizing p99 tail latency",
            "hint": "Concessive clause + comma + subject + predicate."
          },
          "inputDrill": {
            "sentenceBefore": "While concurrency is about structuring tasks to make progress independently,",
            "missingWord": "parallelism requires",
            "sentenceAfter": "multiple physical cores executing instructions simultaneously.",
            "hint": "Subject 'parallelism' + verb 'requires'.",
            "explanation": "Parallelism specifically depends on physical multi-core execution."
          },
          "deepQuiz": {
            "question": "Why is the p99 latency metric favored over mean (average) latency in high-scale systems?",
            "options": [
              "Average latency is mathematically more computationally expensive to calculate.",
              "The mean hides extreme tail latency spikes experienced by the unluckiest 1% of users.",
              "p99 latency only measures failed HTTP 500 error responses.",
              "p99 latency ignores network packet loss."
            ],
            "correctIndex": 1,
            "explanation": "Averages obscure severe degradation; p99 reveals the latency boundary experienced by the 99th percentile of users."
          },
          "speakingSimulation": {
            "prompt": "Explain the difference between concurrency and parallelism to a junior engineer during an onboarding session.",
            "collocations": [
              "overlapping time intervals",
              "simultaneous multi-core execution",
              "tail latency percentiles",
              "sustained throughput"
            ],
            "sampleNativeAnswer": "Concurrency is about composition—designing your system to handle multiple tasks in overlapping periods, like async I/O on a single thread. Parallelism is about execution—physically running computations simultaneously on separate CPU cores."
          }
        },
        "checklist": [
          {
            "id": "c_m_2_3_1",
            "text": "Study the Latency vs Throughput & Concurrency vs Parallelism formula & contrastive rules"
          },
          {
            "id": "c_m_2_3_2",
            "text": "Complete the interactive Sentence Builder & Input Drill"
          },
          {
            "id": "c_m_2_3_3",
            "text": "Pass the deep technical challenge quiz with 100% accuracy"
          }
        ],
        "actionTarget": {
          "tab": "practice",
          "practiceMode": "quizzes",
          "title": "Metrics Quiz",
          "buttonText": "🎯 Test Systems Vocabulary"
        },
        "targetVocabulary": [
          {
            "term": "parallelism requires",
            "pos": "Concurrency vs Parallelism Definition",
            "definition": "Parallelism strictly requires multiple physical CPU cores executing instructions simultaneously.",
            "example": "While concurrency is about structuring tasks, parallelism requires multiple physical cores.",
            "usageTip": "Concurrency deals with multiple things at once; parallelism does multiple things simultaneously."
          },
          {
            "term": "p99 tail latency",
            "pos": "SRE Performance Metric",
            "definition": "The response time boundary experienced by the slowest 1% of incoming requests.",
            "example": "Although the system sustains 20,000 RPS, our primary focus remains optimizing p99 tail latency.",
            "usageTip": "Never rely solely on average latency; senior engineers evaluate p95 and p99 tail metrics."
          },
          {
            "term": "sustained throughput",
            "pos": "Capacity Benchmark Collocation",
            "definition": "Continuous requests per second (RPS) or queries per second (QPS) handled without degradation.",
            "example": "Our cluster maintains a sustained throughput of 15,000 requests per second under peak load.",
            "usageTip": "Throughput measures volume of work per unit time; latency measures time per unit work."
          },
          {
            "term": "overlapping time intervals",
            "pos": "Concurrency Characteristic",
            "definition": "Tasks making progress in interleaved windows via context switching on a single or multiple cores.",
            "example": "Asynchronous I/O handles thousands of connections in overlapping time intervals.",
            "usageTip": "Theoretical definition of concurrent execution models."
          }
        ]
      },
      {
        "id": "m_2_4",
        "stageId": "stage_2",
        "number": "2.4",
        "title": "Database Indexing, Connection Pools & Deadlocks",
        "category": "Data Reliability",
        "icon": "🗄️",
        "estimatedTime": "30 mins",
        "xp": 75,
        "level": "B1 ➔ B2",
        "tagline": "Explain B-tree lookups, composite indexes, connection pool exhaustion, and circular lock deadlocks.",
        "whyItMatters": "Database bottlenecks bring entire clusters down. Senior engineers must clearly diagnose index scans vs sequential table scans, explain why connection pool limits were reached, and describe how two concurrent transactions became deadlocked.",
        "learnContent": {
          "summary": "Database indexes (B-tree, Hash) accelerate read queries by avoiding full sequential table scans at the cost of slower writes. Connection pools maintain reusable database connections to prevent TCP handshake overhead. A deadlock occurs when two concurrent transactions mutually wait on resources held by each other.",
          "formula": "Full Table Scan (O(N)) ➔ B-Tree Index Scan (O(log N)) | Tx A locks Row 1, Tx B locks Row 2 ➔ Deadlock",
          "rules": [
            "Say 'sequential scan' or 'full table scan' (not 'scanning all base').",
            "Say 'composite index' for multi-column indices (not 'double index').",
            "Say 'connection pool contention / exhaustion' (not 'pool is full and dying')."
          ],
          "badVsGood": {
            "bad": "The base was blocked because two transactions locked each other and died in dead point.",
            "good": "The database aborted Transaction B because a circular dependency triggered a deadlock while updating order records concurrently.",
            "explanation": "'Circular dependency', 'triggered a deadlock', and 'updating records concurrently' use precise ACID transaction terminology."
          },
          "ukrainianTrap": "Ukrainian developers often call a deadlock 'мертва петля' or 'завис'. In technical English, it is strictly termed a 'deadlock', and resolving it involves 'deadlock detection and automated rollback'."
        },
        "interactivePractice": {
          "sentenceBuilder": {
            "prompt": "Construct the DBA diagnosis: 'Adding a composite index / on tenant_id and created_at / eliminated the sequential scan / and stabilized database CPU load.'",
            "words": [
              "Adding a composite index",
              "on tenant_id and created_at",
              "eliminated the sequential scan",
              "and stabilized database CPU load"
            ],
            "target": "Adding a composite index on tenant_id and created_at eliminated the sequential scan and stabilized database CPU load",
            "hint": "Gerund subject + prepositional modifier + transitive verb phrase + coordinate predicate."
          },
          "inputDrill": {
            "sentenceBefore": "When two concurrent transactions acquire exclusive locks in opposite order,",
            "missingWord": "a deadlock occurs",
            "sentenceAfter": "forcing the database engine to abort and roll back one of them.",
            "hint": "Three words: indefinite article + 'deadlock' + verb 'occurs'.",
            "explanation": "A deadlock is the definitive relational database term for mutually blocking transactions."
          },
          "deepQuiz": {
            "question": "What is the primary trade-off when adding multiple secondary indexes to a high-write relational table?",
            "options": [
              "It degrades read performance for all queries.",
              "It accelerates reads but increases write latency because every index must be updated on insert or update.",
              "It forces the database to convert all columns into strings.",
              "It causes automatic foreign key drops."
            ],
            "correctIndex": 1,
            "explanation": "Indexes speed up read lookups, but every additional index introduces write overhead since the B-tree must be rebalanced on inserts/updates/deletes."
          },
          "speakingSimulation": {
            "prompt": "Explain to your team during a retrospective why a production incident was caused by database deadlocks and how you resolved it.",
            "collocations": [
              "circular locking dependency",
              "enforced consistent lock ordering",
              "added a composite index",
              "reduced transaction duration"
            ],
            "sampleNativeAnswer": "Our order processing service hit deadlocks during peak traffic because two worker services updated inventory and order tables in reverse order. We resolved this by enforcing strict lock ordering across all transactions and keeping write transactions minimal."
          }
        },
        "checklist": [
          {
            "id": "c_m_2_4_1",
            "text": "Study the Database Indexing, Connection Pools & Deadlocks formula & contrastive rules"
          },
          {
            "id": "c_m_2_4_2",
            "text": "Complete the interactive Sentence Builder & Input Drill"
          },
          {
            "id": "c_m_2_4_3",
            "text": "Pass the deep technical challenge quiz with 100% accuracy"
          }
        ],
        "actionTarget": {
          "tab": "practice",
          "practiceMode": "sentences",
          "title": "Practice Arena",
          "buttonText": "🧩 Assemble Database Scenarios"
        },
        "targetVocabulary": [
          {
            "term": "a deadlock occurs",
            "pos": "Relational Database Incident Term",
            "definition": "Two or more concurrent transactions mutually blocked, each waiting for locks held by the other.",
            "example": "When two concurrent transactions acquire exclusive locks in opposite order, a deadlock occurs.",
            "usageTip": "Relational engines automatically abort and roll back one transaction to break the cycle."
          },
          {
            "term": "sequential table scan",
            "pos": "Database Performance Term",
            "definition": "Reading every row of a database table sequentially from disk due to missing indexes.",
            "example": "Adding a composite index eliminated the sequential scan and stabilized database CPU load.",
            "usageTip": "O(N) operation; the primary cause of slow queries on large tables."
          },
          {
            "term": "composite index",
            "pos": "Database Schema Collocation",
            "definition": "A B-tree index created across two or more columns to accelerate filtered multi-column lookups.",
            "example": "We created a composite index on (tenant_id, created_at) to optimize query performance.",
            "usageTip": "Column ordering matters: leading column must match the query filter for the index to be utilized."
          },
          {
            "term": "lock contention",
            "pos": "Concurrency Bottleneck Term",
            "definition": "Multiple concurrent transactions queuing to acquire exclusive locks on identical rows or tables.",
            "example": "Long-running write transactions created severe row-level lock contention.",
            "usageTip": "Mitigate by keeping write transactions minimal and enforcing consistent lock ordering."
          }
        ]
      },
      {
        "id": "m_2_5",
        "stageId": "stage_2",
        "number": "2.5",
        "title": "Caching Topologies & Eviction Strategies",
        "category": "Distributed Caching",
        "icon": "⚡",
        "estimatedTime": "30 mins",
        "xp": 75,
        "level": "B1 ➔ B2",
        "tagline": "Master cache-aside, write-through, cache stampedes (dogpiling), and TTL eviction policies.",
        "whyItMatters": "There are only two hard things in Computer Science: cache invalidation and naming things. Senior engineers must clearly explain cache hit ratios, cache penetration, stale-while-revalidate, and why an LRU (Least Recently Used) policy was selected over LFU.",
        "learnContent": {
          "summary": "Caching reduces database load by storing pre-computed results in fast in-memory stores (e.g., Redis). Patterns include Cache-Aside (lazy loading), Write-Through (updating cache and DB simultaneously), and Write-Behind. Eviction algorithms include LRU (Least Recently Used) and TTL-based expiration.",
          "formula": "Read: Cache Hit ➔ Return | Cache Miss ➔ Read DB ➔ Populate Cache ➔ Return",
          "rules": [
            "Say 'cache stampede' or 'dogpiling' when multiple requests hit the DB on key expiration (not 'cache storm').",
            "Say 'cache hit ratio / hit rate' (not 'cache success percentage').",
            "Say 'cache invalidation' (not 'cache cleaning' or 'cache reset')."
          ],
          "badVsGood": {
            "bad": "When cache dies, all users go to database at once and crash it because of no data in Redis.",
            "good": "Upon key expiration, an unexpected cache stampede occurred, overwhelming the primary database with concurrent fallback queries.",
            "explanation": "'Cache stampede' and 'concurrent fallback queries' accurately identify the architectural vulnerability."
          },
          "ukrainianTrap": "Ukrainian developers often call cache invalidation 'скидання кешу' or 'інвалідація'. In English, you must specify whether you are doing 'TTL-based expiration', 'explicit cache eviction', or 'stale-while-revalidate'."
        },
        "interactivePractice": {
          "sentenceBuilder": {
            "prompt": "Construct the resilience plan: 'To prevent cache stampedes / on high-traffic product endpoints, / we implemented probabilistic early expiration / using jittered TTL values.'",
            "words": [
              "To prevent cache stampedes",
              "on high-traffic product endpoints,",
              "we implemented probabilistic early expiration",
              "using jittered TTL values"
            ],
            "target": "To prevent cache stampedes on high-traffic product endpoints, we implemented probabilistic early expiration using jittered TTL values",
            "hint": "Infinitive purpose clause + prepositional phrase + main clause + participle instrument."
          },
          "inputDrill": {
            "sentenceBefore": "Our architecture utilizes the",
            "missingWord": "cache-aside pattern",
            "sentenceAfter": "where the application queries Redis first and falls back to Postgres on a miss.",
            "hint": "Three words: 'cache' + hyphen + 'aside' + 'pattern'.",
            "explanation": "Cache-Aside is the standard design pattern where the application orchestrates checking the cache and querying the backing store on misses."
          },
          "deepQuiz": {
            "question": "What is the primary benefit of adding randomized jitter to cache TTL values?",
            "options": [
              "It encrypts sensitive cached objects.",
              "It prevents thousands of identical keys from expiring simultaneously and causing a cache stampede.",
              "It enables direct peer-to-peer cache replication.",
              "It forces the database to bypass transaction locks."
            ],
            "correctIndex": 1,
            "explanation": "Jitter staggers expiration times over a randomized window, preventing simultaneous cache misses from overwhelming the database."
          },
          "speakingSimulation": {
            "prompt": "Propose a caching strategy to your lead to alleviate heavy load on user profile endpoints.",
            "collocations": [
              "cache-aside pattern",
              "high cache hit ratio",
              "jittered TTL expiration",
              "mitigate cache stampedes"
            ],
            "sampleNativeAnswer": "I recommend adopting a cache-aside pattern with Redis in front of the user profile service. By configuring a 15-minute TTL with 10% randomized jitter, we can achieve an estimated 92% cache hit ratio and insulate the database from traffic spikes."
          }
        },
        "checklist": [
          {
            "id": "c_m_2_5_1",
            "text": "Study the Caching Topologies & Eviction Strategies formula & contrastive rules"
          },
          {
            "id": "c_m_2_5_2",
            "text": "Complete the interactive Sentence Builder & Input Drill"
          },
          {
            "id": "c_m_2_5_3",
            "text": "Pass the deep technical challenge quiz with 100% accuracy"
          }
        ],
        "actionTarget": {
          "tab": "practice",
          "practiceMode": "sentences",
          "title": "Practice Arena",
          "buttonText": "🧩 Assemble Caching Architectures"
        },
        "targetVocabulary": [
          {
            "term": "cache-aside pattern",
            "pos": "Caching Architecture Pattern",
            "definition": "Application checks cache first, queries backing database on a miss, and populates cache with result.",
            "example": "Our architecture utilizes the cache-aside pattern with Redis in front of Postgres.",
            "usageTip": "Also known as lazy caching; the most widely deployed distributed caching strategy."
          },
          {
            "term": "cache stampede (dogpiling)",
            "pos": "Caching Vulnerability Term",
            "definition": "Simultaneous mass cache misses overwhelming the backing database when a popular key expires.",
            "example": "To prevent cache stampedes, we implemented probabilistic early expiration with jittered TTL.",
            "usageTip": "Prevent using mutual exclusion locks (mutexes) or staggered background pre-fetching."
          },
          {
            "term": "randomized jittered TTL",
            "pos": "Resilience Technique",
            "definition": "Adding small randomized time deltas to key expiration times to prevent simultaneous eviction.",
            "example": "We configured a 15-minute TTL with 10% randomized jitter across all product keys.",
            "usageTip": "Staggers expirations over a distribution window, preventing sudden database traffic spikes."
          },
          {
            "term": "cache hit ratio",
            "pos": "Performance Metric",
            "definition": "The percentage of read requests satisfied directly by cache without hitting the database.",
            "example": "Following optimization, our Redis cluster sustained a 94% cache hit ratio.",
            "usageTip": "Higher cache hit ratio directly reduces database compute spend and lowers response latency."
          }
        ]
      },
      {
        "id": "m_2_6",
        "stageId": "stage_2",
        "number": "2.6",
        "title": "Microservices vs Monoliths: Decoupling & IPC",
        "category": "Distributed Systems",
        "icon": "🏗️",
        "estimatedTime": "35 mins",
        "xp": 80,
        "level": "B1 ➔ B2",
        "tagline": "Debate architectural trade-offs: domain boundaries, asynchronous message brokers, and operational complexity.",
        "whyItMatters": "Blindly promoting microservices or defending a tangled monolith reveals a lack of architectural maturity. Senior engineers must articulate boundaries using Domain-Driven Design (DDD), evaluate synchronous REST/gRPC vs asynchronous messaging (Kafka/RabbitMQ), and weigh operational overhead against team scalability.",
        "learnContent": {
          "summary": "A modular monolith offers simple deployment and transactional consistency within a single codebase. Microservices decouple deployability and allow independent scaling at the expense of distributed complexity, network latency, and eventual consistency.",
          "formula": "Modular Monolith (In-Memory IPC) ➔ Microservices (Network IPC: gRPC / Event Brokers)",
          "rules": [
            "Say 'domain boundaries' and 'bounded contexts' (not 'service borders').",
            "Say 'inter-process communication (IPC)' or 'service-to-service calls' (not 'services talking to each other').",
            "Say 'operational overhead' (not 'hard devops work')."
          ],
          "badVsGood": {
            "bad": "We must break our big monolith into 20 services because modern tech is microservices and services talk better.",
            "good": "Unless our bounded contexts are well-defined and team topologies demand autonomous deployment pipelines, premature decomposition into microservices will simply create a distributed monolith.",
            "explanation": "Articulates real architectural wisdom ('bounded contexts', 'premature decomposition', 'distributed monolith') rather than buzzword adoption."
          },
          "ukrainianTrap": "Ukrainian developers often call distributed services 'мікросервіси спілкуються'. In English technical specs, refer to 'synchronous request-response IPC via gRPC' or 'asynchronous event streaming via Kafka'."
        },
        "interactivePractice": {
          "sentenceBuilder": {
            "prompt": "Construct the architectural recommendation: 'Prematurely decomposing the monolith / without clear domain boundaries / will introduce distributed network latency / and operational complexity.'",
            "words": [
              "Prematurely decomposing the monolith",
              "without clear domain boundaries",
              "will introduce distributed network latency",
              "and operational complexity"
            ],
            "target": "Prematurely decomposing the monolith without clear domain boundaries will introduce distributed network latency and operational complexity",
            "hint": "Gerund subject phrase + prepositional qualification + modal verb + coordinate object."
          },
          "inputDrill": {
            "sentenceBefore": "To decouple the billing service from payment processing, we replaced synchronous REST calls with",
            "missingWord": "asynchronous event-driven messaging",
            "sentenceAfter": "via Apache Kafka.",
            "hint": "Four words: 'asynchronous' + 'event-driven' + 'messaging'.",
            "explanation": "Event-driven asynchronous architectures decouple producers from consumers, eliminating temporal coupling."
          },
          "deepQuiz": {
            "question": "What is the primary characteristic of an anti-pattern known as a 'distributed monolith'?",
            "options": [
              "Services that compile directly into machine binary code.",
              "Multiple services that are tightly coupled and must be deployed together in lockstep.",
              "A single monolithic codebase deployed across multiple cloud regions.",
              "Services that store all state in Redis rather than a relational database."
            ],
            "correctIndex": 1,
            "explanation": "A distributed monolith possesses all the operational pains of microservices with none of the benefits of autonomous deployability."
          },
          "speakingSimulation": {
            "prompt": "Present an architectural evaluation comparing a modular monolith with a microservices migration to your CTO.",
            "collocations": [
              "bounded contexts",
              "distributed transactional complexity",
              "operational overhead",
              "autonomous deployment cadences"
            ],
            "sampleNativeAnswer": "While microservices offer independent deployment cadences for scaling teams, they introduce distributed transaction complexity and network latency. Given our current team size, refactoring our application into a well-isolated modular monolith is substantially more cost-effective."
          }
        },
        "checklist": [
          {
            "id": "c_m_2_6_1",
            "text": "Study the Microservices vs Monoliths: Decoupling & IPC formula & contrastive rules"
          },
          {
            "id": "c_m_2_6_2",
            "text": "Complete the interactive Sentence Builder & Input Drill"
          },
          {
            "id": "c_m_2_6_3",
            "text": "Pass the deep technical challenge quiz with 100% accuracy"
          }
        ],
        "actionTarget": {
          "tab": "practice",
          "practiceMode": "sentences",
          "title": "Practice Arena",
          "buttonText": "🧩 Assemble Architectural Arguments"
        },
        "targetVocabulary": [
          {
            "term": "asynchronous event-driven messaging",
            "pos": "Distributed Systems Architecture",
            "definition": "Decoupled communication where producers publish events to brokers without waiting for consumers.",
            "example": "To decouple billing from payment processing, we replaced REST with asynchronous event-driven messaging.",
            "usageTip": "Eliminates temporal coupling and prevents cascading failures across service boundaries."
          },
          {
            "term": "bounded contexts",
            "pos": "Domain-Driven Design (DDD) Term",
            "definition": "Explicit boundary within which a domain model applies and is insulated from external concepts.",
            "example": "Decomposing the monolith without clear bounded contexts will introduce accidental complexity.",
            "usageTip": "Core DDD concept required to prevent microservices from turning into a distributed monolith."
          },
          {
            "term": "distributed monolith",
            "pos": "Architecture Anti-Pattern",
            "definition": "Multiple services that are tightly coupled and must be deployed together in lockstep.",
            "example": "A distributed monolith has all the operational overhead of microservices with none of the agility.",
            "usageTip": "Avoid by enforcing loose coupling, asynchronous contracts, and independent deployability."
          },
          {
            "term": "inter-process communication (IPC)",
            "pos": "Systems Engineering Term",
            "definition": "Protocols and mechanisms allowing separate processes or services to exchange data over network.",
            "example": "We adopted gRPC with Protocol Buffers for high-throughput internal service-to-service IPC.",
            "usageTip": "Formal technical umbrella term for HTTP REST, gRPC, and message queues."
          }
        ]
      }
    ]
  },
  {
    "id": "stage_3",
    "number": 3,
    "title": "Stage 3: Complex Logic, Cause-Effect & Code Quality",
    "level": "B2 ➔ C1 Structural Rigor",
    "description": "Construct high-order conditional logic for outages, master RFC specification modals, and craft airtight refactoring defenses.",
    "badge": "Stage 3",
    "color": "#a855f7",
    "milestones": [
      {
        "id": "m_3_1",
        "stageId": "stage_3",
        "number": "3.1",
        "title": "Conditionals for Incident Management & Postmortems",
        "category": "Conditionals & Logic",
        "icon": "⚖️",
        "estimatedTime": "30 mins",
        "xp": 80,
        "level": "B2 ➔ C1",
        "tagline": "Express causality, counterfactual hypotheses, and incident outcomes using Zero to Mixed Conditionals.",
        "whyItMatters": "During incident postmortems, you must distinguish between actual outcomes, preventable failures, and hypothetical futures. Using Mixed Conditionals ('If we had provisioned read-replicas last sprint, the cluster would not be failing right now') conveys mature retrospective analysis.",
        "learnContent": {
          "summary": "Zero: If CPU reaches 90%, alert triggers. First: If traffic surges, autoscaler will spin up pods. Second: If we refactored the monolith, velocity would double. Third: If we had run load tests, we would have discovered the bottleneck. Mixed: Past Cause ➔ Present Consequence.",
          "formula": "Mixed: If + past perfect, would + verb | If we had indexed the column, latency would be lower now.",
          "rules": [
            "Use Third Conditional for past counterfactuals: 'If we had deployed on Friday, we would have broken production.'",
            "Use Mixed Conditional to connect past mistake with current system status: 'If we had configured alerting, we wouldn't be dealing with this outage now.'",
            "Never put 'would' inside the if-clause: 'If we would have tested' ❌ ➔ 'If we had tested' ✅."
          ],
          "badVsGood": {
            "bad": "If we would do this migration earlier, our database would not be dead right now.",
            "good": "If we had executed this schema migration earlier, our database would not be degraded right now.",
            "explanation": "Mixed Conditional: Past counterfactual ('had executed') produces a different present reality ('would not be degraded')."
          },
          "ukrainianTrap": "Ukrainian speakers often say 'Якби ми зробили раніше, воно б не лежало'. Translating this with 'would' in both clauses ('If we would have...') is an unidiomatic error."
        },
        "interactivePractice": {
          "sentenceBuilder": {
            "prompt": "Construct the postmortem deduction: 'If we had implemented rate limiting / on the authentication endpoint, / the brute-force attack / would not have degraded system availability.'",
            "words": [
              "If we had implemented rate limiting",
              "on the authentication endpoint,",
              "the brute-force attack",
              "would not have degraded system availability"
            ],
            "target": "If we had implemented rate limiting on the authentication endpoint, the brute-force attack would not have degraded system availability",
            "hint": "Third conditional: If + had + V3, would not have + V3."
          },
          "inputDrill": {
            "sentenceBefore": "If the team had provisioned a replica in region us-east-2,",
            "missingWord": "we would not be facing",
            "sentenceAfter": "a total service outage today.",
            "hint": "Mixed conditional: 'we would not be facing' for current ongoing consequence.",
            "explanation": "Past preventive action ('had provisioned') directly alters current status ('would not be facing')."
          },
          "deepQuiz": {
            "question": "Which conditional sentence accurately pairs a past incident action with a current production state?",
            "options": [
              "If we enabled caching yesterday, the cluster is fast now.",
              "If we had enabled caching yesterday, the cluster would not be overwhelmed right now.",
              "If we would have enabled caching yesterday, the cluster will not be overwhelmed.",
              "If we enabled caching, the cluster would have been fast today."
            ],
            "correctIndex": 1,
            "explanation": "Option 2 is a textbook Mixed Conditional: past condition ('had enabled') impacting present reality ('would not be overwhelmed')."
          },
          "speakingSimulation": {
            "prompt": "Lead a 1-minute retrospective segment reflecting on how an outage could have been avoided.",
            "collocations": [
              "if we had monitored heap usage",
              "we would have caught the regression",
              "would not be experiencing downtime"
            ],
            "sampleNativeAnswer": "If we had set up synthetic health checks for the third-party payment gateway, we would have detected the timeout cascade within seconds, and our checkout flow would not be failing today."
          }
        },
        "checklist": [
          {
            "id": "c_m_3_1_1",
            "text": "Study the Conditionals for Incident Management & Postmortems formula & contrastive rules"
          },
          {
            "id": "c_m_3_1_2",
            "text": "Complete the interactive Sentence Builder & Input Drill"
          },
          {
            "id": "c_m_3_1_3",
            "text": "Pass the deep technical challenge quiz with 100% accuracy"
          }
        ],
        "actionTarget": {
          "tab": "practice",
          "practiceMode": "sentences",
          "title": "Practice Arena",
          "buttonText": "🧩 Assemble Incident Conditionals"
        },
        "targetVocabulary": [
          {
            "term": "we would not be facing",
            "pos": "Mixed Conditional Consequence",
            "definition": "Present ongoing consequence resulting from a counterfactual past preventive action.",
            "example": "If the team had provisioned a replica in region us-east-2, we would not be facing an outage today.",
            "usageTip": "Connects past action (had + V3) to present reality (would + be + -ing)."
          },
          {
            "term": "if we had implemented rate limiting",
            "pos": "Third Conditional Past Hypothesis",
            "definition": "Past counterfactual condition analyzing what could have prevented an incident.",
            "example": "If we had implemented rate limiting, the brute-force attack would not have degraded availability.",
            "usageTip": "Never put 'would' inside the if-clause: avoid 'If we would have implemented'."
          },
          {
            "term": "provisioned read-replicas",
            "pos": "Infrastructure Action Collocation",
            "definition": "Deploying secondary database instances to offload read queries from primary database.",
            "example": "If we had provisioned read-replicas last sprint, CPU utilization would have remained stable.",
            "usageTip": "Standard relational database scaling operation."
          },
          {
            "term": "brute-force attack mitigation",
            "pos": "Security Incident Collocation",
            "definition": "Preventing automated credential-stuffing or repeated password guessing attempts.",
            "example": "Rate limiting and CAPTCHA challenges provide immediate brute-force attack mitigation.",
            "usageTip": "Cybersecurity terminology for incident postmortem documentation."
          }
        ]
      },
      {
        "id": "m_3_2",
        "stageId": "stage_3",
        "number": "3.2",
        "title": "Modal Verbs of Deduction & RFC Specification Certainty",
        "category": "Technical Specifications",
        "icon": "🔒",
        "estimatedTime": "30 mins",
        "xp": 75,
        "level": "B2 ➔ C1",
        "tagline": "Deploy RFC 2119 keywords (MUST, SHALL, SHOULD, MAY) and modals of deduction (must have been, cannot be).",
        "whyItMatters": "In technical specifications and RFCs, words like 'must', 'should', and 'may' have legally binding engineering definitions per RFC 2119. In troubleshooting, modals of deduction ('The packet must have been dropped at the edge router') communicate analytical reasoning with appropriate certainty.",
        "learnContent": {
          "summary": "RFC 2119: MUST / SHALL (Absolute requirement), SHOULD (Recommended unless valid trade-off), MAY (Truly optional). Deduction: Must be (95% certain), Can't be (95% impossible), Might/Could (possible). Past deduction: Modal + have + V3.",
          "formula": "MUST = Non-negotiable | SHOULD = Strong recommendation | MUST HAVE + V3 = High certainty deduction",
          "rules": [
            "Use 'must have + V3' for high-confidence past deductions: 'The pod must have run out of memory.'",
            "Use 'cannot have + V3' for impossibility: 'The query cannot have completed in 2ms without hitting cache.'",
            "Follow RFC 2119 standards in API contracts: 'Payloads MUST include an Idempotency-Key header.'"
          ],
          "badVsGood": {
            "bad": "Maybe the server died because someone did something with memory.",
            "good": "The node must have crashed due to an Out-Of-Memory exception, as indicated by the kernel OOM-killer logs.",
            "explanation": "'Must have crashed due to...' expresses evidence-backed deduction with senior precision."
          },
          "ukrainianTrap": "Ukrainian speakers often overuse 'maybe' ('Maybe it is bug'). Senior engineers state deductions: 'It could be a race condition, but based on the stack trace, it must be a socket leak.'"
        },
        "interactivePractice": {
          "sentenceBuilder": {
            "prompt": "Assemble the API specification clause: 'Clients MUST include / an Authorization bearer token, / and SHOULD implement / exponential backoff on HTTP 429.'",
            "words": [
              "Clients MUST include",
              "an Authorization bearer token,",
              "and SHOULD implement",
              "exponential backoff on HTTP 429"
            ],
            "target": "Clients MUST include an Authorization bearer token, and SHOULD implement exponential backoff on HTTP 429",
            "hint": "RFC 2119 pairing: MUST (strict requirement) + SHOULD (recommended resilience best practice)."
          },
          "inputDrill": {
            "sentenceBefore": "Given that latency spiked exclusively in us-west-1, the anomaly",
            "missingWord": "must have been caused",
            "sentenceAfter": "by an isolated fiber cut or gateway misconfiguration.",
            "hint": "Four words: 'must have been caused'.",
            "explanation": "High confidence past deduction supported by regional telemetry."
          },
          "deepQuiz": {
            "question": "In RFC 2119 standards, what does the keyword SHOULD signify in an architecture specification?",
            "options": [
              "The feature is completely optional and can be ignored.",
              "There may exist valid reasons in particular circumstances to ignore this item, but the full implications must be understood and carefully weighed.",
              "The feature is deprecated and will be removed in the next sprint.",
              "The developer must request permission from the CTO before writing code."
            ],
            "correctIndex": 1,
            "explanation": "RFC 2119 defines SHOULD as a strong default recommendation where deviations require explicit architectural justification."
          },
          "speakingSimulation": {
            "prompt": "Review an architecture document and evaluate mandatory vs recommended requirements.",
            "collocations": [
              "clients must supply an idempotency key",
              "should cache DNS responses",
              "the service cannot accept unencrypted payloads"
            ],
            "sampleNativeAnswer": "Per the security specification, all microservices MUST authenticate via mTLS. In addition, worker nodes SHOULD cache DNS lookups locally to insulate against DNS server latency."
          }
        },
        "checklist": [
          {
            "id": "c_m_3_2_1",
            "text": "Study the Modal Verbs of Deduction & RFC Specification Certainty formula & contrastive rules"
          },
          {
            "id": "c_m_3_2_2",
            "text": "Complete the interactive Sentence Builder & Input Drill"
          },
          {
            "id": "c_m_3_2_3",
            "text": "Pass the deep technical challenge quiz with 100% accuracy"
          }
        ],
        "actionTarget": {
          "tab": "practice",
          "practiceMode": "quizzes",
          "title": "RFC Specification Quiz",
          "buttonText": "🎯 Test Specification Modals"
        },
        "targetVocabulary": [
          {
            "term": "must have been caused",
            "pos": "Modal of Deduction (High Past Certainty)",
            "definition": "Logical deduction based on technical telemetry indicating 95%+ probability.",
            "example": "Given that latency spiked exclusively in us-west-1, the anomaly must have been caused by a fiber cut.",
            "usageTip": "Modal + have + been + V3 communicates evidence-backed senior deduction."
          },
          {
            "term": "Clients MUST include",
            "pos": "RFC 2119 Absolute Requirement",
            "definition": "Strictly non-negotiable specification requirement; non-compliance invalidates contract.",
            "example": "Clients MUST include an Authorization bearer token with every API request.",
            "usageTip": "In engineering specifications, capitalize MUST to indicate normative RFC 2119 requirement."
          },
          {
            "term": "SHOULD implement exponential backoff",
            "pos": "RFC 2119 Strong Recommendation",
            "definition": "Strong architectural recommendation where deviation requires explicit documented trade-offs.",
            "example": "Clients SHOULD implement exponential backoff upon receiving HTTP 429 Too Many Requests.",
            "usageTip": "RFC 2119 keyword allowing informed deviation only in valid edge cases."
          },
          {
            "term": "idempotency key header",
            "pos": "API Contract Collocation",
            "definition": "Unique client-supplied identifier ensuring duplicate network requests execute exactly once.",
            "example": "Payment endpoints require an Idempotency-Key header to prevent accidental double charges.",
            "usageTip": "Standard distributed systems design pattern for non-idempotent HTTP POST operations."
          }
        ]
      },
      {
        "id": "m_3_3",
        "stageId": "stage_3",
        "number": "3.3",
        "title": "Refactoring Arguments & Clean Architecture Defenses",
        "category": "Clean Code & SOLID",
        "icon": "🧼",
        "estimatedTime": "35 mins",
        "xp": 85,
        "level": "B2 ➔ C1",
        "tagline": "Defend refactoring initiatives, technical debt paydown, and SOLID architectural patterns with executive clarity.",
        "whyItMatters": "Refactoring is often dismissed by non-technical management as unnecessary gold-plating. Senior engineers must articulate why tight coupling, violation of Single Responsibility (SRP), and cyclomatic complexity directly hurt feature velocity and sprint stability.",
        "learnContent": {
          "summary": "SOLID Principles: Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, Dependency Inversion. Architecture smells: Tight coupling, low cohesion, god objects, leaky abstractions, accidental complexity.",
          "formula": "High Cohesion + Loose Coupling = Sustainable Feature Velocity",
          "rules": [
            "Frame refactoring in terms of business velocity: 'Paying down this tech debt will cut future feature development time in half.'",
            "Identify anti-patterns precisely: 'leaky abstraction', 'god class', 'premature optimization'.",
            "Reference the Open/Closed Principle: 'Classes should be open for extension, but closed for modification.'"
          ],
          "badVsGood": {
            "bad": "We need to rewrite this code because it is bad and dirty and hard to read for me.",
            "good": "Refactoring this payment module is essential because its high cyclomatic complexity and tight coupling to third-party SDKs introduce regressions whenever billing logic changes.",
            "explanation": "Replaces subjective complaints ('bad and dirty') with objective architectural metrics ('high cyclomatic complexity', 'tight coupling', 'regression risk')."
          },
          "ukrainianTrap": "Ukrainian developers often say 'код спагеті' or 'треба переписати по-нормальному'. In English executive meetings, use 'reduce cyclomatic complexity', 'decouple business logic from infrastructure', and 'establish clear domain boundaries'."
        },
        "interactivePractice": {
          "sentenceBuilder": {
            "prompt": "Construct the refactoring pitch: 'Decoupling the notification layer / from the core transaction pipeline / will eliminate regressions / and satisfy the Single Responsibility Principle.'",
            "words": [
              "Decoupling the notification layer",
              "from the core transaction pipeline",
              "will eliminate regressions",
              "and satisfy the Single Responsibility Principle"
            ],
            "target": "Decoupling the notification layer from the core transaction pipeline will eliminate regressions and satisfy the Single Responsibility Principle",
            "hint": "Gerund subject + prepositional separation + modal verb phrase + coordinate predicate."
          },
          "inputDrill": {
            "sentenceBefore": "By injecting repository interfaces rather than instantiating concrete database clients directly, we respect the",
            "missingWord": "Dependency Inversion Principle",
            "sentenceAfter": "and simplify unit testing.",
            "hint": "Three words: 'Dependency Inversion Principle'.",
            "explanation": "High-level modules should not depend on low-level modules; both should depend on abstractions."
          },
          "deepQuiz": {
            "question": "How do you justify refactoring technical debt to a product manager focused strictly on shipping new features?",
            "options": [
              "Explain that clean code looks more aesthetically pleasing in pull reviews.",
              "Demonstrate that accumulated technical debt is increasing bug density and slowing sprint velocity for upcoming deliverables.",
              "Threaten to resign if refactoring is not approved.",
              "Promise that refactoring will eliminate the need for QA testing."
            ],
            "correctIndex": 1,
            "explanation": "Translating technical debt into reduced developer velocity and increased bug rates aligns engineering priorities with business outcomes."
          },
          "speakingSimulation": {
            "prompt": "Deliver a 1-minute pitch to your team advocating for refactoring a legacy module.",
            "collocations": [
              "accumulated technical debt",
              "violates the single responsibility principle",
              "high cyclomatic complexity",
              "unlocks future velocity"
            ],
            "sampleNativeAnswer": "Our order checkout service has accumulated substantial technical debt, acting as a god class with over two thousand lines of mixed business and database logic. By decomposing it into domain services, we will eliminate regression risks and increase feature delivery speed by thirty percent."
          }
        },
        "checklist": [
          {
            "id": "c_m_3_3_1",
            "text": "Study the Refactoring Arguments & Clean Architecture Defenses formula & contrastive rules"
          },
          {
            "id": "c_m_3_3_2",
            "text": "Complete the interactive Sentence Builder & Input Drill"
          },
          {
            "id": "c_m_3_3_3",
            "text": "Pass the deep technical challenge quiz with 100% accuracy"
          }
        ],
        "actionTarget": {
          "tab": "practice",
          "practiceMode": "sentences",
          "title": "Practice Arena",
          "buttonText": "🧩 Assemble Refactoring Arguments"
        },
        "targetVocabulary": [
          {
            "term": "Dependency Inversion Principle",
            "pos": "SOLID Architecture Principle",
            "definition": "High-level modules should depend on abstractions (interfaces) rather than concrete implementations.",
            "example": "By injecting repository interfaces rather than concrete database clients, we respect the Dependency Inversion Principle.",
            "usageTip": "The 'D' in SOLID; enables seamless mocking, unit testing, and modular replacement."
          },
          {
            "term": "cyclomatic complexity",
            "pos": "Code Quality Metric",
            "definition": "Quantitative measure of the number of linearly independent paths through program source code.",
            "example": "Refactoring this module is essential because its high cyclomatic complexity causes frequent regressions.",
            "usageTip": "High cyclomatic complexity (>10 per method) indicates hard-to-test spaghetti code."
          },
          {
            "term": "Single Responsibility Principle",
            "pos": "SOLID Architecture Principle",
            "definition": "A class or module should have one, and only one, reason to change.",
            "example": "Decoupling the notification layer from billing satisfies the Single Responsibility Principle.",
            "usageTip": "The 'S' in SOLID; prevents god-classes that mix business, persistence, and presentation."
          },
          {
            "term": "accumulated technical debt",
            "pos": "Software Economics Collocation",
            "definition": "The implied future rework cost caused by choosing expedient, sub-optimal code today.",
            "example": "Paying down accumulated technical debt will increase team sprint velocity by thirty percent.",
            "usageTip": "Frame tech debt around feature velocity drag and regression risk when communicating with management."
          }
        ]
      },
      {
        "id": "m_3_4",
        "stageId": "stage_3",
        "number": "3.4",
        "title": "Inversion & Cleft Sentences for High-Impact Presentations",
        "category": "Advanced Rhetoric",
        "icon": "🎭",
        "estimatedTime": "30 mins",
        "xp": 85,
        "level": "B2 ➔ C1",
        "tagline": "Command listener attention during demos and tech talks using negative inversion and cleft sentence structures.",
        "whyItMatters": "Standard English sentence structure can sound monotonous during important presentations. Using negative inversion ('Not only did the benchmark succeed, but...') and cleft sentences ('What we actually revamped was...') highlights key breakthroughs and captivates stakeholders.",
        "learnContent": {
          "summary": "Negative Inversion: Negative adverbial fronting (Not only, Seldom, Rarely, Under no circumstances) + Auxiliary + Subject + Verb. Cleft Sentences: 'What [clause] is/was [focus]' or 'It was [focus] that [clause]'.",
          "formula": "Not only + DID + Subject + Verb | What we achieved was + Noun Phrase",
          "rules": [
            "Invert auxiliary and subject after negative limiters: 'Never have we seen such throughput' (not 'Never we have seen').",
            "Use wh-clefts to spotlight the root cause: 'What caused the memory spike was an unindexed subquery.'",
            "Use it-clefts for definitive attribution: 'It was the missing connection timeout that brought down the cluster.'"
          ],
          "badVsGood": {
            "bad": "We also increased throughput and we also dropped latency a lot.",
            "good": "Not only did we triple query throughput, but we also slashed p99 latency by seventy percent.",
            "explanation": "Negative inversion ('Not only did we...') creates executive gravitas and dramatic technical impact."
          },
          "ukrainianTrap": "Ukrainian achieves emphasis by rearranging words freely or changing pitch. In English, grammatical inversion and clefting are required to produce formal rhetorical emphasis."
        },
        "interactivePractice": {
          "sentenceBuilder": {
            "prompt": "Assemble the presentation slide hook: 'Not only did the caching overhaul / cut infrastructure spend by half, / but it also improved / customer conversion rates.'",
            "words": [
              "Not only did the caching overhaul",
              "cut infrastructure spend by half,",
              "but it also improved",
              "customer conversion rates"
            ],
            "target": "Not only did the caching overhaul cut infrastructure spend by half, but it also improved customer conversion rates",
            "hint": "Negative inversion: Not only + auxiliary 'did' + subject + base verb, coordinate conjunction."
          },
          "inputDrill": {
            "sentenceBefore": "What brought down our cluster during the Black Friday campaign",
            "missingWord": "was not a database crash",
            "sentenceAfter": "but rather an unthrottled third-party webhook surge.",
            "hint": "Five words: 'was not a database crash'.",
            "explanation": "Wh-cleft sentence emphasizing the true external root cause over internal assumptions."
          },
          "deepQuiz": {
            "question": "Which of the following sentences correctly applies negative inversion for dramatic technical emphasis?",
            "options": [
              "Rarely our database experienced such catastrophic load spikes.",
              "Rarely did our database experience such catastrophic load spikes.",
              "Rarely has experienced our database such catastrophic load spikes.",
              "Rarely our database did experience such catastrophic load spikes."
            ],
            "correctIndex": 1,
            "explanation": "Negative inversion requires fronted limiter ('Rarely') + auxiliary ('did') + subject ('our database') + base verb ('experience')."
          },
          "speakingSimulation": {
            "prompt": "Present a dramatic technical breakthrough to senior executives using inversion and clefting.",
            "collocations": [
              "not only did we achieve our latency targets",
              "what transformed our system was",
              "under no circumstances should we revert"
            ],
            "sampleNativeAnswer": "Not only did we achieve our sub-50 millisecond latency SLA under three times normal load, but what transformed our resilience was our new circuit-breaker architecture. Under no circumstances should we revert to synchronous billing calls."
          }
        },
        "checklist": [
          {
            "id": "c_m_3_4_1",
            "text": "Study the Inversion & Cleft Sentences for High-Impact Presentations formula & contrastive rules"
          },
          {
            "id": "c_m_3_4_2",
            "text": "Complete the interactive Sentence Builder & Input Drill"
          },
          {
            "id": "c_m_3_4_3",
            "text": "Pass the deep technical challenge quiz with 100% accuracy"
          }
        ],
        "actionTarget": {
          "tab": "practice",
          "practiceMode": "sentences",
          "title": "Practice Arena",
          "buttonText": "🧩 Assemble Inversion Sentences"
        },
        "targetVocabulary": [
          {
            "term": "was not a database crash",
            "pos": "Wh-Cleft Focus Clause",
            "definition": "Cleft sentence structure highlighting the true root cause over conventional assumptions.",
            "example": "What brought down our cluster was not a database crash, but an unthrottled webhook surge.",
            "usageTip": "Wh-clefts ('What caused X was Y') focus listener attention on key discoveries."
          },
          {
            "term": "not only did we triple query throughput",
            "pos": "Negative Inversion Structure",
            "definition": "Fronted negative adverbial requiring auxiliary inversion ('did we') for dramatic emphasis.",
            "example": "Not only did we triple query throughput, but we also slashed p99 latency by 70%.",
            "usageTip": "Use negative inversion in architecture presentations to command executive gravitas."
          },
          {
            "term": "slashed p99 latency by 70%",
            "pos": "Quantified Performance Collocation",
            "definition": "Substantial quantified reduction in tail response time following optimization.",
            "example": "Following the index refactoring, our team slashed p99 latency by 70%.",
            "usageTip": "Action verbs like 'slashed' or 'cut by' convey decisive engineering accomplishment."
          },
          {
            "term": "under no circumstances should we revert",
            "pos": "Negative Inversion Constraint",
            "definition": "Firm non-negotiable policy statement emphasized via grammatical inversion.",
            "example": "Under no circumstances should we revert to synchronous third-party billing calls.",
            "usageTip": "Invert modal 'should' with subject 'we' after fronted negative limiter."
          }
        ]
      },
      {
        "id": "m_3_5",
        "stageId": "stage_3",
        "number": "3.5",
        "title": "Participle Clauses for Dense Technical Documentation",
        "category": "Concise Tech Writing",
        "icon": "📑",
        "estimatedTime": "25 mins",
        "xp": 75,
        "level": "B2 ➔ C1",
        "tagline": "Condense lengthy compound sentences into crisp, professional participle phrases: 'Having resolved the bottleneck...'",
        "whyItMatters": "Verbose sentences filled with 'and then we did', 'because it was', and 'after which' make technical documentation tedious to read. Senior technical documentation uses present and perfect participle clauses to pack complex causal relationships into elegant, compact prose.",
        "learnContent": {
          "summary": "Present Participle (-ing): Expresses simultaneous actions or immediate consequences ('Triggering an automatic fallback'). Perfect Participle (Having + V3): Expresses completed antecedent actions ('Having audited the security logs, we patched the vulnerability').",
          "formula": "Having + V3 (Completed Action), Main Clause | Verb-ing (Resulting Consequence)",
          "rules": [
            "Ensure the participle subject matches the main clause subject (avoid dangling participles).",
            "Use 'Having + V3' to establish clear prerequisite execution: 'Having verified the migration in staging, we scheduled production release.'",
            "Use '-ing' to express immediate results: 'The database rejected the write, triggering a circuit-breaker trip.'"
          ],
          "badVsGood": {
            "bad": "We finished the security audit and after that we deployed the patch and this reduced our vulnerability score.",
            "good": "Having completed the comprehensive security audit, our team deployed the patch, significantly reducing our vulnerability surface.",
            "explanation": "Participle clauses compress three clunky coordinated sentences into a cohesive, senior engineering summary."
          },
          "ukrainianTrap": "Ukrainian speakers often construct chain sentences with 'після того як ми зробили... ми пішли і... що призвело до...'. Participle clauses eliminate these repetitive connectors."
        },
        "interactivePractice": {
          "sentenceBuilder": {
            "prompt": "Construct the architectural rationale: 'Having benchmarked three distributed message brokers, / our infrastructure team selected Apache Kafka / for its superior write throughput / and horizontal partitioning.'",
            "words": [
              "Having benchmarked three distributed message brokers,",
              "our infrastructure team selected Apache Kafka",
              "for its superior write throughput",
              "and horizontal partitioning"
            ],
            "target": "Having benchmarked three distributed message brokers, our infrastructure team selected Apache Kafka for its superior write throughput and horizontal partitioning",
            "hint": "Perfect participle clause + main clause + prepositional justification."
          },
          "inputDrill": {
            "sentenceBefore": "The authentication service rejected the malformed token,",
            "missingWord": "triggering an immediate security alert",
            "sentenceAfter": "in our SIEM dashboard.",
            "hint": "Four words: 'triggering an immediate security alert'.",
            "explanation": "Present participle expressing an immediate consequence of the preceding action."
          },
          "deepQuiz": {
            "question": "Identify the sentence that correctly avoids a dangling participle error:",
            "options": [
              "Having refactored the codebase, the bugs were eliminated by the team.",
              "Having refactored the codebase, our team successfully eliminated the persistent race conditions.",
              "Refactoring the codebase, all the unit tests passed without failure.",
              "Running the load test, the server crashed unexpectedly."
            ],
            "correctIndex": 1,
            "explanation": "In Option 2, the subject of 'Having refactored' correctly matches the subject of the main clause ('our team')."
          },
          "speakingSimulation": {
            "prompt": "Summarize a complex technical deployment sequence in two concise sentences using participle clauses.",
            "collocations": [
              "having validated the canary release",
              "routing fifty percent of traffic",
              "ensuring zero downtime"
            ],
            "sampleNativeAnswer": "Having validated the canary release against production telemetry for thirty minutes, we promoted the deployment to the primary cluster, routing one hundred percent of live traffic while ensuring zero downtime."
          }
        },
        "checklist": [
          {
            "id": "c_m_3_5_1",
            "text": "Study the Participle Clauses for Dense Technical Documentation formula & contrastive rules"
          },
          {
            "id": "c_m_3_5_2",
            "text": "Complete the interactive Sentence Builder & Input Drill"
          },
          {
            "id": "c_m_3_5_3",
            "text": "Pass the deep technical challenge quiz with 100% accuracy"
          }
        ],
        "actionTarget": {
          "tab": "practice",
          "practiceMode": "sentences",
          "title": "Practice Arena",
          "buttonText": "🧩 Assemble Participle Documentation"
        },
        "targetVocabulary": [
          {
            "term": "triggering an immediate security alert",
            "pos": "Present Participle Consequence Clause",
            "definition": "-ing participle phrase expressing an immediate, automatic result of the preceding clause.",
            "example": "The authentication service rejected the malformed token, triggering an immediate security alert.",
            "usageTip": "Eliminates clunky chain connectors like 'and this caused an immediate alert'."
          },
          {
            "term": "having benchmarked distributed message brokers",
            "pos": "Perfect Participle Prerequisite Clause",
            "definition": "Having + V3 participle establishing an action completed prior to the main clause decision.",
            "example": "Having benchmarked distributed message brokers, our team selected Apache Kafka.",
            "usageTip": "Subject of the participle clause must match the subject of the main clause."
          },
          {
            "term": "dangling participle avoidance",
            "pos": "Technical Style Rule",
            "definition": "Ensuring the participle modifier grammatically attaches to the true logical actor.",
            "example": "To avoid dangling participles, ensure the team (not the code) is the subject of 'Having refactored'.",
            "usageTip": "'Having refactored the code, the bugs disappeared' is ungrammatical; bugs cannot refactor code."
          },
          {
            "term": "routing live production traffic",
            "pos": "Participle Deployment State",
            "definition": "Continuous action describing active ingress distribution across clusters.",
            "example": "We promoted the deployment to primary, routing live production traffic with zero downtime.",
            "usageTip": "Compact, senior documentation style for release procedures."
          }
        ]
      },
      {
        "id": "m_3_6",
        "stageId": "stage_3",
        "number": "3.6",
        "title": "Phrasal Verbs in Cloud & Software Engineering",
        "category": "Idiomatic Tech Flow",
        "icon": "🚀",
        "estimatedTime": "30 mins",
        "xp": 80,
        "level": "B2 ➔ C1",
        "tagline": "Master idiomatic technical verbs: spin up, roll back, fall back on, drill down into, phase out, and weed out.",
        "whyItMatters": "Relying solely on formal Latinate verbs (initialize, revert, investigate, deprecate) sounds textbook and robotic in agile daily communication. Senior native developers constantly use precise technical phrasal verbs to express cloud operations and code lifecycle events.",
        "learnContent": {
          "summary": "High-frequency tech phrasal verbs: 'spin up' (instantiate VMs/containers), 'tear down' (destroy resources), 'roll back' (revert to previous stable version), 'drill down into' (analyze metrics deeply), 'phase out' (gradually deprecate), 'weed out' (eliminate defective items).",
          "formula": "Spin up = Launch | Roll back = Revert | Drill down into = Investigate details | Phase out = Deprecate",
          "rules": [
            "Use separable phrasal verbs correctly: 'Spin the environment up' or 'Spin up the environment'.",
            "With pronouns, the object MUST go in the middle: 'Roll it back' (never 'Roll back it' ❌).",
            "Pair phrasal verbs with technical nouns: 'phase out legacy endpoints', 'fall back on local caching'."
          ],
          "badVsGood": {
            "bad": "We will make the old system stop working step by step and start new cloud machines.",
            "good": "We plan to phase out the legacy monolith gradually while spinning up containerized microservices in Kubernetes.",
            "explanation": "Replaces childlike descriptions ('make stop working step by step') with authentic engineering phrasal idioms ('phase out', 'spin up')."
          },
          "ukrainianTrap": "Ukrainian has no grammatical category of phrasal verbs. Ukrainian developers either avoid them completely or place object pronouns after the particle ('turn off it' instead of 'turn it off')."
        },
        "interactivePractice": {
          "sentenceBuilder": {
            "prompt": "Construct the incident mitigation update: 'If the primary database cluster fails, / the API gateway / will automatically fall back on / our read-only replica.'",
            "words": [
              "If the primary database cluster fails,",
              "the API gateway",
              "will automatically fall back on",
              "our read-only replica"
            ],
            "target": "If the primary database cluster fails, the API gateway will automatically fall back on our read-only replica",
            "hint": "Conditional clause + subject + phrasal verb 'fall back on' + object."
          },
          "inputDrill": {
            "sentenceBefore": "Before approving the migration, we need to",
            "missingWord": "drill down into",
            "sentenceAfter": "the slow query telemetry in Datadog.",
            "hint": "Three words: 'drill down into'.",
            "explanation": "Idiomatic phrasal verb meaning to conduct an in-depth investigation into granular metrics."
          },
          "deepQuiz": {
            "question": "Which sentence correctly handles pronoun placement with a separable phrasal verb?",
            "options": [
              "The deployment introduced a critical bug, so we had to roll back it immediately.",
              "The deployment introduced a critical bug, so we had to roll it back immediately.",
              "The deployment introduced a critical bug, so we had to roll back them immediately.",
              "The deployment introduced a critical bug, so we had to roll back of it."
            ],
            "correctIndex": 1,
            "explanation": "When the direct object of a separable phrasal verb is a pronoun ('it'), it must be placed between the verb and the particle ('roll it back')."
          },
          "speakingSimulation": {
            "prompt": "Give a standup update on infrastructure decommissioning and rollout using at least three phrasal verbs.",
            "collocations": [
              "spun up staging environments",
              "phasing out legacy APIs",
              "rolled back the canary"
            ],
            "sampleNativeAnswer": "This morning, we spun up three isolated benchmark clusters in AWS to load-test our Kafka consumers. Meanwhile, we are phasing out the v1 REST endpoints and have automated our pipelines to roll back any canary release exceeding five hundred milliseconds."
          }
        },
        "checklist": [
          {
            "id": "c_m_3_6_1",
            "text": "Study the Phrasal Verbs in Cloud & Software Engineering formula & contrastive rules"
          },
          {
            "id": "c_m_3_6_2",
            "text": "Complete the interactive Sentence Builder & Input Drill"
          },
          {
            "id": "c_m_3_6_3",
            "text": "Pass the deep technical challenge quiz with 100% accuracy"
          }
        ],
        "actionTarget": {
          "tab": "practice",
          "practiceMode": "sentences",
          "title": "Practice Arena",
          "buttonText": "🧩 Assemble Technical Phrasal Verbs"
        },
        "targetVocabulary": [
          {
            "term": "drill down into",
            "pos": "Technical Phrasal Verb",
            "definition": "Investigate data or telemetry at deeper, more granular levels of detail.",
            "example": "Before approving the migration, we need to drill down into the slow query telemetry.",
            "usageTip": "Authentic engineering idiom for granular analytical investigations."
          },
          {
            "term": "spin up isolated clusters",
            "pos": "Cloud Phrasal Verb",
            "definition": "Instantiate virtual machines, containers, or test environments in the cloud.",
            "example": "Our CI pipeline automatically spins up isolated staging clusters for integration testing.",
            "usageTip": "Replaces generic formal verbs like 'initialize' or 'create' in daily agile speech."
          },
          {
            "term": "roll it back immediately",
            "pos": "Separable Phrasal Verb + Pronoun",
            "definition": "Revert software or configuration to the previous known stable version.",
            "example": "The deployment triggered high error rates, so we had to roll it back immediately.",
            "usageTip": "Object pronouns must sit in the middle: 'roll it back' (never 'roll back it')."
          },
          {
            "term": "phase out legacy endpoints",
            "pos": "Deprecation Phrasal Verb",
            "definition": "Gradually deprecate and discontinue software components in planned stages.",
            "example": "We plan to phase out legacy v1 REST endpoints over the next two quarters.",
            "usageTip": "Standard engineering phrase for multi-month deprecation cadences."
          }
        ]
      }
    ]
  },
  {
    "id": "stage_4",
    "number": 4,
    "title": "Stage 4: Strategic Workplace Negotiation & Spoken Fluency",
    "level": "C1 Professional Fluency",
    "description": "Master high-stakes workplace discourse: constructive code review diplomacy, blameless postmortems, defending architecture to product managers, and system design interviews.",
    "badge": "Stage 4",
    "color": "#f59e0b",
    "milestones": [
      {
        "id": "m_4_1",
        "stageId": "stage_4",
        "number": "4.1",
        "title": "Constructive Code Review Diplomacy & Soft Pushback",
        "category": "Diplomatic Engineering",
        "icon": "🤝",
        "estimatedTime": "30 mins",
        "xp": 85,
        "level": "C1",
        "tagline": "Express critical feedback constructively without triggering defensive resistance during pull request reviews.",
        "whyItMatters": "Saying 'This is wrong' or 'Why did you write this?' destroys psychological safety and causes interpersonal conflict. Senior engineers phrase feedback collaboratively: 'Have we considered...', 'I have a minor reservation regarding...', or 'What do you think about extracting this into a pure function?'",
        "learnContent": {
          "summary": "Diplomatic inquiry frames: 'Have we explored...', 'My primary concern here is...', 'Could we consider...', 'I wonder if it might be cleaner to...'. Distinguish between 'blocking concerns' and 'non-blocking nits'.",
          "formula": "Observation + Potential Trade-off + Collaborative Suggestion",
          "rules": [
            "Prefix non-critical comments with 'Nit:' to signal they are non-blocking suggestions.",
            "Frame critique around the code, never the person: 'This function has multiple responsibilities' (not 'You wrote a bad function').",
            "Suggest an actionable alternative: 'Could we benchmark this against a Map lookup?'"
          ],
          "badVsGood": {
            "bad": "Your PR is bad because it introduces memory leak. Rewrite this part completely.",
            "good": "I noticed that the subscription listener isn't deregistered on component unmount, which could lead to a memory leak under frequent re-renders. Could we wrap this in a cleanup hook?",
            "explanation": "Replaces hostile confrontation with an objective architectural observation and a constructive, polite solution."
          },
          "ukrainianTrap": "In Slavic communication cultures, directness is often viewed as efficiency. In international tech teams, unhedged critique is perceived as abrasive and hostile. Diplomatic softening is required for senior engineering leadership."
        },
        "interactivePractice": {
          "sentenceBuilder": {
            "prompt": "Assemble the constructive PR feedback: 'Could we consider / extracting this validation logic / into a dedicated utility / to improve testability?'",
            "words": [
              "Could we consider",
              "extracting this validation logic",
              "into a dedicated utility",
              "to improve testability?"
            ],
            "target": "Could we consider extracting this validation logic into a dedicated utility to improve testability?",
            "hint": "Polite modal proposal + gerund action + purpose clause."
          },
          "inputDrill": {
            "sentenceBefore": "While this implementation is functional, my main",
            "missingWord": "reservation is regarding scalability",
            "sentenceAfter": "when tenant datasets exceed ten thousand records.",
            "hint": "Four words: 'reservation is regarding scalability'.",
            "explanation": "Softened diplomatic phrasing framing technical reservations around scaling boundaries."
          },
          "deepQuiz": {
            "question": "Which PR review comment best exemplifies senior technical diplomacy?",
            "options": [
              "This code is completely unreadable. Change it immediately.",
              "Why did you use a linear search here instead of a hash map?",
              "Nice work on the core algorithm! Given our latency SLA, I wonder if replacing this nested loop with a hash lookup might prevent bottlenecking under heavy load?",
              "Approved, but I don't like how you formatted this line."
            ],
            "correctIndex": 2,
            "explanation": "Option 3 validates good work, objectively identifies the risk in relation to system SLAs, and presents a collaborative optimization inquiry."
          },
          "speakingSimulation": {
            "prompt": "Record a 1-minute audio feedback response for a junior colleague's pull request.",
            "collocations": [
              "kudos on getting the PR up",
              "minor concern regarding error handling",
              "what do you think about adding a retry policy"
            ],
            "sampleNativeAnswer": "Kudos on getting this feature branch up so quickly! The core business logic looks solid. I have one minor observation regarding third-party API failures—what do you think about introducing an exponential backoff retry policy before merging?"
          }
        },
        "checklist": [
          {
            "id": "c_m_4_1_1",
            "text": "Study the Constructive Code Review Diplomacy & Soft Pushback formula & contrastive rules"
          },
          {
            "id": "c_m_4_1_2",
            "text": "Complete the interactive Sentence Builder & Input Drill"
          },
          {
            "id": "c_m_4_1_3",
            "text": "Pass the deep technical challenge quiz with 100% accuracy"
          }
        ],
        "actionTarget": {
          "tab": "practice",
          "practiceMode": "sentences",
          "title": "Practice Arena",
          "buttonText": "🧩 Assemble Diplomatic Feedback"
        },
        "targetVocabulary": [
          {
            "term": "reservation is regarding scalability",
            "pos": "Diplomatic Pushback Formula",
            "definition": "Polite phrasing to voice critical architectural concerns without personal confrontation.",
            "example": "While this implementation is functional, my main reservation is regarding scalability.",
            "usageTip": "Frames critique around objective scaling boundaries rather than attacking the author's skill."
          },
          {
            "term": "could we consider extracting",
            "pos": "Collaborative Proposal Syntax",
            "definition": "Polite suggestion encouraging code refinement via collaborative inquiry.",
            "example": "Could we consider extracting this validation logic into a dedicated utility?",
            "usageTip": "Invites the author into the design process rather than issuing an authoritarian command."
          },
          {
            "term": "non-blocking nit",
            "pos": "Code Review Convention",
            "definition": "Minor stylistic suggestion that does not block pull request approval or merging.",
            "example": "Nit: Consider renaming this variable to adhere to our camelCase convention.",
            "usageTip": "Prefixing with 'Nit:' prevents junior developers from overthinking minor stylistic tweaks."
          },
          {
            "term": "kudos on getting the PR up",
            "pos": "Interpersonal Affirmation",
            "definition": "Validating colleague effort and progress before providing constructive critique.",
            "example": "Kudos on getting this feature branch up so quickly! I have one minor observation regarding retries.",
            "usageTip": "Builds psychological safety and receptivity in distributed asynchronous teams."
          }
        ]
      },
      {
        "id": "m_4_2",
        "stageId": "stage_4",
        "number": "4.2",
        "title": "Incident Postmortem Leadership & Blameless RCA",
        "category": "Incident Management",
        "icon": "🛡️",
        "estimatedTime": "35 mins",
        "xp": 90,
        "level": "C1",
        "tagline": "Facilitate root-cause analysis (RCA) meetings and write postmortems that investigate systemic failures without blame.",
        "whyItMatters": "True engineering maturity is reflected in blameless postmortems. Blaming individual engineers ('John deployed without testing') creates fear. Senior engineers investigate systemic vulnerabilities: 'Our CI/CD pipeline lacked automated canary validation, which permitted an undetected regression to reach production.'",
        "learnContent": {
          "summary": "Blameless vocabulary: 'contributing factors', 'systemic vulnerabilities', 'automated safeguards', 'timeline of events', 'action items', 'mean time to detect (MTTD)', 'mean time to resolve (MTTR)'.",
          "formula": "Systemic Vulnerability + Trigger Event ➔ Remediation & Automated Safeguards",
          "rules": [
            "Never mention personal names as points of failure; focus on missing safeguards.",
            "Distinguish between the proximate trigger (what sparked the incident) and root causes (why the system allowed it).",
            "Ensure every action item is measurable and preventative (e.g., 'Add synthetic monitoring for checkout flow')."
          ],
          "badVsGood": {
            "bad": "Alex made a typo in the database config file and production died for two hours.",
            "good": "A configuration syntax discrepancy was deployed due to a gap in our pre-commit schema validation, resulting in a 45-minute service degradation.",
            "explanation": "Focuses on the systemic gap (missing pre-commit validation) rather than individual human error."
          },
          "ukrainianTrap": "In many Eastern European environments, finding the person responsible is the default reflex. Western engineering culture strictly separates human fallibility from system resilience via Blameless Postmortems."
        },
        "interactivePractice": {
          "sentenceBuilder": {
            "prompt": "Assemble the blameless postmortem insight: 'Rather than attributing the outage / to individual human error, / we must address the missing / automated deployment validation.'",
            "words": [
              "Rather than attributing the outage",
              "to individual human error,",
              "we must address the missing",
              "automated deployment validation"
            ],
            "target": "Rather than attributing the outage to individual human error, we must address the missing automated deployment validation",
            "hint": "Prepositional phrase + comma + modal verb clause."
          },
          "inputDrill": {
            "sentenceBefore": "Our primary action item from this incident is to implement",
            "missingWord": "automated canary analysis",
            "sentenceAfter": "to halt rollouts automatically when error rates spike.",
            "hint": "Three words: 'automated canary analysis'.",
            "explanation": "Systemic safeguard preventing human operators from manually verifying faulty deployments."
          },
          "deepQuiz": {
            "question": "What is the foundational philosophy behind a Blameless Postmortem?",
            "options": [
              "To ensure that the engineer responsible is publicly reprimanded so mistakes are not repeated.",
              "To acknowledge that humans make mistakes, and design systems with guardrails that make catastrophic mistakes impossible.",
              "To pretend that the outage never happened so management remains satisfied.",
              "To delegate all deployment responsibilities strictly to external contractors."
            ],
            "correctIndex": 1,
            "explanation": "Blameless postmortems assume well-intentioned engineers and focus on engineering resilient safeguards against systemic failures."
          },
          "speakingSimulation": {
            "prompt": "Present a 90-second incident debrief summarizing a major database outage to the VP of Engineering.",
            "collocations": [
              "timeline of events",
              "root contributing factor",
              "mean time to recovery",
              "preventative action items"
            ],
            "sampleNativeAnswer": "At 14:15 UTC, an automated cron job triggered an unindexed batch deletion, creating massive table lock contention on our primary database. Our mean time to recovery was 28 minutes. As a permanent preventative safeguard, we are enforcing query timeout thresholds and migrating all batch cleanup jobs to dedicated read-replicas during off-peak hours."
          }
        },
        "checklist": [
          {
            "id": "c_m_4_2_1",
            "text": "Study the Incident Postmortem Leadership & Blameless RCA formula & contrastive rules"
          },
          {
            "id": "c_m_4_2_2",
            "text": "Complete the interactive Sentence Builder & Input Drill"
          },
          {
            "id": "c_m_4_2_3",
            "text": "Pass the deep technical challenge quiz with 100% accuracy"
          }
        ],
        "actionTarget": {
          "tab": "speaking",
          "practiceMode": "code_002",
          "title": "Lead Incident Postmortem",
          "buttonText": "🎙️ Deliver Incident Briefing"
        },
        "targetVocabulary": [
          {
            "term": "automated canary analysis",
            "pos": "Continuous Delivery Safeguard",
            "definition": "Automated evaluation of canary error and latency metrics against production baselines.",
            "example": "Our primary action item is to implement automated canary analysis to halt faulty rollouts.",
            "usageTip": "Systemic guardrail removing manual human gatekeeping from release verification."
          },
          {
            "term": "blameless postmortem",
            "pos": "Engineering Culture Term",
            "definition": "Incident retrospective assuming well-intentioned engineers, focusing on systemic gaps.",
            "example": "Our blameless postmortem focused on missing pre-commit validation rather than human error.",
            "usageTip": "Excludes personal names from failure points; focuses entirely on missing guardrails."
          },
          {
            "term": "mean time to recovery (MTTR)",
            "pos": "SRE Reliability Metric",
            "definition": "The average time required to troubleshoot and restore normal service operations following an outage.",
            "example": "By automating regional failover, we reduced our mean time to recovery to under fifteen minutes.",
            "usageTip": "Core site reliability metric measuring incident response efficiency."
          },
          {
            "term": "timeline of contributing factors",
            "pos": "Incident Analysis Term",
            "definition": "Chronological sequence of interacting conditions that culminated in service degradation.",
            "example": "Complex outages are rarely caused by a single bug, but by a timeline of contributing factors.",
            "usageTip": "Complex systems fail through cascading interactions rather than isolated single root causes."
          }
        ]
      },
      {
        "id": "m_4_3",
        "stageId": "stage_4",
        "number": "4.3",
        "title": "Defending Architectural Decisions to Non-Technical Stakeholders",
        "category": "Stakeholder Alignment",
        "icon": "💼",
        "estimatedTime": "35 mins",
        "xp": 90,
        "level": "C1",
        "tagline": "Translate technical architecture, debt, and refactoring into business value: revenue, conversion, and risk mitigation.",
        "whyItMatters": "Talking to product managers, sales directors, or the CEO using internal jargon ('we need to rewrite the gRPC protos') fails. Senior engineers translate technical trade-offs into customer churn, page load conversion loss, and infrastructure cost savings.",
        "learnContent": {
          "summary": "Business translation formulas: 'Every 100ms latency reduction increases conversion by 1%', 'Ignoring this technical debt introduces a 30% drag on future feature velocity', 'This architectural investment mitigates GDPR compliance breach risks.'",
          "formula": "Technical Problem ➔ Business Impact (Revenue / Risk / Velocity) ➔ Proposed Solution",
          "rules": [
            "Avoid pure implementation details when communicating with executives.",
            "Quantify risks in currency, downtime percentages, or user churn metrics.",
            "Frame engineering investments as accelerators for strategic company goals."
          ],
          "badVsGood": {
            "bad": "We have to rewrite our backend because Python is slow and we want to use Rust for speed.",
            "good": "Migrating our high-throughput payment processor to Rust will slash our cloud infrastructure spend by forty percent and ensure our latency SLA remains under twenty milliseconds during peak holiday sales.",
            "explanation": "Connects a technology choice directly to bottom-line cloud expenditure and revenue stability during critical sales periods."
          },
          "ukrainianTrap": "Developers often express desires as personal technology preferences ('We want to use X'). Executives need business justification ('Using X cuts AWS costs and expands capacity')."
        },
        "interactivePractice": {
          "sentenceBuilder": {
            "prompt": "Construct the executive proposal: 'Investing two sprints in refactoring / will reduce customer churn / caused by frequent checkout timeouts / and protect holiday revenue.'",
            "words": [
              "Investing two sprints in refactoring",
              "will reduce customer churn",
              "caused by frequent checkout timeouts",
              "and protect holiday revenue"
            ],
            "target": "Investing two sprints in refactoring will reduce customer churn caused by frequent checkout timeouts and protect holiday revenue",
            "hint": "Gerund subject + modal verb + coordinate business benefit objects."
          },
          "inputDrill": {
            "sentenceBefore": "By migrating our media transcoding pipeline to serverless workers, we can",
            "missingWord": "cut operational costs by 35%",
            "sentenceAfter": "while scaling compute capacity dynamically.",
            "hint": "Five words: 'cut operational costs by 35%'.",
            "explanation": "Clear business outcome tying architectural change to significant financial cost savings."
          },
          "deepQuiz": {
            "question": "How should a Senior Engineer pitch an architectural migration to the Chief Product Officer?",
            "options": [
              "Focus entirely on compiler optimizations and memory safety features.",
              "Demonstrate how the migration eliminates bottlenecks that currently delay feature launches by several weeks.",
              "Argue that other tech companies are using this stack.",
              "Explain that developers are bored with the current framework."
            ],
            "correctIndex": 1,
            "explanation": "Aligning the architecture migration with feature time-to-market directly speaks to product leadership priorities."
          },
          "speakingSimulation": {
            "prompt": "Deliver an elevator pitch to the CFO explaining why modernizing the data pipeline is a financial priority.",
            "collocations": [
              "cloud infrastructure spend",
              "reduces compute overhead",
              "accelerates customer onboarding",
              "return on investment"
            ],
            "sampleNativeAnswer": "Currently, our legacy data pipeline costs eighty thousand dollars monthly in redundant cloud compute and requires manual developer intervention twice a week. Modernizing this infrastructure will deliver a complete return on investment within six months while cutting pipeline execution time by seventy percent."
          }
        },
        "checklist": [
          {
            "id": "c_m_4_3_1",
            "text": "Study the Defending Architectural Decisions to Non-Technical Stakeholders formula & contrastive rules"
          },
          {
            "id": "c_m_4_3_2",
            "text": "Complete the interactive Sentence Builder & Input Drill"
          },
          {
            "id": "c_m_4_3_3",
            "text": "Pass the deep technical challenge quiz with 100% accuracy"
          }
        ],
        "actionTarget": {
          "tab": "practice",
          "practiceMode": "sentences",
          "title": "Practice Arena",
          "buttonText": "🧩 Assemble Business Cases"
        },
        "targetVocabulary": [
          {
            "term": "cut operational costs by 35%",
            "pos": "Business Value Proposition",
            "definition": "Quantified reduction in cloud infrastructure or licensing expenditure.",
            "example": "Migrating our transcoding pipeline will cut operational costs by 35%.",
            "usageTip": "Translates technical refactoring into financial savings compelling to executive leaders."
          },
          {
            "term": "mitigate customer churn",
            "pos": "Business Risk Term",
            "definition": "Preventing paying users from abandoning the service due to poor latency or reliability.",
            "example": "Eliminating checkout timeouts is critical to mitigate customer churn during holiday sales.",
            "usageTip": "Connects site reliability directly to customer retention and company revenue."
          },
          {
            "term": "drag on feature velocity",
            "pos": "Productivity Cost Collocation",
            "definition": "The slowdown in shipping new product capabilities caused by navigating fragile legacy code.",
            "example": "Accumulated technical debt currently imposes a 30% drag on feature velocity.",
            "usageTip": "The most effective argument to persuade product managers to allocate refactoring sprints."
          },
          {
            "term": "return on investment (ROI)",
            "pos": "Executive Financial Metric",
            "definition": "Ratio between net financial profit or cost savings and initial cost of project investment.",
            "example": "Modernizing our data pipeline will deliver a complete return on investment within six months.",
            "usageTip": "Essential acronym when defending multi-sprint engineering migrations to the CFO."
          }
        ]
      },
      {
        "id": "m_4_4",
        "stageId": "stage_4",
        "number": "4.4",
        "title": "System Design Interview Dialogue: Scoping & Trade-offs",
        "category": "Interview Mastery",
        "icon": "🎯",
        "estimatedTime": "40 mins",
        "xp": 95,
        "level": "C1",
        "tagline": "Lead senior system design discussions: clarify functional and non-functional requirements, and justify trade-offs.",
        "whyItMatters": "In senior system design interviews, jumping straight to drawing boxes and databases is an immediate red flag. Top candidates take ownership by asking probing scoping questions, calculating scale back-of-the-envelope, and explicitly defending trade-offs between consistency, availability, and latency.",
        "learnContent": {
          "summary": "System Design steps: 1. Clarify Requirements (Functional & Non-Functional: RPS, Storage, Latency SLA). 2. Back-of-the-envelope estimation. 3. High-level architecture (APIs, Gateway, Services, DBs). 4. Deep dive into bottlenecks (Caching, Sharding, Partitions, Failover).",
          "formula": "Requirements Clarification ➔ Scale Math ➔ High-Level Architecture ➔ Bottleneck Deep Dive",
          "rules": [
            "Always ask clarifying questions before proposing solutions: 'Are we optimizing for read-heavy or write-heavy traffic?'",
            "State trade-offs explicitly: 'We can achieve strong consistency via Spanner, but at the cost of higher write latency.'",
            "Perform quick mathematical sanity checks: 100M daily active users * 10 requests = ~12,000 QPS."
          ],
          "badVsGood": {
            "bad": "I will put Kafka and then microservices and then Redis and MongoDB for everything.",
            "good": "Before designing the components, I'd like to clarify our scale: assuming 50 million daily active users with a 100:1 read-to-write ratio, our architecture should prioritize aggressive caching and read-replica scaling over complex write sharding.",
            "explanation": "Demonstrates structured, analytical problem breakdown rather than blindly assembling random buzzword technologies."
          },
          "ukrainianTrap": "Many candidates treat system design as a test of memorized architectures. FAANG interviewers assess your collaborative reasoning, trade-off evaluation, and requirement clarification."
        },
        "interactivePractice": {
          "sentenceBuilder": {
            "prompt": "Assemble the interview opening: 'Before diving into the architecture, / I would like to clarify / the expected read-to-write ratio / and our p99 latency requirements.'",
            "words": [
              "Before diving into the architecture,",
              "I would like to clarify",
              "the expected read-to-write ratio",
              "and our p99 latency requirements"
            ],
            "target": "Before diving into the architecture, I would like to clarify the expected read-to-write ratio and our p99 latency requirements",
            "hint": "Introductory prepositional phrase + polite modal verb + coordinate noun phrase objects."
          },
          "inputDrill": {
            "sentenceBefore": "Given that our application requires global availability with minimal latency, we should accept",
            "missingWord": "eventual consistency",
            "sentenceAfter": "in favor of high partition tolerance.",
            "hint": "Two words: 'eventual consistency'.",
            "explanation": "Core architectural trade-off prioritizing availability over strict immediate consistency in distributed environments."
          },
          "deepQuiz": {
            "question": "What is the first step a senior engineer should take in a System Design interview?",
            "options": [
              "Draw the database schema and foreign key constraints on the whiteboard.",
              "Ask clarifying questions to determine functional scope, traffic volume, and latency SLAs.",
              "Choose the cloud provider and Kubernetes distribution.",
              "Write the REST API routes in pseudocode."
            ],
            "correctIndex": 1,
            "explanation": "Clarifying functional requirements and non-functional constraints defines the problem boundaries before architecting components."
          },
          "speakingSimulation": {
            "prompt": "Simulate the first 2 minutes of designing a real-time notification system in an interview.",
            "collocations": [
              "clarify the scale",
              "read-heavy vs write-heavy",
              "delivery guarantee trade-offs",
              "back-of-the-envelope calculations"
            ],
            "sampleNativeAnswer": "To ensure we build the right system, I'd like to start by scoping our requirements. Are we delivering push notifications, emails, or SMS? Secondly, what is our target scale—how many active users, and what is our peak delivery latency expectation? Lastly, is at-least-once delivery acceptable, or do we strictly require exactly-once processing with deduplication?"
          }
        },
        "checklist": [
          {
            "id": "c_m_4_4_1",
            "text": "Study the System Design Interview Dialogue: Scoping & Trade-offs formula & contrastive rules"
          },
          {
            "id": "c_m_4_4_2",
            "text": "Complete the interactive Sentence Builder & Input Drill"
          },
          {
            "id": "c_m_4_4_3",
            "text": "Pass the deep technical challenge quiz with 100% accuracy"
          }
        ],
        "actionTarget": {
          "tab": "speaking",
          "practiceMode": "code_002",
          "title": "System Design Interview Simulation",
          "buttonText": "🎙️ Simulate System Design"
        },
        "targetVocabulary": [
          {
            "term": "eventual consistency",
            "pos": "Distributed Systems Trade-off",
            "definition": "Consistency model where all replicas eventually converge to identical state without immediate locking.",
            "example": "Given our global scale, we should accept eventual consistency in favor of partition tolerance.",
            "usageTip": "Core architectural trade-off prioritizing availability and latency over linearizability."
          },
          {
            "term": "read-heavy vs write-heavy ratio",
            "pos": "System Design Scoping Term",
            "definition": "Proportion of database reads compared to writes (e.g. 100:1 read-heavy for Twitter/Instagram).",
            "example": "Before designing components, I'd like to clarify our expected read-heavy vs write-heavy ratio.",
            "usageTip": "Determines whether to invest in aggressive caching or complex write sharding."
          },
          {
            "term": "back-of-the-envelope estimation",
            "pos": "Interview Methodology Collocation",
            "definition": "Quick approximate mathematical calculation to size bandwidth, storage, and QPS requirements.",
            "example": "Let's perform a back-of-the-envelope estimation: 50 million DAU generates approximately 12,000 QPS.",
            "usageTip": "Demonstrates analytical rigor before committing to architectural component design."
          },
          {
            "term": "temporal decoupling",
            "pos": "Architecture Property",
            "definition": "Separating components so the sender and receiver do not need to be online simultaneously.",
            "example": "Message queues provide temporal decoupling between ingestion and processing services.",
            "usageTip": "Senior architectural explanation for introducing asynchronous message brokers."
          }
        ]
      },
      {
        "id": "m_4_5",
        "stageId": "stage_4",
        "number": "4.5",
        "title": "Sprint Estimation, Refinement & Scope Creep Pushback",
        "category": "Agile Leadership",
        "icon": "⏱️",
        "estimatedTime": "30 mins",
        "xp": 85,
        "level": "C1",
        "tagline": "Provide realistic engineering estimates, negotiate story points, and politely push back against mid-sprint additions.",
        "whyItMatters": "Saying 'Yes, sure, we will do it' to every mid-sprint feature request leads to burnout and missed deadlines. Senior engineers use professional boundary negotiation: 'Given our current velocity, accommodating this ticket requires descoping an equivalent story from Sprint 12.'",
        "learnContent": {
          "summary": "Negotiation phrases: 'Given the unknown dependencies...', 'To accommodate this request, what should we deprioritize?', 'Our confidence interval for this estimate is based on...', 'Adding this scope introduces substantial risk to our release deadline.'",
          "formula": "Fixed Capacity = Trade-off Required (Scope In ➔ Scope Out)",
          "rules": [
            "Never simply say 'No'; provide the trade-off constraint: 'We can take this on if we defer the search filtering ticket.'",
            "Account for unknown discovery time: 'This estimate includes a 2-day spike to evaluate third-party SDK compatibility.'",
            "Refer to team velocity as an objective factual constraint, not a personal preference."
          ],
          "badVsGood": {
            "bad": "No, we cannot do this task because sprint is already full and you always add more work.",
            "good": "Our sprint capacity is currently fully committed to the payment gateway deliverable. If this new analytics requirement is urgent, we can certainly accommodate it by swapping out the user preferences ticket.",
            "explanation": "Demonstrates professional, boundary-respecting agile collaboration rather than emotional confrontation."
          },
          "ukrainianTrap": "Developers often feel pressured to accept unreasonable deadlines and express frustration through passive aggression. Master the professional art of swap-based scope negotiation."
        },
        "interactivePractice": {
          "sentenceBuilder": {
            "prompt": "Construct the scope negotiation statement: 'To accommodate this urgent feature / without jeopardizing our release deadline, / we recommend deferring the notification overhaul / to the subsequent sprint.'",
            "words": [
              "To accommodate this urgent feature",
              "without jeopardizing our release deadline,",
              "we recommend deferring the notification overhaul",
              "to the subsequent sprint"
            ],
            "target": "To accommodate this urgent feature without jeopardizing our release deadline, we recommend deferring the notification overhaul to the subsequent sprint",
            "hint": "Infinitive purpose clause + prepositional qualifier + main recommendation clause."
          },
          "inputDrill": {
            "sentenceBefore": "Because this integration touches unmapped third-party APIs, our estimate includes a two-day",
            "missingWord": "investigative spike",
            "sentenceAfter": "to de-risk the implementation.",
            "hint": "Two words: 'investigative spike'.",
            "explanation": "Agile terminology for a timeboxed research or prototyping task designed to resolve technical uncertainty."
          },
          "deepQuiz": {
            "question": "A product manager insists on adding a complex feature three days before sprint completion. What is the most effective senior response?",
            "options": [
              "Accept the work and work overtime over the weekend to finish it.",
              "Tell the product manager that they do not understand software engineering.",
              "Explain that our capacity is committed, but we can swap out a lower-priority task of equivalent size if this takes precedence.",
              "Quietly ignore the ticket and do not complete it."
            ],
            "correctIndex": 2,
            "explanation": "Swap-based scope negotiation respects team capacity while empowering product managers to make informed priority trade-offs."
          },
          "speakingSimulation": {
            "prompt": "Simulate pushing back against an unrealistic deadline during sprint planning with your PM.",
            "collocations": [
              "fully committed capacity",
              "jeopardize release stability",
              "propose a phased rollout",
              "defer non-essential scope"
            ],
            "sampleNativeAnswer": "Given the technical complexity of migrating our authentication provider, our team capacity is fully committed for this sprint. Adding the multi-tenant onboarding flow now would severely jeopardize our release stability. I propose we deliver the auth migration first and schedule the onboarding flow as our top priority in the subsequent sprint."
          }
        },
        "checklist": [
          {
            "id": "c_m_4_5_1",
            "text": "Study the Sprint Estimation, Refinement & Scope Creep Pushback formula & contrastive rules"
          },
          {
            "id": "c_m_4_5_2",
            "text": "Complete the interactive Sentence Builder & Input Drill"
          },
          {
            "id": "c_m_4_5_3",
            "text": "Pass the deep technical challenge quiz with 100% accuracy"
          }
        ],
        "actionTarget": {
          "tab": "practice",
          "practiceMode": "sentences",
          "title": "Practice Arena",
          "buttonText": "🧩 Assemble Scope Pushbacks"
        },
        "targetVocabulary": [
          {
            "term": "investigative spike",
            "pos": "Agile Discovery Term",
            "definition": "Timeboxed research or prototyping task designed to resolve technical uncertainty before estimation.",
            "example": "Because this integration touches unmapped APIs, our estimate includes a two-day investigative spike.",
            "usageTip": "Prevents teams from committing to wild guesses on complex unknown dependencies."
          },
          {
            "term": "fully committed capacity",
            "pos": "Sprint Boundary Collocation",
            "definition": "Team developer bandwidth is 100% allocated to agreed sprint deliverables.",
            "example": "Our sprint capacity is fully committed to the payment gateway migration.",
            "usageTip": "Factual, non-emotional baseline for pushing back against mid-sprint scope creep."
          },
          {
            "term": "swap-based scope negotiation",
            "pos": "Agile Negotiation Methodology",
            "definition": "Accepting a new urgent request strictly on the condition of deferring an equal-sized deliverable.",
            "example": "We can accommodate this request if we swap out the user preferences ticket.",
            "usageTip": "Replaces unconstructive 'No' with constructive, capacity-respecting trade-off choices."
          },
          {
            "term": "confidence interval",
            "pos": "Estimation Metric",
            "definition": "The statistical range within which the actual completion time is expected to fall.",
            "example": "Our confidence interval is wide because third-party documentation is incomplete.",
            "usageTip": "Reflects mature acknowledgment of engineering unknowns rather than false precision."
          }
        ]
      },
      {
        "id": "m_4_6",
        "stageId": "stage_4",
        "number": "4.6",
        "title": "Cross-Functional Alignment: Engineering vs Security vs Product",
        "category": "Executive Alignment",
        "icon": "🌐",
        "estimatedTime": "35 mins",
        "xp": 90,
        "level": "C1",
        "tagline": "Resolve conflicting priorities between speed-to-market, cryptographic compliance, and user experience.",
        "whyItMatters": "Engineering wants clean architecture, Product wants rapid feature shipping, and Security wants rigorous zero-trust compliance. Senior engineers act as organizational synthesizers, forging consensus without alienating stakeholders.",
        "learnContent": {
          "summary": "Consensus framing: 'Finding the optimal balance between security posture and user friction', 'Aligning on acceptable risk thresholds', 'Phased compliance roadmap', 'Pragmatic middle ground'.",
          "formula": "Acknowledge Stakeholder Goals ➔ Highlight Inherent Tension ➔ Propose Synthesized Middle Ground",
          "rules": [
            "Validate the product priority first before stating engineering or security limitations.",
            "Propose a phased approach: Ship MVP with core security controls, then iterate on UX enhancements.",
            "Use consensus-building language: 'How can we align these deliverables to satisfy audit requirements without derailing our Q3 launch?'"
          ],
          "badVsGood": {
            "bad": "Security team is blocking us again with stupid rules and product is complaining.",
            "good": "While Product needs an effortless signup flow, our compliance framework mandates multi-factor authentication. Let's implement risk-based adaptive MFA so low-risk logins remain frictionless while suspicious attempts trigger verification.",
            "explanation": "Synthesizes conflicting departmental needs into an elegant, win-win technical solution (adaptive MFA)."
          },
          "ukrainianTrap": "Engineers frequently treat Security and Legal as bureaucratic enemies. Senior leaders build cross-functional coalitions by finding solutions that satisfy compliance while maintaining product momentum."
        },
        "interactivePractice": {
          "sentenceBuilder": {
            "prompt": "Construct the cross-functional synthesis: 'By adopting risk-based authentication, / we can satisfy the security audit requirements / while maintaining an effortless onboarding experience / for legitimate users.'",
            "words": [
              "By adopting risk-based authentication,",
              "we can satisfy the security audit requirements",
              "while maintaining an effortless onboarding experience",
              "for legitimate users"
            ],
            "target": "By adopting risk-based authentication, we can satisfy the security audit requirements while maintaining an effortless onboarding experience for legitimate users",
            "hint": "Method clause + coordinate predicate clauses balancing security with user experience."
          },
          "inputDrill": {
            "sentenceBefore": "To reconcile our launch deadline with compliance requirements, we agreed to a",
            "missingWord": "phased compliance roadmap",
            "sentenceAfter": "addressing critical SOC 2 controls first.",
            "hint": "Three words: 'phased compliance roadmap'.",
            "explanation": "Strategic compromise delivering regulatory compliance in prioritized phases without stalling product launch."
          },
          "deepQuiz": {
            "question": "How does a Senior Engineer handle a direct conflict between Product's speed and Security's compliance demands?",
            "options": [
              "Side with Product because shipping features drives company revenue.",
              "Side with Security and block the release indefinitely until all possible risks are eliminated.",
              "Facilitate an alignment session to identify minimum viable security controls for launch and schedule remaining hardening for phase two.",
              "Refuse to participate in the debate and let executives decide."
            ],
            "correctIndex": 2,
            "explanation": "A phased, risk-adjusted mitigation strategy enables business velocity while maintaining acceptable security baselines."
          },
          "speakingSimulation": {
            "prompt": "Deliver an opening statement at an alignment meeting between Product and Security leads.",
            "collocations": [
              "align on shared objectives",
              "acceptable risk tolerance",
              "frictionless customer experience",
              "pragmatic compromise"
            ],
            "sampleNativeAnswer": "Thank you everyone for joining. Our shared goal today is to align our Q4 checkout launch with our infosec compliance standards. We all want a frictionless customer experience that drives conversion, but we cannot compromise on customer data protection. Let's evaluate where adaptive security controls can give us the best of both worlds."
          }
        },
        "checklist": [
          {
            "id": "c_m_4_6_1",
            "text": "Study the Cross-Functional Alignment: Engineering vs Security vs Product formula & contrastive rules"
          },
          {
            "id": "c_m_4_6_2",
            "text": "Complete the interactive Sentence Builder & Input Drill"
          },
          {
            "id": "c_m_4_6_3",
            "text": "Pass the deep technical challenge quiz with 100% accuracy"
          }
        ],
        "actionTarget": {
          "tab": "practice",
          "practiceMode": "sentences",
          "title": "Practice Arena",
          "buttonText": "🧩 Assemble Cross-Functional Consensus"
        },
        "targetVocabulary": [
          {
            "term": "phased compliance roadmap",
            "pos": "Strategic Synthesis Collocation",
            "definition": "Iterative plan delivering essential regulatory controls for launch while scheduling enhancements.",
            "example": "To reconcile our launch deadline with compliance, we agreed to a phased compliance roadmap.",
            "usageTip": "Win-win compromise enabling product speed-to-market without failing compliance audits."
          },
          {
            "term": "risk-based adaptive authentication",
            "pos": "Security Architecture Pattern",
            "definition": "Stepping up MFA challenges only when login behavior deviates from normal risk profiles.",
            "example": "By adopting risk-based adaptive authentication, we satisfy security without burdening regular users.",
            "usageTip": "Reconciles Product's desire for frictionless UX with Security's compliance mandate."
          },
          {
            "term": "acceptable risk tolerance",
            "pos": "Governance Term",
            "definition": "The level of potential exposure an organization is prepared to accept to pursue strategic goals.",
            "example": "We need executive guidance to align our deliverables with acceptable risk tolerance.",
            "usageTip": "Acknowledges that zero risk is impossible; engineering must balance risk against velocity."
          },
          {
            "term": "frictionless customer experience",
            "pos": "Product Priority Collocation",
            "definition": "User journey devoid of unnecessary barriers, forms, or latency that trigger drop-offs.",
            "example": "Product leadership prioritized a frictionless customer experience to maximize signup conversion.",
            "usageTip": "Validate this goal before presenting security guardrails to product stakeholders."
          }
        ]
      }
    ]
  },
  {
    "id": "stage_5",
    "number": 5,
    "title": "Stage 5: Cloud Resilience, Distributed Systems & Failure Modes",
    "level": "C1 ➔ C2 High-Availability",
    "description": "Architect mission-critical distributed systems: CAP/PACELC trade-offs, circuit breakers, chaos engineering, canary deployments, and zero-trust security.",
    "badge": "Stage 5",
    "color": "#ec4899",
    "milestones": [
      {
        "id": "m_5_1",
        "stageId": "stage_5",
        "number": "5.1",
        "title": "The CAP Theorem, PACELC & Distributed Consistency",
        "category": "Distributed Consensus",
        "icon": "🌐",
        "estimatedTime": "35 mins",
        "xp": 95,
        "level": "C1 ➔ C2",
        "tagline": "Articulate consistency models: linearizability, eventual consistency, split-brain scenarios, and quorum reads/writes.",
        "whyItMatters": "In distributed storage systems, understanding CAP (Consistency, Availability, Partition Tolerance) and PACELC (If Partition: Availability or Consistency; Else: Latency or Consistency) is essential. Senior engineers defend choices between strong consistency (Raft/Paxos) and high availability with eventual consistency.",
        "learnContent": {
          "summary": "CAP: In the presence of a network partition (P), you must choose between Consistency (C) or Availability (A). PACELC extends this: even when operating normally without partitions (E), you must trade off Latency (L) versus Consistency (C).",
          "formula": "Network Partition ➔ Choose Consistency or Availability | Normal Operation ➔ Trade Latency for Consistency",
          "rules": [
            "Never say a system provides 'all three of CAP'; partitions are an unavoidable physical reality of networks.",
            "Say 'linearizable consistency' or 'strong consistency' (not 'real-time saving').",
            "Explain split-brain prevention: 'fencing tokens and majority quorum voting'."
          ],
          "badVsGood": {
            "bad": "Our database has all three: consistency, availability and partition tolerance because cloud never fails.",
            "good": "Under the PACELC theorem, our globally distributed database prioritizes low read latency over strict serializability during normal operations, settling for bounded eventual consistency.",
            "explanation": "Demonstrates rigorous distributed systems fluency by applying the modern PACELC theorem rather than simplified slogans."
          },
          "ukrainianTrap": "Candidates often parrot 'CAP theorem means choose two of three'. Senior engineers clarify that network partitions cannot be chosen away; the real choice is behavior under partition, and latency vs consistency during healthy states."
        },
        "interactivePractice": {
          "sentenceBuilder": {
            "prompt": "Construct the architectural rationale: 'Because network partitions are physically inevitable, / our distributed storage layer / chooses availability over immediate consistency, / relying on read-repair mechanisms.'",
            "words": [
              "Because network partitions are physically inevitable,",
              "our distributed storage layer",
              "chooses availability over immediate consistency,",
              "relying on read-repair mechanisms"
            ],
            "target": "Because network partitions are physically inevitable, our distributed storage layer chooses availability over immediate consistency, relying on read-repair mechanisms",
            "hint": "Causal subordinate clause + subject + predicate + participle instrument."
          },
          "inputDrill": {
            "sentenceBefore": "To prevent split-brain scenarios during network partitions, the consensus algorithm requires a",
            "missingWord": "strict majority quorum",
            "sentenceAfter": "before committing writes.",
            "hint": "Three words: 'strict majority quorum'.",
            "explanation": "Distributed consensus requirement (e.g. Raft, Paxos) where N/2 + 1 nodes must agree to commit state."
          },
          "deepQuiz": {
            "question": "What does the PACELC theorem add to the traditional CAP theorem?",
            "options": [
              "It proves that relational databases can never run inside Docker containers.",
              "It addresses the trade-off between Latency and Consistency during normal operations when no network partition exists.",
              "It guarantees zero data loss in all distributed cloud providers.",
              "It replaces SQL with GraphQL for all distributed queries."
            ],
            "correctIndex": 1,
            "explanation": "PACELC highlights that even during normal operation (Else), a system must trade off Latency (L) against Consistency (C)."
          },
          "speakingSimulation": {
            "prompt": "Defend your choice of a distributed database architecture in an executive technical review.",
            "collocations": [
              "PACELC trade-offs",
              "bounded eventual consistency",
              "majority quorum writes",
              "tolerate network partitions"
            ],
            "sampleNativeAnswer": "Given that our e-commerce catalog requires sub-twenty millisecond read latency globally, we selected a PACELC-compliant NoSQL store. During normal operations, we trade strict consistency for minimal latency via local read replicas, while accepting bounded eventual consistency across secondary cloud regions."
          }
        },
        "checklist": [
          {
            "id": "c_m_5_1_1",
            "text": "Study the The CAP Theorem, PACELC & Distributed Consistency formula & contrastive rules"
          },
          {
            "id": "c_m_5_1_2",
            "text": "Complete the interactive Sentence Builder & Input Drill"
          },
          {
            "id": "c_m_5_1_3",
            "text": "Pass the deep technical challenge quiz with 100% accuracy"
          }
        ],
        "actionTarget": {
          "tab": "practice",
          "practiceMode": "sentences",
          "title": "Practice Arena",
          "buttonText": "🧩 Assemble Distributed Consensus"
        },
        "targetVocabulary": [
          {
            "term": "strict majority quorum",
            "pos": "Distributed Consensus Requirement",
            "definition": "Consensus rule requiring N/2 + 1 active nodes to agree before committing write operations.",
            "example": "To prevent split-brain scenarios during partitions, the consensus algorithm requires a strict majority quorum.",
            "usageTip": "Core mathematical invariant in Raft and Paxos distributed consensus protocols."
          },
          {
            "term": "PACELC theorem",
            "pos": "Distributed Systems Theory",
            "definition": "If Partition (P): Availability (A) or Consistency (C); Else (E): Latency (L) or Consistency (C).",
            "example": "Under the PACELC theorem, our database prioritizes latency over serializability during normal operations.",
            "usageTip": "Modern extension of CAP theorem addressing non-partitioned steady-state trade-offs."
          },
          {
            "term": "split-brain scenarios",
            "pos": "Distributed Failure Mode",
            "definition": "Network partition causing isolated cluster segments to each believe they are the legitimate leader.",
            "example": "Fencing tokens and epoch numbers prevent split-brain scenarios from corrupting storage.",
            "usageTip": "Fatal distributed state that produces irreconcilable data divergences if unmitigated."
          },
          {
            "term": "bounded eventual consistency",
            "pos": "Consistency Model",
            "definition": "Guaranteed convergence to identical state within a defined, predictable time or version delta.",
            "example": "Our mobile clients operate under bounded eventual consistency via vector clock reconciliation.",
            "usageTip": "More precise than vague 'eventual consistency' in mission-critical SLAs."
          }
        ]
      },
      {
        "id": "m_5_2",
        "stageId": "stage_5",
        "number": "5.2",
        "title": "Circuit Breakers, Bulkheads, Exponential Backoff & Jitter",
        "category": "Resilience Patterns",
        "icon": "⚡",
        "estimatedTime": "35 mins",
        "xp": 95,
        "level": "C1 ➔ C2",
        "tagline": "Explain cascading failure prevention: open/closed circuit states, thread-pool isolation, and randomized retry backoff.",
        "whyItMatters": "When a downstream service degrades, naive retries immediately trigger a catastrophic retry storm that brings down the entire architecture. Senior engineers design systems with Circuit Breakers (Closed, Open, Half-Open), bulkheading, and exponential backoff decorated with full jitter.",
        "learnContent": {
          "summary": "Circuit Breaker states: Closed (normal execution), Open (fail-fast immediately on threshold errors), Half-Open (send probe requests). Bulkheading isolates thread pools so failure in one integration doesn't consume all system threads. Jitter staggers retries to prevent herd behavior.",
          "formula": "Downstream Degraded ➔ Trip Circuit to Open ➔ Fail Fast ➔ Probe in Half-Open ➔ Auto-Recover",
          "rules": [
            "Say 'fail fast' (not 'fail quickly without trying').",
            "Say 'cascading failure / retry storm' (not 'all services falling like dominoes').",
            "Say 'decorating backoff intervals with randomized jitter' (not 'randomizing the sleep')."
          ],
          "badVsGood": {
            "bad": "When payment service died, our API retried 100 times every second and everything crashed.",
            "good": "Because our clients lacked backoff jitter, a transient latency spike triggered an avalanche retry storm, tripping the upstream circuit breakers into an open fail-fast state.",
            "explanation": "Applies professional systems resilience terms ('backoff jitter', 'avalanche retry storm', 'fail-fast state') to describe cascading degradation."
          },
          "ukrainianTrap": "Developers often write simple 'while loop retries'. In distributed production, uncoordinated retries act as a self-inflicted Distributed Denial of Service (DDoS) attack."
        },
        "interactivePractice": {
          "sentenceBuilder": {
            "prompt": "Assemble the resilience mechanism statement: 'By wrapping third-party API calls / in a circuit breaker with exponential backoff, / we prevent cascading failures / when upstream dependencies experience outages.'",
            "words": [
              "By wrapping third-party API calls",
              "in a circuit breaker with exponential backoff,",
              "we prevent cascading failures",
              "when upstream dependencies experience outages"
            ],
            "target": "By wrapping third-party API calls in a circuit breaker with exponential backoff, we prevent cascading failures when upstream dependencies experience outages",
            "hint": "Gerund prepositional phrase + main clause + temporal dependent clause."
          },
          "inputDrill": {
            "sentenceBefore": "To prevent thousands of failed worker clients from retrying simultaneously, we decorated our backoff algorithm with",
            "missingWord": "randomized full jitter",
            "sentenceAfter": "to distribute retry spikes.",
            "hint": "Three words: 'randomized full jitter'.",
            "explanation": "Mathematical technique adding uniform random dispersion to exponential retry intervals."
          },
          "deepQuiz": {
            "question": "What occurs when a Circuit Breaker enters the 'Half-Open' state?",
            "options": [
              "It immediately shuts down the host machine.",
              "It permits a limited number of probe requests through to test if the downstream service has recovered.",
              "It permanently rejects all incoming traffic for twenty-four hours.",
              "It logs an error and bypasses authentication."
            ],
            "correctIndex": 1,
            "explanation": "The Half-Open state safely probes downstream service health before either resetting to Closed or tripping back to Open."
          },
          "speakingSimulation": {
            "prompt": "Explain how you protected a mission-critical checkout service from third-party payment gateway outages.",
            "collocations": [
              "circuit breaker tripped to open",
              "fallback gracefully to queueing",
              "exponential backoff with jitter",
              "bulkheaded thread pools"
            ],
            "sampleNativeAnswer": "When our third-party payment provider degraded, our circuit breaker tripped to open after a five-percent error threshold, immediately failing fast and queueing non-urgent orders. By isolating this dependency in a dedicated bulkheaded thread pool and applying backoff with full jitter, our core browse and cart experiences remained entirely uninterrupted."
          }
        },
        "checklist": [
          {
            "id": "c_m_5_2_1",
            "text": "Study the Circuit Breakers, Bulkheads, Exponential Backoff & Jitter formula & contrastive rules"
          },
          {
            "id": "c_m_5_2_2",
            "text": "Complete the interactive Sentence Builder & Input Drill"
          },
          {
            "id": "c_m_5_2_3",
            "text": "Pass the deep technical challenge quiz with 100% accuracy"
          }
        ],
        "actionTarget": {
          "tab": "practice",
          "practiceMode": "sentences",
          "title": "Practice Arena",
          "buttonText": "🧩 Assemble Resilience Patterns"
        },
        "targetVocabulary": [
          {
            "term": "randomized full jitter",
            "pos": "Resilience Engineering Algorithm",
            "definition": "Adding uniform random dispersion between 0 and 2^attempt to exponential retry backoff intervals.",
            "example": "We decorated our backoff algorithm with randomized full jitter to distribute retry spikes.",
            "usageTip": "Prevents synchronized retry waves from repeatedly overwhelming recovering dependencies."
          },
          {
            "term": "circuit breaker fail-fast state",
            "pos": "Resilience Architecture Term",
            "definition": "Open circuit state rejecting calls immediately without wasting network I/O or worker threads.",
            "example": "When the payment gateway degraded, the circuit breaker entered a fail-fast state.",
            "usageTip": "Trips automatically when error rate thresholds exceed SLA boundaries."
          },
          {
            "term": "cascading failure retry storm",
            "pos": "System Outage Dynamic",
            "definition": "Avalanche failure where uncoordinated client retries amplify load on an already degraded service.",
            "example": "Without backoff jitter, a transient blip triggered a catastrophic cascading failure retry storm.",
            "usageTip": "Self-inflicted DDoS dynamic common in high-traffic microservices."
          },
          {
            "term": "bulkheaded thread pools",
            "pos": "Isolation Architecture Pattern",
            "definition": "Partitioning compute and thread resources so failure in one integration cannot exhaust entire app.",
            "example": "Isolating analytics logging in bulkheaded thread pools protected our checkout pipeline.",
            "usageTip": "Inspired by nautical bulkheads that prevent an entire ship from sinking if one compartment floods."
          }
        ]
      },
      {
        "id": "m_5_3",
        "stageId": "stage_5",
        "number": "5.3",
        "title": "Fault Tolerance, Chaos Engineering & Disaster Recovery",
        "category": "Chaos & Disaster Recovery",
        "icon": "🔥",
        "estimatedTime": "35 mins",
        "xp": 90,
        "level": "C1 ➔ C2",
        "tagline": "Formulate disaster recovery runbooks, simulate randomized pod terminations, and commit to strict RTO and RPO metrics.",
        "whyItMatters": "Assuming production will not fail is the mark of an inexperienced team. Senior cloud architects actively inject faults using Chaos Engineering (e.g., Chaos Mesh, Gremlin), verify automated failovers, and guarantee strict Recovery Time Objectives (RTO) and Recovery Point Objectives (RPO).",
        "learnContent": {
          "summary": "Recovery Time Objective (RTO): Maximum acceptable duration of downtime. Recovery Point Objective (RPO): Maximum acceptable data loss measured in time. Chaos Engineering: The discipline of experimenting on a system to build confidence in its capability to withstand turbulent conditions in production.",
          "formula": "Chaos Hypothesis ➔ Inject Failure (Pod Kill / Latency Injection) ➔ Verify Steady State ➔ Automated Remediation",
          "rules": [
            "Distinguish clearly between RTO (time to recover) and RPO (data loss window).",
            "Say 'active-active cross-region failover' (not 'two clouds running together').",
            "Frame chaos experiments as verification of automated self-healing mechanisms."
          ],
          "badVsGood": {
            "bad": "We have good disaster recovery because we do database backups sometimes and restart pods.",
            "good": "Our multi-region disaster recovery runbook guarantees an RTO of under fifteen minutes and an RPO of zero for transactional ledger data, validated via monthly automated chaos injection experiments.",
            "explanation": "Provides mathematically quantified recovery boundaries (RTO/RPO) and references automated chaos validation."
          },
          "ukrainianTrap": "Many teams confuse 'having backups' with 'having a Disaster Recovery strategy'. An unverified backup is not a recovery plan."
        },
        "interactivePractice": {
          "sentenceBuilder": {
            "prompt": "Construct the disaster recovery commitment: 'Our cross-region disaster recovery strategy / guarantees a Recovery Time Objective / of under ten minutes / with zero transactional data loss.'",
            "words": [
              "Our cross-region disaster recovery strategy",
              "guarantees a Recovery Time Objective",
              "of under ten minutes",
              "with zero transactional data loss"
            ],
            "target": "Our cross-region disaster recovery strategy guarantees a Recovery Time Objective of under ten minutes with zero transactional data loss",
            "hint": "Subject + transitive verb + object + prepositional metric constraints."
          },
          "inputDrill": {
            "sentenceBefore": "During our quarterly chaos engineering drill, we simulated a total regional AWS outage to verify our",
            "missingWord": "automated cross-region failover",
            "sentenceAfter": "without manual operator intervention.",
            "hint": "Four words: 'automated cross-region failover'.",
            "explanation": "Architectural pattern where traffic routes to a secondary cloud region autonomously upon primary region loss."
          },
          "deepQuiz": {
            "question": "What is the difference between RTO (Recovery Time Objective) and RPO (Recovery Point Objective)?",
            "options": [
              "RTO measures cloud cost; RPO measures CPU temperature.",
              "RTO is the targeted duration to restore operations after an outage; RPO is the maximum acceptable data loss measured in time.",
              "RTO applies only to frontend code; RPO applies only to database storage.",
              "RTO and RPO are identical metrics with different acronyms."
            ],
            "correctIndex": 1,
            "explanation": "RTO defines downtime duration; RPO defines data loss tolerance measured from the failure timestamp backward."
          },
          "speakingSimulation": {
            "prompt": "Present a Chaos Engineering hypothesis and experimental result to leadership.",
            "collocations": [
              "steady-state hypothesis",
              "injected latency into auth service",
              "gracefully degraded to read-only",
              "validated RTO targets"
            ],
            "sampleNativeAnswer": "Our steady-state hypothesis was that terminating thirty percent of our ingestion worker pods would not impact message processing throughput. Upon injecting the failure via Chaos Mesh, the horizontal pod autoscaler provisioned replacement nodes within ninety seconds, maintaining our ten-second processing SLA without dropping a single event."
          }
        },
        "checklist": [
          {
            "id": "c_m_5_3_1",
            "text": "Study the Fault Tolerance, Chaos Engineering & Disaster Recovery formula & contrastive rules"
          },
          {
            "id": "c_m_5_3_2",
            "text": "Complete the interactive Sentence Builder & Input Drill"
          },
          {
            "id": "c_m_5_3_3",
            "text": "Pass the deep technical challenge quiz with 100% accuracy"
          }
        ],
        "actionTarget": {
          "tab": "practice",
          "practiceMode": "sentences",
          "title": "Practice Arena",
          "buttonText": "🧩 Assemble Disaster Recovery Plans"
        },
        "targetVocabulary": [
          {
            "term": "automated cross-region failover",
            "pos": "Disaster Recovery Architecture",
            "definition": "Autonomous DNS or routing shift to secondary cloud region when primary health checks fail.",
            "example": "We simulated an AWS regional outage to verify our automated cross-region failover.",
            "usageTip": "Eliminates manual operator delays during Sev-1 catastrophic infrastructure failures."
          },
          {
            "term": "Recovery Time Objective (RTO)",
            "pos": "Disaster Recovery SLA Metric",
            "definition": "Maximum acceptable duration of downtime between incident onset and restored operations.",
            "example": "Our disaster recovery runbook guarantees an RTO of under ten minutes for primary services.",
            "usageTip": "RTO measures downtime duration; RPO measures acceptable data loss window."
          },
          {
            "term": "Recovery Point Objective (RPO)",
            "pos": "Data Loss Tolerance Metric",
            "definition": "Maximum acceptable age of files or transactions that must be recovered from backup.",
            "example": "For financial ledger tables, our architecture enforces an RPO of zero via synchronous replication.",
            "usageTip": "RPO of zero means zero data loss is tolerated under any failure scenario."
          },
          {
            "term": "steady-state hypothesis",
            "pos": "Chaos Engineering Principle",
            "definition": "Measurable system output (e.g. 99.9% 2xx responses) defining normal behavior before chaos injection.",
            "example": "Our steady-state hypothesis was that terminating 30% of pods would not elevate API latency.",
            "usageTip": "Chaos experiments measure whether steady state is maintained during turbulent conditions."
          }
        ]
      },
      {
        "id": "m_5_4",
        "stageId": "stage_5",
        "number": "5.4",
        "title": "Continuous Delivery: Zero-Downtime Blue-Green & Canary Rollouts",
        "category": "Release Engineering",
        "icon": "🚀",
        "estimatedTime": "30 mins",
        "xp": 90,
        "level": "C1 ➔ C2",
        "tagline": "Architect release pipelines: traffic shifting, automated canary analysis, and zero-downtime database migrations.",
        "whyItMatters": "Deploying software with scheduled maintenance windows or risk-laden big-bang releases is unacceptable in high-availability environments. Senior release engineers master Blue-Green deployments, Canary progressive traffic shifting (1% ➔ 5% ➔ 25% ➔ 100%), and Expand-and-Contract database schema evolution.",
        "learnContent": {
          "summary": "Canary Deployment: Directing a tiny fraction of live traffic to the new version while evaluating telemetry (HTTP 5xx, latency) against baseline. Blue-Green: Maintaining two identical production environments and instantly switching the load balancer router. Expand-and-Contract: Multi-phase DB migrations ensuring backwards compatibility.",
          "formula": "Baseline vs Canary Telemetry ➔ Progressive Traffic Shift ➔ Automated Rollback on Metric Degradation",
          "rules": [
            "Say 'progressive traffic shifting' (not 'sending small users first').",
            "Say 'automated canary analysis with telemetry gating' (not 'watching Datadog by hand').",
            "Say 'expand-and-contract schema migration' (not 'changing column in two steps')."
          ],
          "badVsGood": {
            "bad": "We deploy at midnight and turn off the server for 10 minutes to update database columns.",
            "good": "We enforce zero-downtime releases via progressive canary rollouts, accompanied by expand-and-contract database migrations to guarantee full backwards compatibility across versions.",
            "explanation": "Reflects modern continuous delivery excellence with zero maintenance windows and automated telemetry verification."
          },
          "ukrainianTrap": "Teams that dread deployments do big-bang releases. Modern engineering treats deployment as a routine, non-eventful automated progression."
        },
        "interactivePractice": {
          "sentenceBuilder": {
            "prompt": "Assemble the CI/CD pipeline policy: 'Our release pipeline automatically routes / five percent of production traffic to the canary, / halting the rollout / if error rates exceed baseline by 0.1%.'",
            "words": [
              "Our release pipeline automatically routes",
              "five percent of production traffic to the canary,",
              "halting the rollout",
              "if error rates exceed baseline by 0.1%"
            ],
            "target": "Our release pipeline automatically routes five percent of production traffic to the canary, halting the rollout if error rates exceed baseline by 0.1%",
            "hint": "Main clause + participle outcome clause + conditional threshold clause."
          },
          "inputDrill": {
            "sentenceBefore": "To modify database schemas without locking tables or breaking running containers, we strictly follow the",
            "missingWord": "expand-and-contract pattern",
            "sentenceAfter": "across consecutive deployments.",
            "hint": "Three words: 'expand-and-contract pattern'.",
            "explanation": "Database migration methodology: Expand (add new nullable column), Migrate data, Contract (drop old column in next release)."
          },
          "deepQuiz": {
            "question": "Why is the Expand-and-Contract pattern required for zero-downtime database migrations?",
            "options": [
              "It compresses table storage on disk using gzip.",
              "It ensures that both the old version (N) and new version (N+1) of the application can run simultaneously against the database without syntax errors.",
              "It automatically converts SQL queries into MongoDB documents.",
              "It disables table primary keys during deployment."
            ],
            "correctIndex": 1,
            "explanation": "During zero-downtime rolling or canary rollouts, two versions of the app run concurrently; the database must remain compatible with both."
          },
          "speakingSimulation": {
            "prompt": "Walk your team through the automated rollback policy configured for your Kubernetes deployment.",
            "collocations": [
              "telemetry gating criteria",
              "progressive traffic shifting",
              "automated canary analysis",
              "zero-downtime rollbacks"
            ],
            "sampleNativeAnswer": "Our continuous delivery pipeline gates every canary deployment using automated telemetry checks. We route five percent of production ingress to the canary for twenty minutes. If p99 latency degrades by more than five percent or error rates spike by zero-point-one percent compared to the baseline, the ingress controller immediately executes a zero-downtime rollback."
          }
        },
        "checklist": [
          {
            "id": "c_m_5_4_1",
            "text": "Study the Continuous Delivery: Zero-Downtime Blue-Green & Canary Rollouts formula & contrastive rules"
          },
          {
            "id": "c_m_5_4_2",
            "text": "Complete the interactive Sentence Builder & Input Drill"
          },
          {
            "id": "c_m_5_4_3",
            "text": "Pass the deep technical challenge quiz with 100% accuracy"
          }
        ],
        "actionTarget": {
          "tab": "practice",
          "practiceMode": "sentences",
          "title": "Practice Arena",
          "buttonText": "🧩 Assemble Release Pipelines"
        },
        "targetVocabulary": [
          {
            "term": "expand-and-contract pattern",
            "pos": "Zero-Downtime Database Pattern",
            "definition": "Multi-phase schema migration: Expand (add column), Migrate data, Contract (drop old column in next release).",
            "example": "To alter schemas without downtime, we follow the expand-and-contract pattern across deployments.",
            "usageTip": "Ensures old version (N) and new version (N+1) can run concurrently against the database."
          },
          {
            "term": "progressive canary traffic shifting",
            "pos": "Release Engineering Methodology",
            "definition": "Routing small fractions of live traffic (1% ➔ 5% ➔ 25% ➔ 100%) to new version while evaluating metrics.",
            "example": "We enforce zero-downtime releases via progressive canary traffic shifting.",
            "usageTip": "Insulates 99% of user base from undetected regressions or memory leaks."
          },
          {
            "term": "zero-downtime blue-green rollout",
            "pos": "Deployment Architecture",
            "definition": "Maintaining two identical environments and instantly switching the load balancer router.",
            "example": "Blue-green deployment allows instant rollbacks by reverting router targets if issues arise.",
            "usageTip": "Requires double compute resources during release cutover window."
          },
          {
            "term": "telemetry gating criteria",
            "pos": "Automated Deployment Safeguard",
            "definition": "Automated metric thresholds (p99 latency, 5xx rate) that must be satisfied to promote deployment.",
            "example": "Our pipeline halted the rollout because telemetry gating criteria detected a 0.2% error spike.",
            "usageTip": "Automates deployment promotion and rollback without requiring manual operator intervention."
          }
        ]
      },
      {
        "id": "m_5_5",
        "stageId": "stage_5",
        "number": "5.5",
        "title": "Distributed Tracing, Telemetry & OpenTelemetry Observability",
        "category": "Observability & SLA",
        "icon": "📡",
        "estimatedTime": "35 mins",
        "xp": 90,
        "level": "C1 ➔ C2",
        "tagline": "Trace distributed requests: span context propagation, W3C headers, structured logging, and SLO error budgeting.",
        "whyItMatters": "In microservices, a single client click can trigger 40 inter-service RPC calls. When an error occurs, searching raw log files across 200 containers is impossible. Senior engineers champion OpenTelemetry, distributed context propagation via W3C traceparent headers, and Service Level Objectives (SLOs).",
        "learnContent": {
          "summary": "The Three Pillars of Observability: Metrics (aggregates over time: CPU, RPS), Logs (structured event records with trace_id), Traces (request journeys composed of causal Spans). Telemetry terms: SLI (Service Level Indicator), SLO (Service Level Objective), SLA (Agreement with contractual penalties), Error Budget.",
          "formula": "Request Ingress ➔ Inject Trace/Span ID ➔ Context Propagation across RPC ➔ Unified Span Waterfall",
          "rules": [
            "Say 'distributed context propagation' (not 'passing IDs between services').",
            "Say 'span waterfall chart' or 'distributed trace graph' (not 'timing bar chart').",
            "Explain Error Budgets: '100% availability is the wrong goal; our error budget permits controlled innovation.'"
          ],
          "badVsGood": {
            "bad": "When bug happened, we looked into all server logs manually for five hours to find where it broke.",
            "good": "By propagating W3C distributed trace context across all gRPC calls, we isolated the 800ms bottleneck to an unindexed database query in the fulfillment service within seconds via Jaeger.",
            "explanation": "Illustrates true observability: tracing requests seamlessly across microservice boundaries via standard context propagation."
          },
          "ukrainianTrap": "Logging is not observability. Without causal trace context stitching requests across process boundaries, microservices become an un-debuggable black hole."
        },
        "interactivePractice": {
          "sentenceBuilder": {
            "prompt": "Construct the observability standard: 'Every inbound HTTP request / receives a unique W3C trace identifier / propagated across all downstream microservices / to maintain end-to-end distributed tracing.'",
            "words": [
              "Every inbound HTTP request",
              "receives a unique W3C trace identifier",
              "propagated across all downstream microservices",
              "to maintain end-to-end distributed tracing"
            ],
            "target": "Every inbound HTTP request receives a unique W3C trace identifier propagated across all downstream microservices to maintain end-to-end distributed tracing",
            "hint": "Subject + predicate + participle modifier + infinitive purpose clause."
          },
          "inputDrill": {
            "sentenceBefore": "Our team monitors our 99.9% availability SLO using an",
            "missingWord": "error budget burn rate alert",
            "sentenceAfter": "to catch regressions before violating customer SLAs.",
            "hint": "Five words: 'error budget burn rate alert'.",
            "explanation": "Site Reliability Engineering (SRE) practice monitoring the consumption rate of allowed downtime budget."
          },
          "deepQuiz": {
            "question": "In distributed tracing, what is the primary role of a 'Span'?",
            "options": [
              "It compiles TypeScript into JavaScript.",
              "It represents a single contiguous unit of work or segment within a distributed trace, tracking start time, duration, and metadata.",
              "It encrypts database passwords stored in environment variables.",
              "It measures hardware fan speeds on bare-metal servers."
            ],
            "correctIndex": 1,
            "explanation": "A Span is the fundamental building block of a trace, capturing timing and metadata for a specific operation within a service."
          },
          "speakingSimulation": {
            "prompt": "Explain an observability incident investigation to an engineering director using OpenTelemetry terminology.",
            "collocations": [
              "distributed context propagation",
              "span waterfall analysis",
              "error budget burn rate",
              "correlated structured logs"
            ],
            "sampleNativeAnswer": "During yesterday's checkout latency alert, our error budget burn rate spiked to ten times normal. By opening the distributed trace waterfall in OpenTelemetry, we correlated the trace ID across our API gateway and billing microservice, discovering that an external credit card provider was taking four seconds to respond due to connection pool saturation."
          }
        },
        "checklist": [
          {
            "id": "c_m_5_5_1",
            "text": "Study the Distributed Tracing, Telemetry & OpenTelemetry Observability formula & contrastive rules"
          },
          {
            "id": "c_m_5_5_2",
            "text": "Complete the interactive Sentence Builder & Input Drill"
          },
          {
            "id": "c_m_5_5_3",
            "text": "Pass the deep technical challenge quiz with 100% accuracy"
          }
        ],
        "actionTarget": {
          "tab": "practice",
          "practiceMode": "sentences",
          "title": "Practice Arena",
          "buttonText": "🧩 Assemble Observability Architecture"
        },
        "targetVocabulary": [
          {
            "term": "error budget burn rate alert",
            "pos": "SRE Observability Metric",
            "definition": "Alert triggered when the consumption rate of allowed downtime budget threatens SLO violations.",
            "example": "Our team monitors our 99.9% availability SLO using an error budget burn rate alert.",
            "usageTip": "Detects rapid service degradation hours before customer-facing SLAs are breached."
          },
          {
            "term": "distributed context propagation",
            "pos": "OpenTelemetry Mechanism",
            "definition": "Injecting and serializing trace and span IDs across inter-service network boundaries (HTTP/gRPC).",
            "example": "By enforcing distributed context propagation, every RPC call carries its causal trace ID.",
            "usageTip": "Stitches independent service logs and spans into a single coherent request journey."
          },
          {
            "term": "W3C traceparent headers",
            "pos": "Telemetry Industry Standard",
            "definition": "Standardized HTTP header specification (version-traceid-parentid-traceflags) for distributed tracing.",
            "example": "All microservice ingress filters parse and propagate W3C traceparent headers.",
            "usageTip": "Ensures vendor-neutral trace propagation across disparate languages and frameworks."
          },
          {
            "term": "unified span waterfall",
            "pos": "Distributed Trace Visualization",
            "definition": "Hierarchical visualization displaying child spans and timing breakdowns across all services.",
            "example": "Opening the unified span waterfall in Jaeger revealed a 400ms unindexed query bottleneck.",
            "usageTip": "Instantly pinpoints which microservice or database call consumed the bulk of request latency."
          }
        ]
      },
      {
        "id": "m_5_6",
        "stageId": "stage_5",
        "number": "5.6",
        "title": "Zero-Trust Security, OAuth 2.0 PKCE, RBAC & Secret Rotation",
        "category": "Cloud Security",
        "icon": "🔐",
        "estimatedTime": "35 mins",
        "xp": 95,
        "level": "C1 ➔ C2",
        "tagline": "Enforce perimeter-less security: mutual TLS (mTLS), OAuth 2.0 Proof Key for Code Exchange (PKCE), and automated KMS secret rotation.",
        "whyItMatters": "The old security model of 'hard perimeter, soft interior' (castle-and-moat) is obsolete. Modern cloud architectures mandate Zero-Trust: authenticate and authorize every request explicitly, verify identity via mTLS between internal pods, and use short-lived credentials with automated rotation.",
        "learnContent": {
          "summary": "Zero-Trust Principles: Never trust, always verify. Authenticate explicitly. Enforce Least Privilege (RBAC/ABAC). Assume breach. Protocol specs: OAuth 2.0 with PKCE (Proof Key for Code Exchange), OIDC JWT validation, SPIFFE/SPIRE workload identities, and KMS envelope encryption.",
          "formula": "Never Trust, Always Verify | Mutual TLS (mTLS) Everywhere | Ephemeral Short-Lived Tokens",
          "rules": [
            "Say 'assume breach mentality' (not 'thinking someone hacked us').",
            "Say 'mutual TLS (mTLS) for service-to-service mesh authentication' (not 'HTTPS between pods').",
            "Say 'automated KMS secret rotation with zero downtime' (not 'changing passwords regularly')."
          ],
          "badVsGood": {
            "bad": "Our internal network is completely safe behind the firewall, so services do not need passwords to talk.",
            "good": "Under our Zero-Trust architecture, we assume network compromise; consequently, all internal pod-to-pod communication is strictly authenticated via mTLS, and API access is governed by fine-grained RBAC policies.",
            "explanation": "Reflects modern enterprise security architecture: perimeter-less, identity-driven, and hardened against lateral movement."
          },
          "ukrainianTrap": "Assuming an internal network is secure because it is inside a VPC is the root cause of catastrophic lateral breach escalations."
        },
        "interactivePractice": {
          "sentenceBuilder": {
            "prompt": "Assemble the security architecture statement: 'Adopting a Zero-Trust security model / requires mutual TLS authentication / for every internal microservice communication / and automated secret rotation.'",
            "words": [
              "Adopting a Zero-Trust security model",
              "requires mutual TLS authentication",
              "for every internal microservice communication",
              "and automated secret rotation"
            ],
            "target": "Adopting a Zero-Trust security model requires mutual TLS authentication for every internal microservice communication and automated secret rotation",
            "hint": "Gerund subject + transitive verb + coordinate object phrases."
          },
          "inputDrill": {
            "sentenceBefore": "To safeguard public single-page applications against authorization code interception, we strictly enforce",
            "missingWord": "OAuth 2.0 with PKCE",
            "sentenceAfter": "on all client integrations.",
            "hint": "Four words: 'OAuth 2.0 with PKCE'.",
            "explanation": "Proof Key for Code Exchange: cryptographic extension securing public OAuth clients without client secrets."
          },
          "deepQuiz": {
            "question": "What is the core premise of a Zero-Trust Architecture?",
            "options": [
              "Developers should not be trusted to write code without manager approvals.",
              "No actor, device, or network zone is inherently trusted; every interaction must be explicitly authenticated, authorized, and encrypted.",
              "All company computers must use biometric fingerprint scanners.",
              "Third-party software libraries are forbidden from production codebases."
            ],
            "correctIndex": 1,
            "explanation": "Zero-Trust eliminates implicit perimeter trust, requiring continuous explicit verification for all entities and requests."
          },
          "speakingSimulation": {
            "prompt": "Present a security hardening proposal to the Chief Information Security Officer (CISO).",
            "collocations": [
              "zero-trust architecture",
              "mutual TLS service mesh",
              "automated secret rotation via KMS",
              "fine-grained RBAC authorization"
            ],
            "sampleNativeAnswer": "I propose transitioning our internal service communication to a Zero-Trust architecture. By deploying Istio for transparent mutual TLS, we will guarantee end-to-end cryptographic encryption and workload identity verification between all pods. Furthermore, integrating Vault with AWS KMS will automate secret rotation, eliminating static credentials from our repositories."
          }
        },
        "checklist": [
          {
            "id": "c_m_5_6_1",
            "text": "Study the Zero-Trust Security, OAuth 2.0 PKCE, RBAC & Secret Rotation formula & contrastive rules"
          },
          {
            "id": "c_m_5_6_2",
            "text": "Complete the interactive Sentence Builder & Input Drill"
          },
          {
            "id": "c_m_5_6_3",
            "text": "Pass the deep technical challenge quiz with 100% accuracy"
          }
        ],
        "actionTarget": {
          "tab": "practice",
          "practiceMode": "sentences",
          "title": "Practice Arena",
          "buttonText": "🧩 Assemble Zero-Trust Architectures"
        },
        "targetVocabulary": [
          {
            "term": "OAuth 2.0 with PKCE",
            "pos": "Cryptographic Authorization Protocol",
            "definition": "Proof Key for Code Exchange: extension securing public client authorization without secrets.",
            "example": "To safeguard single-page apps against code interception, we strictly enforce OAuth 2.0 with PKCE.",
            "usageTip": "Mandatory standard for mobile and single-page apps where client secrets cannot remain confidential."
          },
          {
            "term": "Zero-Trust security model",
            "pos": "Security Architecture Paradigm",
            "definition": "Perimeter-less architecture based on the core axiom: never trust, always verify.",
            "example": "Under our Zero-Trust security model, we assume network compromise and verify every interaction.",
            "usageTip": "Replaces legacy 'castle-and-moat' perimeter trust with per-request explicit authentication."
          },
          {
            "term": "mutual TLS (mTLS) service mesh",
            "pos": "Service-to-Service Cryptography",
            "definition": "Two-way cryptographic certificate validation ensuring encryption and identity between pods.",
            "example": "Istio transparently enforces mutual TLS across all internal service mesh communications.",
            "usageTip": "Guarantees confidentiality and prevents lateral movement in compromised VPC environments."
          },
          {
            "term": "automated KMS secret rotation",
            "pos": "Cryptographic Operations",
            "definition": "Scheduled, zero-downtime re-encryption and replacement of database credentials and API keys.",
            "example": "Integrating HashiCorp Vault with AWS KMS enables automated secret rotation every 30 days.",
            "usageTip": "Eliminates hardcoded static credentials and limits damage window if keys leak."
          }
        ]
      }
    ]
  },
  {
    "id": "stage_6",
    "number": 6,
    "title": "Stage 6: Senior Native Fluency & Rhetorical Mastery",
    "level": "C2 Senior Native Mastery",
    "description": "Reach the pinnacle of engineering communication: high-stakes Socratic debate, British/American technical litotes, executive RFC authoring, and effortless native conversational flow.",
    "badge": "Stage 6",
    "color": "#eab308",
    "milestones": [
      {
        "id": "m_6_1",
        "stageId": "stage_6",
        "number": "6.1",
        "title": "High-Velocity Technical Debates & Socratic Challenging",
        "category": "Executive Debate",
        "icon": "⚔️",
        "estimatedTime": "40 mins",
        "xp": 110,
        "level": "C2",
        "tagline": "Disarm dogmatic engineering stances and probe unspoken assumptions with gentle, devastating Socratic inquiry.",
        "whyItMatters": "In senior leadership debates, aggressive arguing ('You are completely wrong about microservices') causes defensive entrenchment. Master architects use Socratic questioning to gently expose hidden flaws: 'Help me understand how this state machine recovers if the network partition lasts four hours?', letting the other party realize the vulnerability themselves.",
        "learnContent": {
          "summary": "Socratic questioning stems: 'What assumptions are we making regarding...', 'How might this design behave under the worst-case scenario where...', 'To what extent does this dependency constrain our future flexibility?', 'What would it take to change your mind on this trade-off?'",
          "formula": "Acknowledge the Intent ➔ Pose a Structural Worst-Case Probe ➔ Invite Collaborative Re-evaluation",
          "rules": [
            "Never tell a counterpart their solution is foolish; guide them to discover the constraint.",
            "Probe edge cases and failure domains calmly: 'What is our failure mode if the leader node drops out during election?'",
            "Maintain unconditional professional composure during contentious architectural disputes."
          ],
          "badVsGood": {
            "bad": "Your idea is stupid because it will crash the server and nobody does this in real tech companies.",
            "good": "I see the elegance of this streamlined approach; could you walk me through how the ingestion pipeline handles backpressure if the downstream warehouse becomes unresponsive for thirty minutes?",
            "explanation": "Replaces rude dismissal with an insightful Socratic inquiry that exposes the missing backpressure mechanism constructively."
          },
          "ukrainianTrap": "In many cultures, debates are won by speaking louder or showing dominance. In native senior engineering, the highest status belongs to the person who remains calm, asks the most incisive questions, and steers consensus."
        },
        "interactivePractice": {
          "sentenceBuilder": {
            "prompt": "Assemble the Socratic inquiry: 'Could you help me understand / how our distributed state machine / handles partition recovery / if the consensus quorum / is temporarily unreachable?'",
            "words": [
              "Could you help me understand",
              "how our distributed state machine",
              "handles partition recovery",
              "if the consensus quorum",
              "is temporarily unreachable?"
            ],
            "target": "Could you help me understand how our distributed state machine handles partition recovery if the consensus quorum is temporarily unreachable?",
            "hint": "Polite inquiry stem + object clause + conditional failure probe."
          },
          "inputDrill": {
            "sentenceBefore": "To what extent are we assuming that third-party network latency will remain",
            "missingWord": "negligible under peak holiday traffic",
            "sentenceAfter": "conditions?",
            "hint": "Four words: 'negligible under peak holiday traffic'.",
            "explanation": "Socratic probing of optimistic assumptions regarding external network dependencies."
          },
          "deepQuiz": {
            "question": "Which response exemplifies the highest level of Socratic debate when challenging a colleague's architecture?",
            "options": [
              "That will never scale in production. Read a distributed systems book.",
              "I appreciate the simplicity of this caching design. Could you walk me through the failure domain if Redis reaches memory capacity during a promotional sale?",
              "I completely disagree and will veto this proposal in the architectural committee.",
              "Your design works fine for a startup, but we are an enterprise."
            ],
            "correctIndex": 1,
            "explanation": "Option 2 combines intellectual generosity with an incisive, realistic failure-domain inquiry."
          },
          "speakingSimulation": {
            "prompt": "Simulate challenging a dogmatic architectural proposal in a high-stakes design review using Socratic questioning.",
            "collocations": [
              "appreciate the underlying rationale",
              "walk me through the failure mode",
              "what constraints are we accepting",
              "how does this align with our SLAs"
            ],
            "sampleNativeAnswer": "I genuinely appreciate the simplicity this monolithic database schema brings to our initial prototyping velocity. Help me understand, though: as our tenant volume scales ten-fold next quarter, how do we prevent cross-tenant lock contention without incurring massive migration refactoring down the line?"
          }
        },
        "checklist": [
          {
            "id": "c_m_6_1_1",
            "text": "Study the High-Velocity Technical Debates & Socratic Challenging formula & contrastive rules"
          },
          {
            "id": "c_m_6_1_2",
            "text": "Complete the interactive Sentence Builder & Input Drill"
          },
          {
            "id": "c_m_6_1_3",
            "text": "Pass the deep technical challenge quiz with 100% accuracy"
          }
        ],
        "actionTarget": {
          "tab": "practice",
          "practiceMode": "sentences",
          "title": "Practice Arena",
          "buttonText": "🧩 Assemble Socratic Debates"
        },
        "targetVocabulary": [
          {
            "term": "negligible under peak holiday traffic",
            "pos": "Socratic Probe Phrase",
            "definition": "Socratic inquiry challenging optimistic assumptions regarding network latency under maximum load.",
            "example": "To what extent are we assuming that third-party latency will remain negligible under peak holiday traffic?",
            "usageTip": "Gentle probing question that exposes missing backpressure or caching mechanisms."
          },
          {
            "term": "walk me through the failure mode",
            "pos": "Executive Debate Invariant",
            "definition": "Inviting a counterpart to trace how their architecture behaves when dependencies degrade.",
            "example": "Could you walk me through the failure mode if the leader node drops out during election?",
            "usageTip": "Encourages the other architect to identify structural flaws without feeling attacked."
          },
          {
            "term": "unspoken architectural constraints",
            "pos": "Design Review Collocation",
            "definition": "Hidden assumptions or organizational boundaries that influence design choices unacknowledged.",
            "example": "Let's pause to examine the unspoken architectural constraints shaping this proposal.",
            "usageTip": "Senior technique to uncover hidden biases or historical inertia in technical debates."
          },
          {
            "term": "disarming dogmatic stances",
            "pos": "Leadership Rhetoric",
            "definition": "Neutralizing rigid technology preferences using open-ended questions and empirical evidence.",
            "example": "Socratic inquiry is our most effective tool for disarming dogmatic stances on framework selection.",
            "usageTip": "Focuses conversation on engineering trade-offs rather than emotional tool loyalty."
          }
        ]
      },
      {
        "id": "m_6_2",
        "stageId": "stage_6",
        "number": "6.2",
        "title": "Rhetorical Understatement, Litotes & Idiomatic Engineering Nuance",
        "category": "Native Rhetoric",
        "icon": "🎭",
        "estimatedTime": "35 mins",
        "xp": 100,
        "level": "C2",
        "tagline": "Master British and American professional understatement: 'suboptimal', 'not entirely ideal', 'par for the course'.",
        "whyItMatters": "Non-native speakers often use hyperbole ('This is a complete disaster and a catastrophe!'). Native senior engineers master litotes (ironic understatement through double negatives) and subtle hedging: 'The latency metrics are not entirely reassuring' (meaning: it's terrible and failing). Decoding and using this nuance is the hallmark of true C2 fluency.",
        "learnContent": {
          "summary": "Understatement lexicon: 'suboptimal' (bad/broken), 'not entirely bulletproof' (fragile), 'a bit ambitious' (impossible deadline), 'par for the course' (typical expected difficulty), 'with a grain of salt' (skeptically), 'not without merit' (worth considering).",
          "formula": "It's a complete catastrophe! ➔ The outcome is somewhat suboptimal.",
          "rules": [
            "Use litotes to soften intense critique while maintaining devastating analytical clarity.",
            "Understand that when a British or American lead says 'That's an interesting approach', they often mean 'Do not do this.'",
            "Express composure under crisis: 'We have a minor hiccup in our billing pipeline' (while calmly triaging a sev-1 outage)."
          ],
          "badVsGood": {
            "bad": "This code is an absolute nightmare and everyone is panicked because everything is ruined!",
            "good": "Our initial deployment outcome is somewhat suboptimal, and the current latency degradation is not entirely reassuring. Let's execute our rollback runbook systematically.",
            "explanation": "Radiates unflappable executive leadership, translating panic into calm, nuanced, and actionable direction."
          },
          "ukrainianTrap": "Non-native speakers frequently misunderstand native understatement, interpreting 'not ideal' as a minor issue when it actually signifies an urgent blockers."
        },
        "interactivePractice": {
          "sentenceBuilder": {
            "prompt": "Construct the masterfully understated technical assessment: 'The current memory allocation profile / is not entirely ideal, / and relying on synchronous retries / appears somewhat suboptimal.'",
            "words": [
              "The current memory allocation profile",
              "is not entirely ideal,",
              "and relying on synchronous retries",
              "appears somewhat suboptimal"
            ],
            "target": "The current memory allocation profile is not entirely ideal, and relying on synchronous retries appears somewhat suboptimal",
            "hint": "Subject + litotes predicate + coordinate subject + understated evaluation."
          },
          "inputDrill": {
            "sentenceBefore": "Given our recent infrastructure instability, describing our current reliability posture as robust would be",
            "missingWord": "a bit of a stretch",
            "sentenceAfter": "at this juncture.",
            "hint": "Five words: 'a bit of a stretch'.",
            "explanation": "Classic native engineering idiom indicating that a claim is exaggerated or inaccurate."
          },
          "deepQuiz": {
            "question": "When an engineering VP remarks in a design review: 'That rollout timeline strikes me as a touch ambitious', what do they actually mean?",
            "options": [
              "They are praising the team's high energy and work ethic.",
              "They believe the deadline is unrealistic and will inevitably result in missed commitments or broken software.",
              "They want the team to ship the release even faster.",
              "They are recommending an immediate team promotion."
            ],
            "correctIndex": 1,
            "explanation": "'A touch ambitious' is standard executive understatement signaling that the proposed schedule is unfeasible."
          },
          "speakingSimulation": {
            "prompt": "Deliver a calm, reassuring incident update to executive stakeholders using masterly rhetorical understatement.",
            "collocations": [
              "somewhat suboptimal outcome",
              "not entirely unexpected",
              "mitigating the hiccup",
              "steady progress toward resolution"
            ],
            "sampleNativeAnswer": "Good afternoon everyone. While our midday deployment produced a somewhat suboptimal latency profile on our payment ingress, the root cause is thoroughly understood. Our incident response team is executing a routine rollback, and our system metrics are already trending back toward our baseline SLAs. We will have a comprehensive update shortly."
          }
        },
        "checklist": [
          {
            "id": "c_m_6_2_1",
            "text": "Study the Rhetorical Understatement, Litotes & Idiomatic Engineering Nuance formula & contrastive rules"
          },
          {
            "id": "c_m_6_2_2",
            "text": "Complete the interactive Sentence Builder & Input Drill"
          },
          {
            "id": "c_m_6_2_3",
            "text": "Pass the deep technical challenge quiz with 100% accuracy"
          }
        ],
        "actionTarget": {
          "tab": "practice",
          "practiceMode": "sentences",
          "title": "Practice Arena",
          "buttonText": "🧩 Assemble Rhetorical Litotes"
        },
        "targetVocabulary": [
          {
            "term": "a bit of a stretch",
            "pos": "Native Understatement Idiom",
            "definition": "A polite, understated way of indicating that a claim is exaggerated, unrealistic, or inaccurate.",
            "example": "Describing our current reliability posture as robust would be a bit of a stretch at this juncture.",
            "usageTip": "Replaces harsh accusations like 'You are lying' with polite, devastating British understatement."
          },
          {
            "term": "somewhat suboptimal outcome",
            "pos": "Litotes Engineering Phrasing",
            "definition": "Understated description of a significant technical failure or botched deployment.",
            "example": "Our initial deployment produced a somewhat suboptimal latency profile on payment ingress.",
            "usageTip": "Radiates calm executive composure during crisis triage rather than displaying panic."
          },
          {
            "term": "not entirely bulletproof",
            "pos": "Litotes Architectural Critique",
            "definition": "Subtle understatement indicating that a proposed design possesses critical security or reliability gaps.",
            "example": "While functional in staging, this concurrency model is not entirely bulletproof under high load.",
            "usageTip": "Signifies that immediate hardening or redesign is required before production deployment."
          },
          {
            "term": "par for the course",
            "pos": "Engineering Experience Idiom",
            "definition": "Normal, expected, and typical difficulty encountered in complex distributed engineering projects.",
            "example": "Transient partition errors in multi-region clusters are par for the course.",
            "usageTip": "Reassures team that a problem is a known systemic characteristic, not an unforeseen crisis."
          }
        ]
      },
      {
        "id": "m_6_3",
        "stageId": "stage_6",
        "number": "6.3",
        "title": "Authoring Executive Architecture RFCs & Whitepapers",
        "category": "Staff Architecture",
        "icon": "📜",
        "estimatedTime": "45 mins",
        "xp": 120,
        "level": "C2",
        "tagline": "Author definitive engineering proposals: executive summaries, comparative trade-off matrices, and phased migrations.",
        "whyItMatters": "Senior Staff and Principal engineers lead through written architecture documents (RFCs). An exceptional RFC does not just explain the chosen technology—it systematically articulates alternative designs considered, rejected trade-offs, security implications, and rollback criteria.",
        "learnContent": {
          "summary": "RFC Anatomy: 1. Executive Summary & Context. 2. Problem Statement & Motivation. 3. Proposed Architecture & Component Diagrams. 4. Alternatives Considered & Explicit Rejections. 5. Cross-Cutting Concerns (Security, Observability, Cost). 6. Phased Rollout & Migration Strategy.",
          "formula": "Problem Statement ➔ Proposed Design ➔ Alternatives Considered & Rejected ➔ Phased Execution",
          "rules": [
            "Dedicate substantial space to 'Alternatives Considered' to demonstrate exhaustive intellectual rigor.",
            "Structure trade-offs into comparative matrices (Latency vs Consistency vs Cost vs Operational Simplicity).",
            "Define non-goals explicitly to protect the project from scope bloat: 'Non-goal: Multi-cloud portability.'"
          ],
          "badVsGood": {
            "bad": "I wrote this doc because we should use GraphQL instead of REST because it is modern and nice.",
            "good": "This RFC proposes transitioning our client-facing API tier from REST to GraphQL. By enabling clients to request precise entity subgraphs, we eliminate over-fetching over mobile networks and reduce round-trip requests by fifty-five percent.",
            "explanation": "Replaces superficial preferences with a compelling, quantified architectural justification and clear problem framing."
          },
          "ukrainianTrap": "Weak RFCs read like sales pitches. Exceptional RFCs read like objective scientific papers that candidly discuss the flaws and costs of the proposed solution."
        },
        "interactivePractice": {
          "sentenceBuilder": {
            "prompt": "Assemble the RFC executive summary opener: 'This RFC proposes a decoupled event-driven architecture / to replace our synchronous checkout pipeline, / mitigating database contention / and unlocking independent service scalability.'",
            "words": [
              "This RFC proposes a decoupled event-driven architecture",
              "to replace our synchronous checkout pipeline,",
              "mitigating database contention",
              "and unlocking independent service scalability"
            ],
            "target": "This RFC proposes a decoupled event-driven architecture to replace our synchronous checkout pipeline, mitigating database contention and unlocking independent service scalability",
            "hint": "Main proposal clause + infinitive replacement clause + coordinate participle benefit clauses."
          },
          "inputDrill": {
            "sentenceBefore": "To prevent scope creep, this document explicitly defines supporting legacy protocol adapters as a",
            "missingWord": "non-goal for this initiative",
            "sentenceAfter": "in the initial milestone.",
            "hint": "Four words: 'non-goal for this initiative'.",
            "explanation": "Crucial RFC architectural section explicitly scoping what the project will NOT solve."
          },
          "deepQuiz": {
            "question": "Why is the 'Alternatives Considered' section of an RFC considered its most critical litmus test?",
            "options": [
              "It fills up extra pages to make the document look more authoritative.",
              "It proves that the author evaluated alternative solutions objectively and understood the trade-offs rather than arbitrarily picking a favorite tool.",
              "It provides backup options in case the author forgets their primary proposal.",
              "It allows the legal team to review software licenses."
            ],
            "correctIndex": 1,
            "explanation": "Documenting discarded alternatives demonstrates mature architectural trade-off evaluation and intellectual integrity."
          },
          "speakingSimulation": {
            "prompt": "Pitch the executive summary of your RFC to the architecture review board in two minutes.",
            "collocations": [
              "problem motivation",
              "proposed architectural shift",
              "key trade-offs accepted",
              "phased zero-downtime migration plan"
            ],
            "sampleNativeAnswer": "Members of the architecture board, thank you for your time. This RFC addresses our database connection bottlenecks during traffic spikes. We propose adopting an event-driven architecture utilizing Kafka for asynchronous order processing. While we accept the operational complexity of distributed tracing, this design guarantees decoupled availability and insulates our data tier. Our rollout features a zero-downtime shadow pipeline validating event streams against live traffic for four weeks prior to cutover."
          }
        },
        "checklist": [
          {
            "id": "c_m_6_3_1",
            "text": "Study the Authoring Executive Architecture RFCs & Whitepapers formula & contrastive rules"
          },
          {
            "id": "c_m_6_3_2",
            "text": "Complete the interactive Sentence Builder & Input Drill"
          },
          {
            "id": "c_m_6_3_3",
            "text": "Pass the deep technical challenge quiz with 100% accuracy"
          }
        ],
        "actionTarget": {
          "tab": "speaking",
          "practiceMode": "code_002",
          "title": "Present Architecture RFC",
          "buttonText": "🎙️ Deliver RFC Defense"
        },
        "targetVocabulary": [
          {
            "term": "non-goal for this initiative",
            "pos": "RFC Architectural Boundary Clause",
            "definition": "Explicit statement defining what a technical proposal intentionally refuses to solve.",
            "example": "To prevent scope creep, supporting legacy protocol adapters is a non-goal for this initiative.",
            "usageTip": "Essential RFC section protecting engineering teams from unbounded scope inflation."
          },
          {
            "term": "alternatives considered and rejected",
            "pos": "RFC Critical Litmus Test",
            "definition": "Section documenting discarded design options, proving exhaustive trade-off evaluation.",
            "example": "The RFC thoroughly documents alternatives considered and rejected, including gRPC and WebSockets.",
            "usageTip": "Proves the author did not arbitrarily choose a tool, but evaluated trade-offs scientifically."
          },
          {
            "term": "phased zero-downtime cutover",
            "pos": "Migration Strategy Collocation",
            "definition": "Step-by-step migration sequence ensuring uninterrupted service availability throughout transition.",
            "example": "Our rollout features a phased zero-downtime cutover validating event streams against live traffic.",
            "usageTip": "Critical section reassuring leadership that migration risk is carefully managed."
          },
          {
            "term": "mitigating database contention",
            "pos": "Architectural Objective Collocation",
            "definition": "Relieving lock and connection bottlenecks on primary transactional datastores.",
            "example": "Adopting an event broker decouples order processing, mitigating database contention.",
            "usageTip": "Standard technical value statement in backend RFC executive summaries."
          }
        ]
      },
      {
        "id": "m_6_4",
        "stageId": "stage_6",
        "number": "6.4",
        "title": "Spontaneous Keynote Delivery & Tech Conference Q&A",
        "category": "Public Speaking",
        "icon": "🎤",
        "estimatedTime": "40 mins",
        "xp": 110,
        "level": "C2",
        "tagline": "Deliver captivating tech presentations and field adversarial or curveball audience questions with effortless mastery.",
        "whyItMatters": "Presenting at international tech conferences (e.g., QCon, AWS re:Invent) requires more than solid slides. It demands charismatic vocal pacing, rhetorical hooks, bridging phrases, and the art of disarming combative audience questions with grace and authority.",
        "learnContent": {
          "summary": "Q&A Bridging Phrases: 'That's a perceptive observation; let's unpack that...', 'To your point regarding X, our telemetry actually revealed...', 'While that holds true in conventional architectures, our specific constraint was...', 'I'm glad you brought that up; in fact, we benchmarked exactly that scenario.'",
          "formula": "Validate the Question ➔ Bridge to Core Insight ➔ Deliver Evidence-Backed Answer",
          "rules": [
            "Repeat or rephrase the question for the entire audience before answering: 'For the folks in the back, the question was...'",
            "Never become defensive when an audience member challenges your benchmarks.",
            "If you don't know the exact answer, answer with executive transparency: 'We haven't benchmarked that specific edge case; let's connect offline to explore the data together.'"
          ],
          "badVsGood": {
            "bad": "I don't know why you ask this, our system works fine and your question makes no sense.",
            "good": "That's a really sharp question regarding edge caching invalidation. While in a textbook setup that would indeed present a race condition, our implementation sidesteps it entirely via cryptographic version tags.",
            "explanation": "Graciously validates the challenger's intellect while authoritatively explaining why the system architecture remains sound."
          },
          "ukrainianTrap": "Inexperienced speakers feel attacked by hard questions. Senior keynote speakers welcome tough questions as golden opportunities to demonstrate deep domain mastery."
        },
        "interactivePractice": {
          "sentenceBuilder": {
            "prompt": "Assemble the conference keynote bridging statement: 'That is a remarkably astute question; / let me unpack the reasoning / behind why we favored event streaming / over synchronous RPC calls.'",
            "words": [
              "That is a remarkably astute question;",
              "let me unpack the reasoning",
              "behind why we favored event streaming",
              "over synchronous RPC calls"
            ],
            "target": "That is a remarkably astute question; let me unpack the reasoning behind why we favored event streaming over synchronous RPC calls",
            "hint": "Complimentary bridging clause + infinitive exploration + prepositional architectural comparison."
          },
          "inputDrill": {
            "sentenceBefore": "For the folks watching the livestream who may not have caught that, the question pertains to our",
            "missingWord": "handling of distributed split-brain scenarios",
            "sentenceAfter": "under regional network partitions.",
            "hint": "Five words: 'handling of distributed split-brain scenarios'.",
            "explanation": "Professional conference speaker technique of repeating and framing audience questions clearly."
          },
          "deepQuiz": {
            "question": "An audience member aggressively interrupts your conference talk claiming your benchmark numbers are fraudulent. What is the most effective senior response?",
            "options": [
              "Argue back aggressively from the podium and demand they leave the room.",
              "Ignore them completely and rush to the next slide.",
              "Acknowledge the skepticism calmly, explain the exact load testing methodology and hardware environment, and invite them to review the open-source reproduction repository after the talk.",
              "Apologize profusely and admit that the presentation might have errors."
            ],
            "correctIndex": 2,
            "explanation": "Calmly sharing reproduction methodology and offering offline collaboration preserves authority and de-escalates hostility."
          },
          "speakingSimulation": {
            "prompt": "Deliver a 90-second conference presentation conclusion on the future of distributed systems resilience.",
            "collocations": [
              "the era of monolithic reliability is over",
              "embracing failure as a continuous state",
              "resilience is a cultural discipline",
              "inviting the community to collaborate"
            ],
            "sampleNativeAnswer": "In conclusion, the era of assuming our cloud infrastructure will remain perpetually reliable is over. In distributed systems operating at scale, failure is not an anomaly to be feared; it is a continuous physical reality to be engineered for. By embracing chaos engineering, automated canary gates, and zero-trust boundaries, we transform resilience from an operational panic into a sustainable engineering culture. Thank you very much, and I welcome your questions."
          }
        },
        "checklist": [
          {
            "id": "c_m_6_4_1",
            "text": "Study the Spontaneous Keynote Delivery & Tech Conference Q&A formula & contrastive rules"
          },
          {
            "id": "c_m_6_4_2",
            "text": "Complete the interactive Sentence Builder & Input Drill"
          },
          {
            "id": "c_m_6_4_3",
            "text": "Pass the deep technical challenge quiz with 100% accuracy"
          }
        ],
        "actionTarget": {
          "tab": "practice",
          "practiceMode": "sentences",
          "title": "Practice Arena",
          "buttonText": "🧩 Assemble Keynote Rhetoric"
        },
        "targetVocabulary": [
          {
            "term": "handling of distributed split-brain scenarios",
            "pos": "Conference Keynote Technical Framing",
            "definition": "Professional conference speaker technique of repeating and framing audience questions clearly.",
            "example": "For the folks watching the livestream, the question pertains to our handling of distributed split-brain scenarios.",
            "usageTip": "Ensures the entire audience and remote viewers understand the context before answering."
          },
          {
            "term": "perceptive observation let us unpack that",
            "pos": "Keynote Q&A Bridging Phrase",
            "definition": "Gracious rhetorical bridge acknowledging the questioner's intellect before delivering analysis.",
            "example": "That's a perceptive observation; let's unpack the reasoning behind why we favored event streaming.",
            "usageTip": "Disarms combative audience members and positions you as a thoughtful domain authority."
          },
          {
            "term": "empirically benchmarked under load",
            "pos": "Evidence-Backed Conference Defense",
            "definition": "Demonstrating that design claims are grounded in reproducible performance experiments.",
            "example": "We empirically benchmarked this caching layout under three times anticipated Black Friday load.",
            "usageTip": "Shifts abstract technical debates to hard empirical metrics and reproduction data."
          },
          {
            "term": "offline collaboration invitation",
            "pos": "Keynote Boundary Technique",
            "definition": "Diplomatically moving prolonged or adversarial technical debates to post-presentation chats.",
            "example": "We haven't benchmarked that specific edge case; let's connect offline to review the telemetry together.",
            "usageTip": "Prevents a single audience member from hijacking conference presentation time."
          }
        ]
      },
      {
        "id": "m_6_5",
        "stageId": "stage_6",
        "number": "6.5",
        "title": "Engineering Culture, High-Bar Mentorship & Thought Leadership",
        "category": "Engineering Culture",
        "icon": "🌱",
        "estimatedTime": "40 mins",
        "xp": 110,
        "level": "C2",
        "tagline": "Articulate technical vision memos, cultivate blameless psychological safety, and mentor staff engineers to autonomy.",
        "whyItMatters": "The ultimate measure of a Principal or Staff engineer is not the code they write, but the caliber of engineering culture they nurture. Articulating high standards without elitism, authoring inspiring technical vision memos, and fostering intellectual safety sets the foundation for high-performing teams.",
        "learnContent": {
          "summary": "Cultural leadership vocabulary: 'fostering psychological safety', 'elevating the engineering bar', 'uncompromising standards paired with unconditional empathy', 'cultivating autonomous ownership', 'force multiplier', 'technical stewardship'.",
          "formula": "High Standards + Psychological Safety = World-Class Engineering Autonomy",
          "rules": [
            "Act as a force multiplier: measure your impact by how much your mentorship elevates others.",
            "Pair demanding technical standards with profound interpersonal warmth and humility.",
            "Author memos that provide clarity of vision while giving teams autonomy over implementation."
          ],
          "badVsGood": {
            "bad": "My team is lazy and doesn't write good unit tests, so I have to check every PR myself.",
            "good": "Our role as technical leaders is to be force multipliers. Rather than acting as a gatekeeping bottleneck, we must establish automated tooling, architectural guardrails, and mentorship cadences that empower every engineer to deploy with high confidence.",
            "explanation": "Transforms authoritarian micromanagement into true servant engineering leadership and systemic empowerment."
          },
          "ukrainianTrap": "Weak managers control through gatekeeping and fear. True technical leaders build systems and culture that make them happily redundant."
        },
        "interactivePractice": {
          "sentenceBuilder": {
            "prompt": "Assemble the engineering manifesto statement: 'True architectural leadership / is not about gatekeeping pull requests, / but about cultivating systemic guardrails / and empowering team autonomy.'",
            "words": [
              "True architectural leadership",
              "is not about gatekeeping pull requests,",
              "but about cultivating systemic guardrails",
              "and empowering team autonomy"
            ],
            "target": "True architectural leadership is not about gatekeeping pull requests, but about cultivating systemic guardrails and empowering team autonomy",
            "hint": "Subject + negative definition clause + coordinate empowering outcome clause."
          },
          "inputDrill": {
            "sentenceBefore": "We cultivate high team velocity by fostering",
            "missingWord": "uncompromising technical standards",
            "sentenceAfter": "paired with profound psychological safety.",
            "hint": "Three words: 'uncompromising technical standards'.",
            "explanation": "The hallmark pairing of excellence and safety in high-performing engineering teams."
          },
          "deepQuiz": {
            "question": "What distinguishes an authentic Senior/Staff engineering mentor from a technical micromanager?",
            "options": [
              "The mentor writes all complex algorithms personally and assigns only trivial bug fixes to junior staff.",
              "The mentor acts as a force multiplier, building guardrails, asking guiding questions, and fostering autonomous decision-making in others.",
              "The mentor enforces strict dress codes and monitoring software.",
              "The mentor rejects any PR that does not match their personal coding aesthetics."
            ],
            "correctIndex": 1,
            "explanation": "Staff leadership focuses on being a force multiplier who develops autonomy and capability across the entire organization."
          },
          "speakingSimulation": {
            "prompt": "Deliver a 2-minute vision address to your newly formed engineering department on engineering excellence and psychological safety.",
            "collocations": [
              "engineering excellence as a habit",
              "blameless curiosity over fear",
              "empowered autonomy",
              "elevating our collective bar"
            ],
            "sampleNativeAnswer": "Welcome team. As we embark on building this next-generation platform, I want to be unequivocal about the culture we are building together. We hold an uncompromisingly high bar for code quality, system resilience, and test rigor. But high standards can only thrive in an environment of radical psychological safety. When an outage occurs—and it will—our response is never blame; it is blameless curiosity. We succeed by learning together, challenging ideas respectfully, and empowering every engineer here to act as an owner."
          }
        },
        "checklist": [
          {
            "id": "c_m_6_5_1",
            "text": "Study the Engineering Culture, High-Bar Mentorship & Thought Leadership formula & contrastive rules"
          },
          {
            "id": "c_m_6_5_2",
            "text": "Complete the interactive Sentence Builder & Input Drill"
          },
          {
            "id": "c_m_6_5_3",
            "text": "Pass the deep technical challenge quiz with 100% accuracy"
          }
        ],
        "actionTarget": {
          "tab": "speaking",
          "practiceMode": "code_002",
          "title": "Deliver Engineering Culture Address",
          "buttonText": "🎙️ Deliver Leadership Vision"
        },
        "targetVocabulary": [
          {
            "term": "uncompromising technical standards",
            "pos": "Engineering Culture Value",
            "definition": "High bar for code quality, automated testing, and resilience paired with profound empathy.",
            "example": "We cultivate high team velocity by fostering uncompromising technical standards paired with safety.",
            "usageTip": "Distinguishes world-class engineering teams: excellence as a habit, not an elitist gate."
          },
          {
            "term": "radical psychological safety",
            "pos": "High-Performance Culture Term",
            "definition": "Environment where team members feel completely safe to admit mistakes and propose bold ideas.",
            "example": "High standards can only thrive in an environment of radical psychological safety.",
            "usageTip": "The foundational prerequisite for blameless postmortems and rapid innovation."
          },
          {
            "term": "force multiplier leadership",
            "pos": "Staff/Principal Engineering Archetype",
            "definition": "Measuring seniority not by individual lines of code, but by elevating the output of entire teams.",
            "example": "Our role as Staff engineers is to act as force multipliers through tooling and mentorship.",
            "usageTip": "Core evaluation criterion for Staff and Principal engineering career ladders."
          },
          {
            "term": "servant architectural stewardship",
            "pos": "Engineering Leadership Paradigm",
            "definition": "Guiding technical vision by building guardrails and empowering autonomous ownership in others.",
            "example": "Rather than acting as gatekeeping bottlenecks, we practice servant architectural stewardship.",
            "usageTip": "Transforms authoritarian micromanagement into autonomous team empowerment."
          }
        ]
      },
      {
        "id": "m_6_6",
        "stageId": "stage_6",
        "number": "6.6",
        "title": "Native Conversational Flow: Hedging, Concession & Clarity",
        "category": "C2 Native Fluency",
        "icon": "💎",
        "estimatedTime": "45 mins",
        "xp": 120,
        "level": "C2",
        "tagline": "Weave nuanced concessions, tactical hedging, and uncompromising clarity into effortless, spontaneous native speech.",
        "whyItMatters": "The apex of English proficiency is not pedantic vocabulary—it is effortless, fluid conversational pragmatics. C2 speakers seamlessly balance concession ('Granted, while X has merits...'), tactical hedging ('I'd venture to say that...'), and definitive clarity ('...the overarching imperative remains Y').",
        "learnContent": {
          "summary": "C2 Pragmatic Connectors: 'Granted, ... nevertheless', 'Be that as it may', 'At the end of the day', 'Without getting bogged down in minutiae', 'I'd venture to suggest that', 'To play devil's advocate for a moment', 'The crux of the matter boils down to...'.",
          "formula": "Tactical Concession ('Granted...') ➔ Counter-Perspective ('Be that as it may...') ➔ Definitive Core Imperative",
          "rules": [
            "Use 'Granted' to acknowledge the counterpart's best point before pivoting to the decisive constraint.",
            "Use 'The crux of the matter' to distill hours of debate into a single crystal-clear decision point.",
            "Employ 'Without getting bogged down in the weeds' to keep discussions at the strategic level."
          ],
          "badVsGood": {
            "bad": "I agree with you a little bit, but we should do my way because it is better for our project.",
            "good": "Granted, adopting an in-memory datastore delivers immediate read performance gains; nevertheless, the crux of the matter remains data durability across catastrophic node reboots. I'd venture to suggest that a tiered cache represents the more prudent path forward.",
            "explanation": "The highest register of professional dialogue: deeply respectful, structurally rigorous, nuanced, and decisively persuasive."
          },
          "ukrainianTrap": "Intermediate speakers think winning an argument means never conceding anything. C2 native masters cheerfully concede minor points to fortify their position on the core strategic imperative."
        },
        "interactivePractice": {
          "sentenceBuilder": {
            "prompt": "Assemble the C2 diplomatic concession: 'Granted, this refactoring entails initial overhead; / nevertheless, the long-term payoff / in developer velocity and system stability / substantially outweighs the transient cost.'",
            "words": [
              "Granted, this refactoring entails initial overhead;",
              "nevertheless, the long-term payoff",
              "in developer velocity and system stability",
              "substantially outweighs the transient cost"
            ],
            "target": "Granted, this refactoring entails initial overhead; nevertheless, the long-term payoff in developer velocity and system stability substantially outweighs the transient cost",
            "hint": "Concession clause with semicolon + conjunctive adverb + compound subject + transitive verb phrase."
          },
          "inputDrill": {
            "sentenceBefore": "Without getting bogged down in low-level implementation details, the",
            "missingWord": "crux of the matter boils down to",
            "sentenceAfter": "our tolerance for data latency.",
            "hint": "Six words: 'crux of the matter boils down to'.",
            "explanation": "Idiomatic C2 executive phrasing identifying the fundamental essence of a complex dilemma."
          },
          "deepQuiz": {
            "question": "Which sentence demonstrates the most sophisticated native C2 pragmatic balance of concession and strategic decision-making?",
            "options": [
              "Your idea is okay, but my idea is what we must do right now.",
              "Granted, while third-party hosting reduces immediate operational maintenance, the crux of the matter remains our strict data residency compliance mandates.",
              "I don't care about the costs, we just need to build this feature immediately.",
              "Maybe we can do both things at the same time and see what happens."
            ],
            "correctIndex": 1,
            "explanation": "Option 2 seamlessly integrates a courteous concession ('Granted, while...') with a decisive strategic imperative ('the crux of the matter remains...')."
          },
          "speakingSimulation": {
            "prompt": "Synthesize a 2-hour contentious technical meeting into a 90-second definitive executive summary using C2 conversational pragmatics.",
            "collocations": [
              "granted, valid concerns were raised",
              "be that as it may",
              "the crux of the matter boils down to",
              "the most prudent path forward"
            ],
            "sampleNativeAnswer": "Thank you everyone for a spirited and thorough discussion. Granted, valid concerns were voiced regarding the initial migration effort of decomposing our monolith; nevertheless, be that as it may, the crux of the matter boils down to our ability to scale engineering teams across multiple continents without deployment bottlenecks. I'd venture to say that adopting a modular architecture with well-defined service boundaries represents our most prudent path forward. Let's proceed with the phase one RFC."
          }
        },
        "checklist": [
          {
            "id": "c_m_6_6_1",
            "text": "Study the Native Conversational Flow: Hedging, Concession & Clarity formula & contrastive rules"
          },
          {
            "id": "c_m_6_6_2",
            "text": "Complete the interactive Sentence Builder & Input Drill"
          },
          {
            "id": "c_m_6_6_3",
            "text": "Pass the deep technical challenge quiz with 100% accuracy"
          }
        ],
        "actionTarget": {
          "tab": "speaking",
          "practiceMode": "code_002",
          "title": "Synthesize Executive Meeting",
          "buttonText": "🎙️ Deliver C2 Synthesis"
        },
        "targetVocabulary": [
          {
            "term": "crux of the matter boils down to",
            "pos": "C2 Executive Pragmatic Idiom",
            "definition": "Distilling hours of complex debate into the single decisive strategic question or trade-off.",
            "example": "Without getting bogged down in low-level details, the crux of the matter boils down to our latency SLA.",
            "usageTip": "Used by senior leaders to cut through bikeshedding and align teams on core decisions."
          },
          {
            "term": "granted this refactoring entails initial overhead",
            "pos": "Tactical Concession Clause",
            "definition": "Courteously conceding the counterpart's valid point before pivoting to the decisive constraint.",
            "example": "Granted, this refactoring entails initial overhead; nevertheless, the long-term payoff is immense.",
            "usageTip": "C2 rhetorical mastery: conceding minor ground strengthens your core strategic position."
          },
          {
            "term": "without getting bogged down in minutiae",
            "pos": "Strategic Elevation Phrase",
            "definition": "Steering conversations away from trivial implementation trivia up to architectural strategy.",
            "example": "Without getting bogged down in minutiae, let's evaluate our overarching data residency obligations.",
            "usageTip": "Preserves executive meeting focus on high-impact architectural decisions."
          },
          {
            "term": "the most prudent path forward",
            "pos": "Decisive Executive Recommendation",
            "definition": "Authoritative conclusion indicating the wisest, most risk-adjusted course of action.",
            "example": "I'd venture to suggest that adopting a modular architecture represents our most prudent path forward.",
            "usageTip": "Classic C2 British/American executive phrasing synthesizing debate into consensus."
          }
        ]
      }
    ]
  }
]
};

// Helper to retrieve all milestones flattened across stages
ROADMAP_DATA.getAllMilestones = function() {
  const all = [];
  this.stages.forEach(stage => {
    stage.milestones.forEach(m => {
      all.push({
        ...m,
        stageNumber: stage.number,
        stageTitle: stage.title,
        stageBadge: stage.badge,
        stageColor: stage.color
      });
    });
  });
  return all;
};

// Helper to find milestone by ID
ROADMAP_DATA.getMilestoneById = function(id) {
  return this.getAllMilestones().find(m => m.id === id) || null;
};

if (typeof window !== 'undefined') {
  window.ROADMAP_DATA = ROADMAP_DATA;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = ROADMAP_DATA;
}
