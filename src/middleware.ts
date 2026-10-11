import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    "/",
    "/dashboard/:path*",
    "/crop-doctor/:path*",
    "/my-reports/:path*",
    "/outbreaks/:path*",
    "/mandi/:path*",
    "/officer/:path*",
    "/schemes/:path*",
    "/roadmap/:path*",
    "/login",
    "/signup",
  ],
};

