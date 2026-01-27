-- Drop the existing unique constraint that applies to all cart statuses
DROP INDEX IF EXISTS "carts_user_id_status_key";

-- Create a partial unique index that only applies to active carts
-- This allows multiple converted carts per user while enforcing one active cart
CREATE UNIQUE INDEX "carts_user_id_active_unique" 
ON "carts" ("user_id", "status") 
WHERE "status" = 'active';
