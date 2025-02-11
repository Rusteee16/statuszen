import { NextResponse, NextRequest } from "next/server";
import { db } from "~/server/db";
import { users, organizations } from "~/server/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { clerkId, email, fname, lname, role } = body;
    
    // Check if user already exists in the database
    const existingUser = await db.select().from(users).where(eq(users.clerkId, clerkId));
    
    if (existingUser.length > 0) {
      return NextResponse.json({ message: "User already exists" }, { status: 200 });
    }

    // Check if there is an existing organization
    const org = await db.select().from(organizations).limit(1);
    let orgId = org.length > 0 && org[0] ? org[0].id : null;

    // If no organization exists, create one
    if (!orgId) {
      const newOrg = await db.insert(organizations).values({ name: `${fname || "New"}'s Organization` }).returning();
      orgId = newOrg.length > 0 && newOrg[0] ? newOrg[0].id : null;
    }

    if (!orgId) {
      return NextResponse.json({ error: "Failed to create organization" }, { status: 500 });
    }

    // Insert new user with assigned organization
    const newUser = await db.insert(users).values({
      clerkId,
      email,
      fname,
      lname,
      role: role || "user",
      orgId,
    }).returning();

    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to add user" }, { status: 500 });
  }
}
