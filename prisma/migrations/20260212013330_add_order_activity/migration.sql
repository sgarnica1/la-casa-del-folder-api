-- CreateEnum
CREATE TYPE "OrderActivityType" AS ENUM ('ORDER_PLACED', 'PAYMENT_CONFIRMED', 'ORDER_READY', 'ORDER_SHIPPED', 'ORDER_DELIVERED', 'STATUS_CHANGED');

-- CreateTable
CREATE TABLE "order_activities" (
    "id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "activity_type" "OrderActivityType" NOT NULL,
    "description" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "order_activities_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "order_activities" ADD CONSTRAINT "order_activities_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
