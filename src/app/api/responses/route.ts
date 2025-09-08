// src/app/api/responses/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '@/utils/auth';
import { ESGData } from '@/types/esg';

const prisma = new PrismaClient();

// --- Helper Function for Authentication ---
// Extracts the JWT token from the Authorization header.
function getTokenFromHeader(request: NextRequest): string | null {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }
    return authHeader.substring(7); // Remove 'Bearer ' prefix
}

// --- POST Handler: Save ESG Responses ---
// Handles POST requests to /api/responses
export async function POST(request: NextRequest) {
    let userId: string | null = null; // Variable to store the authenticated user's ID

    try {
        // 1. Extract and Verify JWT Token
        const token = getTokenFromHeader(request);
        if (!token) {
            return NextResponse.json({ error: 'Authentication token required.' }, { status: 401 });
        }

        userId = verifyToken(token);
        if (!userId) {
            return NextResponse.json({ error: 'Invalid or expired token.' }, { status: 401 });
        }

        // 2. Parse the JSON body from the incoming request
        // Expecting: { responses: { [year: number]: ESGData } }
        const body = await request.json();
        const responsesData: { [year: number]: ESGData } | undefined = body.responses;

        // 3. Validate the request body structure
        if (!responsesData || typeof responsesData !== 'object') {
            return NextResponse.json({ error: 'Invalid request body. Expected { responses: { [year: number]: ESGData } }.' }, { status: 400 });
        }

        // 4. Prepare and execute upsert operations for each year's data
        const upsertPromises = [];
        for (const [yearStr, esgData] of Object.entries(responsesData)) {
            const year = parseInt(yearStr, 10);
            if (isNaN(year)) {
                console.warn(`Skipping invalid year key: ${yearStr}`);
                continue;
            }

            // Basic validation: Ensure at least one field has data 
            const hasData = Object.values(esgData).some(value => value !== null && value !== undefined);
            if (!hasData) {
                console.warn(`Skipping year ${year} as it contains no data.`);
                continue;
            }

            // Prepare the data object for Prisma
            const prismaData = {
                // --- Environmental ---
                totalElectricityConsumption: esgData.totalElectricityConsumption,
                renewableElectricityConsumption: esgData.renewableElectricityConsumption,
                totalFuelConsumption: esgData.totalFuelConsumption,
                carbonEmissions: esgData.carbonEmissions,
                // --- Social ---
                totalEmployees: esgData.totalEmployees,
                femaleEmployees: esgData.femaleEmployees,
                averageTrainingHours: esgData.averageTrainingHours,
                communityInvestment: esgData.communityInvestment,
                // --- Governance ---
                independentBoardMembers: esgData.independentBoardMembers,
                hasDataPrivacyPolicy: esgData.hasDataPrivacyPolicy,
                totalRevenue: esgData.totalRevenue,
                // --- Calculated (store for easy retrieval) ---
                carbonIntensity: esgData.carbonIntensity,
                renewableElectricityRatio: esgData.renewableElectricityRatio,
                diversityRatio: esgData.diversityRatio,
                communitySpendRatio: esgData.communitySpendRatio,
            };

            const upsertPromise = prisma.eSGResponse.upsert({
                where: {
                    // Define the condition to find an existing record
                    userId_year: {
                        userId: userId,
                        year: year,
                    }
                },
                update: prismaData, // Data to use if the record is found (UPDATE)
                create: {
                    // Data to use if the record is NOT found (CREATE)
                    userId: userId,
                    year: year,
                    ...prismaData, // Spread the common data
                },
            });

            upsertPromises.push(upsertPromise);
        }

        // 5. Check if there's any valid data to process
        if (upsertPromises.length === 0) {
            return NextResponse.json({ error: 'No valid ESG data provided to save.' }, { status: 400 });
        }

        // 6. Execute all upsert operations concurrently
        const upsertResults = await Promise.all(upsertPromises);

        // 7. Return success response
        // upsertResults contains the results of each upsert operation
        return NextResponse.json(
            { message: 'ESG responses saved/updated successfully.', count: upsertResults.length },
            { status: 200 }
        );

    } catch (error: any) {
        // 8. Handle unexpected errors
        console.error(`POST /api/responses - User ID: ${userId} - Error:`, error);
        return NextResponse.json(
            { error: 'Internal server error while saving ESG responses.' },
            { status: 500 } // Internal Server Error
        );
    } finally {
        await prisma.$disconnect();
    }
}

// --- GET Handler: Fetch ESG Responses ---
// Handles GET requests to /api/responses

export async function GET(request: NextRequest) {
    let userId: string | null = null; // Variable to store the authenticated user's ID

    try {
        // 1. Extract and Verify JWT Token
        const token = getTokenFromHeader(request);
        if (!token) {
            return NextResponse.json({ error: 'Authentication token required.' }, { status: 401 });
        }

        userId = verifyToken(token);
        if (!userId) {
            return NextResponse.json({ error: 'Invalid or expired token.' }, { status: 401 });
        }

        // 2. Fetch responses from the database for the authenticated user
        const userResponses = await prisma.eSGResponse.findMany({
            where: {
                userId: userId,
            },
            orderBy: {
                year: 'desc', // Order by year, newest first
            },
        });

        const responseData: { [year: number]: ESGData } = {};
        userResponses.forEach(response => {
            // Map Prisma fields directly to ESGData fields
            responseData[response.year] = {
                // --- Environmental ---
                totalElectricityConsumption: response.totalElectricityConsumption,
                renewableElectricityConsumption: response.renewableElectricityConsumption,
                totalFuelConsumption: response.totalFuelConsumption,
                carbonEmissions: response.carbonEmissions,
                // --- Social ---
                totalEmployees: response.totalEmployees,
                femaleEmployees: response.femaleEmployees,
                averageTrainingHours: response.averageTrainingHours,
                communityInvestment: response.communityInvestment,
                // --- Governance ---
                independentBoardMembers: response.independentBoardMembers,
                hasDataPrivacyPolicy: response.hasDataPrivacyPolicy,
                totalRevenue: response.totalRevenue,
                // --- Stored Calculated Fields ---
                carbonIntensity: response.carbonIntensity,
                renewableElectricityRatio: response.renewableElectricityRatio,
                diversityRatio: response.diversityRatio,
                communitySpendRatio: response.communitySpendRatio,
            };
        });

        // 4. Return the fetched data
        return NextResponse.json({ responses: responseData }, { status: 200 });

    } catch (error: any) {

        console.error(`GET /api/responses - User ID: ${userId} - Error:`, error);
        return NextResponse.json(
            { error: 'Internal server error while fetching ESG responses.' },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
}