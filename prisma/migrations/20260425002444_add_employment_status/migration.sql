-- CreateEnum
CREATE TYPE "EmploymentStatus" AS ENUM ('ACTIVE', 'ON_LEAVE', 'RESIGNED', 'TERMINATED');

-- CreateEnum
CREATE TYPE "TerminationReason" AS ENUM ('RESIGNATION', 'DISMISSAL_WITH_CAUSE', 'DISMISSAL_WITHOUT_CAUSE', 'END_OF_CONTRACT', 'MUTUAL_AGREEMENT', 'RETIREMENT', 'OTHER');

-- AlterTable
ALTER TABLE "internal_profiles" ADD COLUMN     "status" "EmploymentStatus" NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN     "terminatedAt" TIMESTAMP(3),
ADD COLUMN     "terminationNotes" TEXT,
ADD COLUMN     "terminationReason" "TerminationReason";

-- CreateIndex
CREATE INDEX "internal_profiles_status_idx" ON "internal_profiles"("status");

-- CreateIndex
CREATE INDEX "internal_profiles_terminatedAt_idx" ON "internal_profiles"("terminatedAt");
