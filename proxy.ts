import { withAuth } from "next-auth/middleware";

const PUBLIC_ROUTES = new Set([
  "/",
  "/login",
  "/register",
  "/privacy",
  "/terms",
  "/data-deletion"
]);

const PUBLIC_API_ROUTES = new Set(["/api/health/db"]);
const PUBLIC_API_PREFIXES = ["/api/auth/"];

function isPublicPath(pathname: string) {
  return (
    PUBLIC_ROUTES.has(pathname) ||
    PUBLIC_API_ROUTES.has(pathname) ||
    PUBLIC_API_PREFIXES.some((prefix) => pathname.startsWith(prefix))
  );
}

export const proxy = withAuth({
  pages: {
    signIn: "/login"
  },
  callbacks: {
    authorized: ({ req, token }) => {
      if (isPublicPath(req.nextUrl.pathname)) {
        return true;
      }

      return Boolean(token);
    }
  }
});

export const config = {
  // Only authenticated app areas are matched. Public routes such as
  // /data-deletion are intentionally excluded from the proxy.
  matcher: ["/profile/:path*", "/dashboard/:path*", "/admin/:path*", "/rescuer/:path*"]
};
