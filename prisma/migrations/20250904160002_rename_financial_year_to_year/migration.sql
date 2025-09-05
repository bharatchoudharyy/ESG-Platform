/*
  Warnings:

  - You are about to drop the column `financialYear` on the `ESGResponse` table. All the data in the column will be lost.
  - Added the required column `year` to the `ESGResponse` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."ESGResponse" DROP COLUMN "financialYear",
ADD COLUMN     "year" INTEGER NOT NULL;
