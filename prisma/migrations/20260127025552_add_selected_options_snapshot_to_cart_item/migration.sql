/*
  Warnings:

  - A unique constraint covering the columns `[cart_id,draft_id]` on the table `cart_items` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[user_id,status]` on the table `carts` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `product_id` to the `cart_items` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "cart_items" ADD COLUMN     "product_id" TEXT NOT NULL,
ADD COLUMN     "selected_options_snapshot" JSONB,
ALTER COLUMN "quantity" SET DEFAULT 1;

-- CreateIndex
CREATE UNIQUE INDEX "cart_items_cart_id_draft_id_key" ON "cart_items"("cart_id", "draft_id");

-- CreateIndex
CREATE UNIQUE INDEX "carts_user_id_status_key" ON "carts"("user_id", "status");

-- AddForeignKey
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
