// src/app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyPassword, generateToken } from '@/utils/auth'; // Import our helper functions

// Instantiate Prisma Client
// Note: As mentioned before, we'll improve this instantiation later.
const prisma = new PrismaClient();

// Define the expected structure of the request body using a TypeScript interface
interface LoginRequestBody {
    email: string;
    password: string;
}

/**
 * Handles POST requests to /api/auth/login
 * This function authenticates a user and provides a JWT token upon successful login.
 * @param request The incoming Next.js request object.
 * @returns A Next.js response object containing the JWT token on success, or an error message.
 */
export async function POST(request: NextRequest) {
    try {
        // 1. Parse the JSON body from the incoming request
        const body: LoginRequestBody = await request.json();

        // 2. Basic validation: Check if required fields are present
        if (!body.email || !body.password) {
            return NextResponse.json(
                { error: 'Email and password are required.' },
                { status: 400 } // HTTP status code 400: Bad Request
            );
        }

        // 3. Find the user in the database by their email address
        const user = await prisma.user.findUnique({
            where: { email: body.email },
        });

        // 4. Check if a user with that email was found
        if (!user) {
            // Security best practice: Provide a generic error message.
            // Don't reveal whether the email exists or not.
            return NextResponse.json(
                { error: 'Invalid credentials.' },
                { status: 401 } // HTTP status code 401: Unauthorized
            );
        }

        // 5. Verify the provided password against the stored hashed password
        // Use the utility function we created for this purpose.
        const isPasswordValid = await verifyPassword(body.password, user.password);

        // 6. Check if the password was correct
        if (!isPasswordValid) {
            // Password didn't match the stored hash
            return NextResponse.json(
                { error: 'Invalid credentials.' },
                { status: 401 } // HTTP status code 401: Unauthorized
            );
        }

        // 7. If we reach here, authentication was successful!
        // Generate a JWT token for the authenticated user.
        const token = generateToken(user.id);

        // 8. Return a success response including the JWT token
        // Also include basic user information which is often useful for the frontend.
        // IMPORTANT: Never send the hashed password back to the client.
        return NextResponse.json(
            {
                message: 'Login successful.',
                token: token,             // The JWT token the frontend needs to store
                user: {               // Basic user info
                    id: user.id,
                    name: user.name,
                    email: user.email,
                },
            },
            { status: 200 } // HTTP status code 200: OK
        );

    } catch (error: any) {
        // 9. Handle any unexpected errors during the process
        console.error('Login API Error:', error);

        // Return a generic error message to the client
        return NextResponse.json(
            { error: 'Internal server error during login.' },
            { status: 500 } // HTTP status code 500: Internal Server Error
        );
    } finally {
        // 10. Always ensure the database connection is closed
        await prisma.$disconnect();
    }
}