/*
  Warnings:

  - You are about to drop the column `avgTrainingHours` on the `ESGResponse` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."ESGResponse" DROP COLUMN "avgTrainingHours",
ADD COLUMN     "averageTrainingHours" DOUBLE PRECISION;
