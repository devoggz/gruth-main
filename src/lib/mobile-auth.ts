// src/lib/mobile-auth.ts
import { jwtVerify } from "jose";
import { type NextRequest } from "next/server";

export interface MobileSession {
  userId: string;
  role: string;
}

export async function verifyMobileToken(
  req: NextRequest,
): Promise<MobileSession | null> {
  const header = req.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) return null;
  const token = header.slice(7);
  const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET!);
  try {
    const { payload } = await jwtVerify(token, secret);
    return { userId: payload.sub as string, role: payload.role as string };
  } catch {
    return null;
  }
}

// CORS headers — add to every mobile API response
export const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};
