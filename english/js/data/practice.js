// ============================================================================
// PRACTICE DATA: 100% ENGLISH IMMERSION PRACTICE ENGINE
// 1. Sentence Builder (SVOMPT, Inversion, Conditionals, Cleft Sentences)
// 2. Letter Scramble (Spelling & Active Recall of Essential Technical Vocabulary)
// 3. Grammar Quizzes (25 Deep Grammar Hack & Nuance Quizzes)
// 4. Mistake Hunter (Spot the Grammatical Error & Master Correct Usage)
// ============================================================================

if (typeof window === 'undefined') {
  global.window = global;
}

const PRACTICE_DATA = {
  // --- 1. SENTENCE BUILDER (SVOMPT & Syntactic Precision) ---
  sentenceBuilder: [
    {
      id: "sb-1",
      prompt: "Assemble a habit sentence with Subject + Verb + Object + Place + Time (SVOMPT):",
      words: ["I", "drink", "hot coffee", "in the kitchen", "every morning"],
      explanation: "SVOMPT rule: Subject (I) + Verb (drink) + Object (hot coffee) + Place (in the kitchen) + Time (every morning)."
    },
    {
      id: "sb-2",
      prompt: "Arrange three chronological time prepositions from largest to smallest (Month -> Day -> Hour):",
      words: ["She", "was born", "in May", "on a Friday", "at seven in the morning"],
      explanation: "Preposition hierarchy: Month (IN May) -> Specific Day (ON a Friday) -> Exact Hour (AT seven)."
    },
    {
      id: "sb-3",
      prompt: "Combine Present Perfect with the adverb 'already' and the correct collocation for assignments:",
      words: ["I", "have already done", "all my homework"],
      explanation: "Present Perfect connects past effort to current completion ('have already done'); tasks and homework take 'do', never 'make'."
    },
    {
      id: "sb-4",
      prompt: "Form a First Conditional expressing a real future possibility:",
      words: ["If", "it rains", "tomorrow", "I will stay", "at home"],
      explanation: "First Conditional: The IF-clause requires Present Simple ('it rains'), while the main clause takes 'will + infinitive' ('will stay')."
    },
    {
      id: "sb-5",
      prompt: "Assemble a sentence with a phrasal verb and an exact past time marker:",
      words: ["He", "turned down", "the job offer", "yesterday evening"],
      explanation: "Past Simple is required due to the specific time marker 'yesterday evening'. 'Turned down' means rejected or declined."
    },
    {
      id: "sb-6",
      prompt: "Construct a sentence using the prepositional idiom 'look forward to':",
      words: ["I", "am looking forward to", "meeting", "you"],
      explanation: "Trap alert: in 'look forward to', 'to' is a preposition, which requires a gerund ('meeting'), not a bare infinitive."
    },
    {
      id: "sb-7",
      prompt: "Express strong deduction (99% certainty) based on observable evidence:",
      words: ["You", "have worked all day", "you must be", "exhausted"],
      explanation: "Modal deduction of high certainty: 'must be' indicates a logical conclusion based on undeniable evidence."
    },
    {
      id: "sb-8",
      prompt: "Form a negative financial capability sentence with an infinitive object:",
      words: ["We", "cannot afford", "to buy", "a new car", "right now"],
      explanation: "The verb 'afford' grammatically requires a full infinitive ('to buy'), never a gerund."
    },
    {
      id: "sb-9",
      prompt: "Describe an ongoing psychological adaptation using 'get used to':",
      words: ["I", "am getting used to", "waking up", "at 6 AM"],
      explanation: "The construction 'be / get used to + V-ing' conveys becoming accustomed to a new routine."
    },
    {
      id: "sb-10",
      prompt: "Assemble a sentence using the correct collocation with an error:",
      words: ["He", "made", "a big mistake", "in his report"],
      explanation: "Collocation rule: English uses 'make a mistake' (creating an outcome), never 'do a mistake'."
    },
    {
      id: "sb-11",
      prompt: "Express an ongoing state that started in the past using 'since':",
      words: ["I", "have lived", "in this cozy city", "since 2018"],
      explanation: "Present Perfect ('have lived') paired with 'since' indicates an action that began at a past date and continues today."
    },
    {
      id: "sb-12",
      prompt: "Form a classic imperative proverb with a phrasal verb meaning delay:",
      words: ["Never", "put off", "until tomorrow", "what you can do", "today"],
      explanation: "Phrasal verb 'put off' means to procrastinate or postpone."
    },
    {
      id: "sb-13",
      prompt: "Construct a formal negative inversion emphasizing rarity:",
      words: ["Rarely", "have we encountered", "such high latency", "in production"],
      explanation: "Negative Inversion: Fronting a negative adverb like 'Rarely' forces auxiliary-subject inversion ('have we encountered')."
    },
    {
      id: "sb-14",
      prompt: "Assemble a Third Conditional expressing an unreal past scenario and regret:",
      words: ["If", "we had indexed", "the database table", "the query would have finished", "much faster"],
      explanation: "Third Conditional: 'If + Past Perfect (had indexed)' followed by 'would have + past participle (would have finished)'."
    },
    {
      id: "sb-15",
      prompt: "Form a cleft sentence placing rhetorical emphasis on the root cause:",
      words: ["What", "caused the server crash", "was", "an unexpected memory leak"],
      explanation: "Wh-cleft sentence: 'What caused...' structures the sentence to spotlight the key explanatory clause."
    },
    {
      id: "sb-16",
      prompt: "Construct a passive sentence detailing a graceful cloud failover:",
      words: ["All incoming traffic", "was immediately rerouted", "to the replica cluster", "without downtime"],
      explanation: "Passive voice ('was rerouted') correctly shifts focus to the affected system rather than the human operator."
    }
  ],

  // --- 2. LETTER SCRAMBLE (Technical Vocabulary & Accurate Spelling) ---
  letterScramble: [
    {
      id: "ls-1",
      word: "IMPROVE",
      meaning: "To make something substantially better in quality, performance, or value.",
      hint: "Starts with 'I', ends with 'E'. Often paired with performance metrics.",
      category: "Verbs"
    },
    {
      id: "ls-2",
      word: "ACHIEVE",
      meaning: "To successfully reach a desired milestone, objective, or target through sustained effort.",
      hint: "Contains 'IE' spelling pattern. 7 letters.",
      category: "Verbs"
    },
    {
      id: "ls-3",
      word: "LATENCY",
      meaning: "The time delay between a request initiation and the corresponding response.",
      hint: "Crucial networking and database metric measured in milliseconds. 7 letters.",
      category: "Nouns"
    },
    {
      id: "ls-4",
      word: "DECOUPLE",
      meaning: "To separate software components so changes in one do not break the other.",
      hint: "Opposite of tight coupling. 8 letters.",
      category: "Verbs"
    },
    {
      id: "ls-5",
      word: "CRUCIAL",
      meaning: "Decisive or critically important for the success or failure of something.",
      hint: "Synonym for vital or essential. 7 letters.",
      category: "Adjectives"
    },
    {
      id: "ls-6",
      word: "FAILOVER",
      meaning: "An automated backup operational mode in which the functions of a crashed system are assumed by a secondary system.",
      hint: "Compound noun: fail + over. 8 letters.",
      category: "Nouns"
    },
    {
      id: "ls-7",
      word: "MITIGATE",
      meaning: "To make a risk, vulnerability, or failure less severe or harmful.",
      hint: "Commonly paired with 'risk', 'bottleneck', or 'impact'. 8 letters.",
      category: "Verbs"
    },
    {
      id: "ls-8",
      word: "SUBTLE",
      meaning: "Delicate, understated, or difficult to detect immediately (silent 'B').",
      hint: "Pronounced 'sut-l', but spelled with a silent letter. 6 letters.",
      category: "Adjectives"
    },
    {
      id: "ls-9",
      word: "DEADLINE",
      meaning: "The strict boundary time or date by which a piece of work must be finished.",
      hint: "Two combined words: dead + line. 8 letters.",
      category: "Nouns"
    },
    {
      id: "ls-10",
      word: "CLARIFY",
      meaning: "To make a statement, requirement, or architecture easy to understand and free from confusion.",
      hint: "From the root 'clear'. Ends with 'FY'. 7 letters.",
      category: "Verbs"
    },
    {
      id: "ls-11",
      word: "RESILIENT",
      meaning: "Able to withstand or recover quickly from difficult conditions, crashes, or partition failures.",
      hint: "Core trait of distributed architectures. 9 letters.",
      category: "Adjectives"
    },
    {
      id: "ls-12",
      word: "HESITATE",
      meaning: "To pause before saying or doing something that one feels unsure or reluctant about.",
      hint: "Don't ... to ask questions! 8 letters.",
      category: "Verbs"
    },
    {
      id: "ls-13",
      word: "REFACTOR",
      meaning: "To restructure existing computer code without changing its external behavior.",
      hint: "Done to improve readability and reduce code debt. 8 letters.",
      category: "Verbs"
    },
    {
      id: "ls-14",
      word: "ALLOCATE",
      meaning: "To distribute resources, memory, or funds for a designated purpose.",
      hint: "Often paired with heap memory or CPU quotas. 8 letters.",
      category: "Verbs"
    },
    {
      id: "ls-15",
      word: "SCRUTINY",
      meaning: "Critical observation or thorough examination of code, architecture, or data.",
      hint: "Pull requests must withstand strict technical ... 8 letters.",
      category: "Nouns"
    },
    {
      id: "ls-16",
      word: "EPHEMERAL",
      meaning: "Lasting for a very short time; transient, non-persistent storage or containers.",
      hint: "Describes temporary worker nodes or stateless storage. 9 letters.",
      category: "Adjectives"
    }
  ],

  // --- 3. GRAMMAR QUIZ (25 High-Impact Grammar & Nuance Quizzes) ---
  grammarQuiz: [
    {
      id: "gq-1",
      question: "Our architecture sync will start ___ Monday ___ 10:00 AM sharp.",
      options: ["in / at", "on / at", "at / on", "on / in"],
      correctIndex: 1,
      explanation: "Time Prepositions Rule: Days of the week take 'ON' (on Monday), while specific clock times take 'AT' (at 10:00 AM)."
    },
    {
      id: "gq-2",
      question: "I ___ to San Francisco three times in my career, but last year I ___ to Tokyo for a conference.",
      options: [
        "was / have gone",
        "have been / went",
        "went / have been",
        "had been / went"
      ],
      correctIndex: 1,
      explanation: "Life experience without a specific past timestamp requires Present Perfect ('have been'). A definite past marker like 'last year' strictly requires Past Simple ('went')."
    },
    {
      id: "gq-3",
      question: "Please don't interrupt me right now. I need to ___ this performance analysis.",
      options: ["do", "make", "create", "doing"],
      correctIndex: 0,
      explanation: "Collocation Rule: Work, tasks, analysis, and research take the verb 'DO' (do an analysis, do a task, do homework). 'Make' is reserved for creating, inventing, or manufacturing something new."
    },
    {
      id: "gq-4",
      question: "If the caching layer ___ operational tomorrow, the system ___ peak traffic without throttling.",
      options: [
        "will be / will handle",
        "is / will handle",
        "is / handles",
        "was / would handle"
      ],
      correctIndex: 1,
      explanation: "First Conditional: Future 'will' is strictly prohibited inside the IF-clause. Use Present Simple ('is') in the condition and 'will + base verb' ('will handle') in the result."
    },
    {
      id: "gq-5",
      question: "The telemetry logs show 100% CPU saturation and unhandled panic exceptions. The service ___ be functioning correctly.",
      options: ["must", "can't", "should", "might not"],
      correctIndex: 1,
      explanation: "Modal Deduction Rule: Negative logical certainty (0% possibility based on overwhelming contradictory proof) is expressed with 'CAN'T' ('it can't be working'). 'Mustn't' expresses prohibition, not deduction."
    },
    {
      id: "gq-6",
      question: "Our engineering squad is really looking forward to ___ the new microservice architecture next quarter.",
      options: ["deploy", "deployed", "deploying", "be deployed"],
      correctIndex: 2,
      explanation: "Prepositional Gerund Trap: In 'look forward to', the word 'to' is a preposition, not an infinitive marker. Prepositions must be followed by a gerund ('deploying')."
    },
    {
      id: "gq-7",
      question: "We ___ deploy code manually on Friday evenings, but now our CI/CD pipeline does it automatically.",
      options: ["used to", "are used to", "got used to", "use to"],
      correctIndex: 0,
      explanation: "'Used to + infinitive' describes a terminated past habit or obsolete state that is no longer true in the present."
    },
    {
      id: "gq-8",
      question: "We noticed ___ anomaly in our API gateway yesterday. ___ anomaly disappeared after the hotfix.",
      options: ["the / An", "an / The", "an / An", "the / The"],
      correctIndex: 1,
      explanation: "Articles Rule: Introduce a singular countable noun for the first time using an indefinite article ('an anomaly'). Refer to the exact same known noun subsequently using the definite article ('the anomaly')."
    },
    {
      id: "gq-9",
      question: "After inspecting the memory dumps, the lead architect managed to ___ why the garbage collector stalled.",
      options: ["figure out", "give up", "put off", "look up to"],
      correctIndex: 0,
      explanation: "'Figure out' is a phrasal verb meaning to understand, solve, or discover the underlying cause through reasoning."
    },
    {
      id: "gq-10",
      question: "If we ___ dedicated staging clusters right now, we ___ test our failover protocols with zero risk.",
      options: [
        "have / will",
        "had / would",
        "had had / would have",
        "would have / had"
      ],
      correctIndex: 1,
      explanation: "Second Conditional: Hypothetical present state uses 'If + Past Simple' (had), followed by 'would + base verb' (would test)."
    },
    {
      id: "gq-11",
      question: "Rarely ___ such an insidious concurrency deadlock in production workloads.",
      options: [
        "we have witnessed",
        "have we witnessed",
        "we witnessed",
        "did we witnessed"
      ],
      correctIndex: 1,
      explanation: "Negative Inversion: Placing negative or restrictive adverbials ('Rarely', 'Seldom', 'Never') at the beginning of a clause requires inverted word order: Auxiliary + Subject + Main Verb ('have we witnessed')."
    },
    {
      id: "gq-12",
      question: "If the DevOps team ___ the snapshot yesterday, we ___ the corrupted database this morning.",
      options: [
        "backed up / could restore",
        "had backed up / could have restored",
        "backed up / would restore",
        "had backed up / could restore"
      ],
      correctIndex: 1,
      explanation: "Third Conditional: Unreal past condition ('had backed up') producing an unreal past outcome ('could have restored')."
    },
    {
      id: "gq-13",
      question: "If we had designed the API idempotently last year, we ___ dealing with duplicate payments today.",
      options: [
        "wouldn't have been",
        "wouldn't be",
        "won't be",
        "aren't"
      ],
      correctIndex: 1,
      explanation: "Mixed Conditional (Past condition -> Present result): 'If we had designed' (past) explains why 'we wouldn't be dealing' (present ongoing result)."
    },
    {
      id: "gq-14",
      question: "The director insisted that the security vulnerability ___ patched before the end of the business day.",
      options: ["is", "was", "be", "must be"],
      correctIndex: 2,
      explanation: "Present Subjunctive: Verbs of demand, urgency, and recommendation (insist, demand, recommend, require) take the subjunctive base form ('that it be patched') regardless of the subject."
    },
    {
      id: "gq-15",
      question: "She stopped ___ with the legacy codebase because it was taking too much time, and stopped ___ coffee instead.",
      options: [
        "to work / to drink",
        "working / to drink",
        "working / drinking",
        "to work / drinking"
      ],
      correctIndex: 1,
      explanation: "'Stop + gerund' means halting an activity permanently or temporarily ('stopped working'). 'Stop + infinitive' means pausing in order to engage in a new action ('stopped to drink')."
    },
    {
      id: "gq-16",
      question: "The team remembered ___ the environment variables last week, so they didn't need to rebuild the container.",
      options: ["to set", "setting", "set", "having been set"],
      correctIndex: 1,
      explanation: "'Remember + gerund' refers to recalling a past action already performed ('remember setting'). 'Remember + infinitive' means not forgetting a required future duty ('remember to set')."
    },
    {
      id: "gq-17",
      question: "The distributed storage partition, ___ was deployed across three regions, survived the datacenter outage.",
      options: ["which", "that", "what", "where"],
      correctIndex: 0,
      explanation: "Non-defining Relative Clause: Extra descriptive information set off by commas must use 'which' (never 'that') when referring to inanimate objects."
    },
    {
      id: "gq-18",
      question: "___ the substantial spike in network traffic, response times remained well below the 50ms SLA.",
      options: ["Despite", "In spite", "Although", "Even though"],
      correctIndex: 0,
      explanation: "'Despite' and 'In spite of' are prepositions followed directly by noun phrases ('the substantial spike'). 'Although' and 'Even though' require a full subject + verb clause."
    },
    {
      id: "gq-19",
      question: "The senior engineer had the junior developer ___ the integration test suite.",
      options: ["to rewrite", "rewrite", "rewrote", "rewriting"],
      correctIndex: 1,
      explanation: "Causative 'Have': 'Have + person + bare infinitive' expresses instructing or delegating someone to perform an action ('had him rewrite')."
    },
    {
      id: "gq-20",
      question: "The database servers were ___ under high load that query response times tripled.",
      options: ["such", "so", "too", "very"],
      correctIndex: 1,
      explanation: "'So' modifies adverbs, adjectives, or prepositional phrases with result clauses ('so under high load that...'). 'Such' requires an accompanying noun phrase ('such a heavy load that...')."
    },
    {
      id: "gq-21",
      question: "I wish our deployment pipeline ___ so slow; waiting forty minutes per build breaks my focus.",
      options: ["isn't", "wasn't", "weren't", "wouldn't"],
      correctIndex: 2,
      explanation: "Unreal Present Wish: 'Wish' expressing dissatisfaction with current reality takes the subjunctive Past Simple ('weren't' or 'wasn't', with 'weren't' preferred in formal English)."
    },
    {
      id: "gq-22",
      question: "Hardly ___ deployed the critical patch when the alert notification sounded again.",
      options: [
        "we had",
        "had we",
        "did we have",
        "have we"
      ],
      correctIndex: 1,
      explanation: "Correlative Inversion: 'Hardly had + Subject + Past Participle ... when' conveys that one rapid event immediately succeeded another."
    },
    {
      id: "gq-23",
      question: "It is crucial that every developer ___ familiar with the incident response runbook.",
      options: ["is", "be", "are", "would be"],
      correctIndex: 1,
      explanation: "Mandative Subjunctive: Expressions of importance ('It is crucial / essential / vital that...') require the bare subjunctive form ('be') for all persons."
    },
    {
      id: "gq-24",
      question: "The API endpoint returns a 429 status code ___ prevent abusive clients from overwhelming the server.",
      options: ["so as to", "so that", "for to", "in order"],
      correctIndex: 0,
      explanation: "Purpose Clause: 'So as to + infinitive' and 'in order to + infinitive' express objective or intent concisely. 'So that' requires a subject and modal verb ('so that it can prevent')."
    },
    {
      id: "gq-25",
      question: "By the time the database replication lag reaches zero, the analytics workers ___ millions of queued records.",
      options: [
        "will process",
        "will be processing",
        "will have processed",
        "would process"
      ],
      correctIndex: 2,
      explanation: "Future Perfect: 'By the time + Present Simple clause' indicates a deadline before which another future event will be completed ('will have processed')."
    }
  ],

  // --- 4. ERROR HUNTER (Spot & Eliminate Grammatical Flaws) ---
  errorHunter: [
    {
      id: "eh-1",
      sentence: "I am agree with your architectural assessment regarding the microservices breakdown.",
      tokens: ["I", "am", "agree", "with", "your", "architectural", "assessment"],
      wrongToken: "am",
      correction: "I agree with your architectural assessment.",
      explanation: "'Agree' is already an active lexical verb. Saying 'I am agree' is a common mother-tongue transfer error; use 'I agree'."
    },
    {
      id: "eh-2",
      sentence: "The lead engineer explained me the complex distributed consensus algorithm.",
      tokens: ["The", "lead", "engineer", "explained", "me", "the", "algorithm"],
      wrongToken: "me",
      correction: "The lead engineer explained to me the algorithm (or explained the algorithm to me).",
      explanation: "Unlike the verb 'tell' (tell me), 'explain' cannot take an indirect human object without the preposition 'TO' (explain to someone)."
    },
    {
      id: "eh-3",
      sentence: "Our engineering squad has refactored the legacy payment gateway two months ago.",
      tokens: ["Our", "squad", "has", "refactored", "the", "gateway", "two", "months", "ago"],
      wrongToken: "has",
      correction: "Our squad refactored the gateway two months ago.",
      explanation: "The explicit past timestamp 'two months ago' firmly anchors the action in a closed past period, strictly prohibiting Present Perfect."
    },
    {
      id: "eh-4",
      sentence: "He made all his assigned programming tasks before the end of the sprint.",
      tokens: ["He", "made", "all", "his", "assigned", "tasks", "before", "the", "sprint"],
      wrongToken: "made",
      correction: "He did all his assigned programming tasks.",
      explanation: "Collocation error: work, chores, and assigned technical tasks combine with DO ('did his tasks'), never MAKE."
    },
    {
      id: "eh-5",
      sentence: "If the load balancer will fail during peak hours, traffic will crash the nodes.",
      tokens: ["If", "the", "load", "balancer", "will", "fail", "during", "peak", "hours"],
      wrongToken: "will",
      correction: "If the load balancer fails during peak hours...",
      explanation: "Conditional clauses introduced by 'if' require Present Simple to denote future conditions; modal 'will' is prohibited in the condition clause."
    },
    {
      id: "eh-6",
      sentence: "Despite of high network latency, the transaction completed within the allowed SLA.",
      tokens: ["Despite", "of", "high", "network", "latency", "the", "transaction", "completed"],
      wrongToken: "of",
      correction: "Despite high network latency... (or In spite of high network latency)",
      explanation: "'Despite' takes a noun phrase directly without any preposition. Only 'in spite' takes 'of'."
    },
    {
      id: "eh-7",
      sentence: "All team members are looking forward to meet the keynote speakers at the tech summit.",
      tokens: ["All", "team", "members", "are", "looking", "forward", "to", "meet", "them"],
      wrongToken: "meet",
      correction: "All team members are looking forward to meeting them.",
      explanation: "'Look forward to' is followed by a gerund ('meeting') because 'to' is a preposition governing a noun/gerund object."
    },
    {
      id: "eh-8",
      sentence: "The team didn't used to implement integration tests, but now they are mandatory.",
      tokens: ["The", "team", "didn't", "used", "to", "implement", "tests"],
      wrongToken: "used",
      correction: "The team didn't use to implement tests.",
      explanation: "After the negative auxiliary 'didn't', the main verb must appear in its bare infinitive form ('use to', not 'used to')."
    },
    {
      id: "eh-9",
      sentence: "The lead architect insisted that the caching layer is deployed before Black Friday.",
      tokens: ["The", "lead", "architect", "insisted", "that", "it", "is", "deployed"],
      wrongToken: "is",
      correction: "The lead architect insisted that it be deployed.",
      explanation: "Mandative Subjunctive: Clauses following verbs of demand or insistence require the bare base verb ('be deployed')."
    },
    {
      id: "eh-10",
      sentence: "Hardly we had finished the database migration when another connection spike arrived.",
      tokens: ["Hardly", "we", "had", "finished", "the", "migration", "when", "it", "spiked"],
      wrongToken: "we",
      correction: "Hardly had we finished the migration...",
      explanation: "Negative Inversion: When 'Hardly' opens a sentence, the auxiliary verb must precede the subject ('Hardly had we finished')."
    },
    {
      id: "eh-11",
      sentence: "We must avoid to make breaking changes to the public REST endpoints.",
      tokens: ["We", "must", "avoid", "to", "make", "breaking", "changes"],
      wrongToken: "to",
      correction: "We must avoid making breaking changes.",
      explanation: "The verb 'avoid' grammatically demands a gerund object ('avoid making'), never an infinitive ('avoid to make')."
    },
    {
      id: "eh-12",
      sentence: "The telemetry data confirms that the server behaves much more better after optimization.",
      tokens: ["The", "telemetry", "data", "confirms", "the", "server", "behaves", "more", "better"],
      wrongToken: "more",
      correction: "The server behaves much better after optimization.",
      explanation: "Double Comparative Error: 'Better' is already the comparative form of good/well. Adding 'more' is redundant and ungrammatical."
    }
  ]
};

// Export for Node and browser
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PRACTICE_DATA;
}
