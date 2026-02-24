-- Cast column to text to remove enum dependency
ALTER TABLE "orders" ALTER COLUMN "order_status" TYPE text;

-- Migrate any 'received' data to 'delivered'
UPDATE "orders" SET "order_status" = 'delivered' WHERE "order_status" = 'received';

-- Drop old enum and recreate without 'received', with 'delivered'
DROP TYPE "OrderStatus";
CREATE TYPE "OrderStatus" AS ENUM ('new', 'in_production', 'ready', 'shipped', 'delivered', 'cancelled', 'refunded');

-- Cast column back to the new enum
ALTER TABLE "orders" ALTER COLUMN "order_status" TYPE "OrderStatus" USING ("order_status"::"OrderStatus");

-- Remove ORDER_RECEIVED from OrderActivityType if it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_enum 
    WHERE enumlabel = 'ORDER_RECEIVED' 
    AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'OrderActivityType')
  ) THEN
    -- Cast to text, drop old, recreate without ORDER_RECEIVED
    ALTER TABLE "order_activities" ALTER COLUMN "activity_type" TYPE text;
    DELETE FROM "order_activities" WHERE "activity_type" = 'ORDER_RECEIVED';
    DROP TYPE "OrderActivityType";
    CREATE TYPE "OrderActivityType" AS ENUM ('ORDER_PLACED', 'PAYMENT_CONFIRMED', 'ORDER_IN_PRODUCTION', 'ORDER_READY', 'ORDER_SHIPPED', 'ORDER_DELIVERED', 'STATUS_CHANGED', 'ORDER_CANCELLED', 'ORDER_REFUNDED');
    ALTER TABLE "order_activities" ALTER COLUMN "activity_type" TYPE "OrderActivityType" USING ("activity_type"::"OrderActivityType");
  END IF;
END $$;
