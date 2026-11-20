// A separate workplace dataset for the checkpoint before JOINs.
export const helpdeskSchema=[
 ['tickets','Customer requests',[['id','integer · PK'],['subject','text'],['channel','text'],['status','text'],['priority','integer · 1–4'],['estimated_minutes','integer']]],
 ['agents','Support staff',[['id','integer · PK'],['name','text'],['team','text'],['active','boolean'],['capacity','integer']]],
 ['incidents','Service problems',[['id','integer · PK'],['service','text'],['severity','text'],['status','text']]]
];

export function helpdeskSeed(variant=false){return `
CREATE TABLE tickets(id integer PRIMARY KEY,subject text NOT NULL,channel text NOT NULL,status text NOT NULL,priority integer NOT NULL,estimated_minutes integer NOT NULL);
CREATE TABLE agents(id integer PRIMARY KEY,name text NOT NULL,team text NOT NULL,active boolean NOT NULL,capacity integer NOT NULL);
CREATE TABLE incidents(id integer PRIMARY KEY,service text NOT NULL,severity text NOT NULL,status text NOT NULL);
INSERT INTO tickets VALUES
(1,'Login fails','email','open',4,45),(2,'Invoice copy','email','closed',1,10),
(3,'Slow checkout','chat','open',3,30),(4,'Address change','chat','open',1,15),
(5,'Refund request','email','open',3,40),(6,'Password reset','phone','closed',2,12),
(7,'Payment declined','phone','open',4,50),(8,'Delivery question','chat','open',2,20),
(9,'Coupon issue','email','closed',2,18),(10,'Account locked','phone','open',3,25);
INSERT INTO agents VALUES
(1,'Mira','Billing',true,6),(2,'Denys','Billing',true,5),
(3,'Oksana','Technical',true,7),(4,'Roman','Technical',true,4),
(5,'Iryna','Technical',false,4),(6,'Petro','Logistics',true,5);
INSERT INTO incidents VALUES
(1,'Checkout','high','open'),(2,'Login','high','open'),(3,'Checkout','medium','closed'),
(4,'Checkout','high','closed'),(5,'Search','low','open'),(6,'Login','medium','open'),
(7,'Payments','high','open'),(8,'Payments','high','closed');
${variant?`UPDATE tickets SET status='closed' WHERE id=1; UPDATE tickets SET priority=4 WHERE id=8;
INSERT INTO tickets VALUES (11,'Duplicate charge','phone','open',4,55),(12,'Shipping label','email','open',2,22);
UPDATE agents SET active=false WHERE id=2; INSERT INTO agents VALUES(7,'Sofia','Logistics',true,6);
INSERT INTO incidents VALUES(9,'Search','high','open'),(10,'Search','high','open');`:''}
`;}

export const checkpoint={
 module:11,kind:'checkpoint',fixture:'helpdesk',
 title:'Support desk: daily handoff',
 concept:'You joined a support team during a busy shift. The lead needs one handoff pack from three tables: tickets, agents, and incidents. Write four SELECT statements in one script, in the requested order. Each result is checked separately on today\'s data and a changed shift. You do not need JOIN yet.',
 example:'SELECT * FROM tickets LIMIT 5;',
 task:'1. Urgent queue: return id, subject, priority for open tickets with priority at least 3. Sort by priority descending, then id ascending.\n\n2. Channel load: return channel and open_tickets (the count of open tickets) for every channel with open tickets. Sort by open_tickets descending, then channel ascending.\n\n3. Staffing: return team and available_agents (the count of active agents) for teams with at least two active agents. Sort by team ascending.\n\n4. Recurring incidents: among high-severity incidents, return service and incident_count for services with at least two such incidents. Sort by incident_count descending, then service ascending.',
 hint:'Write four separate SELECT statements, each ending with a semicolon. WHERE filters rows before GROUP BY; HAVING filters groups after COUNT(*). Run the full script to inspect all four reports.',
 solution:`SELECT id, subject, priority
FROM tickets
WHERE status='open' AND priority>=3
ORDER BY priority DESC, id;

SELECT channel, COUNT(*) AS open_tickets
FROM tickets
WHERE status='open'
GROUP BY channel
ORDER BY open_tickets DESC, channel;

SELECT team, COUNT(*) AS available_agents
FROM agents
WHERE active=true
GROUP BY team
HAVING COUNT(*)>=2
ORDER BY team;

SELECT service, COUNT(*) AS incident_count
FROM incidents
WHERE severity='high'
GROUP BY service
HAVING COUNT(*)>=2
ORDER BY incident_count DESC, service;`,
 reports:['Urgent queue','Channel load','Staffing','Recurring incidents'],
 orderedReports:[true,true,true,true]
};
