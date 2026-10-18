# SQL that holds up

A course about what databases promise, where those promises end, and how to find out for yourself.

You can know what a foreign key is and still be surprised when an application saves the wrong owner. You can understand `ROLLBACK` and still be unsure what to do when a payment screen says "Try again."

Those gaps are where this course begins.

We use a fictional clinic because patients, visits, notes, and invoices give us concrete things to reason about. You do not need medical knowledge or access to the original application. Later exercises change the setting so that the ideas travel with you.

**Audience:** programmers new to databases. **Focus:** SQL and PostgreSQL, with backend context when it explains the database's behavior. **Format:** connected articles and separate, resettable labs.

## Choose a way in

- **New to SQL:** start with [Reading the examples](articles/00-reading-the-examples.md), then [What a foreign key actually promises](articles/01-foreign-keys.md).
- **Returning to Module 2:** use the [first learning route](COURSE_MAP.md#the-first-route) and the return notes at the end of each article.
- **Following a particular question:** browse the [concept map](COURSE_MAP.md). A prerequisite is a reasoned suggestion, not a locked gate.
- **Ready to experiment:** choose either setup in the [lab guide](labs/README.md).

## Available drafts

| Article | What you should be able to do afterward |
|---|---|
| [Reading the examples](articles/00-reading-the-examples.md) | Read a small table definition and inspect or change a row. |
| [What a foreign key actually promises](articles/01-foreign-keys.md) | Separate "that row exists" from "that row is suitable." |
| [An existing person can still be the wrong owner](articles/02-business-rules.md) | Explain what an owner-check trigger checks, and what it misses. |
| [Who put that owner on the note?](articles/03-derived-values.md) | Trace a supplied value through a BEFORE trigger. |
| [Deleting a patient with visits](articles/04-deleting-related-rows.md) | Predict rejection, cascading deletion, and clearing a reference. |
| [Can the database wait until I am finished?](articles/05-deferred-checks.md) | Compare immediate and deferred checks with a complete transaction. |
| [The invoice failed. Did its number disappear?](articles/06-transaction-boundaries.md) | Locate a rollback boundary and distinguish it from a missing response. |

These are editorial drafts, not a claim that a complete course has been published. See [verification status](VERIFICATION.md) before treating the labs as release-ready.

## How the course grows

The whole [topic inventory](TOPIC_INVENTORY.md) is mapped, but articles are published as the author learns and verifies them. A planned topic is marked planned. An available article links only to existing files.

Read a worked example, predict a change, run it, and explain the result. In a later article, you meet the idea again in a different problem. Use the [review prompts](REVIEW.md) when returning after a gap.

## Real engineering, with attribution

The course includes short, attributed connections to engineers' own writing. Start with the [source notebook](SOURCES.md): Stripe on retries, Notion on related data, GitHub on database boundaries, and Brandur Leach on deletion and triggers.

The prose in this draft was prepared with AI assistance. Linked engineering accounts retain their authors' voices and credit. The course author should revise examples and explanations after doing the labs; we do not invent personal work experience or claim this draft was written entirely by a human.

## Author materials

[Teaching and editorial guide](AUTHORING.md) · [Repository evidence](REPOSITORY_EVIDENCE.md) · [Publication queue](PUBLICATION.md)

The SQL uses dedicated `course_*` schemas and synthetic data. Use a disposable learning database; the reset scripts remove only their named course schema.

