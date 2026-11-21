// @ts-nocheck
// Generated from integration/english-course.cjs by scripts/sync-english-content.mjs.
import examples from './examples';
import * as learning from './learning';
  'use strict';
  const VERSION = '2.0.0';
  // Wrong choices describe plausible misunderstandings of this particular case.
  // Preserved for legacy choice-validation tests while the UI renders 100% open tasks.
  const CONTRASTS = `Project introductions|The new developer knows the users but not the team's tools.|The new developer does not know who chose the technical tools.|We introduce the tools first and leave the user discussion for later.|We describe the new features before deciding who owns each part.|A feature list explains the user problem once the tools are named.|The introduction should focus on tools before discussing who uses the app.
Team roles|The tester has confirmed requirements that the designer wants to change.|The team has named an owner but has not written the requirements.|We let each role approve its own part without naming a final owner.|We ask the developer to confirm requirements before consulting the other roles.|Each role needs a different person even when the team is small.|Naming a final owner removes the need to consult other roles.
Agile feedback|Users want the team to collect more information in the form.|The form collects enough information but users cannot find the submit button.|We explain why each field exists and keep the current form for the next trial.|We ask the team to agree on a larger form before another user trial.|User feedback can replace a written plan for the next change.|An early release should keep its original plan despite later feedback.
Scrum and sprints|The team has finished the sprint but has not received new requests.|The team has enough time but cannot agree who requested each feature.|We divide every request between developers before agreeing on a sprint goal.|We select the easiest requests first and define the sprint goal afterwards.|The daily scrum mainly confirms whether each person followed the manager's plan.|The daily scrum replaces planning because the sprint goal can be discussed later.
Tasks and blockers|The reminder fails even though the developer has valid test access.|The developer has credentials but does not know which account to test.|I continue building the reminder and ask for access after the update.|I ask a teammate to run the test without explaining why I cannot run it.|An update should describe completed work and leave blockers for a separate meeting.|A blocker should be mentioned only after it has delayed the release.
Git history|The team knows the changed commit but cannot reproduce its behaviour.|The bug disappears when the developers switch to the release branch.|We compare the current files with the release notes before checking commits.|We create a new branch and record the current behaviour as the starting point.|Finding the first affected commit is enough to explain the bug's cause.|The history explains the cause without needing to reproduce the behaviour.
Feature branches|The filter is complete but has not been copied from the release branch.|A reminder fix cannot be tested because it shares the filter's settings.|I finish the filter on the release branch and keep its interface hidden.|I collect both changes on one branch and review them in a single request.|Keeping a branch separate reduces the need to integrate it regularly.|A long-lived branch stays easier to merge because its changes are isolated.
Clear commits|The reviewer understands the files but cannot run the timezone test.|The timezone fix and colour changes depend on the same missing setting.|I keep the changes together and describe the timezone fix in more detail.|I group the changes by file type before explaining the reason for the fix.|A detailed message can make unrelated changes into one coherent fix.|Grouping files by their location is enough to explain the purpose of a change.
Pull requests|The reviewer can reproduce the behaviour but does not know who owns it.|The new behaviour differs from the approved requirements.|I add a full list of changed files and ask the reviewer to infer the test steps.|I attach the successful test output without describing how to repeat it.|A small change usually needs less attention to the consequences of failure.|The number of changed lines is the main measure of review risk.
Constructive code review|The colleague understands the duplicate reminder but disagrees about its owner.|The review requests a new feature rather than explaining a failure case.|I ask for a cleaner function before describing the duplicate-send case.|I present the guard as a personal preference without discussing its effect.|A polite suggestion and a correctness requirement have the same priority.|A review should treat every improvement as required before integration.
DevOps collaboration|Release instructions are shared but the deployment command is undocumented.|The automated release is available only to the development team.|We choose a deployment tool first and ask operations to document its use.|We document the manual steps and leave automation to another team.|Choosing a deployment tool is enough to establish shared responsibility.|A DevOps job title defines how development and operations should collaborate.
Builds and dependencies|Both machines use the same versions but run different test data.|The build server cannot find an artifact produced by the laptop.|We update both machines to the latest dependencies without fixing their versions.|We copy the laptop's artifact instead of making the build commands consistent.|A successful build is sufficient evidence that the new behaviour is correct.|Matching dependency versions removes the need to check application behaviour.
Continuous integration|The developer sees the failure immediately but cannot identify the changed files.|The build works after integration but the test command is missing.|We collect changes during the week and test them together before release.|We run checks only after the reviewer has accepted the proposed change.|A passing check confirms cases similar to the ones it was designed to cover.|A passing pipeline removes uncertainty about cases outside the test suite.
Why our deployment failed|Production has the setting but uses a value intended for staging.|The previous release cannot read a setting introduced by the database.|We add the missing setting directly and keep the new release in production.|We rebuild the previous release without adding configuration validation.|Returning to the old code also restores the previous database contents.|Code and database rollback can be treated as the same recovery operation.
Development and production|Staging has test addresses but sends messages through the production service.|Production is using settings copied from the developer's test account.|We warn the testers about real addresses and keep the shared configuration.|We separate the accounts after the reminder has been tested on customer data.|Staging results cover the same conditions as real production traffic.|Keeping environments separate makes their traffic and behaviour equivalent.
HTTP requests|The page rejects successful responses because the booking takes too long.|The server confirms bookings but does not return the available slots.|We show the success message when the request finishes, then check its status.|We retry the request before looking at the response status and message.|A successful HTTP status confirms that the requested business action completed.|The status code provides enough information to confirm every booking outcome.
API contracts|The mobile team changes a field that the backend has already documented.|The backend keeps the field name but changes the release schedule.|We publish the new field name and ask consumers to update immediately.|We keep both formats without agreeing how the transition will end.|Documenting a field makes additional checks at the boundary unnecessary.|A stable contract allows consumers to trust incoming values without validation.
Authentication and sessions|The token is valid but belongs to a user without dashboard access.|The server rejects a token before its expiry time.|We renew the token automatically without checking the current session.|We check the user's role before checking whether the token is still valid.|Signing in successfully gives the user access to other patients' records.|A valid token is enough to authorise every action on the dashboard.
Useful error messages|The API explains the date problem but exposes private customer details.|The API returns a validation message for a date that is actually valid.|We return the internal exception so the caller can identify the invalid date.|We keep the server error and document the expected date format elsewhere.|Including a stack trace makes the response safer because it is more specific.|A detailed internal exception is usually the clearest explanation for the user.
Third-party integrations|The SMS service responds quickly but reports the wrong delivery status.|The reminder is queued locally but the booking result is not stored.|We wait for delivery confirmation before allowing the booking page to continue.|We retry immediately and treat the first timeout as a failed send.|A timed-out call confirms that the external service did not send the reminder.|A missing response is sufficient reason to repeat any remote operation safely.
SQL queries|The database filters correctly but the application requests the wrong columns.|The dashboard loads one doctor's appointments in an incorrect order.|We fetch all appointments once and cache the filtered result in memory.|We add application workers to filter the fetched records faster.|A smaller result set is enough to establish that a query uses an efficient plan.|The number of returned rows directly describes how much work the query performs.
Database indexes|The query uses an email index but returns appointment details slowly.|The database reads few rows but spends most of its time writing emails.|We cache every email search before inspecting the query plan.|We increase the number of connections before testing the search index.|An index improves reads without changing the cost of maintaining stored data.|The storage cost of an index is independent of its effect on writes.
Transactions and locking|The requests reserve different slots but return the same confirmation code.|A lock prevents both requests from seeing any available slots.|We check availability before starting two separate confirmation operations.|We group the operations but leave the isolation level and constraints unchanged.|Wrapping the code in a transaction is sufficient under any isolation level.|Isolation affects performance but does not affect whether the race can occur.
The N+1 query problem|One large query returns appointments for patients outside the result set.|The patient list is slow because it is requested more than once.|We run the per-patient queries concurrently while keeping their number unchanged.|We cache patient names before fetching appointments individually.|A batch removes the need to handle patients without related appointments.|Batching means the response size no longer needs a practical limit.
Cursor pagination|The order is stable but the cursor stores a field the query does not return.|The query is fast but users cannot choose a different page size.|We retain offset pages and increase the limit for deeper requests.|We return a cursor without specifying a stable ordering key.|A cursor can ignore tie-breakers when most ordering values are different.|The cursor only needs the page size rather than the values used for ordering.
UI state|Changing the date clears the available dates instead of the selected slot.|The interface forgets the selected slot before the date changes.|We keep the selected slot and validate it only when the form is submitted.|We copy the slot into another state variable whenever the date changes.|Keeping extra copies of derived state makes consistency easier to guarantee.|Updating every state copy independently reduces the need to coordinate changes.
Events and cleanup|The previous listener is removed but the new callback never runs.|The component adds its listener before the first visit has completed.|We replace the listener's callback but leave the old subscription active.|We remove listeners using a newly created callback with the same body.|A callback with matching code is sufficient even if it is a different reference.|The removal options can differ as long as the callback name is the same.
Debounced search|Typing quickly replaces newer results with responses to an older query.|The search waits too long because requests are already being delayed.|We send the first request immediately and delay only its display.|We start each request but show a loading state after typing stops.|Reducing request frequency also prevents older responses replacing newer results.|Debouncing resolves response ordering without an additional stale-response check.
Stale responses|The Ann request is sent after the Anna request because input events are delayed.|The Anna response is rejected because the older request has been cancelled.|We debounce future input without checking which response updates the interface.|We accept the response that finishes last because it has the latest result.|Cancelling the browser request confirms that the server stopped processing it.|A cancelled client connection also cancels work already running on the server.
Memory leaks|Active components use more memory because they are displaying larger results.|Listeners are removed but the browser reserves memory for later reuse.|We increase the memory limit before examining what retains the components.|We clear displayed data but leave the long-lived subscriptions unchanged.|A high memory reading by itself identifies retained objects as a leak.|Memory that has not immediately decreased must belong to unused components.
Asynchronous work|The interface shows a loading state while a remote operation is slow.|The asynchronous operation completes before the interface can display its result.|We move the same synchronous wait behind a loading message.|We wrap the CPU work in a promise and assume it will run on another core.|Returning a promise means CPU-heavy work runs in parallel with the interface.|Asynchronous scheduling automatically moves calculations to separate workers.
Sequential and concurrent requests|The first request needs data that only the second request can return.|Both independent requests start together but one returns stale data.|We start the second request after preparing the first request's result.|We combine the returned data but keep the two requests sequential.|Requests with dependencies can start together if they share a promise container.|Awaiting results together removes the need to check dependencies first.
Concurrency and parallelism|A colleague assumes that parallel CPU work must use a single request.|More CPU cores are available but the code sends only one I/O request.|We increase the promise count before separating CPU work from I/O waits.|We describe every overlapping operation as work on another CPU core.|Increasing concurrency is mainly limited by the number of CPU cores.|Overlapping more I/O work does not affect shared connection or memory limits.
Streams|The process crashes because it reads chunks in an incorrect order.|The report fits in memory but the output cannot be opened.|We build the full result and stream only the final write.|We read in chunks but retain every chunk until the report is complete.|Streaming makes resource cleanup optional because each chunk is small.|Processing a report in chunks also handles errors in the surrounding resources.
Backpressure|The writer finishes before the reader can produce another chunk.|The writer rejects chunks even when the output buffer is empty.|We increase the buffer size while leaving the reader's rate unchanged.|We keep reading and retry each write after the buffer fills.|A larger buffer resolves a continuing difference between reader and writer speed.|Buffer capacity is enough to control memory use without slowing the reader.
Safe refactoring|The responsibilities are separated but tests check unrelated input formats.|A new feature needs behaviour that the existing function does not provide.|We split the function first and verify behaviour after the structural changes.|We preserve the old structure and test only the responsibility being changed.|A simpler structure is sufficient evidence that the original behaviour is preserved.|Reducing the number of responsibilities makes behaviour checks less important.
Testing boundaries|The parser handles the database format but rejects a format from a user form.|An integration test fails because its database data is unavailable.|We add more parser unit tests using the same assumed date format.|We normalise the expected test result without checking the real database output.|Repeating unit tests with the same assumptions increases boundary coverage.|The number of tests matters more than whether they exercise different assumptions.
Strategy pattern|Channel senders share an interface but expose different result formats.|The existing switch handles a small set of channels that rarely changes.|We move the switch into another function without separating channel details.|We add sender classes with different interfaces for each channel.|Several sender classes are preferable even when a switch is small and stable.|Introducing a shared interface is worthwhile regardless of the change patterns.
Architecture and trade-offs|The modular application has too few boundaries to assign clear ownership.|A service has been extracted but the team has not measured its traffic.|We split the most complex functions first and evaluate the operating cost later.|We choose services to match the architecture used by a larger organisation.|A newer architecture is a better fit once the team has learned its tools.|Architectural familiarity should not influence a decision about current constraints.
Monoliths and microservices|The proposed service has clear ownership but cannot be deployed independently.|The monolith needs a new feature that already has a separate data owner.|We extract the shared transaction code before identifying data ownership.|We create service boundaries around existing functions and coordinate their writes.|Separating deployment units removes concerns about cross-service data changes.|A network boundary simplifies transaction coordination between the extracted parts.
Latency and throughput|The team measures slow requests but has not recorded completed request counts.|Request counts are low but the team has already measured response percentiles.|We raise the average request-count target before measuring response times.|We measure mean response time and use it to represent the slowest requests.|A higher throughput figure is sufficient to show that the slowest requests improved.|Tail latency can be inferred from the average number of completed requests.
Cache-aside|Cached hours are available but the application always waits for cache expiry.|The database contains changed hours but the interface never reads the cache.|We cache the hours without an expiry and refresh them only after a failure.|We query the database on every request and update the cached copy afterwards.|An available cached value can be treated as current until the cache fails.|A successful cache read establishes that the value still matches its source.
Cache invalidation|The cache entry has expired but the database still stores the old schedule.|The updated hours are cached under a key that the application does not read.|We wait for the existing expiry rather than invalidating the affected entry.|We invalidate entries before checking whether the database update succeeds.|Choosing an expiry time is enough for any freshness requirement.|A finite expiry provides the same guarantee as immediate invalidation after writes.
Cache stampede|Different cache keys miss together and request different database records.|The cached result is ready but callers cannot find the updated key.|We let each caller reload independently and shorten the cache lifetime.|We add database connections while keeping separate reloads for the same key.|Sharing a reload result removes the need to consider what happens when it fails.|The first loading request can remain the owner until it eventually succeeds.
Load testing|A realistic traffic burst reveals an unrelated error in the test environment.|The test models the burst but reports only completed request counts.|We repeat the uniform-traffic test at a higher constant request rate.|We reduce the test data size before checking the shape of real traffic.|A passing load test establishes capacity for traffic patterns it did not exercise.|Matching the average request rate is enough to predict every burst outcome.
Cloud infrastructure|The provider owns the application but the team still receives cost alerts.|Backup and cost ownership are clear but their controls are not configured.|We ask the provider to choose backup ownership without documenting team duties.|We configure backup tools before agreeing who will maintain them.|Moving to a provider also transfers responsibility for application and data decisions.|Provider-managed infrastructure makes application-level backup ownership unnecessary.
Containers|The runtime matches but each environment uses a different application setting.|The same image is deployed but a database dependency is unavailable.|We rebuild the application separately in each target environment.|We copy the source into a container without fixing its runtime dependencies.|A container provides the same isolation and operating system as a full virtual machine.|Packaging an image makes separate runtime security configuration unnecessary.
Scaling services|The database has spare capacity but the web tier cannot accept more traffic.|More web instances increase capacity while the database load stays low.|We add more web instances before checking which shared component is saturated.|We distribute requests more evenly without examining the database limit.|Adding stateless instances is sufficient when a shared database remains the bottleneck.|Horizontal scaling is independent of the service's state and shared dependencies.
Safer rollouts|The new version fails for every user in the initial release group.|The sampled traffic includes the edge case but the team has not reviewed its signals.|We release to every user and compare the aggregate metrics afterwards.|We choose a small release group without checking which traffic it represents.|A successful canary demonstrates that edge cases outside its sample are safe.|The sample size matters more than whether it contains the relevant failure conditions.
Logs metrics and traces|The trace identifies the delay but the team does not have request counts.|The logs include request timing but the service has no error messages.|We collect more independent log lines without adding a request identifier.|We measure aggregate latency without connecting it to the slow request's steps.|Collecting more telemetry is sufficient even without specific diagnostic questions.|Observability data can be retained without considering whether it contains sensitive values.
Authorisation and least privilege|The server checks permissions but the interface displays an unavailable action.|The button is visible only after the server has rejected the user's permission.|We hide the action for users who are not expected to need it.|We check permission when rendering the page but not when performing the action.|Removing a button establishes the access boundary for the corresponding operation.|Checking the interface once is equivalent to checking each protected server action.
SQL injection|The query binds the value but chooses an invalid column from an allowlist.|The input is stored correctly but its displayed formatting changes.|We escape incoming values manually before concatenating them into SQL.|We validate the input format while retaining string-built query values.|Manual escaping is as reliable as parameter binding once quotes have been removed.|Validating a value's expected format replaces the need to bind it as query data.
Secrets and configuration|The credential is private but the application cannot read its configured value.|A replacement credential has been created without deploying the configuration.|We remove the current line and keep using the existing credential.|We rewrite the configuration before revoking the exposed credential.|Removing the latest copy is enough even when earlier commits contain the credential.|Moving a credential out of source removes the need to replace an exposed value.
Reliability and recovery|A restore has succeeded but the team has not recorded the backup schedule.|The backup process fails before producing a file that can be restored.|We check successful backup logs without attempting a restoration.|We copy another backup before testing whether the existing one can be restored.|A successful backup log provides the same evidence as a tested restoration.|Completing the backup operation establishes that recovery will meet the required time.
Blameless incident review|The team agrees on the timeline but does not assign follow-up owners.|The first discussion lists safeguards without checking who deployed the change.|We identify who deployed first and use that person's account as the main cause.|We avoid naming any owners so that the discussion remains blameless.|A blameless review should leave follow-up ownership to volunteers later.|Examining system factors means individuals do not need ownership of improvements.
Distributed consistency|A patient sees different booking formats on two servers with current data.|The servers agree on the slot status but one request is rejected.|We require the strongest read guarantee for every operation before discussing its needs.|We allow stale reads everywhere and explain the delay in the interface.|A single consistency guarantee is the right choice for all application operations.|Choosing a stronger guarantee has the same consequences for every type of read.
Retries and backoff|Clients wait between retries but repeat an operation that already succeeded.|The service has recovered but the clients stop after their first attempt.|We retry every failure immediately but reduce the total number of attempts.|We add a fixed delay and repeat operations without considering their effects.|A retry delay makes non-idempotent operations safe to repeat.|Backoff removes the need to distinguish repeatable operations from unsafe ones.
Idempotent webhooks|The handler rejects two different payments because they have the same amount.|A payment event is processed once but its response is not acknowledged.|We check for an earlier event before performing a separate payment write.|We use a customer's identifier as the deduplication key for all their payments.|Any unique request identifier is suitable even if it changes on each delivery.|A customer-level key distinguishes repeated deliveries from separate payments.
Transactional outbox|The event is published but the database transaction is rolled back afterwards.|A separate worker publishes an event that was never saved with the booking.|We save the booking and publish immediately without storing an outbox record.|We publish the event first and then save the booking in a separate operation.|An outbox means consumers can assume that each event is delivered only once.|Atomic storage removes the need to consider duplicate publication by the worker.
Circuit breakers|The slow service is healthy but the client rejects its first request.|Limited recovery probes succeed but normal traffic is not restored.|We increase the request timeout while continuing to call the unhealthy service.|We retry each failed request before considering the shared resource usage.|Opening a circuit is enough without planning what the caller should do instead.|The same failure threshold and fallback suit every dependency.`.split('\n').map(line=>line.split('|'));

  const BLOCKS = [
    ['review', 'Review', 8], ['vocabulary', 'Vocabulary', 6],
    ['reading', 'Reading', 6], ['listening', 'Listening', 6],
    ['grammar', 'Grammar', 5], ['speaking', 'Speaking', 16],
    ['writing', 'Writing', 6], ['summary', 'Wrap-up', 2]
  ].map(([id, title, minutes]) => ({id, title, minutes}));

  const SOURCES = [
`Project introductions|A project solves a problem for a particular group of people.|Our team is building a booking app for a small clinic.|The new developer knows the tools but not the users.|We explain who uses the app, what it does, and who owns each part.|A list of technologies is not a description of the user problem.|project~проєкт;user~користувач;feature~функція;team~команда;build~створювати;responsible for~відповідальний за
Team roles|The designer thinks about the screen, the developer about the code, and the tester about possible problems.|A designer, a developer and a tester are planning a new booking screen for a clinic.|The team is ready to build the screen, but nobody knows who must approve the final requirements.|They choose one owner. The designer, developer and tester tell the owner what each of them needs.|In a small team, one person may cover several roles, so that person cannot review every detail at the same time.|role~роль;developer~розробник;tester~тестувальник;designer~дизайнер;requirement~вимога;owner~відповідальний
Agile feedback|Agile development uses feedback to adjust plans and deliver useful changes.|The clinic tries an early version of the booking form.|Users say the form asks for too much information.|We simplify the form and ask users to try it again.|Agile does not mean working without a plan or documentation.|feedback~зворотний зв'язок;deliver~постачати результат;change~зміна;value~цінність;improve~покращувати;try out~випробувати
Scrum and sprints|Scrum organises work around a goal, short sprints, and regular inspection.|The team plans a two-week sprint to improve appointment reminders.|There are more requests than the team can finish.|We agree on a sprint goal and select a realistic amount of work.|A daily scrum is a planning conversation, not a report to a boss.|sprint~спринт;goal~мета;backlog~список майбутньої роботи;estimate~оцінювати;plan~планувати;priority~пріоритет
Tasks and blockers|A useful update says what changed, what comes next, and what needs help.|I am connecting the booking page to the email service.|I cannot test the reminder because I do not have test credentials.|I explain the blocker and ask the service owner for access.|Saying that everything is fine hides information the team needs.|task~завдання;blocker~перешкода;access~доступ;work on~працювати над;finish~закінчувати;ask for help~просити допомоги`,
`Git history|Git records snapshots of files so people can inspect and coordinate changes.|Two developers change the same booking project.|A bug appears and the team cannot remember when the behaviour changed.|We inspect the history and compare the relevant commits.|Version control helps investigate a bug but does not explain its cause by itself.|repository~репозиторій;history~історія;track~відстежувати;change~зміна;compare~порівнювати;version~версія
Feature branches|A branch is a movable reference that lets work develop separately.|I am adding a search filter while my colleague fixes reminders.|An unfinished filter must not enter the release branch.|I create a feature branch and keep the change focused.|Long-lived branches can become harder to integrate.|branch~гілка;separate~окремий;merge~об'єднувати;conflict~конфлікт;update~оновлювати;switch~перемикатися
Clear commits|A focused commit groups a coherent change and explains its purpose.|I have fixed a timezone bug and changed several unrelated colours.|A reviewer cannot tell which files are needed for the bug fix.|I split the changes and write a message explaining the timezone correction.|A good message cannot compensate for a confusing change.|commit~коміт;message~повідомлення;purpose~мета;related~пов'язаний;split~розділяти;fix~виправляти
Pull requests|A pull request makes a proposed change available for review before integration.|I open a pull request for appointment cancellation.|The reviewer sees the code but cannot reproduce the new behaviour.|I add the reason for the change and clear steps for testing.|A small pull request can still need careful review if the risk is high.|pull request~запит на злиття;review~перевірка;describe~описувати;reproduce~відтворювати;approve~схвалювати;test steps~кроки перевірки
Constructive code review|Useful review comments identify a concern and suggest a concrete next step.|A colleague submits a function that sends duplicate reminders.|A blunt comment sounds like criticism of the person.|I describe the duplicate-send case and ask whether we can add a guard.|A suggestion is different from a change that is required for correctness.|suggest~пропонувати;concern~занепокоєння;duplicate~дублікат;guard~захисна перевірка;required~обов'язковий;could we~чи могли б ми`,
`DevOps collaboration|DevOps connects development and operations through shared responsibility and feedback.|Developers finish a feature but operations staff must deploy it manually.|Release instructions live in a private chat.|We document the process and automate repeatable steps together.|DevOps is not only a job title or a collection of tools.|operations~експлуатація;shared~спільний;automate~автоматизувати;release~реліз;manual~ручний;repeatable~повторюваний
Builds and dependencies|A build turns source files into an artifact that can be run or distributed.|The booking app builds on my laptop but fails on the build server.|The two machines use different dependency versions.|We pin the required versions and use the same build command.|A successful build does not prove that the application behaves correctly.|build~збірка;dependency~залежність;artifact~артефакт збірки;source~вихідний код;version~версія;fail~зазнати невдачі
Continuous integration|Continuous integration checks changes frequently after they are integrated.|A small change breaks the booking validation tests.|The developer finds the failure only at the end of the week.|We run the build and tests on every proposed change.|Passing checks only cover the cases the checks actually test.|pipeline~конвеєр перевірок;check~перевірка;integrate~інтегрувати;run tests~запускати тести;failure~збій;catch~виявляти
Why our deployment failed|Deployment puts a built version into a target environment.|We deployed the reminder service yesterday afternoon.|The new version expected a setting that production did not have.|We restored the previous version and added configuration validation.|Rolling back code may not undo a database change.|deployment~розгортання;roll back~повертати попередню версію;setting~налаштування;validate~перевіряти;previous~попередній;automatically~автоматично
Development and production|Environments separate experiments, checks, and real user traffic.|A developer tests a payment reminder in a staging environment.|The staging configuration accidentally points to real customer email addresses.|We use test accounts and separate environment configuration.|Staging resembles production but cannot reproduce every production condition.|environment~середовище;staging~передрелізне середовище;production~робоче середовище;configuration~конфігурація;test account~тестовий акаунт;traffic~трафік`,
`HTTP requests|HTTP lets a client send a request and receive a response from a server.|The booking page requests the available appointment slots.|The page treats every response as a successful booking.|We inspect the status code and show an appropriate message.|A successful HTTP response does not always mean the business action succeeded.|request~запит;response~відповідь;client~клієнт;server~сервер;status code~код стану;handle~обробляти
API contracts|An API contract describes how systems exchange data and errors.|A mobile app consumes the appointment API.|The backend renames a field without telling the mobile team.|We agree on a stable format and plan a compatible transition.|Documented fields still need validation at system boundaries.|contract~контракт;field~поле;format~формат;compatible~сумісний;consumer~споживач API;boundary~межа
Authentication and sessions|Authentication establishes who a user is; authorisation controls what they may do.|A receptionist signs in to the clinic dashboard.|The server accepts an expired session token.|We check token validity and ask the user to sign in again.|A valid identity alone does not grant access to every record.|sign in~увійти;identity~особа;session~сеанс;token~токен;expire~втратити чинність;permission~дозвіл
Useful error messages|An error response should help a caller understand what to do next.|A user submits a booking with an invalid date.|The API returns only an unexplained server error.|We return a validation error with a safe, actionable explanation.|Internal stack traces can expose information and confuse users.|invalid~некоректний;error message~повідомлення про помилку;retry~повторити спробу;explain~пояснювати;detail~деталь;safe~безпечний
Third-party integrations|An integration connects systems whose availability and behaviour we do not fully control.|Our app asks an external SMS service to send a reminder.|The service is slow and the booking page waits indefinitely.|We set a timeout and show the reminder status separately.|A timeout does not prove that the remote service did nothing.|third-party~сторонній;timeout~обмеження часу;external~зовнішній;available~доступний;delay~затримка;depend on~залежати від`,
`SQL queries|A query selects or changes records according to explicit conditions.|The admin dashboard lists appointments for one doctor.|The query fetches every appointment and filters them in application memory.|We filter the required records in the database.|Selecting fewer rows helps, but the execution plan still matters.|query~запит;row~рядок;column~стовпець;filter~фільтрувати;record~запис;select~вибирати
Database indexes|An index helps a database locate some records without scanning an entire table.|Searching appointments by patient email becomes slow.|The database reads many rows for each exact email search.|We inspect the plan and test an index on the search field.|Indexes use storage and make some writes more expensive.|index~індекс;scan~сканувати;lookup~пошук значення;storage~сховище;write~запис даних;execution plan~план виконання
Transactions and locking|A transaction groups related operations; appropriate isolation protects invariants.|Two requests try to reserve the last appointment slot.|Both requests see the slot as available and confirm it.|We enforce the invariant with a transaction and a suitable database constraint or lock.|A transaction alone does not prevent every race under every isolation level.|transaction~транзакція;lock~блокування;constraint~обмеження;reserve~бронювати;consistent~узгоджений;race condition~гонка даних
The N+1 query problem|N+1 happens when one query is followed by a separate query for each result.|The dashboard loads fifty patients and then their appointments.|It sends one additional query for every patient.|We fetch related appointments in a batch and map them to patients.|Batching must still handle large result sets and missing related records.|batch~пакет;related~пов'язаний;roundtrip~цикл звернення;fetch~отримувати дані;map~зіставляти;bottleneck~вузьке місце
Cursor pagination|Cursor pagination continues from a stable position rather than skipping an increasing number of rows.|A large appointment history loads page by page.|Deep offset pages become slow and new records shift the visible results.|We order by a stable key and return a cursor for the next page.|The cursor must reflect the ordering and any tie-breaker.|pagination~поділ на сторінки;cursor~курсор;offset~зсув;stable~стабільний;order~упорядковувати;next page~наступна сторінка`,
`UI state|UI state represents information that affects what a component displays.|A booking form shows a selected date and an available slot.|The interface keeps a slot selected after the date changes.|We clear dependent state when the date changes.|Duplicating derived state can make updates harder to keep consistent.|state~стан;component~компонент;display~відображати;selected~обраний;update~оновлювати;derived~похідний
Events and cleanup|An event listener runs a callback when an event occurs.|The dashboard listens for browser resize events.|Each visit adds another listener without removing the previous one.|We remove the listener when the component is no longer used.|Cleanup must use the matching callback reference and options.|event~подія;listener~обробник подій;callback~функція зворотного виклику;cleanup~очищення;remove~видаляти;reference~посилання
Debounced search|Debouncing waits for a quiet period before running an action.|A patient search sends a request after every keystroke.|Fast typing creates many unnecessary requests.|We wait briefly after typing stops before sending the search request.|Debouncing delays requests and does not by itself handle stale responses.|debounce~відкладати до паузи;keystroke~натискання клавіші;search~пошук;unnecessary~зайвий;wait~чекати;cancel~скасовувати
Stale responses|An earlier asynchronous response can arrive after a later one.|A user quickly changes the search from Ann to Anna.|The slower Ann response replaces the newer Anna results.|We cancel obsolete work or ignore responses that no longer match the latest request.|Cancelling a client request does not guarantee that server work stops.|stale~застарілий;latest~найновіший;replace~замінювати;ignore~ігнорувати;obsolete~неактуальний;match~відповідати
Memory leaks|A leak occurs when memory remains reachable even though the application no longer needs it.|The dashboard becomes slower after many page visits.|Unused components are retained by long-lived listeners.|We inspect retained references and release them during cleanup.|High memory usage alone is not enough to identify a memory leak.|memory~пам'ять;retain~утримувати;release~звільняти;heap~купа пам'яті;garbage collection~збирання сміття;inspect~досліджувати`,
`Asynchronous work|Asynchronous work allows a program to wait for a result without blocking all other useful work.|A dashboard loads a patient profile and appointment summary.|The interface freezes while the code waits synchronously.|We use asynchronous operations and show a loading state.|Asynchronous code does not automatically run CPU work in parallel.|asynchronous~асинхронний;await~очікувати результат;block~блокувати;loading~завантаження;result~результат;operation~операція
Sequential and concurrent requests|Independent operations can overlap instead of waiting for one another.|The profile and appointment requests do not depend on each other.|The second request starts only when the first has finished.|We start both requests and await their results together.|Operations with dependencies cannot simply be started together.|sequential~послідовний;concurrent~одночасний у поступі;independent~незалежний;overlap~перекриватися в часі;depend on~залежати від;complete~завершувати
Concurrency and parallelism|Concurrency manages overlapping tasks; parallelism executes work simultaneously on multiple resources.|The service handles many waiting network requests.|A colleague assumes that more promises mean more CPU cores are working.|We distinguish waiting for I/O from parallel CPU execution.|Too much concurrent work can exhaust shared resources.|parallelism~паралельне виконання;concurrency~конкурентне виконання;resource~ресурс;CPU~процесор;I/O~введення та виведення;exhaust~виснажувати
Streams|A stream processes data in chunks instead of loading the whole input at once.|The clinic exports a very large appointment report.|Building the full report in memory causes the process to crash.|We read, transform and write the report in chunks.|A stream still needs correct error handling and resource cleanup.|stream~потік даних;chunk~частина;export~експортувати;process~обробляти;crash~аварійно завершуватися;transform~перетворювати
Backpressure|Backpressure slows a producer when a consumer cannot keep up.|The export reader produces data faster than the destination can write it.|Buffered chunks grow until memory runs out.|We respect the writer's signal and pause reading until it can continue.|Larger buffers postpone the problem if the speed mismatch continues.|backpressure~зворотний тиск;producer~виробник даних;consumer~споживач;buffer~буфер;pause~призупиняти;keep up~встигати`,
`Safe refactoring|Refactoring changes code structure while preserving its intended behaviour.|A reminder function mixes validation, storage and sending.|A small change in one responsibility breaks another.|We separate responsibilities and check behaviour with focused tests.|A cleaner structure is useful only if the required behaviour remains correct.|refactor~змінювати структуру коду;behaviour~поведінка;responsibility~відповідальність;preserve~зберігати;extract~виділяти;focused~сфокусований
Testing boundaries|Different tests verify different assumptions about a system.|Unit tests pass for the appointment parser.|The real database returns dates in a format the parser tests never used.|We add an integration test at the data boundary.|More tests do not help if they all repeat the same wrong assumption.|unit test~модульний тест;integration test~інтеграційний тест;assumption~припущення;verify~перевіряти;coverage~покриття;boundary~межа
Strategy pattern|A strategy separates interchangeable behaviour behind a common interface.|The reminder service supports email, SMS and push messages.|A growing switch statement mixes channel-specific details.|We give each channel its own sender with the same interface.|A small stable switch may be simpler than introducing several classes.|strategy~стратегія;interface~інтерфейс;interchangeable~взаємозамінний;channel~канал;implement~реалізовувати;complexity~складність
Architecture and trade-offs|Architecture decisions balance constraints rather than maximise every quality at once.|The clinic wants faster delivery and easier independent scaling.|Splitting every function into a service creates operational overhead.|We compare a modular monolith with services for the actual constraints.|A familiar architecture can be a better choice than a fashionable one.|trade-off~компроміс;constraint~обмеження;modular~модульний;overhead~додаткові витрати;maintain~підтримувати;decision~рішення
Monoliths and microservices|A monolith deploys as a unit; microservices introduce separate deployment and communication boundaries.|Several teams share a booking platform.|A proposed split would require frequent cross-service transactions.|We identify clear ownership boundaries before extracting a service.|Separate services add network failures and distributed data concerns.|monolith~моноліт;microservice~мікросервіс;deploy~розгортати;ownership~відповідальність;coupling~зв'язаність;extract~виокремлювати`,
`Latency and throughput|Latency measures time per operation; throughput measures completed work per time unit.|A dashboard feels slow even though the service handles many requests.|The team reports only average request counts.|We measure response-time percentiles and completed requests separately.|Improving throughput does not necessarily improve tail latency.|latency~затримка;throughput~пропускна здатність;percentile~перцентиль;measure~вимірювати;average~середнє;tail latency~затримка повільних запитів
Cache-aside|With cache-aside, an application checks the cache and loads missing data from the source.|Many users request the same clinic opening hours.|Repeated database reads consume unnecessary resources.|We cache the hours for a limited time and load on a miss.|Cached values can become stale when the source changes.|cache~кеш;cache miss~відсутність у кеші;source~джерело;expire~втрачати чинність;read~читати;stale~застарілий
Cache invalidation|Invalidation decides when cached data should stop being used.|A receptionist changes the clinic opening hours.|The cache continues to return the old schedule.|We invalidate affected entries after a successful update.|An expiry time limits staleness but may not meet a strict freshness requirement.|invalidate~позначати нечинним;entry~запис;expiry~строк дії;freshness~актуальність;affected~зачеплений;consistent~узгоджений
Cache stampede|A cache stampede happens when many callers reload the same missing value together.|A popular schedule entry expires during a busy morning.|Hundreds of requests query the database for identical data.|We coordinate the reload so callers can share one in-flight result.|Coordination needs a failure strategy if the loading request fails.|stampede~масовий одночасний запит;in-flight~у процесі виконання;coordinate~узгоджувати;share~ділитися;reload~завантажувати знову;fallback~запасний варіант
Load testing|Load tests explore system behaviour under a specified traffic pattern.|The booking team expects a surge when new appointments open.|A test uses uniform traffic and misses the real burst pattern.|We model realistic bursts and measure errors and resource use.|A test result is evidence for its conditions, not a universal capacity guarantee.|load~навантаження;burst~сплеск;capacity~потужність;resource use~використання ресурсів;simulate~моделювати;error rate~частота помилок`,
`Cloud infrastructure|Cloud services provide resources whose configuration and cost still need ownership.|The clinic moves a service from one server to cloud infrastructure.|Nobody knows which team owns backups or cost alerts.|We document responsibilities and configure the required controls.|Using a cloud provider does not remove application or data responsibilities.|cloud~хмара;infrastructure~інфраструктура;backup~резервна копія;cost~вартість;provision~виділяти ресурси;manage~керувати
Containers|A container packages a process with its runtime dependencies and uses host operating-system facilities.|The app behaves differently on development and deployment machines.|The runtime versions do not match.|We build and test one container image for deployment.|A container is not a full virtual machine and still needs secure configuration.|container~контейнер;image~образ;runtime~середовище виконання;package~пакувати;host~хост;dependency~залежність
Scaling services|Scaling changes resources or instance counts to handle demand.|More patients use the booking service in the morning.|Adding instances helps web traffic but the database remains saturated.|We locate the bottleneck and scale the appropriate component.|State and shared dependencies can limit horizontal scaling.|scale~масштабувати;instance~екземпляр;horizontal~горизонтальний;vertical~вертикальний;saturated~перевантажений;demand~попит
Safer rollouts|A gradual rollout exposes a change to a limited audience before wider release.|The team releases a new booking calculation.|A hidden edge case affects a small group of users.|We release gradually, watch relevant signals and retain a rollback plan.|A canary cannot catch problems absent from its traffic sample.|rollout~поступовий випуск;canary~обмежений пробний реліз;monitor~спостерігати;signal~сигнал;rollback~відкат;edge case~граничний випадок
Logs metrics and traces|Logs describe events, metrics aggregate measurements, and traces connect work across components.|A booking request is slow across three services.|Separate log lines do not show where the request spent its time.|We use correlation and traces alongside latency metrics.|Observability needs useful questions and controlled sensitive data.|log~журнал подій;metric~метрика;trace~трасування;correlation~зв'язування подій;span~відрізок трасування;diagnose~діагностувати`,
`Authorisation and least privilege|Authorisation checks whether an identified user may perform a particular action.|A receptionist can view bookings but should not change billing settings.|The backend trusts a hidden button instead of checking permission.|We enforce permission checks on the server for each protected action.|A hidden interface control is not an access-control boundary.|authorisation~авторизація;least privilege~мінімальні привілеї;enforce~забезпечувати виконання;protected~захищений;allow~дозволяти;deny~відмовляти
SQL injection|SQL injection occurs when untrusted input is interpreted as part of a SQL command.|A patient search concatenates a text value into a query.|A crafted input changes the meaning of the SQL statement.|We use parameterised queries for values and allowlists for dynamic identifiers.|Escaping strings manually is easier to get wrong than parameter binding.|injection~ін'єкція;input~вхідні дані;parameter~параметр;untrusted~недовірений;allowlist~список дозволеного;bind~прив'язувати
Secrets and configuration|Secrets such as API keys need controlled storage, access and replacement.|A developer includes a service credential in a source file.|The credential becomes visible in repository history.|We revoke it, create a replacement and move configuration out of source code.|Deleting the latest line does not remove an exposed credential from history.|secret~секрет;credential~облікові дані;revoke~відкликати;rotate~замінювати секрет;expose~розкривати;configuration~конфігурація
Reliability and recovery|Reliability work plans for failures and verifies recovery procedures.|A database backup job reports success every night.|The team has never tested restoring a backup.|We run a restoration exercise and check data and recovery time.|A successful backup message is not proof of recoverability.|reliability~надійність;recovery~відновлення;restore~відновлювати;verify~перевіряти;outage~недоступність;procedure~процедура
Blameless incident review|An incident review investigates contributing conditions and useful changes.|A release interruption causes missed appointment reminders.|The first discussion focuses only on who pressed the deploy button.|We reconstruct the timeline and identify missing safeguards.|Avoiding blame does not remove ownership of follow-up actions.|incident~інцидент;timeline~хронологія;root cause~першопричина;safeguard~запобіжник;follow-up~подальша дія;contribute~сприяти`,
`Distributed consistency|Distributed systems must define what different participants can observe during delays and failures.|A booking update reaches one replica before another.|A patient sees an old slot status on a different server.|We describe the consistency requirement and choose how reads should behave.|Not every operation needs the same consistency guarantee.|replica~репліка;consistency~узгодженість;propagate~поширювати;guarantee~гарантія;delay~затримка;observe~спостерігати
Retries and backoff|Retries can recover from transient failures but also increase load.|The reminder provider briefly rejects requests.|Every client retries immediately and makes the overload worse.|We use bounded retries with backoff and jitter for suitable failures.|Some operations are unsafe to repeat without an idempotency mechanism.|retry~повторна спроба;backoff~збільшення інтервалу;jitter~випадкова варіація;transient~тимчасовий;bounded~обмежений;overload~перевантаження
Idempotent webhooks|An idempotent operation preserves the intended effect when the same request is repeated.|A payment provider sends a webhook more than once.|The handler records the same payment twice.|We store a unique event identifier and make processing atomic.|The deduplication key must match the real business operation.|idempotent~ідемпотентний;webhook~вебхук;deduplicate~усувати дублікати;identifier~ідентифікатор;atomic~атомарний;effect~ефект
Transactional outbox|An outbox records an event in the same database transaction as the business change.|The booking service saves a reservation and must publish a reminder event.|A crash happens after saving but before publishing.|We save an outbox record atomically and publish it through a separate worker.|The publisher may deliver twice, so consumers still need duplicate handling.|outbox~таблиця вихідних подій;publish~публікувати;event~подія;worker~обробник;delivery~доставка;atomic~атомарний
Circuit breakers|A circuit breaker temporarily stops calls to a failing dependency and later probes recovery.|An unavailable SMS provider causes many slow failures.|Requests keep waiting and occupy shared resources.|We open a circuit after suitable failures and test recovery with limited probes.|A circuit breaker needs a useful fallback and appropriate failure thresholds.|circuit breaker~автоматичний вимикач;threshold~поріг;probe~пробний запит;dependency~залежність;fallback~запасний варіант;recover~відновлюватися`
  ];

  const WEEKS = ['Команда та Agile', 'Git і code review', 'DevOps та CI/CD', 'HTTP та API', 'Бази даних', 'Frontend', 'Async і потоки', 'Архітектура', 'Performance і caching', 'Cloud та observability', 'Security і reliability', 'Distributed systems'];

  const GRAMMAR = [
    ['Present Simple та питання', 'Для регулярних дій: we work, she works. Питання: What does it do? Після does — базова форма.', [
      ['The team ___ this feature every day.', ['checks','check','checking'],0,'Use checks with the singular subject the team.'],
      ['What ___ this component do?', ['do','does','is'],1,'Use does, then the subject and the base verb do.'],
      ['We ___ access to the test account.', ['needs','needing','need'],2,'Use need with we.'],
      ['She ___ on the booking app.', ['works','work','working'],0,'Use works with a singular third-person subject.']]],
    ['Past Simple та завершені зміни', 'Для завершеної події в минулому: changed, fixed, went. У питаннях did + базова форма.', [
      ['Yesterday we ___ the change.', ['merge','merged','merging'],1,'Yesterday places the action in a completed past period.'],
      ['Why did the check ___?', ['failed','failing','fail'],2,'Use the base verb fail after did.'],
      ['I ___ the description last night.', ['updated','update','have update'],0,'Last night places the action in a completed past period.'],
      ['We ___ change the public interface.', ["didn't","doesn't","weren't"],0,'Use did not followed by the base verb change.']]],
    ['Подія чи поточний результат', 'Past Simple описує минулі події; Present Perfect пов’язує минуле з теперішнім.', [
      ['We ___ the release yesterday.', ['have deployed','deployed','deploy'],1,'Yesterday refers to a completed past period.'],
      ['The service is ready now: we ___ the missing setting.', ['have added','has added','adding'],0,'Have added connects the change to the current result.'],
      ['___ you checked the build yet?', ['Did','Has','Have'],2,'Use have with you, followed by a past participle.'],
      ['The deployment ___ at 3 pm yesterday.', ['has failed','failed','failing'],1,'Use failed for an event that took place at a specific past time.']]],
    ['Питання й ввічливі уточнення', 'Пряме питання: What does it return? Після Could you explain — порядок твердження: what it returns.', [
      ['Could you explain what the API ___?', ['returns','does return it','return'],0,'Use subject–verb order in an indirect question.'],
      ['What ___ this status mean?', ['is','does','do'],1,'Use does, then this status and the base verb mean.'],
      ['Do you know why the request ___?', ['did fail it','does it fail','failed'],2,'Use statement word order after why in this indirect question.'],
      ['___ you show me an example?', ['Could','Must to','Do to'],0,'Could you begins a polite request.']]],
    ['Порівняння й кількість', 'Fewer — зі злічуваними множинними іменниками; less — з незлічуваними. Порівняння: faster than, more expensive than.', [
      ['This version sends ___ requests.', ['less','fewer','much'],1,'Requests are countable, so use fewer.'],
      ['The operation uses ___ memory.', ['fewer','many','less'],2,'Memory is uncountable here, so use less.'],
      ['This query is faster ___ the previous one.', ['than','then','as'],0,'Use than after the comparative faster.'],
      ['Writes may become ___ expensive.', ['more','most','many'],0,'Use more to form the comparative more expensive.']]],
    ['Процес і регулярна поведінка', 'Present Continuous: is/are + -ing для поточного процесу. Present Simple — для звичної поведінки.', [
      ['The user ___ a new date right now.', ['selects','is selecting','select'],1,'Right now describes an action in progress.'],
      ['The component usually ___ a loading message.', ['shows','is show','showing'],0,'Usually describes regular behaviour.'],
      ['We ___ the old listener at the moment.', ['remove','removed','are removing'],2,'Use are removing for an action in progress.'],
      ['The page ___ after every change.', ['updates','update','is update'],0,'This recurring action takes the Present Simple.']]],
    ['Умови й наслідки', 'Реальна умова: If + Present Simple, will/can + дієслово.', [
      ['If the writer is slow, the buffer ___ grow.', ['can','to','would to'],0,'Follow can with the base verb.'],
      ['If we ___ independent work together, we can reduce waiting.', ['starts','start','will starts'],1,'Use the Present Simple in this if-clause.'],
      ['We will continue when the resource ___ ready.', ['will be','being','is'],2,'Use the Present Simple in this time clause.'],
      ['If a request fails, we ___ handle the error.', ['must','must to','musts'],0,'Follow must with the base verb.']]],
    ['Причини та протиставлення', 'Because + речення; because of + іменник. Although вводить протиставлення.', [
      ['We split the function ___ it had several responsibilities.', ['because of','because','despite'],1,'Because introduces a complete clause.'],
      ['___ the change is small, it needs tests.', ['Although','Because of','Despite of'],0,'Use although before a subject and verb.'],
      ['The release was delayed because of ___.', ['it failed','we test','a failing check'],2,'Because of introduces a noun phrase.'],
      ['The design is simpler; ___, it has limitations.', ['however','because of','despite of'],0,'However connects two contrasting points.']]],
    ['Обережні висновки', 'May/might/could — можливість; must — сильний логічний висновок у відповідному контексті.', [
      ['The cache ___ contain an old value; we have not checked yet.', ['must to','might','is'],1,'Might expresses uncertainty.'],
      ['We ___ measure before drawing a conclusion.', ['should','should to','shoulds'],0,'Follow should with the base verb.'],
      ['This result ___ prove the cause on its own.', ['not','is not','does not'],2,'Use does not prove to make the verb negative.'],
      ['The spike could ___ related to the traffic burst.', ['be','is','being'],0,'Follow could with the base form be.']]],
    ['Пасивний стан у процесах', 'Пасив: be + V3, коли важливіша дія або об’єкт.', [
      ['The image ___ built by the pipeline.', ['is','does','has'],0,'Is built is Present Simple passive.'],
      ['The new version was ___ gradually.', ['release','released','releasing'],1,'Use the past participle released after was.'],
      ['Metrics ___ collected every minute.', ['is','be','are'],2,'Metrics is plural, so use are collected.'],
      ['We deployed the service. The service ___ deployed yesterday.', ['was','is been','has'],0,'Use was deployed for a completed past action.']]],
    ['Обов’язок, дозвіл і заборона', 'Must not — заборонено; do not have to — немає необхідності. Should — рекомендація.', [
      ['You ___ put a secret in public source code.', ['must not','do not have to','may to'],0,'Must not expresses a prohibition.'],
      ['You ___ be an administrator to view this public page.', ['must not','do not have to','cannot to'],1,'Do not have to means something is unnecessary.'],
      ['The server ___ check the permission.', ['musts','must to','must'],2,'Follow must with the base verb.'],
      ['We should ___ the recovery procedure.', ['test','testing','to test'],0,'Follow should with the base verb test.']]],
    ['Гіпотези та компроміси', 'Для гіпотетичної ситуації: If + Past Simple, would + дієслово. Після by — -ing форма.', [
      ['If we retried forever, we ___ increase the load.', ['will to','would','would to'],1,'Use would increase for this hypothetical result.'],
      ['If the worker ___ after publishing, it might send the event again.', ['crashed','crashes to','would crashed'],0,'Use the Past Simple in this hypothetical if-clause.'],
      ['We could reduce duplicate effects by ___ an event identifier.', ['store','stored','storing'],2,'Follow by with the -ing form storing.'],
      ['The design would be simpler if we ___ fewer services.', ['had','would have','has'],0,'Use had in this hypothetical if-clause.']]]
  ];

  const GRAMMAR_PATTERNS = [
    [
      {label:'Describing a system action',phrase:'The service processes / validates / stores <noun> every time...',uk:'Сервіс обробляє / перевіряє / зберігає <іменник> щоразу, коли...',example:'The booking service validates each form field before saving the record.'},
      {label:'Asking how a mechanism works',phrase:'How does the <component> handle <input>?',uk:'Як саме <компонент> обробляє <вхідні дані>?',example:'How does the sprint backlog handle new customer feedback?'},
      {label:'Stating team responsibility',phrase:'Our team owns <part> and ensures that...',uk:'Наша команда відповідає за <частину> і гарантує, що...',example:'Our team owns the reminder module and ensures that messages arrive on time.'},
      {label:'Explaining what does not happen',phrase:'This stage does not skip <step>; instead, it...',uk:'Цей етап не пропускає <крок>; натомість він...',example:'Agile does not skip planning; instead, it plans in short two-week sprints.'}
    ],
    [
      {label:'Reporting a completed investigation',phrase:'We inspected the commit log and discovered that...',uk:'Ми перевірили історію комітів і виявили, що...',example:'We inspected the commit log and discovered that the bug appeared on Tuesday.'},
      {label:'Asking about a past change',phrase:'Why did the build fail after we merged <branch>?',uk:'Чому впала збірка після того, як ми злили <гілку>?',example:'Why did the timezone test fail after we merged the UI branch?'},
      {label:'Explaining an isolated fix',phrase:'I separated the changes and committed only...',uk:'Я розділив зміни і закомітив лише...',example:'I separated the changes and committed only the timezone calculation fix.'},
      {label:'Describing what did not change',phrase:'We did not modify the public contract during this fix.',uk:'Ми не змінювали публічний контракт під час цього виправлення.',example:'We did not modify the database schema when we patched the filter.'}
    ],
    [
      {label:'Announcing a current engineering result',phrase:'We have pinned the dependency versions, so the build is now reproducible.',uk:'Ми зафіксували версії залежностей, тож збірка тепер відтворювана.',example:'We have added a startup config check, so the service fails fast on missing keys.'},
      {label:'Reporting a specific past incident',phrase:'The deployment failed at 14:30 yesterday because...',uk:'Деплой впав учора о 14:30, тому що...',example:'The deployment failed yesterday afternoon because a production variable was missing.'},
      {label:'Checking pipeline readiness',phrase:'Have you verified the build artifact in staging yet?',uk:'Ти вже перевірив артефакт збірки на стейджингу?',example:'Have you run the integration test suite on the release branch yet?'},
      {label:'Connecting fix to present state',phrase:'We have rolled back the release and restored normal traffic.',uk:'Ми відкотили реліз і відновили нормальний трафік.',example:'We have separated the staging credentials so test emails never reach real users.'}
    ],
    [
      {label:'Polite indirect technical question',phrase:'Could you explain what the endpoint returns when...?',uk:'Чи не міг би ти пояснити, що повертає ендпоінт, коли...?',example:'Could you explain what the API returns when the session token expires?'},
      {label:'Clarifying failure cause',phrase:'Do you know why the third-party gateway timed out?',uk:'Чи знаєш ти, чому сторонній шлюз відвалився за таймаутом?',example:'Do you know why the client treated an HTTP 500 response as a confirmed booking?'},
      {label:'Asking for contract details',phrase:'Could you point out which payload field changed in v2?',uk:'Чи можеш показати, яке саме поле payload змінилося у v2?',example:'Could you point out which header carries the authentication token?'},
      {label:'Direct diagnostic question',phrase:'What does status code 422 indicate in our validation layer?',uk:'Що означає статус-код 422 у нашому шарі валідації?',example:'What does the retry header tell the calling client to do?'}
    ],
    [
      {label:'Comparing countable operations',phrase:'Batching sends far fewer roundtrips to the database than...',uk:'Пакетний запит відправляє значно менше звернень до БД, ніж...',example:'A single batch query sends far fewer roundtrips than fifty N+1 queries.'},
      {label:'Comparing uncountable resources',phrase:'Cursor pagination consumes less memory and CPU time on deep pages.',uk:'Курсорна пагінація споживає менше пам’яті та часу CPU на глибоких сторінках.',example:'Filtering rows in SQL uses much less application memory than filtering in Node.js.'},
      {label:'Comparing execution speed',phrase:'An indexed B-tree lookup is orders of magnitude faster than a full table scan.',uk:'Пошук за B-tree індексом на порядки швидший за повне сканування таблиці.',example:'Reading from an index is faster than scanning every row in the appointments table.'},
      {label:'Stating write trade-offs',phrase:'Adding extra indexes makes INSERT and UPDATE operations more expensive.',uk:'Додавання зайвих індексів робить операції INSERT та UPDATE дорожчими.',example:'Maintaining five indexes on one table makes every write more expensive.'}
    ],
    [
      {label:'Describing live runtime state',phrase:'The component is currently waiting for a response while...',uk:'Компонент зараз очікує на відповідь, поки...',example:'The search bar is currently debouncing user keystrokes before firing a fetch call.'},
      {label:'Describing invariant component rules',phrase:'Whenever the date changes, the form resets dependent slot state.',uk:'Щоразу, коли змінюється дата, форма скидає залежний стан слота.',example:'When the component unmounts, it removes the window resize listener.'},
      {label:'Explaining an active memory issue',phrase:'Uncleaned listeners are holding references to detached DOM nodes right now.',uk:'Неочищені обробники прямо зараз утримують посилання на від’єднані DOM-вузли.',example:'An outdated response is overwriting the newest search state in the UI.'},
      {label:'Contrast between normal and current behaviour',phrase:'The UI normally renders in 16 ms, but right now it is re-rendering on every keystroke.',uk:'Зазвичай UI рендериться за 16 мс, але зараз він перемальовується на кожне натискання клавіші.',example:'The hook usually cleans up on unmount, but it is passing a new function reference each time.'}
    ],
    [
      {label:'First conditional for system backpressure',phrase:'If the producer ignores backpressure, the memory buffer will overflow.',uk:'Якщо продюсер ігноруватиме зворотний тиск, буфер пам’яті переповниться.',example:'If the stream reader does not pause when write() returns false, the heap will grow rapidly.'},
      {label:'Condition for concurrent execution',phrase:'If two requests do not depend on each other, we can run them concurrently with Promise.all.',uk:'Якщо два запити не залежать один від одного, ми можемо запустити їх одночасно через Promise.all.',example:'If the profile and schedule calls are independent, we can await them together.'},
      {label:'Time clause with Present Simple',phrase:'The stream will resume reading as soon as the drain event fires.',uk:'Потік відновить читання щойно спрацює подія drain.',example:'The worker will process the next chunk when the output buffer is empty.'},
      {label:'Engineering requirement under failure',phrase:'If a chunk transform fails, the pipeline must close all open file descriptors.',uk:'Якщо трансформація чанка падає, пайплайн зобов’язаний закрити всі відкриті файлові дескриптори.',example:'If a concurrent request rejects, we must handle the error cleanly.'}
    ],
    [
      {label:'Explaining architectural rationale',phrase:'We extracted a common interface because each notification channel needed custom retry logic.',uk:'Ми виділили спільний інтерфейс, тому що кожен канал сповіщень потребував власної логіки повторів.',example:'We refactored the reminder function because it mixed validation, persistence, and email delivery.'},
      {label:'Conceding a point with although',phrase:'Although a microservices split looks clean on a diagram, it introduces network latency.',uk:'Хоча поділ на мікросервіси виглядає чисто на діаграмі, він додає мережеву затримку.',example:'Although unit tests pass in isolation, integration can still fail at the database boundary.'},
      {label:'Naming a concrete blocker with because of',phrase:'The parser failed in staging because of an unexpected timestamp format.',uk:'Парсер впав на стейджингу через неочікуваний формат часової мітки.',example:'Cross-service writes became fragile because of distributed transaction overhead.'},
      {label:'Balancing trade-offs with however',phrase:'A modular monolith deploys as a single unit; however, it enforces strict module boundaries.',uk:'Модульний моноліт розгортається як єдине ціле; проте він забезпечує суворі межі між модулями.',example:'The Strategy pattern decouples channel senders; however, it is overkill for two static branches.'}
    ],
    [
      {label:'Formulating a cautious diagnosis',phrase:'The p99 latency spike might be caused by a cache stampede on the schedule key.',uk:'Стрибок p99 затримки може бути спричинений одночасним пробоєм кешу (cache stampede) на ключі розкладу.',example:'The stale opening hours could come from a missing cache invalidation call after UPDATE.'},
      {label:'Recommending evidence-based checks',phrase:'We should compare p95 and p99 percentiles before concluding that the service is healthy.',uk:'Нам слід порівняти 95-й та 99-й перцентилі, перш ніж робити висновок, що сервіс здоровий.',example:'We should simulate a realistic traffic burst before signing off on the load test.'},
      {label:'Qualifying what a metric proves',phrase:'High average throughput does not prove that tail latency is acceptable for all users.',uk:'Висока середня пропускна здатність не доводить, що tail latency є прийнятною для всіх користувачів.',example:'A high cache hit ratio does not guarantee that critical updates appear immediately.'},
      {label:'Hypothesizing resource saturation',phrase:'Unbounded concurrent reloads could exhaust the database connection pool.',uk:'Необмежені одночасні перезавантаження кешу можуть вичерпати пул з’єднань бази даних.',example:'A sudden morning surge may saturate the primary database if cache keys expire together.'}
    ],
    [
      {label:'Describing container build pipelines (Passive)',phrase:'The Node.js application is packaged inside an Alpine Linux container image.',uk:'Node.js-додаток пакується всередину контейнерного образу на базі Alpine Linux.',example:'Runtime dependencies are locked and installed when the Docker image is built.'},
      {label:'Describing gradual canary release',phrase:'Five percent of production traffic was routed to the canary instance first.',uk:'П’ять відсотків продакшн-трафіку спочатку було спрямовано на канарковий інстанс.',example:'The rollout was paused automatically when elevated error rates were detected.'},
      {label:'Describing observability telemetry',phrase:'Distributed trace spans are correlated using a shared request ID header.',uk:'Спани розподіленого трейсингу зв’язуються за допомогою спільного заголовка request ID.',example:'Container CPU and memory metrics are scraped every fifteen seconds.'},
      {label:'Describing automated cloud provisioning',phrase:'Encrypted database snapshots are created every night and stored in a separate region.',uk:'Зашифровані снепшоти бази даних створюються щоночі й зберігаються в окремому регіоні.',example:'Host port 3000 is mapped to container port 3000 when the service is started.'}
    ],
    [
      {label:'Stating strict security prohibitions',phrase:'Developers must not hardcode API keys or database credentials in Git commits.',uk:'Розробники категорично не повинні хардкодити API-ключі чи паролі БД у Git-комітах.',example:'The server must not concatenate raw user input directly into a SQL query string.'},
      {label:'Explaining least-privilege rules',phrase:'A receptionist role does not have to access billing settings to manage bookings.',uk:'Роль рецепціоніста не повинна мати доступ до налаштувань білінгу, щоб керувати записами.',example:'A read-only reporting worker does not have to run with database superuser privileges.'},
      {label:'Enforcing server-side verification',phrase:'Every protected endpoint must verify permissions on the server, regardless of UI state.',uk:'Кожен захищений ендпоінт зобов’язаний перевіряти права на сервері, незалежно від стану UI.',example:'We must bind user values as query parameters ($1, $2) to prevent SQL injection.'},
      {label:'Recommending reliability drills',phrase:'We should test restoring a production backup into an isolated instance every month.',uk:'Нам варто щомісяця тестувати відновлення бекапу в ізольований інстанс.',example:'An incident post-mortem should identify missing safeguards rather than blame individuals.'}
    ],
    [
      {label:'Second conditional for distributed failure modes',phrase:'If every client retried immediately without backoff, we would trigger a cascading outage.',uk:'Якби кожен клієнт повторював запит миттєво без backoff, ми б спричинили каскадний збій.',example:'If the service crashed after committing to the database but before publishing, the event would be lost without an outbox.'},
      {label:'Explaining a mechanism with by + -ing',phrase:'We guarantee idempotent webhook handling by storing a unique event_id in a database constraint.',uk:'Ми гарантуємо ідемпотентну обробку вебхуків шляхом збереження унікального event_id в обмеженні БД.',example:'A circuit breaker protects the thread pool by failing fast when the downstream error threshold is exceeded.'},
      {label:'Hypothetical architectural comparison',phrase:'If we required strong linearizable reads on every replica, latency would increase across regions.',uk:'Якби ми вимагали суворої консистентності читання на кожній репліці, затримка між регіонами зросла б.',example:'If we used a customer ID instead of a payment event ID, legitimate repeat purchases would be rejected.'},
      {label:'Qualifying distributed guarantees',phrase:'Even with an atomic transactional outbox, the relay worker might publish an event more than once.',uk:'Навіть з атомарною таблицею transactional outbox, воркер може опублікувати подію більше одного разу.',example:'Adding random jitter prevents synchronized retry waves across thousands of clients.'}
    ]
  ];

  // 12 sets of 6 high-value spoken B1-B2 words/phrases that appear 100% verbatim in Listening dialogues.
  const CATCH_SETS = [
    [
      {word:'enormous',pos:'adjective',uk:'величезний, колосальний',meaning:'Extremely large in size, amount, or impact.'},
      {word:'overwhelming',pos:'adjective',uk:'перевантажувальний, надмірний',meaning:'Too much to deal with comfortably at one time.'},
      {word:'track down',pos:'phrasal verb',uk:'відстежити, знайти першопричину',meaning:'To find the exact source of a problem after searching.'},
      {word:'mismatch',pos:'noun',uk:'невідповідність, розбіжність',meaning:'A failure of two things to correspond or match properly.'},
      {word:'bottleneck',pos:'noun',uk:'вузьке місце (що гальмує процес)',meaning:'A stage or component that slows down the entire workflow.'},
      {word:'crucial',pos:'adjective',uk:'критично важливий, вирішальний',meaning:'Extremely important because everything else depends on it.'}
    ],
    [
      {word:'pinpoint',pos:'verb',uk:'точно визначити, локалізувати',meaning:'To locate or identify something with high precision.'},
      {word:'tangled',pos:'adjective',uk:'заплутаний, змішаний докупи',meaning:'Mixed together in a complicated or messy way.'},
      {word:'straightforward',pos:'adjective',uk:'простий, зрозумілий, прямолінійний',meaning:'Easy to understand or follow; not complicated.'},
      {word:'safeguard',pos:'noun',uk:'запобіжник, захисний механізм',meaning:'A check or rule that protects against an unwanted error.'},
      {word:'side effect',pos:'noun',uk:'побічний ефект',meaning:'An unexpected secondary consequence of a code change.'},
      {word:'narrow down',pos:'phrasal verb',uk:'звузити коло пошуку',meaning:'To reduce the number of possibilities step by step.'}
    ],
    [
      {word:'fragile',pos:'adjective',uk:'крихкий, ненадійний',meaning:'Easily broken by small changes or environment differences.'},
      {word:'caught off guard',pos:'idiom',uk:'заскочений зненацька',meaning:'Surprised by an unexpected problem without preparation.'},
      {word:'under the hood',pos:'idiom',uk:'під капотом, усередині механізму',meaning:'At the internal technical implementation level.'},
      {word:'roll out',pos:'phrasal verb',uk:'викочувати, розгортати реліз',meaning:'To release or deploy software into an environment.'},
      {word:'identical',pos:'adjective',uk:'ідентичний, точнісінько такий самий',meaning:'Exactly the same in every detail.'},
      {word:'spot on',pos:'idiom',uk:'в яблучко, абсолютно точний',meaning:'Completely accurate or exact.'}
    ],
    [
      {word:'misleading',pos:'adjective',uk:'оманливий, такий що вводить в оману',meaning:'Giving the wrong impression or hiding the true state.'},
      {word:'seamless',pos:'adjective',uk:'безшовний, плавний (без збоїв)',meaning:'Smooth and continuous, without awkward breaks or errors.'},
      {word:'opaque',pos:'adjective',uk:'непрозорий, незрозумілий ззовні',meaning:'Hard to understand because internal details are unclear.'},
      {word:'hang up',pos:'phrasal verb',uk:'зависати, блокувати очікуванням',meaning:'To stall or keep a process waiting indefinitely.'},
      {word:'fall back',pos:'phrasal verb',uk:'переходити на запасний варіант',meaning:'To use an alternative safe behaviour when the main call fails.'},
      {word:'breakage',pos:'noun',uk:'поломка, порушення сумісності',meaning:'An incident where a change causes existing clients to fail.'}
    ],
    [
      {word:'sluggish',pos:'adjective',uk:'повільний, млявий (про систему)',meaning:'Responding much more slowly than expected.'},
      {word:'pile up',pos:'phrasal verb',uk:'накопичуватися, громадитися',meaning:'To accumulate rapidly until it causes pressure.'},
      {word:'overhead',pos:'noun',uk:'накладні витрати (ресурсів/часу)',meaning:'Extra computational time or memory required by a mechanism.'},
      {word:'collide',pos:'verb',uk:'зіштовхуватися, конфліктувати одночасно',meaning:'To attempt conflicting changes on the same data at once.'},
      {word:'drastic',pos:'adjective',uk:'разючий, радикальний',meaning:'Extreme and sudden in effect.'},
      {word:'fine-tune',pos:'verb',uk:'тонко налаштувати, оптимізувати',meaning:'To make small precise adjustments for optimal performance.'}
    ],
    [
      {word:'out of sync',pos:'idiom',uk:'розсинхронізований',meaning:'No longer matching the current state of truth.'},
      {word:'linger',pos:'verb',uk:'затримуватися, залишатися в пам’яті',meaning:'To stay alive longer than needed instead of being cleaned up.'},
      {word:'flood',pos:'verb',uk:'завалювати, затоплювати запитами',meaning:'To send an excessive number of requests in a short window.'},
      {word:'overwrite',pos:'verb',uk:'перезаписати поверх нових даних',meaning:'To replace current data with another value.'},
      {word:'culprit',pos:'noun',uk:'винуватець, джерело багу',meaning:'The specific piece of code or reference causing a bug.'},
      {word:'cleanly',pos:'adverb',uk:'чисто, без залишкових хвостів',meaning:'In a complete and orderly way without leaving leftover state.'}
    ]
  ];

  // Deep technical enrichment for every single topic in SOURCES.
  const TOPIC_INFO = {
    'Database indexes': {
      summary:'A database index gives PostgreSQL another way to find matching rows. The query plan shows whether it actually chose that path.',
      ukBrief:'Індекс дає PostgreSQL додатковий шлях до потрібних рядків. На прикладі пошуку записів за email подивись, як план виконання показує спосіб читання і чому новий індекс не гарантує швидшого запиту.',
      mechanism:'PostgreSQL can scan the appointments table and filter each row, or use an index to find matching email values first. An index is useful when the filter matches a small share of a large table. For a query that reads many rows, scanning the table may still be cheaper.',
      steps:['Record the current search time with a representative email address.','Inspect the query plan to see where PostgreSQL reads and filters rows.','Test an index on the column used by the filter.','Compare the plans and timings on the same data, then check the effect on writes.'],
      realWorldWhy:'Checking the plan and measuring the same search before and after the change gives the team evidence to keep or reconsider the index.',
      misconception:'Creating an index does not guarantee that PostgreSQL will use it. It also adds storage and work when rows change.',
      diagContext:'An index on patient_email has been added, but exact email searches still take two seconds. The team has not checked the new plan yet.',
      workflowSituation:'After discussing the two-second email search, write a handover. Record which plan and measurement you would collect next and what result would justify keeping the index.',
    },
    'Project introductions': {
      ukBrief: 'Коли розробник приєднується до ІТ-проєкту, головна помилка — одразу занурюватися в перелік фреймворків (React, Node.js, PostgreSQL), не розуміючи бізнес-проблеми. Справжнє онбординг-знайомство з проєктом будується зверху вниз: 1) Хто кінцеві користувачі (users) і яку їхню проблему вирішує продукт; 2) Які ключові функції (features) закривають цю потребу; 3) Як система поділена на модулі та хто є відповідальним (owner) за кожен компонент.',
      summary: 'A technical project introduction aligns engineers around the user problem, core domain workflows, and module ownership before diving into frameworks and repositories.',
      steps: [
        'Identify the target users and the core real-world problem the software solves.',
        'Map the critical user journeys and product features (e.g., searching slots, booking, notifications).',
        'Review system boundaries and clarify which engineer or squad is responsible for each module.',
        'Connect the technical stack and repositories to those domain responsibilities.'
      ],
      realWorldWhy: 'Engineers who understand the user problem catch edge cases and design simpler solutions than developers who only follow ticket checklists.',
      misconception: 'Listing libraries and database tables is not an architecture introduction; without user context, a developer cannot judge whether a code change helps or breaks the workflow.',
      mechanism: 'In software engineering onboarding, a system architecture walkthrough always connects domain context to code modules. Before cloning a repository, a new engineer learns the domain model: patients book 15-minute clinic slots, receptionists manage cancellations, and automated workers send reminders.',
      diagContext: 'During a first-week architecture check, a junior developer knows that the project uses TypeScript and PostgreSQL, but cannot explain what happens when a clinic receptionist cancels a double-booked appointment.',
      workflowSituation: 'You are preparing a README onboarding workflow (docs/ONBOARDING.md) for new developers joining the clinic booking repository so they understand domain modules before running npm install and npm run dev.'
    },
    'Team roles': {
      ukBrief: 'У продуктовому ІТ-команді три ключові ролі дивляться на одну фічу під різними кутами: UI/UX Designer проєктує зручний інтерфейс та користувацький шлях; Software Developer відповідає за архітектуру, код, швидкодію та роботу з БД; QA Engineer / Tester шукає граничні випадки (edge cases), баги та невідповідності вимогам. Щоб ці три погляди не зайшли в глухий кут під час суперечки, фіча повинна мати єдиного відповідального власника (Feature Owner / Product Owner), який узгоджує фінальні вимоги.',
      summary: 'Cross-functional software teams combine UX design, engineering implementation, and QA verification under clear decision ownership so requirements never stall between roles.',
      steps: [
        'UX Designer defines the screen flow, accessibility, and user interaction states.',
        'Developer evaluates technical feasibility, API payload constraints, and database schema.',
        'QA Tester identifies edge cases, invalid inputs, and regression risks before coding finishes.',
        'The designated Feature Owner synthesizes all three inputs and signs off on the final acceptance criteria.'
      ],
      realWorldWhy: 'Without an explicit owner to resolve requirement trade-offs, developers build undocumented assumptions and QA blocks the release late in the sprint.',
      misconception: 'In startups and small squads, one engineer often wears multiple hats (e.g., dev + QA), which increases cognitive load and makes independent peer review essential.',
      mechanism: 'Cross-functional collaboration relies on explicit separation of concerns and a single point of accountability. When designing a new clinic booking screen, the designer optimises visual clarity, the backend engineer checks query latency, and the QA engineer probes invalid dates and double clicks.',
      diagContext: 'Halfway through coding the new booking screen, the designer wants a multi-step wizard while the developer built a single form, and the QA tester does not know which acceptance criteria to test against.',
      workflowSituation: 'You are writing a Definition of Ready (DoR) workflow note for Jira tickets showing how Design, Engineering, and QA sign off on requirements with the Feature Owner before sprint development starts.'
    },
    'Agile feedback': {
      ukBrief: 'Agile — це ітеративна методологія розробки ПЗ, яка проводить кожну фічу через 6 чітких етапів життєвого циклу розробки (SDLC — Software Development Life Cycle): 1) Plan (планування задач спринту та вимог); 2) Design (проєктування архітектури, БД та UI); 3) Code / Implement (написання коду розробником); 4) Test / QA (автотести, перевірка багів та edge cases); 5) Deploy / Release (викочування робочого інкременту реальному замовнику чи користувачам); 6) Feedback & Iterate (збір реального зворотного зв’язку від клієнтів і оновлення плану наступного спринту). На відміну від Waterfall (де всі 6 етапів йдуть один раз лінійно протягом багатьох місяців), в Agile цей цикл із 6 етапів крутиться кожні 1–2 тижні.',
      summary: 'Agile software development executes the 6 stages of the Software Development Life Cycle (Plan → Design → Code → Test → Deploy to Customer → Feedback & Iterate) in short, repeatable sprints rather than one rigid multi-month pass.',
      steps: [
        'Stage 1 — Plan: Define the sprint goal, user stories, and acceptance criteria with stakeholders.',
        'Stage 2 — Design: Design the UI flow, API contract, and data schema for the current increment.',
        'Stage 3 — Code (Implement): Write clean, modular code on a feature branch for the planned story.',
        'Stage 4 — Test (QA): Run unit, integration, and exploratory tests to catch defects early.',
        'Stage 5 — Deploy to Customer: Release the working software increment to staging/production users.',
        'Stage 6 — Feedback & Iterate: Measure real customer feedback and adjust the backlog for the next cycle.'
      ],
      realWorldWhy: 'Users rarely know every requirement upfront; shipping a working increment through all 6 SDLC stages early exposes real friction before months of engineering effort are wasted.',
      misconception: 'Agile NEVER means coding without a plan, architecture, or documentation; it means planning and documenting iteratively in every sprint cycle and updating the plan based on verified feedback.',
      mechanism: 'To understand Agile software engineering, you must look at how it organises the six stages of the Software Development Life Cycle (SDLC): 1. Plan, 2. Design, 3. Code, 4. Test, 5. Deploy to the customer, and 6. Collect feedback to iterate. In a traditional Waterfall model, a team spends months planning and designing everything upfront before writing a single line of code or showing anything to users. In Agile, the engineering team runs all six SDLC stages inside a short 1-to-2-week iteration called a sprint, delivering a small working version of the product and using real customer feedback from Stage 6 to refine Stage 1 of the next sprint.',
      diagContext: 'During a sprint review of the clinic booking MVP (Stage 5 & 6 of the Agile SDLC), analytics show that 65% of patients abandon the form because Stage 2 (Design) included twelve mandatory insurance fields before showing available doctors.',
      workflowSituation: 'You are writing a Sprint Review & Iteration workflow update explaining how the team completed Stages 1–5 (Plan, Design, Code, Test, Deploy) for the booking form v1 and how customer feedback from Stage 6 will reshape the backlog for Sprint 2.'
    },
    'Scrum and sprints': {
      ukBrief: 'Scrum — це найпопулярніший фреймворк реалізації Agile, де робота організована у фіксовані часові відрізки — спринти (зазвичай 2 тижні). Процес рухається зліва направо: Product Backlog (повний пріоритезований список фіч продукту) → Sprint Planning (команда оцінює задачі, формулює єдину Sprint Goal і бере реалістичний обсяг у Sprint Backlog) → 2 тижні розробки з щоденним 15-хвилинним синхроном (Daily Scrum) → Sprint Review (демо інкременту замовнику) → Sprint Retrospective (аналіз процесу команди).',
      summary: 'Scrum structures Agile delivery into time-boxed sprints driven by a prioritized Product Backlog, a focused Sprint Goal, daily 15-minute team synchronization, and end-of-sprint inspection.',
      steps: [
        'Product Backlog Refinement: Prioritize user stories by business value and estimate complexity.',
        'Sprint Planning: Agree on one clear Sprint Goal and commit to a realistic Sprint Backlog.',
        'Sprint Execution & Daily Scrum: Build and test stories while syncing for 15 minutes daily on progress and blockers.',
        'Sprint Review & Retrospective: Demonstrate the working increment to stakeholders and improve team workflow.'
      ],
      realWorldWhy: 'Time-boxed sprints with a protected Sprint Goal prevent scope creep and give developers predictable focus time to ship tested code.',
      misconception: 'The Daily Scrum (stand-up) is NOT a status report to a manager; it is a 15-minute tactical replanning session among developers to coordinate dependencies and unblock the Sprint Goal.',
      mechanism: 'Inside the Scrum framework, work flows from a master Product Backlog into a time-boxed two-week sprint. During Sprint Planning, developers estimate stories in story points or hours, establish a single unifying Sprint Goal, and pull only the backlog items that fit their measured velocity.',
      diagContext: 'On Day 4 of a two-week sprint focused on automated SMS appointment reminders, three unplanned cosmetic dashboard requests arrive from sales and threaten to derail the agreed Sprint Goal.',
      workflowSituation: 'You are drafting a Sprint Planning summary in Jira/Slack that defines the two-week Sprint Goal for appointment reminders, lists the selected Sprint Backlog items, and moves lower-priority requests to the next sprint.'
    },
    'Tasks and blockers': {
      ukBrief: 'Під час щоденної роботи розробника в Scrum-команді найгірша поведінка — мовчки сидіти над заблокованим таском (blocker) два дні, боячись попросити допомоги. Інженерний стандарт апдейту складається з 3 чітких пунктів: 1) Що конкретно вже зроблено й перевірено; 2) Над яким технічним кроком працюю зараз; 3) Який саме блокер зупиняє рух (наприклад, відсутні тестові API-ключі чи доступи до пісочниці) і від кого потрібна дія для розблокування.',
      summary: 'Effective engineering status updates surface technical blockers immediately by stating completed progress, the exact current step, the blocking dependency, and the person needed to unblock it.',
      steps: [
        'State the concrete technical step you completed and verified.',
        'Describe the exact integration or task you are working on right now.',
        'Pinpoint the blocker (e.g., missing sandbox API credentials, failing upstream endpoint, unclear spec).',
        'Tag the specific service owner or teammate with a direct request to unblock the task.'
      ],
      realWorldWhy: 'Surfacing a credential or environment blocker within two hours saves days of wasted sprint capacity and keeps dependent QA tasks on schedule.',
      misconception: 'Saying "everything is fine, still working on it" when you are blocked by missing test credentials is a major engineering anti-pattern that hides delivery risk from the team.',
      mechanism: 'In daily engineering workflows, tasks move across a board from To Do to In Progress, Blocked, Code Review, QA, and Done. When an external dependency such as an SMTP sandbox key or IAM role is missing, marking the ticket as Blocked and escalating immediately allows the team lead or DevOps owner to provision access.',
      diagContext: 'A backend developer has finished writing the email reminder service code, but cannot verify SMTP delivery in the staging environment because the DevOps vault credentials have not been granted to their test account.',
      workflowSituation: 'You are writing a concise stand-up and Jira blocker message tagging the infrastructure owner to request sandbox SMTP credentials so you can run end-to-end reminder tests before opening a pull request.'
    },
    'Containers': {
      ukBrief: 'Docker та контейнеризація вирішують класичну проблему «на моєму ноутбуці все працює, а на сервері падає». Контейнер (Container) пакує застосунок разом із його середовищем виконання (наприклад, Node.js конкретної версії), системними бібліотеками та мінімальним образом ОС (наприклад, легким Alpine Linux) в єдиний незмінний образ (Docker Image). На відміну від важкої віртуальної машини (VM), яка емулює власне ядро ОС і жере гігабайти RAM, Docker-контейнер використовує спільне ядро хост-системи (Linux kernel namespaces & cgroups), запускаючись за мілісекунди на будь-якому девайсі чи сервері.',
      summary: 'Docker containerization packages an application, its runtime (such as Node.js), and a minimal Linux filesystem (such as Alpine Linux) into an immutable image that runs identically across laptops, CI pipelines, and cloud servers.',
      steps: [
        'Write a Dockerfile starting from a minimal base image (e.g., FROM node:20-alpine).',
        'Copy package.json and lockfiles, then install exact dependencies inside the isolated filesystem layer.',
        'Bundle the application source code and define the startup command (CMD ["node", "server.js"]).',
        'Build an immutable Docker image and run isolated containers sharing the host OS kernel with port mapping (-p 3000:3000) or docker-compose.'
      ],
      realWorldWhy: 'Building one immutable Docker image eliminates environment drift between a developer laptop (macOS/Windows) and Linux production servers.',
      misconception: 'A Docker container is NOT a full virtual machine with its own OS kernel; it shares the host kernel and still requires non-root users, port mapping, and externalized environment secrets.',
      mechanism: 'Under the hood, Docker containerization solves environment drift by bundling an application process with its exact runtime filesystem. When you write a Dockerfile using a lightweight base layer such as Alpine Linux (FROM node:20-alpine), Docker packages the minimal Linux userland, the exact Node.js runtime binary, and your locked node_modules tree into a read-only image. Because every container started from that image shares the host kernel through Linux namespaces and cgroups while running its own isolated Alpine Linux + Node.js filesystem, the program executes identically on any developer laptop or cloud server.',
      diagContext: 'You started the clinic Node.js container on a staging host using docker run, and the container logs say Server listening on port 3000, yet requests to http://localhost:3000 fail with Connection refused because port mapping (-p 3000:3000) and host binding (0.0.0.0) were not configured.',
      workflowSituation: 'You are writing an engineering handover note explaining how your docker-compose.yml workflow (docker compose up -d --build) orchestrates the Alpine Linux + Node.js API container alongside a PostgreSQL container with port mapping 3000:3000 and health checks.'
    }
  };

  const POS_MAP = {
    'project':'noun','user':'noun','feature':'noun','team':'noun','build':'verb','responsible for':'adjective phrase',
    'role':'noun','developer':'noun','tester':'noun','designer':'noun','requirement':'noun','owner':'noun',
    'feedback':'noun','deliver':'verb','change':'noun / verb','value':'noun','improve':'verb','try out':'phrasal verb',
    'sprint':'noun','goal':'noun','backlog':'noun','estimate':'verb','plan':'verb / noun','priority':'noun',
    'task':'noun','blocker':'noun','access':'noun','work on':'phrasal verb','finish':'verb','ask for help':'verb phrase',
    'repository':'noun','history':'noun','track':'verb','compare':'verb','version':'noun',
    'branch':'noun','separate':'adjective / verb','merge':'verb','conflict':'noun','update':'verb','switch':'verb',
    'commit':'noun / verb','message':'noun','purpose':'noun','related':'adjective','split':'verb','fix':'verb / noun',
    'pull request':'noun','review':'noun / verb','describe':'verb','reproduce':'verb','approve':'verb','test steps':'noun phrase',
    'suggest':'verb','concern':'noun','duplicate':'noun / adjective','guard':'noun','required':'adjective','could we':'modal phrase',
    'operations':'noun','shared':'adjective','automate':'verb','release':'noun / verb','manual':'adjective','repeatable':'adjective',
    'dependency':'noun','artifact':'noun','source':'noun','fail':'verb',
    'pipeline':'noun','check':'noun / verb','integrate':'verb','run tests':'verb phrase','failure':'noun','catch':'verb',
    'deployment':'noun','roll back':'phrasal verb','setting':'noun','validate':'verb','previous':'adjective','automatically':'adverb',
    'environment':'noun','staging':'noun','production':'noun','configuration':'noun','test account':'noun','traffic':'noun',
    'request':'noun / verb','response':'noun','client':'noun','server':'noun','status code':'noun','handle':'verb',
    'contract':'noun','field':'noun','format':'noun','compatible':'adjective','consumer':'noun','boundary':'noun',
    'sign in':'phrasal verb','identity':'noun','session':'noun','token':'noun','expire':'verb','permission':'noun',
    'invalid':'adjective','error message':'noun','retry':'verb / noun','explain':'verb','detail':'noun','safe':'adjective',
    'third-party':'adjective','timeout':'noun','external':'adjective','available':'adjective','delay':'noun','depend on':'phrasal verb',
    'query':'noun / verb','row':'noun','column':'noun','filter':'verb / noun','record':'noun','select':'verb',
    'index':'noun','scan':'verb / noun','lookup':'noun','storage':'noun','write':'noun / verb','execution plan':'noun',
    'transaction':'noun','lock':'noun / verb','constraint':'noun','reserve':'verb','consistent':'adjective','race condition':'noun',
    'batch':'noun','roundtrip':'noun','fetch':'verb','map':'verb','bottleneck':'noun',
    'pagination':'noun','cursor':'noun','offset':'noun','stable':'adjective','order':'verb / noun','next page':'noun',
    'state':'noun','component':'noun','display':'verb','selected':'adjective','derived':'adjective',
    'event':'noun','listener':'noun','callback':'noun','cleanup':'noun','remove':'verb','reference':'noun',
    'debounce':'verb','keystroke':'noun','search':'noun / verb','unnecessary':'adjective','wait':'verb','cancel':'verb',
    'stale':'adjective','latest':'adjective','replace':'verb','ignore':'verb','obsolete':'adjective','match':'verb',
    'memory':'noun','retain':'verb','heap':'noun','garbage collection':'noun','inspect':'verb',
    'asynchronous':'adjective','await':'verb','block':'verb','loading':'noun','result':'noun','operation':'noun',
    'sequential':'adjective','concurrent':'adjective','independent':'adjective','overlap':'verb','complete':'verb',
    'parallelism':'noun','concurrency':'noun','resource':'noun','CPU':'noun','I/O':'noun','exhaust':'verb',
    'stream':'noun','chunk':'noun','export':'verb / noun','process':'verb / noun','crash':'verb','transform':'verb',
    'backpressure':'noun','producer':'noun','buffer':'noun','pause':'verb','keep up':'phrasal verb',
    'refactor':'verb','behaviour':'noun','responsibility':'noun','preserve':'verb','extract':'verb','focused':'adjective',
    'unit test':'noun','integration test':'noun','assumption':'noun','verify':'verb','coverage':'noun',
    'strategy':'noun','interface':'noun','interchangeable':'adjective','channel':'noun','implement':'verb','complexity':'noun',
    'trade-off':'noun','modular':'adjective','overhead':'noun','maintain':'verb','decision':'noun',
    'monolith':'noun','microservice':'noun','deploy':'verb','ownership':'noun','coupling':'noun',
    'latency':'noun','throughput':'noun','percentile':'noun','measure':'verb','average':'noun / adjective','tail latency':'noun',
    'cache':'noun / verb','cache miss':'noun','read':'noun / verb',
    'invalidate':'verb','entry':'noun','expiry':'noun','freshness':'noun','affected':'adjective',
    'stampede':'noun','in-flight':'adjective','coordinate':'verb','share':'verb','reload':'verb','fallback':'noun',
    'load':'noun','burst':'noun','capacity':'noun','resource use':'noun','simulate':'verb','error rate':'noun',
    'cloud':'noun','infrastructure':'noun','backup':'noun','cost':'noun','provision':'verb','manage':'verb',
    'container':'noun','image':'noun','runtime':'noun','package':'verb / noun','host':'noun',
    'scale':'verb','instance':'noun','horizontal':'adjective','vertical':'adjective','saturated':'adjective','demand':'noun',
    'rollout':'noun','canary':'noun','monitor':'verb','signal':'noun','rollback':'noun','edge case':'noun',
    'log':'noun','metric':'noun','trace':'noun','correlation':'noun','span':'noun','diagnose':'verb',
    'authorisation':'noun','least privilege':'noun','enforce':'verb','protected':'adjective','allow':'verb','deny':'verb',
    'injection':'noun','input':'noun','parameter':'noun','untrusted':'adjective','allowlist':'noun','bind':'verb',
    'secret':'noun','credential':'noun','revoke':'verb','rotate':'verb','expose':'verb',
    'reliability':'noun','recovery':'noun','restore':'verb','outage':'noun','procedure':'noun',
    'incident':'noun','timeline':'noun','root cause':'noun','safeguard':'noun','follow-up':'noun','contribute':'verb',
    'replica':'noun','consistency':'noun','propagate':'verb','guarantee':'noun','observe':'verb',
    'backoff':'noun','jitter':'noun','transient':'adjective','bounded':'adjective','overload':'noun',
    'idempotent':'adjective','webhook':'noun','deduplicate':'verb','identifier':'noun','atomic':'adjective','effect':'noun',
    'outbox':'noun','publish':'verb','worker':'noun','delivery':'noun',
    'circuit breaker':'noun','threshold':'noun','probe':'noun','recover':'verb',
    'make sure':'phrasal verb','point out':'phrasal verb','take into account':'verb phrase','in terms of':'prepositional phrase',
    'keep track of':'verb phrase','deal with':'phrasal verb','as long as':'conjunction phrase','lead to':'phrasal verb',
    'as opposed to':'prepositional phrase','draw a conclusion':'verb phrase','on the basis of':'prepositional phrase','be likely to':'verb phrase',
    'in the event of':'prepositional phrase','carry out':'phrasal verb','provided that':'conjunction phrase','be subject to':'verb phrase',
    'weigh up':'phrasal verb','take for granted':'verb phrase'
  };

  const SCENARIOS = { 'The N+1 query problem':'code_001','Transactions and locking':'code_002','Events and cleanup':'code_003','Debounced search':'code_004','Sequential and concurrent requests':'code_005','Secrets and configuration':'code_006','Logs metrics and traces':'code_007','SQL injection':'code_008','Strategy pattern':'code_009','Cache-aside':'code_010','Cursor pagination':'code_011','Idempotent webhooks':'code_012','Cache stampede':'code_014','Concurrency and parallelism':'code_015','Circuit breakers':'code_016','Transactional outbox':'code_017','Backpressure':'code_018','Memory leaks':'code_003' };
  const CODE = {
    'Feature branches':'git switch -c feature/booking-filter\ngit status',
    'Clear commits':'git add booking/timezone.js\ngit commit -m "Fix booking timezone conversion"',
    'Continuous integration':'on: [push, pull_request]\nsteps:\n  - run: npm ci\n  - run: npm test\n  - run: npm run build',
    'HTTP requests':"const response = await fetch('/api/slots');\nif (!response.ok) throw new Error('Could not load slots');\nconst slots = await response.json();",
    'SQL queries':"SELECT id, starts_at\nFROM appointments\nWHERE doctor_id = $1\nORDER BY starts_at;",
    'Database indexes':'CREATE INDEX appointments_email_idx\nON appointments (patient_email);',
    'UI state':'function selectDate(date) {\n  setSelectedDate(date);\n  setSelectedSlot(null);\n}',
    'Stale responses':'const requestId = ++latestRequest;\nconst results = await search(query);\nif (requestId === latestRequest) show(results);',
    'Asynchronous work':'showLoading();\ntry { showProfile(await loadProfile()); }\nfinally { hideLoading(); }',
    'Safe refactoring':'function sendReminder(input) {\n  const reminder = validate(input);\n  return sender.send(reminder);\n}',
    'Cache invalidation':'await database.updateHours(clinicId, hours);\nawait cache.delete(`hours:${clinicId}`);',
    'Authorisation and least privilege':"if (!user.permissions.includes('billing:write')) {\n  return forbidden();\n}\nreturn updateBilling(input);",
    'Containers':'FROM node:20-alpine\nWORKDIR /app\nCOPY package*.json ./\nRUN npm ci --omit=dev\nCOPY . .\nEXPOSE 3000\nCMD ["node", "server.js"]'
  };

  const PROGRESSION=[
    {label:'A2 → B1',from:1,to:21,goal:'Foundations, clear questions and short explanations.'},
    {label:'B1',from:22,to:42,goal:'Connect experiences, reasons and next steps.'},
    {label:'B1 → B2',from:43,to:63,goal:'Compare alternatives, explain consequences and qualify conclusions.'},
    {label:'B2 practice',from:64,to:84,goal:'Develop an argument, answer objections and discuss trade-offs.'}
  ];

  const COMMUNICATION=[null,null,null,
    [['make sure','переконатися','Please make sure the consumer understands the error.'],['point out','звернути увагу на','Could you point out which part of the contract changed?']],
    [['take into account','враховувати','We should take into account the cost of database writes.'],['in terms of','з погляду','Compare these options in terms of consistency and response time.']],
    [['keep track of','відстежувати','We need to keep track of the most recent search request.'],['deal with','мати справу з','How should the interface deal with an outdated response?']],
    [['as long as','за умови, що','We can process both requests together as long as they are independent.'],['lead to','призводити до','Extra concurrent work can lead to pressure on shared resources.']],
    [['as opposed to','на відміну від','We need evidence about our constraints as opposed to a fashionable diagram.'],['draw a conclusion','зробити висновок','Before we draw a conclusion, we should compare the actual alternatives.']],
    [['on the basis of','на підставі','Make the decision on the basis of representative measurements.'],['be likely to','імовірно','An unbounded queue would be likely to exhaust shared memory.']],
    [['in the event of','у разі','Who owns recovery in the event of a failed rollout?'],['carry out','виконувати','We should carry out the same checks in both environments.']],
    [['provided that','за умови, що','The change can proceed provided that the protected action has a server-side check.'],['be subject to','підлягати','The recovery plan may be subject to additional access restrictions.']],
    [['weigh up','зважувати варіанти','We need to weigh up the benefits and operational costs.'],['take for granted','вважати само собою зрозумілим','We cannot take for granted that a timed-out operation had no effect.']]
  ];

  function buildTopicDetails(card, week, day) {
    const custom = TOPIC_INFO[card.title];
    const terms = card.vocabulary.map(v => `${v.en} (${v.uk})`).join(', ');
    const w = card.vocabulary.map(v => v.en);
    const summary = custom?.summary || `${card.explanation} In real engineering systems, mastering ${card.title.toLowerCase()} prevents production defects and keeps team delivery predictable.`;
    const ukBrief = custom?.ukBrief || `Концепт «${card.title}» у сучасній ІТ-інженерії: ${card.explanation} У реальній роботі розробника цей механізм проходить послідовні етапи: від аналізу поточної поведінки системи (${card.scene}) та локалізації технічної проблеми (${card.problem}) до впровадження інженерного рішення (${card.action}) з обов’язковим урахуванням архітектурних обмежень (${card.caveat}). Ключові терміни теми: ${terms}.`;
    const steps = custom?.steps || [
      `Step 1 — Inspect how ${w[0]||'the component'} and ${w[1]||'the workflow'} interact in the current system architecture.`,
      `Step 2 — Pinpoint the technical bottleneck or failure mode affecting ${w[2]||'the operation'}.`,
      `Step 3 — Implement a clean, verifiable engineering fix around ${w[3]||'the boundary'} and ${w[4]||'the state'}.`,
      `Step 4 — Validate edge cases and monitor ${w[5]||'system behaviour'} in staging and production.`
    ];
    const realWorldWhy = custom?.realWorldWhy || `Software engineers apply ${card.title.toLowerCase()} every day to prevent regressions, diagnose incidents quickly, and make clear technical decisions with their team.`;
    const misconception = custom?.misconception || card.caveat;
    const mechanism = custom?.mechanism || `Under the hood, ${card.title.toLowerCase()} operates as a structured engineering mechanism rather than an isolated slogan. When an engineering team works on a production system, they trace how ${w[0]||'data'}, ${w[1]||'state'}, and ${w[2]||'components'} interact across boundaries.`;
    const diagContext = custom?.diagContext || `During a technical design and diagnostic check on ${card.title.toLowerCase()}, a teammate notices an edge case involving ${w[0]||'the module'} and ${w[2]||'the boundary'} under production load and asks how we validate that our implementation handles failures safely.`;
    const workflowSituation = custom?.workflowSituation || `You are documenting the practical team workflow and verification sequence for ${card.title.toLowerCase()} (covering ${w[0]||'setup'}, ${w[1]||'execution'}, and ${w[3]||'verification'}) so that developers and reviewers follow the same standard before shipping.`;
    return { summary, ukBrief, steps, realWorldWhy, misconception, mechanism, diagContext, workflowSituation };
  }

  function buildListeningLayer(card, week, day, role, stage) {
    const set = CATCH_SETS[week % CATCH_SETS.length];
    const topicLower = card.title.toLowerCase();
    const w0 = card.vocabulary[0]?.en || 'system';
    const w1 = card.vocabulary[1]?.en || 'change';
    const w2 = card.vocabulary[2]?.en || 'check';

    let turns;
    if (card.title === 'Agile feedback') {
      turns = [
        {speaker:role, text:`Hey, before our sprint planning call starts, can we look at the clinic booking rollout? Users tried our first increment, and the drop-off rate is enormous.`},
        {speaker:'Developer', text:`I saw the telemetry this morning. The twelve-field intake screen is completely overwhelming for first-time patients who just want to pick a doctor and time slot.`},
        {speaker:role, text:`Wait—how does Agile handle this without throwing away our whole architecture? Some stakeholders think Agile means coding without documentation or a structured plan.`},
        {speaker:'Developer', text:`That is a classic mismatch in how people view Agile. Every two-week sprint still runs through all six stages of the Software Development Life Cycle: Plan, Design, Code, Test, Deploy to the customer, and collect Feedback.`},
        {speaker:role, text:`Okay, so instead of waiting six months like in Waterfall, we use Stage 6 feedback right now to track down where users get stuck?`},
        {speaker:'Developer', text:`Exactly. Our Stage 6 data shows that the long insurance section is the main bottleneck. In Sprint 2, we will feed that insight back into Stage 1 Planning and Stage 2 Design so we trim the form down to three fields.`},
        {speaker:role, text:`And we still update our specification and run Stage 4 QA tests before we deploy the simplified version?`},
        {speaker:'Developer', text:`Yes! Keeping a written sprint plan and automated checks is crucial; Agile simply repeats the six SDLC stages in short loops so every release delivers real value.`}
      ];
    } else if (card.title === 'Database indexes') {
      turns = [
        {speaker:role,text:'I added the index on patient_email yesterday, but looking up one patient’s appointments still takes two seconds.'},
        {speaker:'Developer',text:'That is the same timing as before. Did you save the query plan from staging so we can see which scan it used?'},
        {speaker:role,text:'I have the old plan. The new test used a much smaller copy of the database, so the data is not representative.'},
        {speaker:'Developer',text:'Could we rerun the search on the same data? I want to compare what PostgreSQL reads, not just the elapsed time.'},
        {speaker:role,text:'I can do that today. We should also check whether the index adds too much overhead to writes.'},
        {speaker:'Developer',text:'Good. Bring both plans and the timings to stand-up. Then we can decide whether to keep the index.'},
      ];
    } else if (card.title === 'Containers') {
      turns = [
        {speaker:role, text:`Hey, do you have a minute? The clinic API runs fine on my macOS laptop, but in the Linux staging cluster the startup failure rate is enormous.`},
        {speaker:'Developer', text:`I know—debugging manual server installs is overwhelming when every machine has a different Node.js binary and system library version.`},
        {speaker:role, text:`How did you track down what broke on the staging host this morning?`},
        {speaker:'Developer', text:`There was a runtime mismatch between Node 20 on our laptops and an older Node 18 package on the host. That version drift became our biggest deployment bottleneck.`},
        {speaker:role, text:`So how does packaging the app into a Docker container fix that under the hood?`},
        {speaker:'Developer', text:`In our Dockerfile, we start from a lightweight Alpine Linux image, install the exact Node.js runtime and locked dependencies, and bundle our source code into one immutable image.`},
        {speaker:role, text:`Does the container boot a full virtual machine operating system on every server?`},
        {speaker:'Developer', text:`No, and that distinction is crucial: the container runs an isolated Alpine Linux userland process that shares the host OS kernel, so it starts in milliseconds and runs identically everywhere.`}
      ];
    } else {
      const templates = [
        [
          {speaker:role, text:`Hey, can we look at the ${topicLower} metrics before stand-up? The impact on our clinic service today is enormous.`},
          {speaker:'Developer', text:`Sure. When traffic spiked this morning, the raw alerts looked overwhelming, so I opened the diagnostic logs to inspect how ${w0} and ${w1} interact.`},
          {speaker:role, text:`Were you able to track down why the earlier implementation struggled under real usage?`},
          {speaker:'Developer', text:`Yes. There was a clear mismatch between what our local setup assumed about ${w2} and what actually happens during peak clinic hours.`},
          {speaker:role, text:`Did that create a bottleneck for the rest of the booking workflow?`},
          {speaker:'Developer', text:`It did. Once we isolated the root cause, we updated our ${topicLower} workflow so the team handles ${w0} cleanly and verifies every step.`},
          {speaker:role, text:`Is there any trade-off we still need to watch out for after this change goes live?`},
          {speaker:'Developer', text:`Definitely. Monitoring the real outcome in production is crucial because no single technique solves every edge case automatically.`}
        ],
        [
          {speaker:role, text:`Thanks for jumping on this call. We need to pinpoint why our ${topicLower} check flagged a warning in the clinic repository.`},
          {speaker:'Developer', text:`I just looked at the trace. Two different responsibilities got tangled together around ${w0}, which made the behaviour hard to predict.`},
          {speaker:role, text:`What is the most straightforward way to clean that up without breaking existing features?`},
          {speaker:'Developer', text:`First, we narrow down the exact boundary where ${w1} changes state, and then we isolate it behind a focused check.`},
          {speaker:role, text:`Should we also add an automated safeguard so the same issue does not slip back in next week?`},
          {speaker:'Developer', text:`Absolutely. Adding a targeted verification around ${w2} catches any unintended side effect before the change reaches real clinic users.`}
        ],
        [
          {speaker:role, text:`Our previous ${topicLower} setup felt really fragile whenever two engineers deployed changes on the same afternoon.`},
          {speaker:'Developer', text:`Agreed—we were caught off guard last week because the manual verification steps were not consistent across machines.`},
          {speaker:role, text:`Walk me through what happens under the hood now that we redesigned the ${w0} flow.`},
          {speaker:'Developer', text:`Now every time we roll out an update involving ${w1}, the system validates the configuration and runs an automated check on ${w2}.`},
          {speaker:role, text:`So staging and production follow an identical verification path before traffic switches over?`},
          {speaker:'Developer', text:`Your summary is spot on—and we still keep a fast rollback and monitoring check because environment conditions can always vary.`}
        ],
        [
          {speaker:role, text:`Quick question about ${topicLower}: the status indicator on the dashboard looked misleading during our morning test.`},
          {speaker:'Developer', text:`Good catch. The user experience looked seamless on the surface, but the error handling around ${w0} was still incomplete.`},
          {speaker:role, text:`Why was the failure so opaque when the client called the ${w1} endpoint?`},
          {speaker:'Developer', text:`Because the caller could hang up waiting when ${w2} failed, instead of receiving a structured response with a clear next action.`},
          {speaker:role, text:`How do we prevent breakage for mobile and web clients when we tighten that validation?`},
          {speaker:'Developer', text:`We enforce an explicit contract and let the caller fall back safely whenever an external or boundary check rejects the request.`}
        ],
        [
          {speaker:role, text:`Have you noticed that the admin view becomes sluggish whenever fifty clinic staff query ${topicLower} at 9 a.m.?`},
          {speaker:'Developer', text:`Yes, I profiled it ten minutes ago. Unoptimized operations around ${w0} pile up in the queue during the morning rush.`},
          {speaker:role, text:`Is the extra overhead coming from how we handle ${w1} on each request?`},
          {speaker:'Developer', text:`Exactly—and when two requests collide on the same ${w2} resource, the waiting time multiplies across all active workers.`},
          {speaker:role, text:`Did restructuring the query and locking path make a drastic difference in the benchmark?`},
          {speaker:'Developer', text:`It cut latency by eighty percent, though we still need to fine-tune our write path and monitor resource limits under load.`}
        ],
        [
          {speaker:role, text:`I just reproduced a weird bug in ${topicLower}: the state on screen goes out of sync right after rapid user input.`},
          {speaker:'Developer', text:`I traced that in DevTools. Old references to ${w0} linger in memory when we switch views without a proper cleanup step.`},
          {speaker:role, text:`And if someone types fast, does it also flood the worker with redundant ${w1} calls?`},
          {speaker:'Developer', text:`Yes, and a slower earlier callback can return late and overwrite the newest ${w2} result on the screen.`},
          {speaker:role, text:`So the real culprit is a combination of uncleaned listeners and untracked async order?`},
          {speaker:'Developer', text:`Precisely. Once we cancel obsolete work and release references cleanly, both the stale UI bug and the memory growth disappear.`}
        ]
      ];
      turns = templates[week % templates.length];
    }

    const indexWords = [
      ['index','noun','індекс','A structure that helps the database find matching rows.'],
      ['query plan','noun phrase','план виконання','The steps the database chooses to run a query.'],
      ['scan','noun','сканування','Reading rows through a table or index.'],
      ['representative','adjective','репрезентативний','Similar enough to real usage to make a test useful.'],
      ['overhead','noun','додаткові витрати','Extra work or cost caused by a change.'],
      ['timings','noun','вимірювання часу','Recorded execution times used to compare tests.'],
    ].map(([word,pos,uk,meaning])=>({word,pos,uk,meaning}));
    const usedSet = card.title==='Database indexes'?indexWords:(card.title === 'Agile feedback' || card.title === 'Containers') ? CATCH_SETS[0] : set;
    const catchWords = usedSet.map(item => {
      const turn = turns.find(t => t.text.toLowerCase().includes(item.word.toLowerCase())) || turns[0];
      return {
        word: item.word,
        pos: item.pos,
        uk: item.uk,
        meaning: item.meaning,
        quote: turn.text
      };
    });

    const context = `Layer 2 · Live Engineering Stand-up & Debugging Audio: Listen to a ${role} and a Developer troubleshooting a real production case involving ${card.title.toLowerCase()}. Notice how they use the 6 catch-words in context.`;
    return { context, dialogue: turns, catchWords };
  }

  function buildSpeakingFrames(week, stage) {
    if (stage === 0) {
      return [
        {label:'Framing the technical mechanism',phrase:'Under the hood, <concept> works by...',uk:'Під капотом <концепт> працює шляхом...',example:'Under the hood, Agile works by running the six SDLC stages in short two-week sprints.'},
        {label:'Pinpointing the diagnostic issue',phrase:'In this diagnostic case, the main bottleneck / failure is that...',uk:'У цьому діагностичному кейсі головна проблема полягає в тому, що...',example:'In this diagnostic case, the main issue is that the twelve-field form overwhelms users.'},
        {label:'Proposing a concrete engineering action',phrase:'To resolve this cleanly, we should <action> so that...',uk:'Щоб вирішити це чисто, нам варто <дія>, щоб...',example:'To resolve this cleanly, we should simplify the form in Stage 2 Design and test it in Stage 4.'},
        {label:'Stating a verification check',phrase:'We still need to verify <metric/check> because...',uk:'Нам усе ще потрібно перевірити <метрику/перевірку>, тому що...',example:'We still need to verify completion rates in Stage 6 because feedback guides the next sprint.'}
      ];
    }
    if (stage === 1) {
      return [
        {label:'Connecting cause and effect',phrase:'The issue occurs when <condition>, which leads to...',uk:'Проблема виникає, коли <умова>, що призводить до...',example:'The issue occurs when environment configs drift, which leads to failed production deploys.'},
        {label:'Explaining the safeguard',phrase:'By introducing <mechanism>, we prevent <failure mode> from...',uk:'Впроваджуючи <механізм>, ми запобігаємо тому, щоб <збій>...',example:'By introducing an automated CI pipeline, we prevent broken commits from reaching the release branch.'},
        {label:'Clarifying boundary assumptions',phrase:'One important boundary to keep in mind is that...',uk:'Важлива межа, про яку слід пам’ятати, полягає в тому, що...',example:'One important boundary to keep in mind is that an HTTP 200 status does not prove business success.'},
        {label:'Proposing the next diagnostic check',phrase:'Our next verification step is to inspect <signal> under...',uk:'Наш наступний крок перевірки — дослідити <сигнал> під час...',example:'Our next verification step is to inspect the SQL execution plan under realistic row counts.'}
      ];
    }
    return [
      {label:'Weighing engineering trade-offs',phrase:'On the one hand, <approach A> simplifies...; on the other hand, it introduces...',uk:'З одного боку, <підхід А> спрощує...; з іншого боку, він додає...',example:'On the one hand, microservices isolate deployments; on the other hand, they introduce network latency.'},
      {label:'Contrasting with an alternative',phrase:'As opposed to <alternative>, our proposed design guarantees...',uk:'На відміну від <альтернативи>, наш запропонований дизайн гарантує...',example:'As opposed to a full virtual machine, an Alpine Linux Docker container starts in milliseconds.'},
      {label:'Addressing a counterargument',phrase:'A reviewer might object that...; however, we mitigate this by...',uk:'Рев’юер може заперечити, що...; проте ми мінімізуємо це шляхом...',example:'A reviewer might object that cache invalidation adds complexity; however, we mitigate this by deleting keys right after DB writes.'},
      {label:'Defining criteria to reconsider',phrase:'We would reconsider this architecture provided that <evidence/threshold>...',uk:'Ми б переглянули цю архітектуру за умови, що <докази/поріг>...',example:'We would reconsider this caching strategy provided that p99 read latency exceeds 150 ms.'}
    ];
  }

  function buildWritingFrames(week, stage) {
    return [
      {label:'Opening a technical update',phrase:'Context & Workflow: In our current implementation of <topic>, ...',uk:'Контекст і воркфлоу: У нашій поточній реалізації <теми>...',example:'Context & Workflow: In our current Docker workflow, we package the Node.js API inside an Alpine Linux image.'},
      {label:'Explaining the step-by-step command / action',phrase:'Implementation Step: First, we run / configure <step> in order to...',uk:'Крок реалізації: Спочатку ми запускаємо / налаштовуємо <крок>, щоб...',example:'Implementation Step: First, we run docker compose up -d to start the API and PostgreSQL containers on a shared bridge network.'},
      {label:'Explaining why this beats the alternative',phrase:'Engineering Rationale: Unlike <alternative>, this workflow ensures that...',uk:'Інженерне обґрунтування: На відміну від <альтернативи>, цей воркфлоу гарантує, що...',example:'Engineering Rationale: Unlike manual server scripts, a declarative docker-compose.yml file guarantees reproducible environments.'},
      {label:'Defining the verification & guardrail',phrase:'Verification & Next Check: Before closing the ticket, we verify that...',uk:'Верифікація та наступна перевірка: Перед закриттям тікета ми перевіряємо, що...',example:'Verification & Next Check: Before closing the ticket, we verify that port 3000 responds to health checks and no secrets live in the image.'}
    ];
  }

  function random(seed){let x=2166136261;for(const c of String(seed)){x^=c.charCodeAt(0);x=Math.imul(x,16777619);}return()=>{x+=0x6D2B79F5;let t=x;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296;};}
  function presentLesson(lesson,seed){
    const rng=random(seed);let previous=-1,run=0;
    for(const area of ['reading','listening','grammar'])for(const q of area==='grammar'?lesson.grammar.exercises:lesson[area].questions){
      const answer=q.options[q.correct],options=[...q.options];for(let i=options.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[options[i],options[j]]=[options[j],options[i]];}
      let correct=options.indexOf(answer);
      if(correct===previous&&run>=2){const other=(correct+1+Math.floor(rng()*(options.length-1)))%options.length;[options[correct],options[other]]=[options[other],options[correct]];correct=other;}
      run=correct===previous?run+1:1;previous=correct;q.options=options;q.correct=correct;
    }
    lesson.choicePresentationVersion=2;return lesson;
  }
  function refreshSession(session,history=[]){
    if(!session)return false;const languageUpdated=learning.refreshSession(session,history,lessons);if(session.choicePresentationVersion===2)return languageUpdated;
    const source=getLesson(session.lessonId),lesson=session.lesson,selected={},exitSelected={};
    for(const area of ['reading','listening','grammar'])for(const [i,q]of(area==='grammar'?lesson.grammar.exercises:lesson[area].questions).entries()){
      const key=area+'-'+i;if(/^\d+$/.test(session.answers[key]||''))selected[key]=q.options[Number(session.answers[key])];
      if(area==='grammar'&&i<2){const options=[...q.options.slice(1),q.options[0]],key='exit-'+(i+3);if(/^\d+$/.test(session.answers[key]||''))exitSelected[key]=options[Number(session.answers[key])];}
      const updated=source&&(area==='grammar'?source.grammar.exercises[i]:source[area].questions[i]);
      if(updated&&updated.options[updated.correct]===q.options[q.correct]){q.options=[...updated.options];q.correct=updated.correct;}
    }
    presentLesson(lesson,session.id);
    for(const area of ['reading','listening','grammar'])for(const [i,q]of(area==='grammar'?lesson.grammar.exercises:lesson[area].questions).entries()){
      const key=area+'-'+i;if(Object.prototype.hasOwnProperty.call(selected,key)){const index=q.options.indexOf(selected[key]);session.answers[key]=index<0?'':String(index);if(index<0)delete session.results[key];}
      if(area==='grammar'&&i<2){const key='exit-'+(i+3);if(Object.prototype.hasOwnProperty.call(exitSelected,key)){const options=[...q.options.slice(1),q.options[0]],index=options.indexOf(exitSelected[key]);session.answers[key]=index<0?'':String(index);if(index<0)delete session.results[key];}}
    }
    session.choicePresentationVersion=2;return true;
  }
  function parse(line, week, day) {
    const [title, explanation, scene, problem, action, caveat, terms] = line.split('|');
    if (!terms) throw new Error('Incomplete lesson: '+title);
    const contrast=CONTRASTS[week*5+day];if(!contrast||contrast[0]!==title||contrast.length!==7)throw new Error('Missing contextual choices: '+title);
    const vocabulary=terms.split(';').map((pair,index)=>{
      const [en, uk] = pair.split('~');
      const example=examples[en+'::'+uk]||examples[en];
      if(!example)throw new Error('Missing vocabulary example: '+en);
      const pos = POS_MAP[en] || 'noun / verb';
      const conceptPrompt = `Write 1–2 sentences using “${en}” (${pos}) to explain how ${title.toLowerCase()} works in a real software team.`;
      return {id:`w${week+1}d${day+1}-v${index+1}`,en,uk,pos,example,conceptPrompt};
    });
    if(COMMUNICATION[week])vocabulary.splice(4,2,...COMMUNICATION[week].map(([en,uk,example],i)=>({
      id:`w${week+1}d${day+1}-c${i+1}`,en,uk,pos:POS_MAP[en]||'phrase',example,
      conceptPrompt:`Write 1–2 sentences using the phrase “${en}” to discuss an engineering decision or trade-off in ${title.toLowerCase()}.`
    })));
    return {title,explanation,scene,problem,action,caveat,vocabulary,contrast:contrast.slice(1),scenarioId:SCENARIOS[title]||null,code:CODE[title]||null};
  }

  function definition(card, week, day, previous, type='lesson') {
    const number=week*7+day+1, id=`daily-${String(number).padStart(3,'0')}`;
    const grammar=GRAMMAR[week];
    const grammarPatterns=GRAMMAR_PATTERNS[week]||GRAMMAR_PATTERNS[0];
    const focus=type==='lesson'?card.title:type==='simulation'?`Simulation: ${WEEKS[week]}`:`Checkpoint: ${WEEKS[week]}`;
    const stage=Math.floor(week/3),level=PROGRESSION[stage].label;
    const details = buildTopicDetails(card, week, day);
    const mission = type==='simulation'
      ? `Run a full technical handover on ${card.title.toLowerCase()}: explain the architecture mechanism, diagnose the live issue, and document the practical workflow.`
      : type==='checkpoint'
      ? `Apply this week's engineering concepts (${card.title.toLowerCase()} and ${previous[0].title.toLowerCase()}) across reading, live troubleshooting, diagnostics, and workflow writing.`
      : `Master ${card.title.toLowerCase()} across 5 progressive layers: 1) Architecture & Mechanism, 2) Live Troubleshooting Audio, 3) Technical Grammar, 4) Runtime Diagnostics, and 5) Practical Workflow.`;

    const choice=(prompt,answer,wrong,explanation,openExtras={})=>{
      const options=[answer,...wrong];
      return {prompt,options,correct:0,explanation,...openExtras};
    };

    const stepSummary = details.steps.join(' -> ');
    let reading=type==='lesson'
      ?`${details.mechanism}\n\nHow the lifecycle works step by step: ${stepSummary}.\n\nCase study in our clinic engineering team: ${card.scene} ${card.explanation} During implementation, the team hits a concrete obstacle: ${card.problem} To resolve this systematically, ${card.action}\n\nEngineering boundary & common misconception: ${card.caveat} ${details.realWorldWhy}`
      :`${type==='simulation'?'You are joining an architecture handover for a partner clinic platform.':'A principal engineer is reviewing a technical design proposal before the next release.'} ${details.mechanism}\n\n${card.scene} ${card.problem} A colleague proposes: ${card.action.replace(/^We /,'we ').replace(/^I /,'I ')}\n\nThe team has limited time and needs a clear architectural breakdown before acting. ${card.explanation} Your job is to connect the underlying mechanism (${stepSummary}) to the observed bottleneck, evaluate the proposed response, and state what must be verified.\n\n${card.caveat} ${previous[0].explanation} Combine both concepts when you evaluate the design. Ask for measurable evidence before assuming that a familiar pattern fits the new workload.`;

    const role=['teammate','reviewer','QA engineer','DevOps engineer','product manager','interviewer'][number%6];
    const discourse=number%2===0?
      {text:`Although the proposal addresses the immediate concern, the reviewer is not yet convinced that its benefits will last. The phrase "not yet" matters: the reviewer is asking for stronger evidence, rather than rejecting the idea. The team will record the conditions of the next trial so that the result can be compared with what happens now.`,question:choice('What does the reviewer mean by being "not yet convinced"?','The idea remains possible, but the current evidence is not sufficient.',['The idea has been rejected and a replacement has been agreed.','The evidence is accepted, but the implementation has been postponed.'],'Explain in 1–2 sentences why asking for stronger evidence is different from rejecting a technical proposal.',{
        openPrompt:'What does the reviewer mean by being "not yet convinced", and how should the engineering team respond?',
        instruction:'Write 1–2 full English sentences in your own words. Explain why the reviewer wants measurable evidence from the next trial.',
        targetForm:'Although the proposal addresses..., the reviewer wants stronger evidence before...',
        hint:'Look at the paragraph about "not yet convinced": is the idea rejected, or does it need a measured trial?',
        example:'The reviewer has not rejected the proposal, but wants measurable evidence from the next trial before making a final decision.'
      })}:
      {text:`The reviewer agrees that the immediate concern needs attention. Nevertheless, agreement about the problem should not be taken as agreement about the proposed response. Two approaches may address the same issue while having different costs. The next discussion will therefore compare the recommendation with an alternative, rather than treat the first plausible idea as the final decision.`,question:choice('Why does the writer distinguish agreement about the problem from agreement about the response?','People may recognise the same problem while preferring different solutions.',['The team has changed its description of the original problem.','The reviewer accepts the response but questions whether a problem exists.'],'Explain in 1–2 sentences why recognizing the same bug or bottleneck does not mean every engineer agrees on the fix.',{
        openPrompt:'Why does the author distinguish agreement about the technical problem from agreement about the proposed solution?',
        instruction:'Write 1–2 full English sentences in your own words. Mention that two engineering approaches can solve the same issue with different trade-offs.',
        targetForm:'Engineers may agree on the root problem while preferring different solutions because...',
        hint:'Two solutions can fix the same bug while having very different operational costs.',
        example:'Teammates can agree that a bottleneck exists while preferring different architectural fixes because each option has different operational costs.'
      })};

    if(stage>=1)reading+=`\n\nA colleague also considers another approach: ${card.contrast[2]} The discussion should make clear why the team prefers its proposed response. A useful explanation connects the choice to the situation, rather than simply saying that it is better. If the circumstances change, the team may need to review that choice.`;
    if(stage>=2)reading+=`\n\n${discourse.text}`;
    if(stage>=3)reading+=`\n\nWhen presenting the recommendation to another team, acknowledge the strongest argument for the alternative before explaining your own position. Distinguish what has been observed from what is still an assumption. A persuasive recommendation states what would make you reconsider it; it does not need to promise an outcome for every possible situation.`;

    const listeningLayer = buildListeningLayer(card, week, day, role, stage);
    const otherTopics=previous.filter(p=>p.title!==card.title).slice((number%2),number%2+2);

    const speakingScenario = {
      layerTitle: `Layer 4 · Runtime Diagnostics, Validation & Edge Cases (${card.title})`,
      context: details.diagContext,
      task: stage<2
        ? `Explain to the ${role} how you diagnose this ${card.title.toLowerCase()} edge case, how the underlying mechanism works, and what concrete check proves the fix works.`
        : `Compare two diagnostic and architectural approaches to this ${card.title.toLowerCase()} scenario for the ${role}, defend your recommendation with trade-offs, and define what metric would make you reconsider.`,
      pointsToCover: [
        `How ${card.title.toLowerCase()} works under the hood in this scenario.`,
        `Why the diagnostic edge case happens and what signal exposes it.`,
        `Which concrete engineering action and verification check you recommend.`
      ]
    };

    const writingFormat = ['Slack engineering note','PR architectural comment','technical handover guide','runbook & workflow update'][number%4];
    const writingRecipient = writingFormat==='PR architectural comment'?'the code reviewer':writingFormat==='technical handover guide'?'the engineer taking over the service':'your engineering squad';
    const writingBriefObj = {
      layerTitle: `Layer 5 · Practical Workflow & Implementation in English (${card.title})`,
      format: writingFormat,
      recipient: writingRecipient,
      purpose: `Document the practical implementation workflow, commands/steps, and verification guardrails for ${card.title.toLowerCase()}.`,
      situation: details.workflowSituation,
      proposal: `Walk through the step-by-step workflow (${details.steps.slice(0,3).join('; ')}) and explain how the team verifies the result in practice.`,
      alternative: card.contrast[2],
      requirements: stage<2 ? [
        `Explain the practical workflow for ${card.title.toLowerCase()} and what each step accomplishes.`,
        `Describe the concrete implementation command, configuration, or process step your team should run.`,
        `State one verification check or misconception to watch out for before closing the task.`
      ] : [
        `Recommend a concrete implementation workflow for ${card.title.toLowerCase()} and justify its engineering rationale.`,
        `Compare your workflow with the alternative (${card.contrast[2]}) and address one operational trade-off.`,
        `Specify the exact verification signal or threshold that confirms the workflow succeeded.`
      ]
    };

    const lesson={
      id,version:VERSION,curriculumVersion:2,number,week:week+1,day:day+1,type,title:focus,theme:WEEKS[week],mission,
      prerequisites:number>1?[`daily-${String(number-1).padStart(3,'0')}`]:[],
      level,progressionStage:stage,targetLevel:'B2',blocks:BLOCKS.map(b=>({...b})),minutes:55,
      communication:{version:1,scene:details.workflowSituation,problem:details.diagContext,proposal:card.action,limitation:details.misconception,alternative:card.contrast[2],allowOwnScenario:true},
      concept:{
        caseStudy:{scene:card.scene,problem:card.problem},
        explanation:card.explanation,
        summary:details.summary,
        steps:details.steps,
        realWorldWhy:details.realWorldWhy,
        misconception:details.misconception,
        ukBrief:details.ukBrief,
        uk:'Read the explanation, then use your own words. Open the technical note if the idea is new.',
        caveat:card.caveat
      },
      vocabulary:card.vocabulary.map(v=>({...v,example: type==='lesson'?v.example:`In this handover: ${v.example}`})),newVocabulary:type==='lesson',
      reading:{
        title:`Layer 1 · Under the Hood: How ${card.title} Works`,
        genre:type==='lesson'?'Technical Architecture & Mechanism':'Engineering Design Case Study',
        guide:'Read how the concept works step by step under the hood. Then answer the open comprehension questions below in your own English sentences (no copy-pasting).',
        text:reading,
        questions:[
          choice('What is the main problem in this scenario?',card.problem,card.contrast.slice(0,2),`Find the core technical bottleneck described in the text: ${card.problem}`,{
            openPrompt:`1. Mechanism & Bottleneck: Based on the text, how does ${card.title.toLowerCase()} work, and what specific technical problem does the team face in this case?`,
            instruction:'Write 1–2 complete English sentences in your own words. Explain both the concept mechanism and the specific obstacle.',
            targetForm:`In this system, ${card.title.toLowerCase()} works by..., and the main problem is that...`,
            hint:`Look at the mechanism paragraph and the obstacle: ${card.problem}`,
            example:`In this architecture, the team faces a bottleneck because ${card.problem.charAt(0).toLowerCase()+card.problem.slice(1)}`
          }),
          choice('Which next step does the team propose?',card.action,card.contrast.slice(2,4),`Proposed engineering action: ${card.action}`,{
            openPrompt:`2. Engineering Action: What concrete step does the team take to solve this problem, and why does that step work?`,
            instruction:'Write 1–2 complete English sentences explaining the solution and its technical purpose.',
            targetForm:'To resolve this issue, the team... so that...',
            hint:`Focus on how the team responds: ${card.action}`,
            example:`To resolve this issue, the team decides to act systematically: ${card.action.charAt(0).toLowerCase()+card.action.slice(1)}`
          }),
          choice('Which limitation should the team explain?',card.caveat,card.contrast.slice(4,6),`Architectural boundary / misconception: ${card.caveat}`,{
            openPrompt:`3. Boundary & Common Misconception: What architectural trade-off or misconception must engineers remember when applying ${card.title.toLowerCase()}?`,
            instruction:'Write 1–2 complete English sentences explaining what this concept does NOT guarantee automatically.',
            targetForm:'Even when we use..., we must remember that... because...',
            hint:`Check the final section on boundaries and misconceptions: ${card.caveat}`,
            example:`Engineers must remember that ${card.caveat.charAt(0).toLowerCase()+card.caveat.slice(1)}`
          }),
          ...(stage>=2?[discourse.question]:[])
        ],
        retell:stage===0
          ?`4. Concept Synthesis: In 2–3 sentences, explain how ${card.title.toLowerCase()} works step by step and why engineers use it in real projects. Use your own words.`
          :stage===1
          ?`4. Concept Synthesis: In 4–5 connected English sentences, explain the mechanism of ${card.title.toLowerCase()}, why the team chose its solution over the alternative, and what they should verify next.`
          :`4. Concept Synthesis: Summarise the architectural argument for ${card.title.toLowerCase()} in English. Compare the main proposal with the alternative and state what evidence would change the decision.`
      },
      listening:{
        context:listeningLayer.context,
        catchWords:listeningLayer.catchWords,
        dialogue:listeningLayer.dialogue,
        questions:[
          choice('What is this conversation mainly about?',`Understanding ${card.title.toLowerCase()} in a practical case.`,otherTopics.map(p=>`Understanding ${p.title.toLowerCase()} in a practical case.`),'Identify the live engineering problem the two speakers are debugging.',{
            openPrompt:`1. Live Issue in the Audio: What specific problem with ${card.title.toLowerCase()} are the ${role} and the Developer troubleshooting in this call? (Try using one of the catch-words above!)`,
            instruction:'Write 1–2 full English sentences summarizing the live issue discussed in the audio.',
            targetForm:'In the audio call, the engineers are troubleshooting... because...',
            hint:`Listen to the first two turns of the dialogue and check words like "${listeningLayer.catchWords[0].word}" or "${listeningLayer.catchWords[1].word}".`,
            example:`In this stand-up call, the engineers are troubleshooting how ${card.title.toLowerCase()} behaves under real workload and why the current setup created friction.`
          }),
          choice('What does the developer suggest?',card.action,card.contrast.slice(2,4),`Listen to how the developer explains the mechanism and fix.`,{
            openPrompt:`2. Developer's Technical Fix: How does the Developer explain the mechanism of ${card.title.toLowerCase()} and what concrete solution do they propose?`,
            instruction:'Write 1–2 full English sentences explaining the developer’s technical solution.',
            targetForm:'The developer explains that under the hood..., and proposes to...',
            hint:`Listen to the middle turns where the developer uses "${listeningLayer.catchWords[2].word}" and "${listeningLayer.catchWords[3].word}".`,
            example:`The developer explains the internal workflow step by step and proposes a clean fix to remove the bottleneck.`
          }),
          choice('What does the colleague ask about at the end?','A limitation or risk of the approach.',['The person who will approve the next change.','The checks completed before the last release.'],'Listen to the final exchange about verification and trade-offs.',{
            openPrompt:`3. Catch-Word & Guardrail in Context: What final check or safeguard do the speakers agree on at the end of the conversation? Use at least ONE catch-word from the list above in your answer.`,
            instruction:`Write 1–2 full English sentences. Include at least one catch-word (e.g., "${listeningLayer.catchWords[4].word}" or "${listeningLayer.catchWords[5].word}").`,
            targetForm:`At the end of the call, they agree that... is ${listeningLayer.catchWords[5].word} because...`,
            hint:`Check the last two turns of the dialogue and use "${listeningLayer.catchWords[5].word}" or "${listeningLayer.catchWords[4].word}".`,
            example:`At the end of the call, the developer emphasizes that verifying the change in production is crucial so no unexpected side effects appear.`
          })
        ]
      },
      grammar:{
        title:grammar[0],
        explanation:grammar[1],
        nativePatterns:grammarPatterns,
        exercises:grammar[2].map(([prompt,options,correct,explanation],i)=>{
          const pat = grammarPatterns[i] || grammarPatterns[0];
          const targetWord = card.vocabulary[i]?.en || card.vocabulary[0]?.en;
          return {
            id:`${id}-g${i}`,
            prompt:`${card.title} · ${prompt}`,
            options:[...options],
            correct,
            explanation,
            openPrompt:`Task ${i+1} (${pat.label}): Write a complete English sentence about ${card.title.toLowerCase()} using the grammar pattern “${pat.phrase}” and the term “${targetWord}”. Reference pattern: "${prompt.replace('___', options[correct])}"`,
            instruction:`Write 1 full English sentence using the grammar pattern above. Connect the sentence to ${card.title.toLowerCase()}.`,
            targetForm:`${pat.phrase} (e.g., use "${options[correct]}" + "${targetWord}")`,
            hint:`${explanation} Model form: "${prompt.replace('___', options[correct])}".`,
            example:pat.example
          };
        })
      },
      speaking:{
        role,
        scenario:speakingScenario,
        frames:buildSpeakingFrames(week,stage),
        prompt:speakingScenario.task,
        outline:['How does the mechanism work under the hood?','What diagnostic signal or edge case appeared?','What concrete engineering action do we take?','How do we verify the fix in practice?'],
        phrases:buildSpeakingFrames(week,stage).map(f=>f.phrase),
        questions:stage<2?[
          `Walk me through what happens step by step when this ${card.title.toLowerCase()} issue occurs.`,
          `Could you give a concrete technical example of how your fix changes the system behaviour?`,
          `What edge case could still go wrong after your fix, and which metric or log would you inspect?`
        ]:[
          `What is the strongest technical argument in favour of the alternative approach to ${card.title.toLowerCase()}?`,
          `Suppose a senior engineer worries about operational overhead. How would you address that trade-off?`,
          `Which specific production metric or failure threshold would make you reconsider your design?`
        ],
        optionalQuestion:'How would you explain this engineering mechanism clearly to a non-technical clinic manager?',
        model:`${details.summary} In our diagnostic case, ${details.diagContext} To address this, ${card.action} Finally, we verify the outcome because ${details.misconception.charAt(0).toLowerCase()+details.misconception.slice(1)}`,
        retry:'Try the explanation again after reading the feedback. Keep the meaning, improve the wording and use a different example.',
        scenarioId:card.scenarioId,
        code:card.code
      },
      writing:{
        brief:writingBriefObj,
        frames:buildWritingFrames(week,stage),
        prompt:`Write a ${writingFormat} to ${writingRecipient} about ${card.title.toLowerCase()}. ${writingBriefObj.requirements.join(' ')}`,
        minWords:[35,50,80,120][stage],
        targetWords:['35–60','70–110','110–160','150–200'][stage],
        checklist:stage<2?[
          'Make the practical implementation workflow and steps clear.',
          'Explain the concrete command, configuration, or engineering action and why it works.',
          'Include a verification check or architectural guardrail.'
        ]:[
          'Develop a clear architectural position with connected paragraphs and native transitions.',
          'Compare your workflow with a reasonable alternative and address an operational trade-off.',
          'State the exact verification signal or condition that would make you reconsider.'
        ],
        model:`Context & Workflow: ${details.workflowSituation} Implementation Step: ${card.action} Engineering Rationale: ${details.realWorldWhy} Verification & Next Check: ${details.misconception}${stage>=2?' As opposed to '+card.contrast[2].charAt(0).toLowerCase()+card.contrast[2].slice(1)+', this workflow keeps our system predictable under real load, provided that we monitor the outcome after deployment.':''}`
      }
    };
    return presentLesson(learning.englishLesson(lesson),'catalog:'+id);
  }

  const lessons=[];
  SOURCES.forEach((source,week)=>{
    const cards=source.split('\n').map((line,day)=>parse(line,week,day));
    cards.forEach((card,day)=>lessons.push(definition(card,week,day,cards)));
    const sim={...cards[week%5],scene:`A second clinic has joined the project. ${cards[week%5].scene}`,vocabulary:[...cards[0].vocabulary.slice(0,3),...cards[3].vocabulary.slice(0,3)]};
    const checkpoint={...cards[(week+2)%5],scene:`You are covering a colleague's shift on a different project. ${cards[(week+2)%5].scene}`,vocabulary:[...cards[1].vocabulary.slice(0,3),...cards[4].vocabulary.slice(0,3)]};
    lessons.push(definition(sim,week,5,cards,'simulation'),definition(checkpoint,week,6,cards,'checkpoint'));
  });
  function getLesson(id){return lessons.find(lesson=>lesson.id===id)||null;}
  function getScenario(lesson, scenarios=[]){return scenarios.find(s=>s.id===lesson.speaking.scenarioId)||null;}
  export {VERSION,BLOCKS,WEEKS,PROGRESSION,lessons,getLesson,getScenario,presentLesson,refreshSession,learning};
