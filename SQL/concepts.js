// Decisions are intentionally about access patterns and trade-offs, not brand names.
let questionNumber=0;
const q=(prompt,options,answer,hint,why)=>{
 const offset=questionNumber++%options.length;
 return {prompt,options:[...options.slice(offset),...options.slice(0,offset)],answer:(answer-offset+options.length)%options.length,hint,why};
};
const lesson=(title,concept,brief,questions)=>({module:10,kind:'concept',title,concept,brief,questions});

export const conceptLessons=[
 lesson('What NoSQL means',
  'NoSQL is a family of data models, not one database or a promise that SQL is obsolete. Document, key-value, graph, and wide-column systems organize data for different access patterns. PostgreSQL itself can store JSON documents.',
  'For each request, choose the most fitting description. Think about how the application reads and changes its data.',
  [
   q('A system stores customers, orders, and payments. It needs foreign keys and reliable multi-row transactions.',
    ['A relational database is a strong default','A key-value cache must be the source of truth','Every NoSQL system is automatically better at transactions'],0,
    'What protects related rows when a payment changes?', 'A relational database expresses relationships and transactions directly. Some NoSQL systems also support transactions; the model still depends on the workload.'),
   q('What does “NoSQL” describe?',
    ['A single language that replaces SQL','A family of non-relational data models','A database that cannot be queried'],1,
    'Think of documents, key-value pairs, graphs, and wide columns.', 'NoSQL is an umbrella term for several models. Each has its own ways to query or access data.'),
   q('Can a PostgreSQL table contain flexible JSON data?',
    ['Yes, with JSONB columns','No, JSON is forbidden in relational databases','Only after replacing SQL with MongoDB'],0,
    'Recall the products.details field in this course.', 'PostgreSQL JSONB lets a relational system store and query document-like data.')
  ]),
 lesson('Design a document',
  'A document stores related fields together, often as JSON. Embedding helps when the pieces are usually read and changed as one bounded unit. Separate collections or references help when a child set grows without bound or needs independent access.',
  'Choose a shape for each case. There is no universal rule to embed everything.',
  [
   q('An order has 2–8 line items. The app almost always reads the whole order, and line items belong only to that order.',
    ['Embed line items in the order document','Store every item only in an unrelated key-value cache','Put every line item in a separate database service'],0,
    'The items form a small, bounded part of one order.', 'Embedding fits a bounded group that is usually read with its parent.'),
   q('A popular product may have millions of reviews. Reviews are paged, searched, and moderated independently.',
    ['Embed every review forever in one product document','Store reviews separately and reference the product','Keep only one review per product'],1,
    'Consider growth and independent review queries.', 'A huge, independently queried collection should not grow inside one parent document.'),
   q('A catalog has products with different optional specifications. What should stay consistent across documents?',
    ['Nothing; flexible schema means no validation','Core fields such as id, name, and price','Every product must have identical optional specifications'],1,
    'Flexibility does not remove the need for application rules.', 'Documents can vary in optional fields while core fields still need validation and stable meaning.')
  ]),
 lesson('Key-value and caching',
  'A key-value store retrieves a value by a known key. It is useful for sessions and caches, often with expiration. A cache is a copy, so the application must decide when to refresh or invalidate it.',
  'Match the store to the lookup you actually need.',
  [
   q('The app receives a session token and must fetch a small session record that expires in 30 minutes.',
    ['Key-value store with a TTL','Graph database for multi-hop traversal','Full table scan for every request'],0,
    'The token is already the lookup key.', 'A key-value lookup and time-to-live match this access pattern.'),
   q('An analyst wants arbitrary filters across customer city, age, and purchase history.',
    ['A plain key-value lookup is enough','Use a queryable model and suitable indexes','Generate a random key for every filter'],1,
    'Can you know one exact key before running the query?', 'Flexible filtering needs a queryable model; plain key-value access is a poor fit.'),
   q('A cached product price is stale after the source price changes. What must the application do?',
    ['Invalidate or update the cached value','Assume caches always update themselves','Delete the source of truth'],0,
    'The cache is only a copy.', 'Cache invalidation or refresh is part of the design, especially for prices and other changing values.')
  ]),
 lesson('Graph relationships',
  'Graph databases model entities as nodes and relationships as edges. They shine when queries traverse many changing connections. A normal one-hop relationship is often simpler in relational tables.',
  'Choose based on the shape of the question, not the name of the data.',
  [
   q('A recommendation engine follows friends, friends of friends, and shared interests across variable numbers of hops.',
    ['Graph model','Single key-value lookup','One fixed text field with comma-separated friends'],0,
    'The path through relationships is the main query.', 'Graph traversal fits variable-depth relationship questions.'),
   q('A friendship began on a certain date. Where can that fact live in a graph?',
    ['On the relationship edge','Only in the database filename','Nowhere; graph edges cannot have properties'],0,
    'The date describes the connection itself.', 'Graph edges can carry properties such as since or weight.'),
   q('You only need each order with its customer name through one foreign key.',
    ['A relational JOIN is a straightforward choice','A graph database is mandatory','Store all customer names as SQL column names'],0,
    'This is a simple, known relationship.', 'A regular JOIN handles a one-hop relation cleanly; a graph system adds little here.')
  ]),
 lesson('Wide-column workloads',
  'Wide-column stores are built for large distributed workloads with queries planned around partition and sort keys. They are not just spreadsheets with many columns. Choosing a partition key starts from the reads you must support.',
  'Think about scale and the query route before choosing a model.',
  [
   q('Billions of sensor readings arrive over time. Most reads fetch one device’s readings in a time range.',
    ['A wide-column design keyed by device and time can fit','Store all readings as one giant JSON value','Use a graph for every timestamp'],0,
    'The read path is device → time range.', 'A partition and clustering strategy can make device/time reads efficient at large scale.'),
   q('Which key design helps those sensor reads?',
    ['A key derived from device and time bucket','A random key with no lookup path','The sensor reading text as a table name'],0,
    'The application knows the device and time window.', 'The partition key should let the query reach the relevant slice without scanning everything.'),
   q('Does “wide-column” simply mean an SQL table with hundreds of columns?',
    ['Yes, it only describes visual width','No, it refers to a distributed storage and access model','It means every row must contain identical columns'],1,
    'The term describes a data model, not the width on screen.', 'Wide-column systems organize and distribute records by keys and column families; their trade-offs differ from a wide SQL table.')
  ]),
 lesson('Consistency and copies',
  'Replication puts data on multiple machines, but copies may lag. Strong consistency and transactions matter for some operations; eventual consistency can be acceptable for others. “NoSQL” alone does not tell you which guarantee a database provides.',
  'Decide what a user may safely see immediately after a write.',
  [
   q('A transfer moves money between two accounts. The debit succeeds but the credit must never be lost.',
    ['Use an atomic transaction with appropriate consistency','Accept an eventually updated balance with no transaction','Keep balances only in a cache'],0,
    'Both changes must succeed or fail together.', 'Money movement needs atomicity and carefully chosen consistency guarantees.'),
   q('A public view counter updates a few seconds late. The exact number is not business critical.',
    ['Eventual consistency may be acceptable','Every reader must lock the whole database','The counter can never be stored'],0,
    'How much harm does a short delay cause?', 'Small lag is often acceptable for low-stakes counters, which can favor availability or throughput.'),
   q('A read replica returns an older value just after the primary accepted a write. What happened?',
    ['Replication lag','The SQL parser changed the value','All replicas always update at the same instant'],0,
    'The copy may not have caught up yet.', 'Replicas can lag behind the primary; read-after-write requirements need deliberate routing or stronger guarantees.')
  ]),
 lesson('Choose an architecture',
  'A good design starts with the questions and guarantees the product needs. You can mix models, but every new database adds operations, synchronization, and failure modes. Use the simplest system that meets the workload.',
  'You are designing the next version of the practice shop. Choose the starting point for each feature.',
  [
   q('Orders and payments need integrity, joins, and transactions. Where should their source of truth begin?',
    ['The existing relational PostgreSQL database','A short-lived session cache','A graph database chosen only because it is new'],0,
    'The team already has PostgreSQL and needs transactional relationships.', 'PostgreSQL is a sensible source of truth for transactional shop data.'),
   q('Product specifications vary. The current PostgreSQL catalog already has details JSONB and the traffic is modest.',
    ['Try JSONB with validation and indexes before adding another service','Move everything to a new document database immediately','Remove all product identifiers'],0,
    'Can the current system already express this need?', 'JSONB may cover flexible attributes without the operational cost of another database. Revisit the choice if the workload changes.'),
   q('Recommendations now require deep, variable-hop paths through customers, products, and interests.',
    ['Evaluate a graph model for that feature','Replace all payment transactions with graph edges','Use a single session key for every path'],0,
    'The new query is primarily about traversing relationships.', 'A graph model is worth evaluating for deep relationship traversal while transactional records can stay relational.')
  ])
];

export function gradeConcept(lesson,answers){
 const wrong=lesson.questions.map((question,index)=>answers[index]===question.answer?null:index).filter(index=>index!==null);
 return {complete:wrong.length===0&&answers.length===lesson.questions.length,correct:lesson.questions.length-wrong.length,wrong};
}
