🛒 Shopping Cart — Scope Definition (Simple, Stupid, Functional)
🎯 Goal of the Cart (VERY IMPORTANT)

The cart exists to:

Let a user group drafts they want to buy

Confirm what will be ordered

Act as the bridge to payment

Freeze intent, not pricing logic complexity

It is not:

A promo engine

A discount system

A wishlist

A multi-shipping flow

A pricing sandbox

✅ Core Principles

One cart per user

Only locked drafts can be added

Cart is ephemeral (can change until checkout)

Orders are immutable (cart disappears after order)

📦 What is a Cart Item?

A cart item represents:

“I want to buy this locked draft, with this product, at this price.”

Minimal data:

draft snapshot reference

product info

quantity (default = 1)

price snapshot

🧱 Cart States

You only need one state:

ACTIVE

Once checkout happens:

Cart is converted into an order

Cart is cleared or archived


🧩 Backend Scope (Minimal)
Data Model

You need 2 new tables (or models):

cart

id

user_id

status (ACTIVE)

created_at

updated_at

cart_item

id

cart_id

draft_id (must be LOCKED)

product_id

quantity

unit_price (snapshot)

created_at

💡 Price snapshot now = future-proofing.

Invariants (non-negotiable)

These are your “this can never happen” rules:

❌ Draft in EDITING cannot be added to cart

❌ Draft already ORDERED cannot be added again

❌ Draft cannot exist twice in the same cart

❌ Cart items cannot be edited except:

quantity

removal

✅ Order creation only reads from cart

Backend Endpoints (Boring & Clean)
Cart
GET    /cart
POST   /cart/items
PATCH  /cart/items/:id
DELETE /cart/items/:id
POST   /cart/checkout


That’s it. No more.

Endpoint Behavior Summary
GET /cart

Returns:

cart

items

computed total (backend-calculated)

POST /cart/items

Input:

draftId

Backend:

validates ownership

validates draft is LOCKED

snapshots price

adds item

PATCH /cart/items/:id

Only allows quantity change

POST /cart/checkout

validates cart not empty

creates order from cart items

locks everything

clears cart

🎨 Frontend Scope (Minimal UX)
Cart Page /carrito

Show:

List of items

product name

draft title

preview thumbnail

quantity

price

Total

CTA: Confirmar pedido

Entry Points

Button: “Agregar al carrito”

visible only if draft is LOCKED

🚫 Explicitly Out of Scope (for now)

Say this confidently if asked:

Coupons / discounts

Shipping options

Multiple carts

Inventory

Taxes

Partial checkout

Saved carts across devices