/*
  Warnings:

  - A unique constraint covering the columns `[userId,year]` on the table `ESGResponse` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "ESGResponse_userId_year_key" ON "public"."ESGResponse"("userId", "year");
