import type { NextAuthConfig } from "next-auth";

// Edge-compatible auth config — no database imports
export const authConfig: NextAuthConfig = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const PUBLIC_PATHS = ["/", "/login", "/register"];
      const isPublic =
        PUBLIC_PATHS.some((p) => nextUrl.pathname === p) ||
        nextUrl.pathname.startsWith("/api/auth");

      if (!isPublic && !isLoggedIn) return false;
      if (isLoggedIn && (nextUrl.pathname === "/login" || nextUrl.pathname === "/register")) {
        return Response.redirect(new URL("/dashboard", nextUrl));
      }
      return true;
    },
  },
};
