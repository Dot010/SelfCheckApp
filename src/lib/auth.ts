import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import {
  AdminSession,
  SESSION_COOKIE,
  SESSION_MAX_AGE,
  signSession,
  verifySession,
} from "./session-token";

export const createSession = async (session: AdminSession) => {
  (await cookies()).set(SESSION_COOKIE, await signSession(session), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
};

export const destroySession = async () => {
  (await cookies()).delete(SESSION_COOKIE);
};

export const getAdminSession = async () =>
  verifySession((await cookies()).get(SESSION_COOKIE)?.value);

// Use in every admin page and server action. The middleware already blocks
// signed-out visitors, but server actions can be called directly, so each one
// checks again that the session belongs to this restaurant.
export const requireAdmin = async (slug: string) => {
  const session = await getAdminSession();
  if (!session || session.slug !== slug) {
    redirect(`/${slug}/admin/login`);
  }
  return session;
};
