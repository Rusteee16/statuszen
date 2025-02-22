import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';

// Public routes that do NOT require authentication
const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/dashboard(.*)',
  '/api/(.*)',
  // '/create-organization',
]);



export default clerkMiddleware(async (auth, request) => {
  await auth.protect();
  if (!isPublicRoute(request)) {
    
    const user = await currentUser();
    if (!user) {
      return NextResponse.redirect(new URL('/sign-in', request.url));
    }

    try {
      // Check if user exists in DB
      const userResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/get-user?clerkId=${user.id}`);
      let userData;
      if (userResponse.ok) {
        userData = await userResponse.json();
      } else {
        const addUserResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/add-user`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            clerkId: user.id,
            email: user.primaryEmailAddress,
            fname: user.firstName,
            lname: user.lastName,
            role: "user",
          }),
        });
        if (!addUserResponse.ok) {
          throw new Error("Failed to add user to database");
        }
        userData = await addUserResponse.json();
      }

      // Ensure user belongs to an organization
      const orgResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/get-organization?userId=${user.id}`);
      if (orgResponse.ok) {
        const orgData = await orgResponse.json();
        if (orgData.orgId) {
          return NextResponse.redirect(new URL(`/${orgData.orgId}/dashboard`, request.url));
        }
      }
    } catch (error) {
      console.error("Middleware error:", error);
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
    
    return NextResponse.redirect(new URL(`/create-organization`, request.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
