import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const pathname = request.nextUrl.pathname;

  // Extract session from cookie
  const sessionCookie =
    request.cookies.get("gram_sahayak_session")?.value ||
    request.cookies.get("demo_user")?.value;

  let sessionUser: any = null;
  if (sessionCookie) {
    try {
      sessionUser = JSON.parse(decodeURIComponent(sessionCookie));
    } catch {
      sessionUser = null;
    }
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";

  let supabaseUser = null;
  if (!supabaseUrl.includes("placeholder")) {
    try {
      const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet: any[]) {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
            supabaseResponse = NextResponse.next({
              request,
            });
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            );
          },
        },
      });

      const {
        data: { user },
      } = await supabase.auth.getUser();
      supabaseUser = user;
    } catch {
      // Offline or network error
    }
  }

  const isAuthenticated = Boolean(sessionUser || supabaseUser);

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

  // Prevent logged-in users from seeing login/signup unless they explicitly log out
  if ((pathname === "/login" || pathname === "/signup") && isAuthenticated) {
    // Note: We allow them to stay if they want, but if already logged in they can be redirected or allowed
  }

  return supabaseResponse;
}
