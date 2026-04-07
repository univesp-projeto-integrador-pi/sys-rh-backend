/*
  Warnings:

  - You are about to drop the column `phoee` on the `candidates` table. All the data in the column will be lost.
  - You are about to drop the column `names` on the `users` table. All the data in the column will be lost.
  - Added the required column `name` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN');

-- AlterTable
ALTER TABLE "candidates" DROP COLUMN "phoee",
ADD COLUMN     "phone" TEXT;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "names",
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "role" "UserRole" NOT NULL DEFAULT 'USER';
