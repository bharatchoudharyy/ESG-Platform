-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ESGResponse" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "financialYear" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "totalElectricityConsumption" DOUBLE PRECISION,
    "renewableElectricityConsumption" DOUBLE PRECISION,
    "totalFuelConsumption" DOUBLE PRECISION,
    "carbonEmissions" DOUBLE PRECISION,
    "totalEmployees" INTEGER,
    "femaleEmployees" INTEGER,
    "avgTrainingHours" DOUBLE PRECISION,
    "communityInvestment" DOUBLE PRECISION,
    "independentBoardMembers" DOUBLE PRECISION,
    "hasDataPrivacyPolicy" BOOLEAN,
    "totalRevenue" DOUBLE PRECISION,
    "carbonIntensity" DOUBLE PRECISION,
    "renewableElectricityRatio" DOUBLE PRECISION,
    "diversityRatio" DOUBLE PRECISION,
    "communitySpendRatio" DOUBLE PRECISION,

    CONSTRAINT "ESGResponse_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- AddForeignKey
ALTER TABLE "public"."ESGResponse" ADD CONSTRAINT "ESGResponse_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
