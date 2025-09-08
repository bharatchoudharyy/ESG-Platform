// src/app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyPassword, generateToken } from '@/utils/auth';

const prisma = new PrismaClient();

// Define the expected structure of the request body using a TypeScript interface
interface LoginRequestBody {
    email: string;
    password: string;
}


// Handles POST requests to /api/auth/login
// This function authenticates a user and provides a JWT token upon successful login.

export async function POST(request: NextRequest) {
    try {

        const body: LoginRequestBody = await request.json();


        if (!body.email || !body.password) {
            return NextResponse.json(
                { error: 'Email and password are required.' },
                { status: 400 }
            );
        }


        const user = await prisma.user.findUnique({
            where: { email: body.email },
        });


        if (!user) {

            return NextResponse.json(
                { error: 'Invalid credentials.' },
                { status: 401 }
            );
        }

        const isPasswordValid = await verifyPassword(body.password, user.password);


        if (!isPasswordValid) {

            return NextResponse.json(
                { error: 'Invalid credentials.' },
                { status: 401 } // 
            );
        }


        const token = generateToken(user.id);


        return NextResponse.json(
            {
                message: 'Login successful.',
                token: token,             // The JWT token the frontend needs to store
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                },
            },
            { status: 200 }
        );

    } catch (error: any) {

        console.error('Login API Error:', error);


        return NextResponse.json(
            { error: 'Internal server error during login.' },
            { status: 500 }
        );
    } finally {

        await prisma.$disconnect();
    }
}