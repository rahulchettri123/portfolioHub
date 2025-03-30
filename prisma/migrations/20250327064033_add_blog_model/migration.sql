/*
  Warnings:

  - You are about to drop the column `date` on the `Blog` table. All the data in the column will be lost.
  - You are about to drop the `BlogSkill` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `eventDate` to the `Blog` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "BlogSkill" DROP CONSTRAINT "BlogSkill_blogId_fkey";

-- AlterTable
ALTER TABLE "Blog" DROP COLUMN "date",
ADD COLUMN     "eventDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "skillsLearned" TEXT[];

-- DropTable
DROP TABLE "BlogSkill";
