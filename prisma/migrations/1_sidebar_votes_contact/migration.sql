
-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "icon" TEXT NOT NULL DEFAULT 'Box';

-- AlterTable
ALTER TABLE "SiteSetting" ADD COLUMN     "contactEmail" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "contactLinkedIn" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "sidebarSubtitle" TEXT NOT NULL DEFAULT '';

-- CreateTable
CREATE TABLE "Vote" (
    "id" SERIAL NOT NULL,
    "projectId" INTEGER NOT NULL,
    "voterKey" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Vote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Vote_projectId_idx" ON "Vote"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "Vote_projectId_voterKey_key" ON "Vote"("projectId", "voterKey");

-- AddForeignKey
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

