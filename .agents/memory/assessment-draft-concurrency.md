---
name: Assessment draft concurrency
description: Concurrency rule for safely resuming an assessment across devices and attempts.
---

Assessment restore, autosave, and submission must serialize on the same application-scoped lock. A save must carry the attempt identity loaded by the client and the last acknowledged draft revision; never infer its target attempt only when the delayed request arrives.

**Why:** A delayed save can otherwise run after another device submits, infer the next attempt from the new attempt count, and restore old answers into that next attempt. An unlocked restore can also return a draft while completion commits concurrently.

**How to apply:** Any future assessment-progress endpoint must re-read terminal state and attempt count after acquiring the shared lock. Reject mismatched attempts and stale revisions, and delete drafts in the same transaction that records submission.