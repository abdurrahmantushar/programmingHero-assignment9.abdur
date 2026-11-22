import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/lib/auth";

const roleRoutes: Record<string, "customer" | "vendor" | "admin"> = {
  "/customer": "customer",
  "/vendor": "vendor",
  "/admin": "admin",
};

const authOnlyRoutes = ["/profile", "/order", "/payment/success"];

const roleHome: Record<string, string> = {
  customer: "/customer",
  vendor: "/vendor",
  admin: "/admin",
};

function matchesRoute(pathname: string, route: string) {
  return pathname === route || pathname.startsWith(`${route}/`);
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const roleRoute = Object.keys(roleRoutes).find((route) =>
    matchesRoute(pathname, route)
  );
  const isAuthOnly = authOnlyRoutes.some((route) =>
    matchesRoute(pathname, route)
  );

  if (!roleRoute && !isAuthOnly) {
    return NextResponse.next();
  }

  let session: { user: { role?: string | null } } | null = null;

  try {
    session = await auth.api.getSession({
      headers: request.headers,
      query: { disableRefresh: true },
    });
  } catch {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  if (!session?.user) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  const userRole = session.user.role;

  if (roleRoute && userRole !== roleRoutes[roleRoute]) {
    return NextResponse.redirect(
      new URL(roleHome[userRole ?? ""] || "/", request.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
