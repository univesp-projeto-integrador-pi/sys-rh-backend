/*
  Warnings:

  - You are about to drop the column `area` on the `candidates` table. All the data in the column will be lost.
  - You are about to drop the column `education` on the `candidates` table. All the data in the column will be lost.
  - You are about to drop the column `experience` on the `candidates` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `candidates` table. All the data in the column will be lost.
  - You are about to drop the column `shift` on the `candidates` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `candidates` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `users` table. All the data in the column will be lost.
  - Added the required column `names` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `password` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "candidates" DROP CONSTRAINT "candidates_userId_fkey";

-- DropIndex
DROP INDEX "candidates_userId_key";

-- AlterTable
ALTER TABLE "candidates" DROP COLUMN "area",
DROP COLUMN "education",
DROP COLUMN "experience",
DROP COLUMN "phone",
DROP COLUMN "shift",
DROP COLUMN "userId",
ADD COLUMN     "phoee" TEXT;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "name",
ADD COLUMN     "names" TEXT NOT NULL,
ADD COLUMN     "password" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_token_key" ON "refresh_tokens"("token");

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
