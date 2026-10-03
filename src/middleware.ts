import { NextRequest, NextResponse } from "next/server";

import { SESSION_COOKIE, verifySession } from "@/lib/session-token";

// Sends signed-out visitors of /<slug>/admin to the login page.
export async function middleware(request: NextRequest) {
  const [, slug, , page] = request.nextUrl.pathname.split("/");
  if (page === "login") {
    return NextResponse.next();
  }
  const session = await verifySession(
    request.cookies.get(SESSION_COOKIE)?.value,
  );
  if (!session || session.slug !== slug) {
    return NextResponse.redirect(new URL(`/${slug}/admin/login`, request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/:slug/admin", "/:slug/admin/:path*"],
};
