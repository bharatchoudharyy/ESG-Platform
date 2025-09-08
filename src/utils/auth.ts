// src/utils/auth.ts
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { JwtPayload } from 'jsonwebtoken';


// Hashes a plain text password.
export async function hashPassword(password: string): Promise<string> {
    // 12 salt rounds for randomness and security
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    return hashedPassword;
}


// Compares a plain text password with a hashed password.
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    const isValid = await bcrypt.compare(password, hashedPassword);
    return isValid;
}

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in environment variables.');
}

// Assert the type for JWT_SECRET after the check.
const JWT_SECRET_KEY: string = JWT_SECRET;

// Generates a JWT token for a given user ID.
export function generateToken(userId: string): string {
    // Payload: Data to include in the token 
    const payload = { userId: userId };

    // Options for the token
    // Using a number for expiresIn (seconds) to satisfy TypeScript definitions.
    const options: jwt.SignOptions = {
        expiresIn: 7 * 24 * 60 * 60, // 7 days in seconds
    };

    const token = jwt.sign(payload, JWT_SECRET_KEY, options);
    return token;
}


// Verifies a JWT token and extracts the user ID.
export function verifyToken(token: string): string | null {
    try {
        const decoded = jwt.verify(token, JWT_SECRET_KEY) as JwtPayload;

        // Check if the decoded payload is an object and contains the expected 'userId' property
        if (typeof decoded === 'object' && decoded !== null && 'userId' in decoded) {
            return (decoded.userId as string);
        }

        // If the payload is not an object, or doesn't have a userId, return null
        return null;

    } catch (err) {
        console.error('Token verification failed:', err);
        return null;
    }
}