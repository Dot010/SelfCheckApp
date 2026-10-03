import { jwtVerify, SignJWT } from "jose";

// Signs and reads the admin session cookie. Uses only Web Crypto (via jose),
// so it also runs in the middleware.

export const SESSION_COOKIE = "admin_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export interface AdminSession {
  userId: string;
  restaurantId: string;
  slug: string;
}

const getSecret = () => {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error(
      "AUTH_SECRET must be set to a random string of at least 32 characters",
    );
  }
  return new TextEncoder().encode(secret);
};

export const signSession = (session: AdminSession) =>
  new SignJWT({ restaurantId: session.restaurantId, slug: session.slug })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(session.userId)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(getSecret());

export const verifySession = async (
  token: string | undefined,
): Promise<AdminSession | null> => {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecret(), {
      algorithms: ["HS256"],
    });
    if (
      typeof payload.sub !== "string" ||
      typeof payload.restaurantId !== "string" ||
      typeof payload.slug !== "string"
    ) {
      return null;
    }
    return {
      userId: payload.sub,
      restaurantId: payload.restaurantId,
      slug: payload.slug,
    };
  } catch {
    return null;
  }
};
