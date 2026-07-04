import { SignJWT, jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(
  process.env.AUTH_SECRET ?? "financeiro-secret-fallback"
);

const COOKIE_NAME = "fin_session";
const EXPIRES_IN = 60 * 60 * 24 * 7; // 7 dias

export async function createSessionToken(email: string): Promise<string> {
  return new SignJWT({ email })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${EXPIRES_IN}s`)
    .sign(SECRET);
}

export async function verifySessionToken(token: string): Promise<{ email: string } | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return { email: payload.email as string };
  } catch {
    return null;
  }
}

export function verifyCredentials(email: string, password: string): boolean {
  return (
    email === process.env.AUTH_EMAIL &&
    password === process.env.AUTH_PASSWORD
  );
}

export { COOKIE_NAME, EXPIRES_IN };
