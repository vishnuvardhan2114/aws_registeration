// middleware.ts (or src/middleware.ts if using src/)
import {
    convexAuthNextjsMiddleware,
    createRouteMatcher,
    nextjsMiddlewareRedirect,
  } from "@convex-dev/auth/nextjs/server";
  
  const isAuthPage = createRouteMatcher(["/admin"]);
  const isProtectedRoute = createRouteMatcher([
    "/admin/dashboard(.*)", 
    "/admin/scanner(.*)", 
    "/admin/manage-event(.*)", 
    "/admin/manage-users(.*)", 
    "/admin/register-users(.*)", 
    "/admin/transactions(.*)"
  ]);
  
  export default convexAuthNextjsMiddleware(async (request, { convexAuth }) => {
    const { pathname } = request.nextUrl;
    
    // Skip middleware for static files and API routes
    if (
      pathname.startsWith('/_next/') ||
      pathname.startsWith('/api/') ||
      pathname.includes('.') ||
      pathname === '/favicon.ico'
    ) {
      return;
    }

    try {
      const isAuthenticated = await convexAuth.isAuthenticated();
      
      // If user is on login page and already authenticated, redirect to dashboard
      if (isAuthPage(request) && isAuthenticated) {
        return nextjsMiddlewareRedirect(request, "/admin/dashboard");
      }
      
      // If user is on protected admin routes and not authenticated, redirect to login
      if (isProtectedRoute(request) && !isAuthenticated) {
        return nextjsMiddlewareRedirect(request, "/admin");
      }
    } catch (error) {
      console.error("Middleware authentication error:", error);
      // If there's an error checking authentication, allow the request to proceed
      // This prevents the middleware from breaking the app
    }
  });
  
  export const config = {
    matcher: [
      /*
       * Match all request paths except for the ones starting with:
       * - api (API routes)
       * - _next/static (static files)
       * - _next/image (image optimization files)
       * - favicon.ico (favicon file)
       */
      "/((?!api|_next/static|_next/image|favicon.ico).*)",
    ],
  };