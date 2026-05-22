import { withAuth } from "next-auth/middleware";

export const proxy = withAuth({
  pages: {
    signIn: "/login"
  },
  callbacks: {
    authorized: ({ token }) => Boolean(token)
  }
});

export const config = {
  matcher: ["/profile/:path*", "/dashboard/:path*", "/admin/:path*", "/rescuer/:path*"]
};
