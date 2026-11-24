-- Accepted applicants now create their own account through a secure invitation.
ALTER TABLE "Application"
ADD COLUMN "invitationTokenHash" TEXT,
ADD COLUMN "invitationExpiresAt" TIMESTAMP(3),
ADD COLUMN "invitationCreatedAt" TIMESTAMP(3),
ADD COLUMN "acceptedCohortId" TEXT;

ALTER TABLE "Learner"
ADD COLUMN "dateOfBirth" TIMESTAMP(3),
ADD COLUMN "educationBackground" TEXT,
ADD COLUMN "previousInstitution" TEXT;

CREATE UNIQUE INDEX "Application_invitationTokenHash_key" ON "Application"("invitationTokenHash");
CREATE INDEX "Application_acceptedCohortId_idx" ON "Application"("acceptedCohortId");

ALTER TABLE "Application"
ADD CONSTRAINT "Application_acceptedCohortId_fkey"
FOREIGN KEY ("acceptedCohortId") REFERENCES "Cohort"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
