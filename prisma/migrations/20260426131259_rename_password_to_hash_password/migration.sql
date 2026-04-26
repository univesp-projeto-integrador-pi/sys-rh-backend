/*
  Warnings:

  - You are about to drop the column `password` on the `users` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId]` on the table `internal_profiles` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[candidateId,positionId]` on the table `job_applications` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `hashPassword` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "internal_profiles" ADD COLUMN     "userId" TEXT;

-- AlterTable
ALTER TABLE "users" RENAME COLUMN "password" TO "hashPassword";

-- CreateIndex
CREATE UNIQUE INDEX "internal_profiles_userId_key" ON "internal_profiles"("userId");

-- CreateIndex
CREATE INDEX "job_applications_currentStage_idx" ON "job_applications"("currentStage");

-- CreateIndex
CREATE UNIQUE INDEX "job_applications_candidateId_positionId_key" ON "job_applications"("candidateId", "positionId");

-- AddForeignKey
ALTER TABLE "internal_profiles" ADD CONSTRAINT "internal_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
