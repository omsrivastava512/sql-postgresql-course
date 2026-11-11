# Why did my saved price disappear?

North sells Breakfast Tea for ₹20. Two members of staff open the price editor before lunch. One has approval to raise the price to ₹22. The other has a promotion sheet with ₹19 on it. The first saves and sees ₹22. The second returns to the still-open editor and saves ₹19. Both get a success message. Which of them decided to replace ₹22?

Neither saw that choice. PostgreSQL carried out two perfectly valid changes to the same offer. The database could check that each price was nonnegative. It had no way to infer from a bare new price that the person had made their decision while looking at ₹20. In [lab 30](../labs/30-conflicting-edits/README.md) you'll send that missing piece of information with the edit and watch the outcome change.

## What did the editor see?

A [worked example for Forge SQL](https://www.atlassian.com/blog/development/reliable-data-storage-using-optimistic-locking-in-forge-sql) by Vasyl Zakharchenko starts with two people editing a release checklist. Each saw a copy before the other's changes were visible to them. The demonstration carries the timestamp from the original read into the eventual update and lets a person reload when it no longer matches. Forge uses TiDB. Our North shop is fictional and the PostgreSQL exercise uses an integer version so you can follow each change on paper.

The shop gives its offer a stable ID. It also stores a version that starts at 1. The ID answers “which offer?” and the version answers “which edit of that offer did I see?” The editor keeps both when the person opens the form. Each successful save advances the version, including a change back to a previously used price. A test that only compares the old price would miss two intervening edits that took ₹20 to ₹22 and back to ₹20.

| Event | Price on North's row | Version on North's row |
|---|---:|---:|
| Both people read | ₹20 | 1 |
| First save against version 1 | ₹22 | 2 |
| Second save against version 1 | Predict it | Predict it |

## Make the decision inside the write

Here is the first person's save, with the amount in paise. The caller binds the ID, the version from the form and the proposed price in a real application.

```sql
UPDATE course_edit.offers
SET price_paise = 2200, version = version + 1
WHERE offer_id = 1 AND version = 1
RETURNING price_paise, version;
```

The statement returns 2200 and 2. The second person submits the same predicate with a different proposed amount. This time there is no qualifying row, so the statement returns an empty result. Inspect North again. It still has 2200 and version 2. South's separate offer still has its original price. A second SELECT checking version 1 followed by an unconditional UPDATE would recreate the original gap between checking and acting.

At PostgreSQL Read Committed, a competing update may wait for the first writer. If that writer commits, PostgreSQL checks the waiting update's condition on the updated row. A committed version change therefore matters even when both saves arrive close together. The numbered lab schedule lets you see the wait and the final empty result. [PostgreSQL 17 transaction isolation](https://www.postgresql.org/docs/17/transaction-iso.html#XACT-READ-COMMITTED)

## Who decides what happens next?

An empty result tells the caller exactly how many rows it changed. It takes another read to learn whether the offer currently exists. In the lab North is present and shows a newer version. A lookup for an unknown ID also returns no updated rows, but there is no current offer for the editor to display. A fresh read describes the state at the time of that read. Another save can still occur before the person responds.

Show the person their proposed price beside the current one. They might keep ₹22, or they might confirm that the promotion should replace it. Only that second decision supplies a reason to submit a new edit against version 2. Automatically fetching a newer version and submitting the original price would turn the warning back into a silent overwrite. The mechanism depends on every price writer advancing the version. A separate import that changes prices without advancing it would break the agreement.

This pattern is called optimistic concurrency control. It fits the interval during which a person may leave a form open for hours. In [competing claims](16-competing-claims.md) the database could decide immediately whether stock remained. Here the database can reject an outdated premise, but the promotion decision belongs to someone at the shop.

**Return after a gap.** East and West both use workshop code 7. Decide what identifies the listing and what identifies the revision of that listing. Try the fee edit in the lab, then explain why adding a version alone cannot make a missing centre predicate safe. Continue to [stock transfers](31-lock-order.md) for an operation that needs two resources at once.
