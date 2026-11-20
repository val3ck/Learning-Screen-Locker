# Postgres Path

A local, practice-first data course for an absolute beginner. It has 37 PostgreSQL lessons across 8 modules, an eight-task storefront project, a workplace checkpoint, and a seven-concept NoSQL track after the SQL path.

## Start on Windows

1. Keep the course files together in this `SQL` folder.
2. Install Node.js LTS from https://nodejs.org if it is not installed.
3. Double-click `START-COURSE.cmd`. On the first run, npm installs the pinned PGlite package; this requires internet access. Keep the console open while studying.
4. Open http://127.0.0.1:4173. If the browser opens before the server is ready, refresh it.

Do not open index.html by double-clicking it. Browser modules, workers, and WebAssembly assets need the local web server. After installing the dependency, the course runs without an internet connection. External documentation links still need internet.

Alternatively, from a terminal in this folder:

```powershell
npm install
npm start
```

The server listens only on loopback (127.0.0.1), not your network interface. Stop it with Ctrl+C. If port 4173 is already occupied, stop your previous course server first. Use the same browser and URL to keep access to the same saved progress.

## Learn by doing

Open **Learning path** to see the course map. The highlighted node is the next recommended exercise. Completing a query or concept lab unlocks the following node; completed nodes remain available for review. **Explore all exercises** opens the whole map when you want to look ahead. Existing saved progress and drafts are preserved when upgrading from the earlier navigation.

Read the explanation, predict the example result, and try the example. Some lessons add a short **Pause & Predict** check: answer it before revealing the reasoning. Write your own query for the challenge, Run it, then Check answer. Use a hint if needed. Study a solution only after trying; reproduce it from memory afterward. Aim for 30–45 minute sessions.

The **Storefront launch** project asks you to build a connected report pack for a shop owner. Part 1 appears after filtering and sorting: missing contacts, reachable cities, a budget shelf, and featured products. Part 2 appears after aggregates: a catalog snapshot, an empty-category inventory value, department summaries, and promotion candidates. The project briefs do not name the SQL clauses to use. Inspect sample rows, draft a query, and check it against both the current and changed shop data. Each task keeps its own draft and completion status. Existing lesson progress is retained.

After part 2 and before Chapter 4, **Support desk: daily handoff** gives you a separate workplace dataset with three tables. Build four reports in one SQL script: an urgent queue, channel workload, staffing, and recurring incidents. Run shows every result set; Check grades each report on two shifts. This reinforces filtering, sorting, grouping, and HAVING before relationships and JOINs. These are multiple tables in one database. Queries across separate PostgreSQL databases are a later, advanced topic.

After the SQL path, **Beyond SQL · NoSQL concepts** adds seven nodes with three decisions each. The scenarios cover document design, key-value stores and caches, graph traversal, wide-column workloads, consistency, and a shop architecture choice. Correct decisions reveal explanations and unlock the next node; selected answers are saved. These are concept labs, not a MongoDB emulator. The SQL lessons and playground continue to run in real PostgreSQL.

1. First steps: tables, SELECT, columns, arithmetic, ordering.
2. Find what matters: WHERE, boolean logic, ranges, ILIKE, NULL, LIMIT.
3. Ask bigger questions: aggregates, GROUP BY, HAVING, CASE.
4. Connect your data: keys, joins, missing matches, line totals, counting.
5. Build a database: CREATE TABLE, identity, constraints, INSERT, UPDATE, DELETE, upserts.
6. Think in queries: subqueries, EXISTS, CTEs, ranks, cumulative windows.
7. PostgreSQL toolkit: dates, casts, JSONB, arrays, indexes, EXPLAIN.
8. Ship with confidence: transactions, views, customer-value and product-performance capstones.

The field guide adds local server setup, a schema-design project, parameterized queries, two-session concurrency practice, backups/restores, and official reference links. This is a beginner-to-intermediate course, not a complete database-administration certification.

## Sandbox behavior

- Real PostgreSQL executes in a Web Worker through PGlite. SQL is not simulated or matched with regular expressions.
- Every Run and Check starts with fresh sample data. Write a complete script for multistep experiments. Playground changes do not persist between runs.
- Run displays the final statement's output in regular lessons. The workplace checkpoint displays all four SELECT results. Use SELECT or RETURNING after writes to inspect data.
- Checks compare reference results on the visible and changed fixtures. They validate column names, values, duplicate counts, and specified ordering. DDL/write lessons inspect state and, for table design, probe key constraints.
- Equivalent queries can pass. The checker does not enforce use of a specific syntax such as WITH, or prove correctness on every possible dataset.
- Long-running queries are limited by statement timeout and a worker watchdog. Restarting the worker discards its database.
- Lesson, project, and concept progress, SQL drafts, and concept choices persist in localStorage in this browser. Completed-step numbers also sync to the local recall tracker configured in `recall-config.json`; drafts and concept choices do not. Export/Import gives you a portable JSON backup. Clearing browser data erases the browser copy of your progress.
- Result tables show up to 200 rows. CSV exports include all returned rows.

Keyboard: Ctrl+Enter (or Cmd+Enter) runs the query; add Shift to check it. Tab inserts two spaces in the editor.

## Tests and verification

```powershell
node test.mjs --static
npm test
```

The static test checks lesson, project, checkpoint, and concept completeness, UI element references, and comparison behavior. The full test requires the PGlite dependency and executes all 45 lesson and storefront reference solutions, then checks the four-report workplace script on two shifts, incorrect-answer rejection, equivalent SQL acceptance, reset behavior, and SQL-error handling.

Current verification: run `npm test` after installing dependencies to verify the SQL path and concept labs.

## Files

- index.html / style.css / app.js: responsive learning interface.
- course.js: lessons, schema, and fresh sample datasets.
- project.js: the eight connected storefront report tasks.
- checkpoint.js: the support-desk fixture and four-report workplace mission.
- concepts.js: the seven NoSQL concept labs and their answer checker.
- engine.js / worker.js: PostgreSQL execution and grading.
- guide.js: practical reference and local-server milestones.
- sample-data.sql: sample dataset for a standalone PostgreSQL database.
- server.mjs: dependency-free local static server.
- test.mjs: course and database verification.

Sources: https://www.postgresql.org/docs/current/tutorial.html and https://pglite.dev/docs/ . Links to deeper official references are included in the field guide. All course explanations and exercises are original.
