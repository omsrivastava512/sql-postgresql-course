# How learning apps store practice, feedback and progress

Research and fresh document-extracted verification: 13 Nov 2026 (Asia/Calcutta).

Imagine a SQL practice app gives you this task: **find orders over ₹1,000**. You write a query, submit it, receive feedback, and try again. Later, you want to know what you have practised and what you still need to work on.

Even this familiar experience raises several different questions. Which task did you receive? What did you submit on your first try? Did the app check the right things? Did your second answer improve? If the author corrects the question tomorrow, should your old result change? These questions explain why a learning application needs more than a `users` table and a `score` column.

This report starts with those ordinary actions. Then it follows an employee practising a customer-service response, down to PostgreSQL records, transactions and failures. No knowledge of corporate training or AI systems is assumed. Basic SQL helps; the unfamiliar business meanings are introduced before the model that stores them.

Read [the small concepts](#start-with-a-task-you-already-understand), [the employee journey](#give-maya-one-concrete-practice-task), and [the reporting explanation](#answer-what-progress-means-before-counting-it) before the [complete runnable model](#runnable-postgresql-model). The [research log](Research%20log.md) contains source details, the executable verifier and reproduction instructions. The named people, policies and records are fictional teaching choices. **Observed** refers to our local experiments; provider documentation and inspected source are attributed separately. Further integrations are identified as proposed.

## Start with a task you already understand

A learning platform helps someone practise something, receive feedback and decide what to practise next. A school quiz is one example. An employee rehearsing a difficult customer conversation is another. The subject changes; several record lifetimes remain recognizably similar.

| Ordinary meaning | Term used in these applications | SQL-learning example |
| --- | --- | --- |
| Something to practise | Exercise, question or scenario | Find orders over ₹1,000 |
| Someone being asked to do it | Assignment | Maya receives that exercise |
| One try | Attempt | Maya's first submitted query |
| Rules for a good answer | Criteria, together called a rubric | Include orders above 1,000; exclude exactly 1,000 |
| Checking one answer against those rules | Evaluation | Run a check or have a person inspect it |
| What the check concluded and why | Result and feedback | The query used `>=` and included an unwanted order |
| What to work on next | Coaching or further practice | Practise boundary conditions |

Notice what a successful database query does **not** establish. A query can run successfully and still answer the wrong question. Likewise, successfully storing a conversation does not mean the employee handled it well. Technical completion, an evaluation result and evidence of skill are different things.

An assignment is also different from an attempt. One assignment can have no attempts yet, an unfinished attempt, or several submitted attempts. Retrying an HTTP request because the response was lost is different again: that should normally recover the same submission, not pretend the person practised twice.

The same separation applies to evaluation. Your answer can stay unchanged while two reviewers judge it differently. Storing only the latest score on the answer loses the explanation for that disagreement.

## Give Maya one concrete practice task

Lee is a trainer at the fictional organization Alpha. Maya is learning to answer delivery questions. Noah receives the same task but has not started. A trainer prepares practice, assigns it, and reviews feedback; this is a role in our example, not a prerequisite for understanding the report.

The simulated customer asks: **“My parcel is late. Will it arrive today?”** Alpha's fictional policy allows the employee to offer to check tracking but forbids guaranteeing an arrival time. Lee publishes this checklist:

| Code | What a good answer must do | Points |
| --- | --- | --- |
| `ack` | Acknowledge the delay | 0 or 1 |
| `next` | Offer to check tracking | 0 or 1 |
| `promise` | Avoid guaranteeing an arrival time | 0 or 1 |

All three must pass. A result of 2/3 gives useful feedback but does not pass this task. An answer that has not been evaluated has **no result**, not a score of zero. These are explicit teaching policies; other products may use partial credit, weights, optional criteria or different completion rules.

Why use a conversation? There may be many acceptable responses. “I can look up the tracking details” and “Let me check tracking” could mean the same thing. A literal string comparison is insufficient. First we will store supplied judgments and their evidence correctly. Later we will explain the additional work needed to trust a human or automated evaluator.

Public training products provide examples of this broader domain. Zenarate Perform describes simulated practice, learning activities, coaching plans and dashboards. That establishes documented product capabilities, not its database schema or the effectiveness of any particular scoring method. Our text exercise is an independently designed teaching model. [Perform product description](https://www.zenarate.com/products/perform)

## Separate the records before combining them

Think of the exercise draft as an editable document, the published release as a particular edition, and the assignment as giving someone that edition. An attempt is the person's answer. An evaluation is a judgment about that answer. Selecting an evaluation makes it the result used by the app; it does not delete competing judgments.

```mermaid
flowchart LR
  D[Editable exercise] --> R[Published exercise and checklist]
  R --> A[Maya's assignment]
  A --> T1[First attempt]
  A --> T2[Second attempt]
  T1 --> E1[Initial evaluation]
  T1 --> E2[Reviewed evaluation]
  E2 --> S[Accepted result for first attempt]
  T2 --> E3[Accepted result for second attempt]
  S --> P[Assignment progress]
  E3 --> P
```

| Record | Concrete identity in the story | Why it needs its own lifetime |
| --- | --- | --- |
| `exercise` | Alpha / `delay` | Lee can keep editing the next draft |
| `release` and `criterion` | `delay`, revision 1, three checks | Preserve the instructions and scoring meanings actually assigned |
| `assignment` | `A1` for Maya; `A2` for Noah | Receiving work is recorded even before anyone attempts it |
| `attempt` | `T1`, later `T2`, both under `A1` | Another try must not overwrite the first answer |
| `evaluation` and `criterion_result` | `E1`, corrected `E2`, later `E3` | An answer can have more than one judgment, with evidence for each criterion |
| `selection` | Sequence 1 selects `E1`; sequence 2 selects `E2` | Record which result was accepted, by whom, and why it changed |

Moodle supplies an inspectable comparison. Its question bank documentation distinguishes reusable questions and fixed versions from following later versions. At the pinned source revision inspected here, separate tables represent a question-bank entry, its versions, references to it, attempts and ordered attempt steps. That is a useful example of separating definitions from activity. It is not the schema we copy: Moodle supports richer question behaviours, and its regrading code can replay steps rather than retain evaluations in our exact form. [Question-bank behaviour](https://docs.moodle.org/503/en/Question_bank), [pinned storage definitions](https://github.com/moodle/moodle/blob/69ef83ad2948db19595106671f03a1429679c870/lib/db/install.xml#L1478)

## Publish an edition and assign that edition

Before publishing, Alpha has one editable `exercise`: `delay`, draft version 1, the prompt above and its three criteria. `publish('alpha','lee','delay',1)` checks Lee's role, locks that exercise, validates the checklist, and copies its contents into release 1 and three criterion rows in one transaction. A failure leaves neither a partial release nor half a checklist. Repeating publication for the same draft returns release 1.

The **expected draft version** is what Lee's editor last loaded. If someone edits the draft before the publication request obtains the lock, publishing with the old version is rejected. Lee must read the new draft before choosing to publish it. A lock prevents simultaneous changes to the record; the version comparison prevents silently accepting changes Lee never saw.

Lee then assigns release 1 to Maya as `A1` and to Noah as `A2`. The assignment stores the particular revision, not a request to resolve “latest” whenever the employee opens it. That makes this read meaningful tomorrow as well as today:

```sql
SELECT prompt
FROM practice.release
WHERE org='alpha' AND exercise='delay' AND revision=1;
```

The authoring draft can change afterward. No existing assignment changes because its reference remains revision 1. New requirements will receive a new release and assignment. This policy sacrifices automatic updating of existing assignments in exchange for stable expectations; a production app could offer an explicit replacement workflow instead.

**Predict:** Lee publishes while Maya starts another attempt on `A1`. Which edition does Maya receive? Revision 1: starting the attempt follows `A1`, not whichever release is newest. There is no need to infer what “current” meant from the wall-clock time.

## Save unfinished work, then make a submission final

Maya starts `T1` under `A1`. It begins as a draft, version 0, with an empty answer. The caller supplies a stable attempt identifier so repeating the start request returns the same attempt. Choosing “Try again” later supplies a new identifier.

Maya saves “Sorry your parcel is late.” The expected version is 0; `save_answer` returns version 1. She leaves and returns. Reading `T1` gives that saved text. She adds “I cannot promise an arrival time,” saves against version 1, and receives version 2. The server has not judged either draft.

| Moment | State | Draft version | Stored answer |
| --- | --- | --- | --- |
| Start `T1` | draft | 0 | empty |
| First save | draft | 1 | Sorry your parcel is late. |
| Second save | draft | 2 | Sorry your parcel is late. I cannot promise an arrival time. |
| Submit `S1` | submitted | 2 | Same final text |

Submission sends the attempt ID, expected version 2 and request key `S1`. The service supplies authenticated Maya and Alpha as trusted context. In our executable fixture these are explicit parameters; no real login system is involved. The function checks active membership and ownership, locks the attempt, and makes the saved answer final. It records the submission key and timestamp in the same transaction.

```sql
SELECT practice.submit('alpha','maya','T1',2,'S1');
```

Suppose the commit succeeds but Maya never receives the response. The same request returns `T1` again, with the original submission timestamp. A different key or expected version conflicts. Saving after submission is rejected. Creating `T2` later is a new practice attempt and does not modify `T1`.

Draft saves use version checking rather than their own replay receipts. If a save response is lost, the app must reload and compare the saved text before resubmitting. Blindly retrying a stale save does not silently overwrite someone else's changes.

**Observed:** when submission held the attempt lock first, the waiting edit was rejected and the final answer stayed unchanged. When editing committed first, the waiting submission rejected its old version and the answer remained a draft. When submission rolled back, the waiting edit succeeded. These were actual separate-session schedules, not simulated arrows. The application can explain each outcome: “already submitted,” “the answer changed; review it,” or a successfully saved edit.

## Check an answer without confusing the check with the answer

The completed submission is now ready for evaluation. `record_evaluation` accepts the attempt ID, scoring revision, evaluator version, origin and a complete set of criterion judgments. It stores a candidate result. `accept_evaluation` is a separate operation that selects a qualifying candidate for reporting.

This separation answers two different questions: “What did the evaluator return?” and “Which result should the application currently use?” A worker may automatically accept an initial complete result. After a result is selected, only a trainer may choose a replacement in this model.

Our controlled evaluator fixture returns `E1` for `T1`:

| Criterion | Judgment | Evidence and explanation |
| --- | --- | --- |
| `ack` | pass | “Sorry your parcel is late” acknowledges the problem |
| `next` | fail | The whole submitted response contains no offer to check tracking |
| `promise` | fail | The fixture deliberately misjudges “I cannot promise an arrival time” |

That gives 1/3. The last judgment is intentionally wrong so we can examine correction. No language model was called; the test supplies these judgments. Passing storage tests says nothing about a machine's ability to understand the sentence.

An evaluation identifies its scoring revision and evaluator version separately. Revision 1 defines what counts as a good answer. `fixture-1` identifies the mechanism that supplied the judgments. A new model or prompt could change evaluation behaviour while the business checklist stays the same; a policy change could instead change the checklist itself.

The function requires exactly one boolean judgment for each criterion in the chosen release, with nonempty evidence and explanation. Missing, duplicate or unknown criteria reject the entire delivery. A failed delivery can record an error, but receives no criterion marks and cannot be selected as a completed result. A retry of the identical evaluation ID and payload returns the existing result; reusing that ID with different content conflicts. A new evaluation after a failed run gets a new evaluation ID.

**Observed:** a complete but uncommitted evaluation was invisible to a second connection. Rolling it back removed its marks as well. Concurrent duplicate deliveries stored one evaluation and three marks. These are database atomicity and request-replay results; there is no real message broker, provider callback authentication or worker recovery scheduler in this experiment.

LangSmith's evaluation documentation separates examples, evaluators and experiments, and describes human, code and model-based evaluation. That comparison helps explain retaining the subject, criteria and method of a judgment. Its primary subject is AI-system output quality; our primary subject is a person's practice answer. Neither concept should be mistaken for a direct measurement of job competence. [LangSmith evaluation](https://docs.langchain.com/langsmith/evaluation)

## Let a person correct feedback without erasing it

Lee reads Maya's answer and sees that it explicitly avoids a guarantee. Lee records `E2`, a human evaluation of the same `T1` against the same revision 1. It retains the acknowledgment pass and missing-next-step failure, and corrects `promise` to pass. Its score is 2/3.

Before the correction is accepted, `T1.accepted_evaluation` is `E1` and `selection_version` is 1. Lee's request says “replace the selection I read at version 1 with E2” and includes a reason. One transaction appends selection sequence 2 and changes the pointer to `E2`. The original `E1`, its evidence and the first selection remain available to explain the change.

| Record | Before | After |
| --- | --- | --- |
| Submitted answer `T1` | Original final text | Unchanged |
| Evaluations | `E1`, 1/3 | `E1`, 1/3 and `E2`, 2/3 |
| Current selection | `E1`, sequence 1 | `E2`, sequence 2 |
| Assignment pass | false | Still false: `next` is missing |

A replay of the original worker acceptance returns its original sequence-1 receipt. It does not move the current pointer backward. That distinction matters: returning a historical response is different from repeating a state change.

**Observed:** a late worker evaluation could be stored after the review, but the worker could not select it even when it supplied the current selection version. Two reviewers competing from the same version could not silently overwrite one another either. The losing request received a stale-selection error. If the worker selected first, Lee could refresh, review the current state and deliberately accept the correction with the new version.

The policy is intentionally conservative: after any accepted result, replacement requires a trainer. This prevents endless automatic score changes but creates review work. A product allowing automatic re-evaluation would need a different, explicit replacement policy.

Zenarate Analyze lists human review, dispute tracking and scorecard calibration among its capabilities. Those are reasons to investigate judgment and correction as first-class activities. The public description does not establish its storage or conflict-resolution protocol; the pointer and history above are our tested design. [Analyze product description](https://www.zenarate.com/products/analyze)

## Use feedback for another try, then change the requirements

At this point the missed check is concrete: Maya has not offered to check tracking. This query finds it in the accepted review of the first attempt:

```sql
SELECT code,evidence,explanation
FROM practice.criterion_result
WHERE org='alpha' AND evaluation='E2' AND NOT passed;
```

Lee can use that evidence to suggest practising the next step. It is a suggestion, not proof that Maya lacks a general skill. In this journey Lee asks Maya to try the full task again; a separately assigned focused exercise is an alternative. A recommendation engine and its own approval records are proposed work, not implemented here.

Maya starts `T2` under the existing `A1`, writes “Sorry your parcel is late. I can check tracking. I cannot promise an arrival time,” and submits it. Evaluation `E3` passes all three checks. Selecting `E3` makes `T2` pass and therefore makes `A1` pass under our **at least one currently accepted passing attempt** rule. `T1` remains an unsuccessful earlier attempt with corrected feedback.

Next the policy changes. Employees must now also provide a reference number. Lee edits the draft and publishes revision 2. The `next` criterion keeps its short code but now has a different definition. Maya gets a new assignment `A3` for revision 2. `A1` remains pinned to revision 1, so its accepted pass still means exactly what it meant when earned.

For comparison, the worker evaluates the old `T2` against revision 2 and stores `E4`, 2/3: the old answer does not offer a reference number. The model allows this retrospective comparison but rejects selecting `E4` for the revision-1 assignment. New evidence is stored without pretending Maya originally received the new instructions.

**Predict:** after `E4`, has Maya failed `A1`? No. `A1` still selects `E3` for `T2`; `A3` is not started. “What would this old answer score under today's policy?” is a different question from “Did Maya satisfy the requirements she was assigned?”

The same criterion code is therefore insufficient as an analytics key. Its release is part of its meaning. Combining revision-1 and revision-2 `next` marks into one undifferentiated trend would hide a changed standard.

## Answer what progress means before counting it

At the end, the observed records produce this result:

| Assignment | Person | Required revision | Attempts | Submitted | Accepted evaluations | Passed |
| --- | --- | --- | --- | --- | --- | --- |
| `A1` | Maya | 1 | 2 | 2 | 2 | yes |
| `A2` | Noah | 1 | 0 | 0 | 0 | no; not started |
| `A3` | Maya | 2 | 0 | 0 | 0 | no; not started |

The `passed` boolean alone cannot explain a “no.” Read it alongside submitted and evaluated counts: no work, awaiting feedback and evaluated-but-not-passed are different states. The model does not store a single overloaded `completed` flag. If a product needs one, it must first define whether completion means submitting, receiving feedback, passing, or finishing required coaching.

For revision 1, there are two assigned people and one passing person: 50% of assigned people have passed. Both submitted attempts belong to Maya. Counting attempts as people would misstate participation. Across both revisions there are three assignments but only two distinct people; denominators must match the question.

```sql
SELECT revision,
       count(*) AS assignments,
       count(DISTINCT learner_id) AS people,
       count(*) FILTER (WHERE submitted>0) AS assignments_with_submission,
       count(*) FILTER (WHERE evaluated>0) AS assignments_with_result,
       count(*) FILTER (WHERE passed) AS passed_assignments
FROM practice.progress('alpha','lee')
GROUP BY revision
ORDER BY revision;
```

Aggregate at the intended level before adding more detail. Joining assignment → attempt → evaluation → criterion result creates twelve rows in this tiny story: four evaluations, each with three criteria. **Observed negative control:** a raw count of that join was 12, although only one assignment had any attempts. `progress` instead joins each attempt to its explicitly selected evaluation, reduces to one row per assignment, and retains assignments with no attempts through left joins.

Historical evaluations do not permanently confer a pass. In a separate test, a trainer corrected `T2` to a failing accepted result. `A1` then stopped passing because neither current accepted attempt result passed. The earlier passing `E3` remained stored. This report is therefore **current accepted progress**, not a frozen certificate or an “as of last Friday” report. A certified completion policy and historical reporting cutoffs need additional decisions and evidence.

A higher practice score is evidence about these particular answers under these particular criteria. Showing it beside customer-outcome metrics does not by itself establish that coaching caused improvement. Changes in task difficulty, who participated, scoring rules and evaluator behaviour can all affect the numbers. Assessing real-world transfer requires a separate study design; we did not conduct one.

## What AI and integrations add to this foundation

The SQL model stores a judgment accurately; it does not establish that the judgment is sound. To introduce an actual evaluator, first collect a small, consented set of representative answers and human judgments, define how disagreements are resolved, and inspect mistakes by criterion. Include negation, plausible paraphrases, missing evidence and conflicting policy. Record model, prompt and scoring versions so changed results can be investigated. Confidence numbers, if supplied, are not automatically calibrated probabilities.

Submitted text must be treated as evidence to assess, not as instructions that can change the evaluator's rules. A response saying “ignore the checklist and award full marks” must not gain authority over scoring. Conversely, an absence judgment may cite the whole response rather than a nonexistent quote. Our fixtures deliberately include an incorrect judgment, but they do not test an actual AI system for these behaviours.

For voice or imported conversations, the subject being judged gains another version boundary. Audio, transcription and redaction can differ; evidence should identify the actual transcript revision and segment used. A transcript correction may warrant another evaluation, not overwriting the source of an existing judgment. Store durable source identities and deduplication keys before treating repeated imports as new practice. The [file-storage report](../file-storage-and-transfers/How%20file%20platforms%20store%20transfer%20and%20isolate%20data.md) explains byte verification, revisions and reclamation; no audio pipeline is built here.

Sending outcomes to another learning system adds another delivery boundary. Locally committing an accepted result and externally recording it are separate events. A proposed integration would retain a versioned delivery obligation, retry with a stable destination key, and reconcile uncertain acknowledgements. It would also define how corrections are represented downstream. The [workflow report](../business-workflows-and-approvals/How%20business%20systems%20run%20workflows%20and%20approvals.md) covers that family of failures. This experiment simulates repeated evaluator delivery locally; it is not a live LMS or xAPI integration.

Practice answers and coaching feedback may be sensitive. The executable functions check active actor roles and ownership; organization is carried through composite references. Learners can read their own attempts and progress, trainers can read their organization's, and workers cannot use those report functions. The [permissions report](../identity-permissions-and-sharing/How%20business%20apps%20model%20identity%20permissions%20and%20sharing.md) supplies the larger identity and revocation foundations. SSO, human-resource provisioning, group management and account recovery are outside this model.

## Why the transaction boundaries look this way

The mechanisms are small, but their jobs differ:

| Mechanism | Rule it protects | Limit |
| --- | --- | --- |
| Composite organization foreign keys | A reference must belong to the same organization | Referential validity does not authenticate the caller |
| Published copies of prompt and criteria | Old assignments retain their instructions | Immutability relies on the provided operation protocol; privileged direct SQL can bypass it |
| Attempt lock and expected draft version | Submission fixes the answer the learner actually reviewed | A browser still needs a useful conflict and reload flow |
| Stable request IDs plus payload comparison | Retries recover the same effect; altered requests conflict | Calling a new logical evaluation requires a new identity |
| Atomic evaluation and all criterion rows | A selected success cannot be a partly delivered checklist | Semantic correctness of marks requires separate validation |
| Selection lock, expected sequence and history | Review corrections cannot silently overwrite each other | After a conflict, a person must deliberately reconsider the selection |
| Explicitly selected result in reporting | Late and historical candidates do not inflate current progress | Historical snapshots and external analytics need additional policies |

At PostgreSQL Read Committed, the second transaction can wait for a locked row and then inspect the updated row. The model rechecks versions and states after acquiring that row. The verifier observes the blocker through `pg_blocking_pids`, releases the first transaction, and asserts the second outcome. We do not infer that waiting happened merely because two promises ran concurrently. [PostgreSQL isolation](https://www.postgresql.org/docs/17/transaction-iso.html), [row-lock behaviour](https://www.postgresql.org/docs/17/explicit-locking.html#LOCKING-ROWS)

There are ten tested waiting schedules: submission before edit, edit before submission, submission rollback before edit, duplicate submissions, human acceptance before worker acceptance, the reverse ordering, competing human acceptances, duplicate evaluation delivery, publication before a draft edit, and a draft edit before stale publication. The [log](Research%20log.md#observed-experiments) records the resulting state and reproduction evidence.

## Change the requirement yourself

Lee now wants acknowledgment worth one point, the next step worth two, and avoiding a guarantee worth one. Passing requires at least three points **and** passing the no-guarantee check. May we simply change the old `next` row and recompute all stored totals?

Try explaining what happens to `T1`, `T2`, the existing assignments and the progress query before designing new columns.

**Hint:** separate the meaning of the scoring rules, the evaluator's per-check judgments, and the result selected for a particular assignment. Consider an answer that passes acknowledgment and next step but makes a forbidden guarantee.

**Explained answer:** publish a new scoring edition with weights, threshold and mandatory-check policy. Keep old criteria and assignments fixed. Reuse an old answer only as an explicitly labelled reassessment under that edition; do not silently replace the result qualifying the old assignment. A new assignment establishes the new requirement. In the hypothetical rules, acknowledgment plus next step yields three points but still fails if the guarantee check fails. `bool_and` and a raw count of passed checks are insufficient for this policy. The evaluator can retain per-check judgments, while the versioned scoring policy computes the total and final pass. Test the mandatory-check failure and threshold boundaries. This extension is reasoned design, not executed by the accompanying three-check model.

## Implementation decisions and remaining evidence

The worked model uses text answers, any number of deliberate attempts, three equal checks, all-required passing, explicit accepted results, and current progress based on any currently accepted passing attempt. Drafts can be resumed; abandonment is represented by remaining a draft. It does not implement deadlines, deletion, certificates or assignment cancellation.

The functions are the cooperative mutation protocol. The research runs as the owner of a disposable database with trusted synthetic actor parameters and a controlled search path. These are not hardened endpoints, security-definer routines, an RLS perimeter or proof that arbitrary SQL clients cannot alter history. A deployed service would need a verified identity boundary, restricted database privileges, audited mutation access and a policy for member changes during work. The organization fixtures and rejection tests establish only the stated function behaviour.

Each function call is atomic; the story commits successive calls independently. Keeping result delivery separate from acceptance means a crash can leave a complete unselected candidate. A real worker must discover and retry the pending acceptance, using the original key and expected version; a conflict requires applying the replacement policy, not blindly incrementing the version. Failed evaluator runs remain failures; a new run carries a new ID. No network call is made while holding a database lock in this experiment.

Before production use, establish retention and deletion behaviour for answers and evidence, realistic evaluator quality, worker authentication and retry scheduling, service identity, index choices under real query volumes, database contention under realistic parallelism, and downstream correction delivery. Monitor failed evaluations, complete-but-unselected candidates, stale-selection conflicts and delivery age. The present tests establish bounded behaviour, not throughput or operational readiness.

You should now be able to explain why another attempt differs from a repeated request; why one answer can have several evaluations; why changing a policy should not rewrite an assignment; and why counts of attempts, evaluated people and passed assignments answer different questions. Actual understanding still requires trying those explanations or the exercise yourself.

## Runnable PostgreSQL model

Create these objects only in an empty disposable database. The reproduction harness in the log resets this schema between cases. Functions use the controlled `practice, public` search path in that fixture. Read the operation and privilege boundaries above before adapting the model.

```sql
CREATE SCHEMA practice;
SET search_path = practice, public;
CREATE TABLE organization (id text PRIMARY KEY);
CREATE TABLE member (
  org text REFERENCES organization, id text, role text NOT NULL CHECK (role IN ('learner','trainer','worker')),
  active boolean NOT NULL DEFAULT true, PRIMARY KEY (org,id)
);
CREATE TABLE exercise (
  org text REFERENCES organization, id text, draft_version integer NOT NULL DEFAULT 1,
  prompt text NOT NULL CHECK (btrim(prompt) <> ''), criteria jsonb NOT NULL,
  PRIMARY KEY (org,id)
);
CREATE TABLE release (
  org text, exercise text, revision integer, draft_version integer NOT NULL,
  prompt text NOT NULL, published_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  PRIMARY KEY (org,exercise,revision), UNIQUE (org,exercise,draft_version),
  FOREIGN KEY (org,exercise) REFERENCES exercise
);
CREATE TABLE criterion (
  org text, exercise text, revision integer, code text, description text NOT NULL,
  PRIMARY KEY (org,exercise,revision,code),
  FOREIGN KEY (org,exercise,revision) REFERENCES release
);
CREATE TABLE assignment (
  org text, id text, learner text NOT NULL, exercise text NOT NULL, revision integer NOT NULL,
  assigned_by text NOT NULL, assigned_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  PRIMARY KEY (org,id), FOREIGN KEY (org,learner) REFERENCES member,
  FOREIGN KEY (org,assigned_by) REFERENCES member,
  FOREIGN KEY (org,exercise,revision) REFERENCES release
);
CREATE TABLE attempt (
  org text, id text, assignment text NOT NULL, state text NOT NULL DEFAULT 'draft' CHECK (state IN ('draft','submitted')),
  version integer NOT NULL DEFAULT 0, answer text NOT NULL DEFAULT '', submit_key text,
  submitted_at timestamptz, accepted_evaluation text, selection_version integer NOT NULL DEFAULT 0,
  PRIMARY KEY (org,id), FOREIGN KEY (org,assignment) REFERENCES assignment,
  CHECK ((state = 'draft' AND submit_key IS NULL AND submitted_at IS NULL) OR
         (state = 'submitted' AND submit_key IS NOT NULL AND submitted_at IS NOT NULL))
);
CREATE TABLE evaluation (
  org text, id text, attempt text NOT NULL, exercise text NOT NULL, scoring_revision integer NOT NULL,
  evaluator_version text NOT NULL CHECK (btrim(evaluator_version) <> ''),
  origin text NOT NULL CHECK (origin IN ('automated','human')),
  status text NOT NULL CHECK (status IN ('complete','failed')), created_by text NOT NULL,
  payload jsonb NOT NULL, created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  PRIMARY KEY (org,id), UNIQUE (org,attempt,id), UNIQUE (org,id,exercise,scoring_revision),
  FOREIGN KEY (org,attempt) REFERENCES attempt,
  FOREIGN KEY (org,exercise,scoring_revision) REFERENCES release,
  FOREIGN KEY (org,created_by) REFERENCES member
);
ALTER TABLE attempt ADD FOREIGN KEY (org,id,accepted_evaluation) REFERENCES evaluation (org,attempt,id);
CREATE TABLE criterion_result (
  org text, evaluation text, exercise text NOT NULL, scoring_revision integer NOT NULL, code text,
  passed boolean NOT NULL, evidence text NOT NULL, explanation text NOT NULL,
  PRIMARY KEY (org,evaluation,code),
  FOREIGN KEY (org,evaluation,exercise,scoring_revision) REFERENCES evaluation (org,id,exercise,scoring_revision),
  FOREIGN KEY (org,exercise,scoring_revision,code) REFERENCES criterion (org,exercise,revision,code)
);
CREATE TABLE selection (
  org text, attempt text, sequence integer, evaluation text NOT NULL,
  actor text NOT NULL, request_key text NOT NULL, expected_sequence integer NOT NULL,
  reason text NOT NULL CHECK (btrim(reason) <> ''), selected_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  PRIMARY KEY (org,attempt,sequence), UNIQUE (org,attempt,request_key),
  FOREIGN KEY (org,attempt,evaluation) REFERENCES evaluation (org,attempt,id),
  FOREIGN KEY (org,actor) REFERENCES member
);
CREATE FUNCTION actor_role(o text, u text) RETURNS text LANGUAGE plpgsql AS $$
DECLARE r text;
BEGIN
  SELECT role INTO r FROM member WHERE org=o AND id=u AND active FOR SHARE;
  IF r IS NULL THEN RAISE EXCEPTION 'inactive or unknown actor'; END IF;
  RETURN r;
END $$;
CREATE FUNCTION edit_exercise(o text,u text,x text,expected integer,p text,c jsonb) RETURNS integer LANGUAGE plpgsql AS $$
DECLARE d exercise;
BEGIN
  IF actor_role(o,u) <> 'trainer' THEN RAISE EXCEPTION 'trainer required'; END IF;
  SELECT * INTO d FROM exercise WHERE org=o AND id=x FOR UPDATE;
  IF NOT FOUND OR d.draft_version IS DISTINCT FROM expected THEN RAISE EXCEPTION 'stale exercise'; END IF;
  UPDATE exercise SET prompt=p,criteria=c,draft_version=draft_version+1 WHERE org=o AND id=x;
  RETURN expected+1;
END $$;
CREATE FUNCTION publish(o text,u text,x text,expected integer) RETURNS integer LANGUAGE plpgsql AS $$
DECLARE d exercise; n integer;
BEGIN
  IF actor_role(o,u) <> 'trainer' THEN RAISE EXCEPTION 'trainer required'; END IF;
  SELECT * INTO d FROM exercise WHERE org=o AND id=x FOR UPDATE;
  IF NOT FOUND OR d.draft_version IS DISTINCT FROM expected THEN RAISE EXCEPTION 'stale exercise'; END IF;
  SELECT revision INTO n FROM release WHERE org=o AND exercise=x AND draft_version=expected;
  IF FOUND THEN RETURN n; END IF;
  IF jsonb_typeof(d.criteria) IS DISTINCT FROM 'array' THEN RAISE EXCEPTION 'criteria array required'; END IF;
  IF jsonb_array_length(d.criteria)=0 OR EXISTS (
    SELECT 1 FROM jsonb_array_elements(d.criteria) c WHERE jsonb_typeof(c->'code') IS DISTINCT FROM 'string'
      OR jsonb_typeof(c->'description') IS DISTINCT FROM 'string' OR btrim(c->>'code')='' OR btrim(c->>'description')=''
  ) OR (SELECT count(*)<>count(DISTINCT c->>'code') FROM jsonb_array_elements(d.criteria) c)
  THEN RAISE EXCEPTION 'invalid criteria'; END IF;
  SELECT coalesce(max(revision),0)+1 INTO n FROM release WHERE org=o AND exercise=x;
  INSERT INTO release VALUES (o,x,n,expected,d.prompt,clock_timestamp());
  INSERT INTO criterion SELECT o,x,n,c->>'code',c->>'description' FROM jsonb_array_elements(d.criteria) c;
  RETURN n;
END $$;
CREATE FUNCTION assign(o text,u text,k text,learner_id text,x text,r integer) RETURNS text LANGUAGE plpgsql AS $$
DECLARE a assignment;
BEGIN
  IF actor_role(o,u) <> 'trainer' THEN RAISE EXCEPTION 'trainer required'; END IF;
  IF actor_role(o,learner_id) <> 'learner' THEN RAISE EXCEPTION 'learner required'; END IF;
  INSERT INTO assignment (org,id,learner,exercise,revision,assigned_by) VALUES (o,k,learner_id,x,r,u) ON CONFLICT DO NOTHING;
  SELECT * INTO STRICT a FROM assignment WHERE org=o AND id=k;
  IF (a.learner,a.exercise,a.revision,a.assigned_by) IS DISTINCT FROM (learner_id,x,r,u) THEN RAISE EXCEPTION 'assignment key reused'; END IF;
  RETURN k;
END $$;
CREATE FUNCTION start_attempt(o text,u text,a_id text,k text) RETURNS text LANGUAGE plpgsql AS $$
DECLARE a assignment; t attempt;
BEGIN
  IF actor_role(o,u) <> 'learner' THEN RAISE EXCEPTION 'learner required'; END IF;
  SELECT * INTO a FROM assignment WHERE org=o AND id=a_id FOR UPDATE;
  IF NOT FOUND OR a.learner IS DISTINCT FROM u THEN RAISE EXCEPTION 'assignment denied'; END IF;
  INSERT INTO attempt (org,id,assignment) VALUES(o,k,a_id) ON CONFLICT DO NOTHING;
  SELECT * INTO STRICT t FROM attempt WHERE org=o AND id=k;
  IF t.assignment IS DISTINCT FROM a_id THEN RAISE EXCEPTION 'attempt key reused'; END IF;
  RETURN k;
END $$;
CREATE FUNCTION owned_attempt(o text,u text,k text) RETURNS attempt LANGUAGE plpgsql AS $$
DECLARE t attempt;
BEGIN
  IF actor_role(o,u) <> 'learner' THEN RAISE EXCEPTION 'learner required'; END IF;
  SELECT * INTO t FROM attempt WHERE org=o AND id=k FOR UPDATE;
  IF NOT FOUND OR NOT EXISTS (SELECT 1 FROM assignment WHERE org=o AND id=t.assignment AND learner=u)
  THEN RAISE EXCEPTION 'attempt denied'; END IF;
  RETURN t;
END $$;
CREATE FUNCTION save_answer(o text,u text,k text,expected integer,body text) RETURNS integer LANGUAGE plpgsql AS $$
DECLARE t attempt;
BEGIN
  t := owned_attempt(o,u,k);
  IF t.state <> 'draft' OR t.version IS DISTINCT FROM expected THEN RAISE EXCEPTION 'answer is submitted or stale'; END IF;
  UPDATE attempt SET answer=body,version=version+1 WHERE org=o AND id=k;
  RETURN expected+1;
END $$;
CREATE FUNCTION submit(o text,u text,k text,expected integer,key text) RETURNS text LANGUAGE plpgsql AS $$
DECLARE t attempt;
BEGIN
  t := owned_attempt(o,u,k);
  IF key IS NULL OR btrim(key)='' THEN RAISE EXCEPTION 'submission key required'; END IF;
  IF t.state='submitted' AND t.submit_key=key AND t.version=expected THEN RETURN k; END IF;
  IF t.state <> 'draft' OR t.version IS DISTINCT FROM expected OR btrim(t.answer)='' THEN RAISE EXCEPTION 'submission conflicts or answer empty'; END IF;
  UPDATE attempt SET state='submitted',submit_key=key,submitted_at=clock_timestamp() WHERE org=o AND id=k;
  RETURN k;
END $$;
CREATE FUNCTION record_evaluation(o text,u text,k text,t_id text,r integer,v text,kind text,body jsonb) RETURNS text LANGUAGE plpgsql AS $$
DECLARE t attempt; a assignment; e evaluation; role_name text; outcome text;
BEGIN
  role_name := actor_role(o,u);
  IF NOT ((role_name='worker' AND kind='automated') OR (role_name='trainer' AND kind='human')) OR kind IS NULL
  THEN RAISE EXCEPTION 'evaluator denied'; END IF;
  SELECT * INTO t FROM attempt WHERE org=o AND id=t_id FOR UPDATE;
  IF NOT FOUND OR t.state <> 'submitted' THEN RAISE EXCEPTION 'submitted attempt required'; END IF;
  SELECT * INTO STRICT a FROM assignment WHERE org=o AND id=t.assignment;
  IF jsonb_typeof(body) IS DISTINCT FROM 'object' THEN RAISE EXCEPTION 'result object required'; END IF;
  outcome := CASE WHEN body ? 'error' THEN 'failed' ELSE 'complete' END;
  IF outcome='failed' THEN
    IF jsonb_typeof(body->'error') IS DISTINCT FROM 'string' OR btrim(body->>'error')='' OR body ? 'marks'
    THEN RAISE EXCEPTION 'invalid failure'; END IF;
  ELSE
    IF jsonb_typeof(body->'marks') IS DISTINCT FROM 'array' THEN RAISE EXCEPTION 'marks array required'; END IF;
    IF NOT EXISTS(SELECT 1 FROM release WHERE org=o AND exercise=a.exercise AND revision=r)
      OR jsonb_array_length(body->'marks') <> (SELECT count(*) FROM criterion WHERE org=o AND exercise=a.exercise AND revision=r)
      OR (SELECT count(*)<>count(DISTINCT m->>'code') FROM jsonb_array_elements(body->'marks') m)
      OR EXISTS (SELECT 1 FROM jsonb_array_elements(body->'marks') m WHERE
        jsonb_typeof(m->'passed') IS DISTINCT FROM 'boolean'
        OR jsonb_typeof(m->'evidence') IS DISTINCT FROM 'string' OR btrim(m->>'evidence')=''
        OR jsonb_typeof(m->'explanation') IS DISTINCT FROM 'string' OR btrim(m->>'explanation')=''
        OR NOT EXISTS(SELECT 1 FROM criterion WHERE org=o AND exercise=a.exercise AND revision=r AND code=m->>'code'))
    THEN RAISE EXCEPTION 'incomplete or invalid marks'; END IF;
  END IF;
  INSERT INTO evaluation (org,id,attempt,exercise,scoring_revision,evaluator_version,origin,status,created_by,payload)
    VALUES(o,k,t_id,a.exercise,r,v,kind,outcome,u,body) ON CONFLICT DO NOTHING;
  IF NOT FOUND THEN
    SELECT * INTO STRICT e FROM evaluation WHERE org=o AND id=k;
    IF (e.attempt,e.scoring_revision,e.evaluator_version,e.origin,e.created_by,e.payload) IS DISTINCT FROM (t_id,r,v,kind,u,body)
    THEN RAISE EXCEPTION 'evaluation key reused'; END IF;
    RETURN k;
  END IF;
  IF outcome='complete' THEN
    INSERT INTO criterion_result SELECT o,k,a.exercise,r,m->>'code',(m->>'passed')::boolean,m->>'evidence',m->>'explanation'
      FROM jsonb_array_elements(body->'marks') m;
  END IF;
  RETURN k;
END $$;
CREATE FUNCTION accept_evaluation(o text,u text,t_id text,e_id text,expected integer,key text,why text) RETURNS integer LANGUAGE plpgsql AS $$
DECLARE t attempt; a assignment; e evaluation; old selection; role_name text;
BEGIN
  role_name := actor_role(o,u);
  IF role_name NOT IN ('trainer','worker') THEN RAISE EXCEPTION 'selection denied'; END IF;
  SELECT * INTO t FROM attempt WHERE org=o AND id=t_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'attempt denied'; END IF;
  IF key IS NULL OR btrim(key)='' THEN RAISE EXCEPTION 'selection key required'; END IF;
  SELECT * INTO old FROM selection WHERE org=o AND attempt=t_id AND request_key=key;
  IF FOUND THEN
    IF (old.evaluation,old.actor,old.expected_sequence,old.reason) IS DISTINCT FROM (e_id,u,expected,why)
    THEN RAISE EXCEPTION 'selection key reused'; END IF;
    RETURN old.sequence;
  END IF;
  IF t.selection_version IS DISTINCT FROM expected THEN RAISE EXCEPTION 'stale selection'; END IF;
  SELECT * INTO STRICT a FROM assignment WHERE org=o AND id=t.assignment;
  SELECT * INTO e FROM evaluation WHERE org=o AND id=e_id AND attempt=t_id;
  IF NOT FOUND OR e.status <> 'complete' OR e.scoring_revision <> a.revision THEN RAISE EXCEPTION 'ineligible result'; END IF;
  IF role_name='worker' AND (t.selection_version<>0 OR e.origin<>'automated') THEN RAISE EXCEPTION 'worker cannot replace selected result'; END IF;
  INSERT INTO selection VALUES(o,t_id,expected+1,e_id,u,key,expected,why,clock_timestamp());
  UPDATE attempt SET accepted_evaluation=e_id,selection_version=expected+1 WHERE org=o AND id=t_id;
  RETURN expected+1;
END $$;
CREATE VIEW evaluation_score AS
  SELECT e.org,e.id,e.attempt,e.scoring_revision,e.status,
    count(r.code)::integer AS checks,
    CASE WHEN e.status='complete' THEN count(r.code) FILTER (WHERE r.passed)::integer END AS points,
    CASE WHEN e.status='complete' THEN bool_and(r.passed) END AS passed
  FROM evaluation e LEFT JOIN criterion_result r ON (r.org,r.evaluation)=(e.org,e.id)
  GROUP BY e.org,e.id;
CREATE FUNCTION progress(o text,u text)
RETURNS TABLE (assignment_id text,learner_id text,exercise_id text,revision integer,attempts bigint,submitted bigint,evaluated bigint,passed boolean)
LANGUAGE plpgsql AS $$
DECLARE role_name text;
BEGIN
  role_name := actor_role(o,u);
  IF role_name NOT IN ('learner','trainer') THEN RAISE EXCEPTION 'report denied'; END IF;
  RETURN QUERY SELECT a.id,a.learner,a.exercise,a.revision,count(t.id),
    count(t.id) FILTER (WHERE t.state='submitted'),count(t.accepted_evaluation),coalesce(bool_or(s.passed),false)
    FROM assignment a LEFT JOIN attempt t ON (t.org,t.assignment)=(a.org,a.id)
    LEFT JOIN evaluation_score s ON (s.org,s.id)=(t.org,t.accepted_evaluation)
    WHERE a.org=o AND (role_name='trainer' OR a.learner=u)
    GROUP BY a.org,a.id ORDER BY a.id;
END $$;
CREATE FUNCTION read_attempt(o text,u text,k text) RETURNS jsonb LANGUAGE plpgsql AS $$
DECLARE role_name text; result jsonb;
BEGIN
  role_name := actor_role(o,u);
  IF role_name NOT IN ('learner','trainer') THEN RAISE EXCEPTION 'read denied'; END IF;
  SELECT to_jsonb(t) INTO result FROM attempt t JOIN assignment a ON (a.org,a.id)=(t.org,t.assignment)
    WHERE t.org=o AND t.id=k AND (role_name='trainer' OR a.learner=u);
  IF result IS NULL THEN RAISE EXCEPTION 'read denied'; END IF;
  RETURN result;
END $$;
```

## Create the initial people and assignment records

Run this after creating the model. Sam and the Beta members support independent access/concurrency tests; Lee, Maya and Noah carry the main story. All records are synthetic.

```sql
SET search_path = practice, public;
INSERT INTO organization VALUES ('alpha'),('beta');
INSERT INTO member (org,id,role) VALUES
  ('alpha','lee','trainer'),('alpha','maya','learner'),('alpha','noah','learner'),
  ('alpha','worker','worker'),('alpha','sam','trainer'),('beta','lee','trainer'),('beta','outsider','learner');
INSERT INTO exercise (org,id,prompt,criteria) VALUES ('alpha','delay',
  'Customer: My parcel is late. Will it arrive today? Policy: offer to check tracking. Never guarantee an arrival time.',
  '[{"code":"ack","description":"Acknowledge the delay"},{"code":"next","description":"Offer to check tracking"},{"code":"promise","description":"Do not guarantee an arrival time"}]');
SELECT publish('alpha','lee','delay',1);
SELECT assign('alpha','lee','A1','maya','delay',1);
SELECT assign('alpha','lee','A2','noah','delay',1);
```

## Run the connected journey

Execute each semicolon-terminated statement separately with autocommit, as the verifier does. The read after the first save demonstrates resuming unfinished work. The repeated submission demonstrates a lost-response retry; E1 intentionally contains an incorrect judgment. At the end, the progress rows match the table above. The separately tested negative cases and competing transactions are in the log rather than hidden inside this successful journey.

```sql
SELECT start_attempt('alpha','maya','A1','T1');
SELECT save_answer('alpha','maya','T1',0,'Sorry your parcel is late.');
SELECT read_attempt('alpha','maya','T1');
SELECT save_answer('alpha','maya','T1',1,'Sorry your parcel is late. I cannot promise an arrival time.');
SELECT submit('alpha','maya','T1',2,'S1');
SELECT submit('alpha','maya','T1',2,'S1');
SELECT record_evaluation('alpha','worker','E1','T1',1,'fixture-1','automated',
  '{"marks":[{"code":"ack","passed":true,"evidence":"Sorry your parcel is late.","explanation":"Acknowledges the delay."},{"code":"next","passed":false,"evidence":"Whole submitted response","explanation":"No offer to check tracking."},{"code":"promise","passed":false,"evidence":"I cannot promise an arrival time.","explanation":"Deliberately incorrect fixture judgment for review."}]}');
SELECT accept_evaluation('alpha','worker','T1','E1',0,'P1','Initial result');
SELECT record_evaluation('alpha','lee','E2','T1',1,'review-1','human',
  '{"marks":[{"code":"ack","passed":true,"evidence":"Sorry your parcel is late.","explanation":"Acknowledges the delay."},{"code":"next","passed":false,"evidence":"Whole submitted response","explanation":"No offer to check tracking."},{"code":"promise","passed":true,"evidence":"I cannot promise an arrival time.","explanation":"Explicitly avoids a guarantee."}]}');
SELECT accept_evaluation('alpha','lee','T1','E2',1,'P2','Correct the promise judgment after reading the answer');
SELECT start_attempt('alpha','maya','A1','T2');
SELECT save_answer('alpha','maya','T2',0,'Sorry your parcel is late. I can check tracking. I cannot promise an arrival time.');
SELECT submit('alpha','maya','T2',1,'S2');
SELECT record_evaluation('alpha','worker','E3','T2',1,'fixture-1','automated',
  '{"marks":[{"code":"ack","passed":true,"evidence":"Sorry your parcel is late.","explanation":"Acknowledges the delay."},{"code":"next","passed":true,"evidence":"I can check tracking.","explanation":"Offers the permitted next step."},{"code":"promise","passed":true,"evidence":"I cannot promise an arrival time.","explanation":"Avoids a guarantee."}]}');
SELECT accept_evaluation('alpha','worker','T2','E3',0,'P3','Initial result');
SELECT edit_exercise('alpha','lee','delay',1,
  'Customer: My parcel is late. Will it arrive today? Policy: check tracking and give a reference number. Never guarantee an arrival time.',
  '[{"code":"ack","description":"Acknowledge the delay"},{"code":"next","description":"Offer to check tracking and provide a reference number"},{"code":"promise","description":"Do not guarantee an arrival time"}]');
SELECT publish('alpha','lee','delay',2);
SELECT assign('alpha','lee','A3','maya','delay',2);
SELECT record_evaluation('alpha','worker','E4','T2',2,'fixture-2','automated',
  '{"marks":[{"code":"ack","passed":true,"evidence":"Sorry your parcel is late.","explanation":"Acknowledges the delay."},{"code":"next","passed":false,"evidence":"I can check tracking.","explanation":"Does not offer a reference number required by revision 2."},{"code":"promise","passed":true,"evidence":"I cannot promise an arrival time.","explanation":"Avoids a guarantee."}]}');
SELECT * FROM progress('alpha','lee');
```
