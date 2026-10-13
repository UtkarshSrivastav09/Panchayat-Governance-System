import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  const supabaseResponse = NextResponse.next({
    request,
  });

  const pathname = request.nextUrl.pathname;

  // Extract session from cookie (instant sub-millisecond edge check)
  const sessionCookie =
    request.cookies.get("gram_sahayak_session")?.value ||
    request.cookies.get("demo_user")?.value ||
    request.cookies.get("sb-access-token")?.value;

  let sessionUser: any = null;
  if (sessionCookie) {
    try {
      sessionUser = JSON.parse(decodeURIComponent(sessionCookie));
    } catch {
      sessionUser = sessionCookie ? { token: sessionCookie } : null;
    }
  }

  const isAuthenticated = Boolean(sessionUser);

  // If user opens root '/', directly redirect to login (or dashboard/officer if logged in)
  if (pathname === "/") {
    const targetUrl = request.nextUrl.clone();
    if (isAuthenticated) {
      targetUrl.pathname = sessionUser?.role === "officer" ? "/officer" : "/dashboard";
    } else {
      targetUrl.pathname = "/login";
    }
    return NextResponse.redirect(targetUrl);
  }

  // Protected routes: user MUST be authenticated to enter main dashboard & features
  const protectedRoutes = [
    "/dashboard",
    "/crop-doctor",
    "/my-reports",
    "/outbreaks",
    "/mandi",
    "/officer",
  ];
  const isProtected = protectedRoutes.some((route) => pathname.startsWith(route));

  if (isProtected && !isAuthenticated) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
