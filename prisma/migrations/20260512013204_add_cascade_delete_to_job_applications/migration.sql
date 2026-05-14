/*
  Warnings:

  - You are about to drop the column `status` on the `internal_profiles` table. All the data in the column will be lost.
  - You are about to drop the column `terminatedAt` on the `internal_profiles` table. All the data in the column will be lost.
  - You are about to drop the column `terminationNotes` on the `internal_profiles` table. All the data in the column will be lost.
  - You are about to drop the column `terminationReason` on the `internal_profiles` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `internal_profiles` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "internal_profiles" DROP CONSTRAINT "internal_profiles_userId_fkey";

-- DropForeignKey
ALTER TABLE "job_applications" DROP CONSTRAINT "job_applications_positionId_fkey";

-- DropIndex
DROP INDEX "internal_profiles_status_idx";

-- DropIndex
DROP INDEX "internal_profiles_terminatedAt_idx";

-- DropIndex
DROP INDEX "internal_profiles_userId_key";

-- DropIndex
DROP INDEX "job_applications_candidateId_positionId_key";

-- DropIndex
DROP INDEX "job_applications_currentStage_idx";

-- AlterTable
ALTER TABLE "internal_profiles" DROP COLUMN "status",
DROP COLUMN "terminatedAt",
DROP COLUMN "terminationNotes",
DROP COLUMN "terminationReason",
DROP COLUMN "userId";

-- DropEnum
DROP TYPE "EmploymentStatus";

-- DropEnum
DROP TYPE "TerminationReason";

-- AddForeignKey
ALTER TABLE "job_applications" ADD CONSTRAINT "job_applications_positionId_fkey" FOREIGN KEY ("positionId") REFERENCES "job_positions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
