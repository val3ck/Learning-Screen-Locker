// @ts-nocheck
const examples = Object.fromEntries(`project|Our project helps patients book appointments.
user|The user chooses a date and confirms the booking.
feature|This feature sends a reminder before an appointment.
team|Our team includes a developer and a tester.
build|We build tools that help receptionists manage appointments.
build::збірка|The build failed because a dependency was missing.
responsible for|I am responsible for the booking page.
role|My role is to test the new reminder service.
developer|The developer explains how the feature works.
tester|The tester found a problem with the date field.
designer|The designer made the form easier to use.
requirement|One requirement is that users can cancel a booking.
owner|Who is the owner of this service?
feedback|We need feedback from the people who use the app.
deliver|We deliver a small improvement every week.
change|This change makes the booking form shorter.
value|The new feature provides value by saving users time.
improve|We want to improve the confirmation message.
try out|Could you try out the new booking form?
sprint|Our sprint lasts two weeks.
goal|The goal is to make reminders more reliable.
backlog|We put lower-priority requests in the backlog.
estimate|Can you estimate how much work this change needs?
plan|We plan to test the feature with one clinic first.
priority|Fixing the duplicate booking is our highest priority.
task|My next task is to connect the email service.
blocker|Missing test credentials are my current blocker.
access|I need access to the staging environment.
work on|I work on the booking API.
finish|I can finish the change after I get access.
ask for help|Please ask for help if the task is unclear.
repository|The repository contains the application and its tests.
history|The commit history shows when the behaviour changed.
track|We track code changes with Git.
compare|Let's compare the current version with the previous one.
version|This version fixes the timezone problem.
branch|Create a separate branch for the new filter.
separate|Keep the bug fix separate from the colour changes.
merge|We can merge the branch after review.
conflict|There is a conflict because we changed the same line.
update|Please update your branch before running the tests.
switch|I will switch to the release branch.
commit|This commit fixes the date conversion.
message|The commit message explains why the change was needed.
purpose|The purpose of this check is to prevent duplicate bookings.
related|Please keep related changes in the same commit.
split|We should split this pull request into smaller changes.
fix|I will fix the timezone error today.
pull request|The pull request includes a description and test steps.
review|Could you review the cancellation logic?
describe|Please describe the behaviour before and after the change.
reproduce|I can reproduce the bug with this test account.
approve|I can approve the change after the failing test is fixed.
test steps|The test steps show how to cancel an appointment.
suggest|I suggest adding a check before sending the reminder.
concern|My main concern is that this could send the email twice.
duplicate|The second request created a duplicate reminder.
guard|This guard prevents sending the same reminder again.
required|A permission check is required before changing billing settings.
could we|Could we add a test for this case?
operations|The operations team helps us investigate deployment problems.
shared|Reliable releases are a shared responsibility.
automate|We should automate the repeatable deployment steps.
release|The release includes a new reminder feature.
release::звільняти|We must release unused references during cleanup.
manual|The manual deployment step is easy to forget.
repeatable|We need a repeatable process for building the app.
dependency|This dependency requires a newer runtime version.
artifact|The pipeline stores the build artifact for deployment.
source|The database is the source of the cached opening hours.
source::вихідний код|The source code is stored in our repository.
fail|The build will fail if the required setting is missing.
pipeline|The pipeline builds the app and runs the tests.
check|This check verifies the booking date.
integrate|We integrate small changes frequently.
run tests|We run tests before deploying a new version.
failure|The test failure revealed a validation problem.
catch|These tests catch invalid appointment dates.
deployment|The deployment failed because production lacked a setting.
roll back|We can roll back to the previous application version.
setting|This setting controls where reminder emails are sent.
validate|We validate configuration before the service starts.
previous|The previous version did not require this setting.
automatically|The pipeline runs automatically after a push.
environment|Use the test environment for experiments.
staging|We test the release in staging before production.
production|Real customers use the production service.
configuration|Each environment has its own configuration.
test account|Please use a test account instead of a real patient account.
traffic|The service receives more traffic in the morning.
request|The client sends a request for available slots.
response|The server returns a response with the matching appointments.
client|The client displays the result to the user.
server|The server checks whether the selected slot is available.
status code|The status code tells the client how the request was handled.
handle|We need to handle unsuccessful responses.
contract|The API contract describes the expected fields.
field|The response includes a field called appointmentId.
format|The mobile app expects dates in this format.
compatible|The new response must remain compatible with older clients.
consumer|The consumer receives data through a defined interface.
boundary|Validate external data at the system boundary.
sign in|Please sign in again because your session has expired.
identity|The token helps the server verify the user's identity.
session|The session expires after a period of inactivity.
token|Do not send the token to an unrelated service.
expire|Test credentials can expire before the next test run.
permission|This action requires a separate permission.
invalid|The API rejects an invalid booking date.
error message|The error message explains how to correct the input.
retry|You can retry after checking the connection.
explain|Could you explain why this request failed?
detail|One important detail is that the token has expired.
safe|The error response should include a safe explanation.
third-party|We use a third-party provider to send SMS reminders.
timeout|Set a timeout so the request cannot wait forever.
external|The external service may be unavailable.
available|The slot is no longer available.
delay|A network delay made the response arrive late.
depend on|These requests do not depend on each other.
query|This query selects appointments for one doctor.
row|Each row represents an appointment.
column|The starts_at column stores the appointment time.
filter|We filter the records by doctor and date.
record|The record contains the booking identifier.
select|We select only the columns needed by the dashboard.
index|An index can speed up this lookup.
scan|The database may scan the whole table for this query.
lookup|The email lookup became faster after we added an index.
storage|The new index requires additional storage.
write|Each write may also need to update the index.
execution plan|The execution plan shows how the query accesses the data.
transaction|Both changes belong in the same transaction.
lock|The lock prevents a conflicting update while the transaction runs.
constraint|A unique constraint prevents two bookings for the same slot.
reserve|Two users tried to reserve the same appointment.
consistent|The application must keep the booking data consistent.
race condition|The race condition appears when both requests check before updating.
batch|We load the related appointments in one batch.
roundtrip|Each database roundtrip adds some waiting time.
fetch|We fetch all related appointments together.
map|We map each appointment to its patient.
bottleneck|The database became the main bottleneck.
pagination|Pagination lets us load a long history in smaller parts.
cursor|The response includes a cursor for the next page.
offset|A large offset can make this query expensive.
stable|We need a stable ordering for pagination.
order|We order appointments by time and identifier.
next page|Use this cursor to request the next page.
state|The form state includes the selected date.
component|This component displays the available slots.
display|We display a loading message while waiting.
selected|Clear the selected slot when the date changes.
derived|The label is derived from the current form state.
event|A resize event triggers the layout callback.
listener|Remove the listener when the component is no longer used.
callback|The callback updates the displayed size.
cleanup|The cleanup function removes the event listener.
remove|We remove obsolete results from the screen.
reference|The listener keeps a reference to the callback.
debounce|We debounce the search to avoid unnecessary requests.
keystroke|Sending a request after every keystroke creates extra traffic.
search|The search returns patients whose names match the input.
unnecessary|Debouncing reduces unnecessary requests.
wait|We wait briefly after the user stops typing.
cancel|We cancel the obsolete search request.
stale|A stale response must not replace the latest results.
latest|Only show results for the latest request.
replace|Do not replace newer data with an older response.
ignore|We ignore responses that no longer match the current query.
obsolete|The previous request became obsolete when the input changed.
match|The results must match the current search text.
memory|The process uses more memory after each visit.
retain|Long-lived listeners can retain unused objects.
heap|The heap contains objects allocated by the application.
garbage collection|Garbage collection cannot free objects that remain reachable.
inspect|We inspect retained references to investigate the leak.
asynchronous|The asynchronous request does not block the interface while waiting.
await|We await the profile before displaying it.
block|This synchronous operation can block the interface.
loading|Show a loading state while the request is in progress.
result|We display the result after the request completes.
operation|This operation reads data from an external service.
sequential|Sequential requests start one after another.
concurrent|These independent requests can be concurrent.
independent|The profile and schedule requests are independent.
overlap|The requests can overlap while waiting for network responses.
complete|Both requests must complete before we render the summary.
parallelism|CPU parallelism requires suitable execution resources.
concurrency|Unbounded concurrency can exhaust the connection pool.
resource|Every active operation uses a shared resource.
CPU|This calculation uses significant CPU time.
I/O|The service spends most of its time waiting for I/O.
exhaust|Too many open files can exhaust the available file handles.
stream|We use a stream to process a large report.
chunk|The reader sends one chunk at a time.
export|We export the appointments as a CSV file.
process|We process each chunk before writing it.
crash|The process may crash if memory runs out.
transform|We transform each record into a report row.
backpressure|Backpressure prevents the producer from overwhelming the writer.
producer|The producer reads appointment records from the database.
buffer|The buffer grows when the consumer is too slow.
pause|We pause reading until the writer is ready.
keep up|The consumer cannot keep up with the producer.
refactor|We refactor the function without changing its intended behaviour.
behaviour|The test verifies the observable behaviour.
responsibility|Sending an email is a separate responsibility.
preserve|We must preserve the existing cancellation behaviour.
extract|We extract the validation logic into a separate function.
focused|A focused test checks one important assumption.
unit test|A unit test checks the parser in isolation.
integration test|An integration test checks the parser with the real database.
assumption|The test revealed a wrong assumption about date formats.
verify|We verify the result before closing the task.
coverage|High coverage does not guarantee useful tests.
strategy|Each delivery strategy implements the same interface.
interface|The interface defines how a message is sent.
interchangeable|The implementations are interchangeable for the caller.
channel|Email is one delivery channel.
implement|We implement a sender for each supported channel.
complexity|The extra abstraction adds complexity.
trade-off|The main trade-off is simplicity versus independent deployment.
modular|A modular design separates responsibilities within one application.
overhead|Separate services introduce operational overhead.
maintain|A small team must be able to maintain the design.
decision|We document the reason for the architecture decision.
monolith|The monolith is deployed as one application.
microservice|Each microservice owns a clear part of the system.
deploy|We deploy the application after the checks pass.
ownership|Clear ownership helps teams coordinate changes.
coupling|Too much coupling makes independent changes difficult.
latency|The latency of the search request increased.
throughput|The service sustained a throughput of one hundred requests per second.
percentile|The ninety-ninth percentile shows how slow the slowest one percent of requests can be.
measure|We measure response time under realistic traffic.
average|The average hides some very slow requests.
tail latency|Tail latency increased during the traffic burst.
cache|We store opening hours in a cache.
cache miss|A cache miss makes the application load data from the source.
read|We read the current schedule from the database.
invalidate|We invalidate the cached hours after an update.
entry|This cache entry contains the clinic schedule.
expiry|The expiry time limits how long an old value remains cached.
freshness|The freshness requirement determines how old the displayed data may be.
affected|Invalidate only the affected cache entries.
stampede|A cache stampede can overload the database.
in-flight|Several callers can share one in-flight request.
coordinate|We coordinate the reload of a missing value.
share|The waiting callers share the same result.
reload|Only one worker should reload this missing value.
fallback|The fallback displays a safe temporary message.
load|The service handles the expected load.
burst|The traffic burst starts when new slots become available.
capacity|We test capacity under a realistic workload.
resource use|The dashboard shows resource use during the test.
simulate|We simulate the morning traffic burst.
error rate|The error rate increased under heavy load.
cloud|We run the booking service in the cloud.
infrastructure|The infrastructure includes compute, storage and networking.
backup|We keep a backup of the appointment database.
cost|The cost increases when we add more instances.
provision|We provision the resources through an automated process.
manage|Our team must manage the configuration and alerts.
container|The container runs the reminder process.
image|The image includes the application and its runtime dependencies.
runtime|The runtime version must match the application's requirements.
package|We package the application in a container image.
host|The container shares operating-system facilities with its host.
scale|We scale the web service when demand increases.
instance|Each instance handles part of the incoming traffic.
horizontal|Horizontal scaling adds more instances.
vertical|Vertical scaling gives one instance more resources.
saturated|The database remains saturated after adding web instances.
demand|Demand rises when new appointments become available.
rollout|The rollout starts with a small group of users.
canary|The canary receives only a small share of traffic.
monitor|We monitor errors and latency during deployment.
signal|An increase in failed bookings is a useful warning signal.
rollback|The rollback plan explains how to restore the previous version.
edge case|This edge case affects bookings near midnight.
log|The log records the failed request.
metric|This metric counts completed bookings.
trace|A trace connects the work done across services.
correlation|A correlation identifier links related log events.
span|Each span represents part of the traced operation.
diagnose|We diagnose the delay using traces and metrics.
authorisation|Authorisation determines which actions the user may perform.
least privilege|Least privilege gives users only the access they need.
enforce|We enforce permission checks on the server.
protected|This is a protected action that requires permission.
allow|We allow receptionists to view appointment times.
deny|We deny access when the required permission is missing.
injection|Parameterised queries help prevent SQL injection through values.
input|Validate the input before using it.
parameter|The email address is passed as a query parameter.
untrusted|Treat data from an external caller as untrusted.
allowlist|Use an allowlist for supported sort columns.
bind|We bind the input value to a query parameter.
secret|Never put a secret in public source code.
credential|The exposed credential must be revoked.
revoke|We revoke the compromised API key.
rotate|We rotate credentials after an exposure.
expose|An error message must not expose a private token.
reliability|We improve reliability by testing failure and recovery.
recovery|The recovery plan includes a restoration test.
restore|We restore the database in an isolated environment.
outage|The outage lasted until the service recovered.
procedure|The procedure explains who does each recovery step.
incident|The incident affected appointment reminders.
timeline|The timeline shows what happened before the failure.
root cause|We investigate the root cause instead of guessing.
safeguard|A configuration check is one useful safeguard.
follow-up|Each follow-up action needs an owner.
contribute|Several missing checks can contribute to an incident.
replica|The replica may receive an update later than the primary.
consistency|The operation requires a clear consistency guarantee.
propagate|Updates take time to propagate between replicas.
guarantee|We must understand what the consistency guarantee covers.
observe|Two clients may observe different versions during replication.
backoff|Backoff increases the wait between retry attempts.
jitter|Jitter adds variation to retry timing.
transient|A transient network error may disappear on a later attempt.
bounded|Use a bounded number of retries.
overload|Immediate retries can make the overload worse.
idempotent|An idempotent handler avoids repeating the business effect.
webhook|The provider may send the same webhook more than once.
deduplicate|We deduplicate events using a stable identifier.
identifier|Each event has a unique identifier.
atomic|The state change and outbox insert must be atomic.
effect|A duplicate event must not create a second payment effect.
outbox|The transaction writes an event to the outbox.
publish|A worker will publish the pending event.
worker|The worker retries publication after a temporary failure.
delivery|The delivery may happen more than once.
circuit breaker|The circuit breaker stops calls to a failing dependency.
threshold|The error threshold controls when the circuit opens.
probe|A limited probe checks whether the dependency has recovered.
recover|The service can recover after the external failure ends.`.split('\n').map(line=>{const separator=line.indexOf('|');return[line.slice(0,separator),line.slice(separator+1)];}));
export default examples;
