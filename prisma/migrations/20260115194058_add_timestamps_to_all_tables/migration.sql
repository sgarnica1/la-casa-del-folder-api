-- Add columns as nullable first
ALTER TABLE "cart_items" ADD COLUMN "created_at" TIMESTAMP(3);
ALTER TABLE "cart_items" ADD COLUMN "updated_at" TIMESTAMP(3);

ALTER TABLE "carts" ADD COLUMN "updated_at" TIMESTAMP(3);

ALTER TABLE "draft_layout_item_images" ADD COLUMN "created_at" TIMESTAMP(3);
ALTER TABLE "draft_layout_item_images" ADD COLUMN "updated_at" TIMESTAMP(3);

ALTER TABLE "draft_layout_items" ADD COLUMN "created_at" TIMESTAMP(3);
ALTER TABLE "draft_layout_items" ADD COLUMN "updated_at" TIMESTAMP(3);

ALTER TABLE "draft_selected_options" ADD COLUMN "created_at" TIMESTAMP(3);
ALTER TABLE "draft_selected_options" ADD COLUMN "updated_at" TIMESTAMP(3);

ALTER TABLE "order_items" ADD COLUMN "created_at" TIMESTAMP(3);
ALTER TABLE "order_items" ADD COLUMN "updated_at" TIMESTAMP(3);

ALTER TABLE "orders" ADD COLUMN "updated_at" TIMESTAMP(3);

ALTER TABLE "product_categories" ADD COLUMN "created_at" TIMESTAMP(3);
ALTER TABLE "product_categories" ADD COLUMN "updated_at" TIMESTAMP(3);

ALTER TABLE "product_images" ADD COLUMN "created_at" TIMESTAMP(3);
ALTER TABLE "product_images" ADD COLUMN "updated_at" TIMESTAMP(3);

ALTER TABLE "product_option_types" ADD COLUMN "created_at" TIMESTAMP(3);
ALTER TABLE "product_option_types" ADD COLUMN "updated_at" TIMESTAMP(3);

ALTER TABLE "product_option_values" ADD COLUMN "created_at" TIMESTAMP(3);
ALTER TABLE "product_option_values" ADD COLUMN "updated_at" TIMESTAMP(3);

ALTER TABLE "product_templates" ADD COLUMN "created_at" TIMESTAMP(3);
ALTER TABLE "product_templates" ADD COLUMN "updated_at" TIMESTAMP(3);

ALTER TABLE "products" ADD COLUMN "created_at" TIMESTAMP(3);
ALTER TABLE "products" ADD COLUMN "updated_at" TIMESTAMP(3);

ALTER TABLE "template_layout_items" ADD COLUMN "created_at" TIMESTAMP(3);
ALTER TABLE "template_layout_items" ADD COLUMN "updated_at" TIMESTAMP(3);

ALTER TABLE "uploaded_images" ADD COLUMN "updated_at" TIMESTAMP(3);

ALTER TABLE "user_addresses" ADD COLUMN "updated_at" TIMESTAMP(3);

ALTER TABLE "users" ADD COLUMN "updated_at" TIMESTAMP(3);

-- Update existing rows with current timestamp
UPDATE "cart_items" SET "created_at" = CURRENT_TIMESTAMP, "updated_at" = CURRENT_TIMESTAMP WHERE "created_at" IS NULL OR "updated_at" IS NULL;
UPDATE "carts" SET "updated_at" = CURRENT_TIMESTAMP WHERE "updated_at" IS NULL;
UPDATE "draft_layout_item_images" SET "created_at" = CURRENT_TIMESTAMP, "updated_at" = CURRENT_TIMESTAMP WHERE "created_at" IS NULL OR "updated_at" IS NULL;
UPDATE "draft_layout_items" SET "created_at" = CURRENT_TIMESTAMP, "updated_at" = CURRENT_TIMESTAMP WHERE "created_at" IS NULL OR "updated_at" IS NULL;
UPDATE "draft_selected_options" SET "created_at" = CURRENT_TIMESTAMP, "updated_at" = CURRENT_TIMESTAMP WHERE "created_at" IS NULL OR "updated_at" IS NULL;
UPDATE "order_items" SET "created_at" = CURRENT_TIMESTAMP, "updated_at" = CURRENT_TIMESTAMP WHERE "created_at" IS NULL OR "updated_at" IS NULL;
UPDATE "orders" SET "updated_at" = CURRENT_TIMESTAMP WHERE "updated_at" IS NULL;
UPDATE "product_categories" SET "created_at" = CURRENT_TIMESTAMP, "updated_at" = CURRENT_TIMESTAMP WHERE "created_at" IS NULL OR "updated_at" IS NULL;
UPDATE "product_images" SET "created_at" = CURRENT_TIMESTAMP, "updated_at" = CURRENT_TIMESTAMP WHERE "created_at" IS NULL OR "updated_at" IS NULL;
UPDATE "product_option_types" SET "created_at" = CURRENT_TIMESTAMP, "updated_at" = CURRENT_TIMESTAMP WHERE "created_at" IS NULL OR "updated_at" IS NULL;
UPDATE "product_option_values" SET "created_at" = CURRENT_TIMESTAMP, "updated_at" = CURRENT_TIMESTAMP WHERE "created_at" IS NULL OR "updated_at" IS NULL;
UPDATE "product_templates" SET "created_at" = CURRENT_TIMESTAMP, "updated_at" = CURRENT_TIMESTAMP WHERE "created_at" IS NULL OR "updated_at" IS NULL;
UPDATE "products" SET "created_at" = CURRENT_TIMESTAMP, "updated_at" = CURRENT_TIMESTAMP WHERE "created_at" IS NULL OR "updated_at" IS NULL;
UPDATE "template_layout_items" SET "created_at" = CURRENT_TIMESTAMP, "updated_at" = CURRENT_TIMESTAMP WHERE "created_at" IS NULL OR "updated_at" IS NULL;
UPDATE "uploaded_images" SET "updated_at" = CURRENT_TIMESTAMP WHERE "updated_at" IS NULL;
UPDATE "user_addresses" SET "updated_at" = CURRENT_TIMESTAMP WHERE "updated_at" IS NULL;
UPDATE "users" SET "updated_at" = CURRENT_TIMESTAMP WHERE "updated_at" IS NULL;

-- Make columns NOT NULL with defaults
ALTER TABLE "cart_items" ALTER COLUMN "created_at" SET NOT NULL, ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "cart_items" ALTER COLUMN "updated_at" SET NOT NULL;

ALTER TABLE "carts" ALTER COLUMN "updated_at" SET NOT NULL;

ALTER TABLE "draft_layout_item_images" ALTER COLUMN "created_at" SET NOT NULL, ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "draft_layout_item_images" ALTER COLUMN "updated_at" SET NOT NULL;

ALTER TABLE "draft_layout_items" ALTER COLUMN "created_at" SET NOT NULL, ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "draft_layout_items" ALTER COLUMN "updated_at" SET NOT NULL;

ALTER TABLE "draft_selected_options" ALTER COLUMN "created_at" SET NOT NULL, ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "draft_selected_options" ALTER COLUMN "updated_at" SET NOT NULL;

ALTER TABLE "order_items" ALTER COLUMN "created_at" SET NOT NULL, ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "order_items" ALTER COLUMN "updated_at" SET NOT NULL;

ALTER TABLE "orders" ALTER COLUMN "updated_at" SET NOT NULL;

ALTER TABLE "product_categories" ALTER COLUMN "created_at" SET NOT NULL, ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "product_categories" ALTER COLUMN "updated_at" SET NOT NULL;

ALTER TABLE "product_images" ALTER COLUMN "created_at" SET NOT NULL, ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "product_images" ALTER COLUMN "updated_at" SET NOT NULL;

ALTER TABLE "product_option_types" ALTER COLUMN "created_at" SET NOT NULL, ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "product_option_types" ALTER COLUMN "updated_at" SET NOT NULL;

ALTER TABLE "product_option_values" ALTER COLUMN "created_at" SET NOT NULL, ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "product_option_values" ALTER COLUMN "updated_at" SET NOT NULL;

ALTER TABLE "product_templates" ALTER COLUMN "created_at" SET NOT NULL, ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "product_templates" ALTER COLUMN "updated_at" SET NOT NULL;

ALTER TABLE "products" ALTER COLUMN "created_at" SET NOT NULL, ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "products" ALTER COLUMN "updated_at" SET NOT NULL;

ALTER TABLE "template_layout_items" ALTER COLUMN "created_at" SET NOT NULL, ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "template_layout_items" ALTER COLUMN "updated_at" SET NOT NULL;

ALTER TABLE "uploaded_images" ALTER COLUMN "updated_at" SET NOT NULL;

ALTER TABLE "user_addresses" ALTER COLUMN "updated_at" SET NOT NULL;

ALTER TABLE "users" ALTER COLUMN "updated_at" SET NOT NULL;
