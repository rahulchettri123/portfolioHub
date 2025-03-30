/*
  Warnings:

  - You are about to drop the column `date` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `demoUrl` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `githubUrl` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `imageLinkTo` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `imageUrl` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `tags` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `techStack` on the `Project` table. All the data in the column will be lost.

*/

-- First add the new columns except startDate
ALTER TABLE "Project" 
ADD COLUMN "current" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "endDate" TIMESTAMP(3),
ADD COLUMN "images" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN "lessonsLearned" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN "location" TEXT,
ADD COLUMN "startDate" TIMESTAMP(3);

-- Copy data from date to startDate
UPDATE "Project" SET "startDate" = "date";

-- If there's an imageUrl, move it to the images array
UPDATE "Project" 
SET "images" = array_append(ARRAY[]::TEXT[], "imageUrl") 
WHERE "imageUrl" IS NOT NULL AND "imageUrl" != '';

-- Now we can safely drop the old columns
ALTER TABLE "Project" 
DROP COLUMN "date",
DROP COLUMN "demoUrl",
DROP COLUMN "githubUrl",
DROP COLUMN "imageLinkTo",
DROP COLUMN "imageUrl",
DROP COLUMN "tags",
DROP COLUMN "techStack";

-- Make startDate required now that we've populated it
ALTER TABLE "Project" 
ALTER COLUMN "startDate" SET NOT NULL;
