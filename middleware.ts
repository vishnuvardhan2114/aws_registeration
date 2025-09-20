// middleware.ts (or src/middleware.ts if using src/)
import {
    convexAuthNextjsMiddleware,
    createRouteMatcher,
    nextjsMiddlewareRedirect,
  } from "@convex-dev/auth/nextjs/server";
  
  const isAuthPage = createRouteMatcher(["/auth(.*)"]);
  const isProtectedRoute = createRouteMatcher(["/admin/dashboard", ]);
  
  export default convexAuthNextjsMiddleware(async (request, { convexAuth }) => {
    if (isAuthPage(request) && (await convexAuth.isAuthenticated())) {
      return nextjsMiddlewareRedirect(request, "/dashboard");
    }
    if (isProtectedRoute(request) && !(await convexAuth.isAuthenticated())) {
      return nextjsMiddlewareRedirect(request, "/admin");
    }
  });
  
  export const config = {
    matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
  };