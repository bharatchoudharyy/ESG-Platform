// src/utils/auth.ts
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { JwtPayload } from 'jsonwebtoken'; // Import JwtPayload type

/**
 * Hashes a plain text password.
 * @param password The plain text password.
 * @returns A promise that resolves to the hashed password.
 */
export async function hashPassword(password: string): Promise<string> {
    // The 'salt' adds randomness to the hashing process.
    // 12 is the number of rounds (a good balance between security and performance).
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    return hashedPassword;
}

/**
 * Compares a plain text password with a hashed password.
 * @param password The plain text password provided by the user.
 * @param hashedPassword The hashed password stored in the database.
 * @returns A promise that resolves to true if they match, false otherwise.
 */
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    const isValid = await bcrypt.compare(password, hashedPassword);
    return isValid;
}

// Get the JWT secret from environment variables
const JWT_SECRET = process.env.JWT_SECRET;

// Check if JWT_SECRET is defined and throw an error if not.
// This ensures the application fails fast if the secret is missing.
if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in environment variables.');
}

// Assert the type for JWT_SECRET after the check.
// Since the check above throws if JWT_SECRET is undefined,
// we can safely tell TypeScript it will always be a string beyond this point.
const JWT_SECRET_KEY: string = JWT_SECRET;

/**
 * Generates a JWT token for a given user ID.
 * @param userId The ID of the user to generate a token for.
 * @returns The signed JWT token.
 */
export function generateToken(userId: string): string {
    // Payload: Data to include in the token (usually just the user ID)
    const payload = { userId: userId };

    // Options for the token
    // Using a number for expiresIn (seconds) to satisfy TypeScript definitions.
    const options: jwt.SignOptions = {
        expiresIn: 7 * 24 * 60 * 60, // 7 days in seconds
    };

    // Sign the token using the asserted secret key
    const token = jwt.sign(payload, JWT_SECRET_KEY, options);
    return token;
}

/**
 * Verifies a JWT token and extracts the user ID.
 * @param token The JWT token string.
 * @returns The user ID if valid, null otherwise.
 */
export function verifyToken(token: string): string | null {
    try {
        // Verify the token using the asserted secret key
        // Type the result as JwtPayload for safer access
        const decoded = jwt.verify(token, JWT_SECRET_KEY) as JwtPayload;

        // Check if the decoded payload is an object and contains the expected 'userId' property
        if (typeof decoded === 'object' && decoded !== null && 'userId' in decoded) {
            // Return the userId. We assert it as string because 'userId' should be a string.
            return (decoded.userId as string);
        }

        // If the payload is not an object, or doesn't have a userId, return null
        return null;

    } catch (err) {
        // Token is invalid or expired
        console.error('Token verification failed:', err);
        return null;
    }
}