// src/app/api/responses/[year]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '@/utils/auth'; // Import our JWT verification utility

const prisma = new PrismaClient();

// Helper function to extract token (same as in /api/responses/route.ts)
function getTokenFromHeader(request: NextRequest): string | null {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }
    return authHeader.substring(7); // Remove 'Bearer ' prefix
}

/**
 * Handles DELETE requests to /api/responses/[year]
 * Deletes the ESG response data for a specific year for the authenticated user.
 * @param request The incoming Next.js request object.
 * @param params The dynamic route parameters, including 'year'.
 * @returns A Next.js response object.
 */
export async function DELETE(request: NextRequest, { params }: { params: { year: string } }) {
    let userId: string | null = null;
    let targetYear: number | null = null;

    try {
        // 1. Validate the year parameter from the URL
        targetYear = parseInt(params.year, 10);
        if (isNaN(targetYear)) {
            return NextResponse.json({ error: 'Invalid year parameter.' }, { status: 400 }); // Bad Request
        }

        // 2. Extract and Verify JWT Token
        const token = getTokenFromHeader(request);
        if (!token) {
            return NextResponse.json({ error: 'Authentication token required.' }, { status: 401 }); // Unauthorized
        }

        userId = verifyToken(token);
        if (!userId) {
            return NextResponse.json({ error: 'Invalid or expired token.' }, { status: 401 }); // Unauthorized
        }

        // 3. Delete the specific record from the database
        // Prisma's deleteMany allows deleting based on multiple conditions
        const deleteResult = await prisma.eSGResponse.deleteMany({
            where: {
                userId: userId,   // Must belong to the authenticated user
                year: targetYear, // Must match the specified year
            },
        });

        // 4. Check if a record was actually deleted
        if (deleteResult.count === 0) {
            // No record found matching userId and year
            return NextResponse.json(
                { message: `No ESG data found for year ${targetYear} for this user.` },
                { status: 404 } // Not Found
            );
        }

        // 5. Return success response
        return NextResponse.json(
            { message: `ESG data for year ${targetYear} deleted successfully.` },
            { status: 200 } // OK
        );

    } catch (error: any) {
        console.error(`DELETE /api/responses/${targetYear} - User ID: ${userId} - Error:`, error);
        return NextResponse.json(
            { error: 'Internal server error while deleting ESG response.' },
            { status: 500 } // Internal Server Error
        );
    } finally {
        await prisma.$disconnect();
    }
}