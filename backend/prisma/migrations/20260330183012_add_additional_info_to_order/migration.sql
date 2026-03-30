/*
  Warnings:

  - The `status` column on the `orders` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "order_status" AS ENUM ('PENDING', 'CONFIRMED', 'PREPARING', 'DELIVERED', 'CANCELLED');

-- DropForeignKey
ALTER TABLE "orders" DROP CONSTRAINT "orders_userId_fkey";

-- DropIndex
DROP INDEX "orders_status_idx";

-- DropIndex
DROP INDEX "orders_userId_idx";

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "additionalInfo" TEXT,
DROP COLUMN "status",
ADD COLUMN     "status" "order_status" NOT NULL DEFAULT 'PENDING',
ALTER COLUMN "phone" SET DATA TYPE TEXT;

-- DropEnum
DROP TYPE "OrderStatus";

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
