// src/app/api/auth/signup/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { hashPassword } from '@/utils/auth'; // Import our helper function

// It's generally recommended to instantiate Prisma Client globally
// and export it to prevent creating multiple instances.
// However, for simplicity in this step-by-step guide, we'll create it here.
// We will refactor this later for better practice.
const prisma = new PrismaClient();

// Define the expected structure of the request body using a TypeScript interface
interface SignupRequestBody {
    name: string;
    email: string;
    password: string;
}

/**
 * Handles POST requests to /api/auth/signup
 * This function creates a new user account.
 * @param request The incoming Next.js request object.
 * @returns A Next.js response object.
 */
export async function POST(request: NextRequest) {
    try {
        // 1. Parse the JSON body from the incoming request
        const body: SignupRequestBody = await request.json();

        // 2. Basic validation: Check if required fields are present
        // In a production app, you'd use a more robust validation library like Zod.
        if (!body.name || !body.email || !body.password) {
            return NextResponse.json(
                { error: 'Name, email, and password are required.' },
                { status: 400 } // HTTP status code 400: Bad Request
            );
        }

        // 3. Check for existing user with the same email to prevent duplicates
        const existingUser = await prisma.user.findUnique({
            where: { email: body.email },
        });

        if (existingUser) {
            // A user with this email already exists
            return NextResponse.json(
                { error: 'User with this email already exists.' },
                { status: 409 } // HTTP status code 409: Conflict
            );
        }

        // 4. Hash the user's password for secure storage
        const hashedPassword = await hashPassword(body.password);

        // 5. Create the new user record in the PostgreSQL database using Prisma
        const newUser = await prisma.user.create({
            data: {
                name: body.name,
                email: body.email,
                password: hashedPassword, // Store the hashed password, never the plain text!
            },
        });

        // 6. Return a success response
        // We typically don't send sensitive data like the password back.
        // Sending the user ID and name confirms creation.
        return NextResponse.json(
            {
                message: 'User created successfully.',
                userId: newUser.id,
                name: newUser.name,
            },
            { status: 201 } // HTTP status code 201: Created
        );

    } catch (error: any) {
        // 7. Handle any unexpected errors during the process
        // Log the error for debugging purposes on the server side
        console.error('Signup API Error:', error);

        // Return a generic error message to the client to avoid exposing internal details
        return NextResponse.json(
            { error: 'Internal server error during signup.' },
            { status: 500 } // HTTP status code 500: Internal Server Error
        );
    } finally {
        // 8. Always ensure the database connection is closed, even if an error occurs
        // This is good practice to prevent potential connection leaks.
        await prisma.$disconnect();
    }
}