import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// Public routes that do NOT require authentication
const isPublicRoute = createRouteMatcher([
  '/',                // Public homepage
  '/sign-in(.*)',     // Sign-in page and related routes
  '/sign-up(.*)',     // Sign-up page and related routes
  '/status(.*)',      // Public status page
  '/api/(.*)',        // Public API routes
]);

export default clerkMiddleware(async (auth, request) => {
  // Protect all routes except public ones
  if (!isPublicRoute(request)) {
    await auth.protect();  // Enforce authentication
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API and tRPC routes
    '/(api|trpc)(.*)',
  ],
};
