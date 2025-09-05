// src/app/api/responses/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '@/utils/auth'; // Import our JWT verification utility
import { ESGData } from '@/types/esg'; // Import the ESG data type

// Instantiate Prisma Client
const prisma = new PrismaClient();

// --- Helper Function for Authentication ---
/**
 * Extracts the JWT token from the Authorization header.
 * @param request The incoming Next.js request object.
 * @returns The JWT token string, or null if not found or invalid format.
 */
function getTokenFromHeader(request: NextRequest): string | null {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }
    return authHeader.substring(7); // Remove 'Bearer ' prefix
}

// --- POST Handler: Save ESG Responses ---
/**
 * Handles POST requests to /api/responses
 * Saves new ESG response data for the authenticated user.
 * @param request The incoming Next.js request object.
 * @returns A Next.js response object.
 */
export async function POST(request: NextRequest) {
    let userId: string | null = null; // Variable to store the authenticated user's ID

    try {
        // 1. Extract and Verify JWT Token
        const token = getTokenFromHeader(request);
        if (!token) {
            return NextResponse.json({ error: 'Authentication token required.' }, { status: 401 }); // Unauthorized
        }

        userId = verifyToken(token);
        if (!userId) {
            return NextResponse.json({ error: 'Invalid or expired token.' }, { status: 401 }); // Unauthorized
        }

        // 2. Parse the JSON body from the incoming request
        // Expecting: { responses: { [year: number]: ESGData } }
        const body = await request.json();
        const responsesData: { [year: number]: ESGData } | undefined = body.responses;

        // 3. Validate the request body structure
        if (!responsesData || typeof responsesData !== 'object') {
            return NextResponse.json({ error: 'Invalid request body. Expected { responses: { [year: number]: ESGData } }.' }, { status: 400 }); // Bad Request
        }

        // 4. Prepare and execute upsert operations for each year's data
        const upsertPromises = [];
        for (const [yearStr, esgData] of Object.entries(responsesData)) {
            const year = parseInt(yearStr, 10);
            if (isNaN(year)) {
                console.warn(`Skipping invalid year key: ${yearStr}`);
                continue;
            }

            // Basic validation: Ensure at least one field has data (optional but good)
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
                    // This assumes a unique constraint exists on userId_year in your Prisma schema
                    // Prisma typically generates compound unique constraints like this: userId_year
                    // If your schema defines it differently, adjust this 'where' clause accordingly.
                    // Example if named explicitly in schema: `userId_year_unique`
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
            { status: 200 } // OK (or 201 Created if you prefer, though 200 is common for updates too)
        );

    } catch (error: any) {
        // 8. Handle unexpected errors
        console.error(`POST /api/responses - User ID: ${userId} - Error:`, error);
        // Differentiate between Prisma errors and others if needed
        return NextResponse.json(
            { error: 'Internal server error while saving ESG responses.' },
            { status: 500 } // Internal Server Error
        );
    } finally {
        // 9. Always disconnect Prisma Client
        await prisma.$disconnect();
    }
}

// --- GET Handler: Fetch ESG Responses ---
/**
 * Handles GET requests to /api/responses
 * Fetches all ESG responses for the authenticated user.
 * @param request The incoming Next.js request object.
 * @returns A Next.js response object containing the user's ESG responses.
 */
export async function GET(request: NextRequest) {
    let userId: string | null = null; // Variable to store the authenticated user's ID

    try {
        // 1. Extract and Verify JWT Token
        const token = getTokenFromHeader(request);
        if (!token) {
            return NextResponse.json({ error: 'Authentication token required.' }, { status: 401 }); // Unauthorized
        }

        userId = verifyToken(token);
        if (!userId) {
            return NextResponse.json({ error: 'Invalid or expired token.' }, { status: 401 }); // Unauthorized
        }

        // 2. Fetch responses from the database for the authenticated user
        // Order by year descending (newest first) is often useful
        const userResponses = await prisma.eSGResponse.findMany({
            where: {
                userId: userId,
            },
            orderBy: {
                year: 'desc', // Order by year, newest first
            },
        });

        // 3. Transform data for the frontend if needed (optional, Prisma returns plain objects)
        // For now, we'll send the data directly as fetched from Prisma.
        // The frontend expects { [year: number]: ESGData }.
        // We can transform the array into this object structure.
        const responseData: { [year: number]: ESGData } = {};
        userResponses.forEach(response => {
            // Map Prisma fields (snake_case) back to ESGData fields (camelCase) if they differ
            // In our Prisma schema, they match, so direct assignment works.
            // Ensure year is treated as a number if needed (Prisma returns it as Int)
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
                // --- Calculated ---
                carbonIntensity: response.carbonIntensity,
                renewableElectricityRatio: response.renewableElectricityRatio,
                diversityRatio: response.diversityRatio,
                communitySpendRatio: response.communitySpendRatio,
            };
        });

        // 4. Return the fetched data
        return NextResponse.json({ responses: responseData }, { status: 200 }); // OK

    } catch (error: any) {
        // 5. Handle unexpected errors
        console.error(`GET /api/responses - User ID: ${userId} - Error:`, error);
        return NextResponse.json(
            { error: 'Internal server error while fetching ESG responses.' },
            { status: 500 } // Internal Server Error
        );
    } finally {
        // 6. Always disconnect Prisma Client
        await prisma.$disconnect();
    }
}