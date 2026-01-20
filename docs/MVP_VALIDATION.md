🎯 YOUR NEW GOAL (REDEFINED)

Make the existing flow unbreakable, understandable, and confidence-inducing
without changing what the system can do.


WHAT YOU SHOULD DO NEXT (AND ONLY THIS)
1️⃣ UX ENHANCEMENT (NO LOGIC CHANGES)
Allowed UX work

These are presentation-only improvements:

🟢 A. Editor clarity

Clear slot numbering (Month 1 → Month 12)

Empty slot state:

“Add photo for March”

Disabled state after lock is visually obvious

🟢 B. Preview realism

Fixed aspect ratio container

Subtle paper shadow

Margins that match a real calendar

Page/frame separation

Even fake realism massively increases trust.

🟢 C. Progress feedback

Step indicator:

Upload → Arrange → Preview → Lock → Confirm

Clear “you are here”

No logic change. Just UI.

🟢 D. Lock moment UX (CRITICAL)

This is a psychological event, not a button.

Confirmation modal

Explicit warning:

“You won’t be able to edit after this”

Success state:

“Draft locked — ready to order”

This reduces regret and support issues later.


2️⃣ BUG DISCOVERY (INTENTIONAL DESTRUCTION)

This is where quality comes from.

You should actively try to break the system.
🔥 BUG-HUNT CHECKLIST (DO ALL OF THESE)
🔁 Reload tests

Reload at every step:

After upload

After partial assignment

After preview

After lock

Confirm behavior is intentional and explainable

If something resets:

Either persist it

Or explain it clearly in UI

🧨 Concurrency tests

Open same draft in two tabs

Lock in one tab

Try editing in the other

Expected:

One succeeds

One gets 409 Conflict

UI handles it gracefully

🧪 API abuse tests

PATCH locked draft → must fail

POST order twice → must fail

DELETE uploaded image used in order → must fail or be blocked

🔒 Auth abuse

Customer tries to:

View admin dashboard

Access another user’s order

Admin tries to:

Edit drafts

Everything must be blocked server-side.

3️⃣ ERROR UX (VERY IMPORTANT)

Bad UX often comes from good errors shown badly.

Improve:

409 Conflict → human message

403 Forbidden → “You don’t have access”

404 Not found → clear recovery path

Do not hide errors.
Make them understandable.

🚫 ABSOLUTELY DO NOT DO

❌ No new endpoints

❌ No new tables

❌ No cart

❌ No payment

❌ No variants

❌ No templates

❌ No editor features

If you feel “this would be nice” → stop.

WHEN ARE YOU DONE WITH THIS PHASE?

You are done when:

✔ You can’t break the system on purpose
✔ Errors feel intentional, not accidental
✔ A non-technical person can complete the flow
✔ You feel bored, not excited

Boredom = stability.