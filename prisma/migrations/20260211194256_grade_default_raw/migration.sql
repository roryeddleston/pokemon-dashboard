/*
  Warnings:

  - Made the column `grade` on table `Holding` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Holding" ALTER COLUMN "grade" SET NOT NULL,
ALTER COLUMN "grade" SET DEFAULT 'RAW';
