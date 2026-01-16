-- CreateEnum
CREATE TYPE "RoleType" AS ENUM ('admin', 'customer');

-- CreateTable
CREATE TABLE "roles" (
    "id" TEXT NOT NULL,
    "type" "RoleType" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "roles_type_key" ON "roles"("type");

-- Insert default roles
INSERT INTO "roles" ("id", "type", "created_at", "updated_at") VALUES
    ('00000000-0000-0000-0000-000000000004', 'customer', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('00000000-0000-0000-0000-000000000005', 'admin', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Add role_id column as nullable first
ALTER TABLE "users" ADD COLUMN "role_id" TEXT;

-- Update existing users to have customer role
UPDATE "users" SET "role_id" = '00000000-0000-0000-0000-000000000004' WHERE "role_id" IS NULL;

-- Make role_id NOT NULL
ALTER TABLE "users" ALTER COLUMN "role_id" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
