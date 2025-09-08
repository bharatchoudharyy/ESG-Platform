// src/app/api/auth/signup/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { hashPassword } from '@/utils/auth';

const prisma = new PrismaClient();

interface SignupRequestBody {
    name: string;
    email: string;
    password: string;
}

// Handles POST requests to /api/auth/signup
// This function creates a new user account.
export async function POST(request: NextRequest) {
    try {
        const body: SignupRequestBody = await request.json();

        if (!body.name || !body.email || !body.password) {
            return NextResponse.json(
                { error: 'Name, email, and password are required.' },
                { status: 400 }
            );
        }

        const existingUser = await prisma.user.findUnique({
            where: { email: body.email },
        });

        if (existingUser) {
            return NextResponse.json(
                { error: 'User with this email already exists.' },
                { status: 409 }
            );
        }

        const hashedPassword = await hashPassword(body.password);

        const newUser = await prisma.user.create({
            data: {
                name: body.name,
                email: body.email,
                password: hashedPassword, // Store the hashed password
            },
        });

        return NextResponse.json(
            {
                message: 'User created successfully.',
                userId: newUser.id,
                name: newUser.name,
            },
            { status: 201 }
        );

    } catch (error: any) {
        // Return a generic error message to the client to avoid exposing internal details
        return NextResponse.json(
            { error: 'Internal server error during signup.' },
            { status: 500 } // HTTP status code 500: Internal Server Error
        );
    } finally {
        await prisma.$disconnect();
    }
}