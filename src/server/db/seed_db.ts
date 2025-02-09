import "dotenv/config";

import { db } from "~/server/db";
import { users, organizations, groups, components, statusHistory, incidents, publicComponents } from "~/server/db/schema";
import { faker } from "@faker-js/faker";

async function seedDatabase() {
  try {
    console.log("Seeding database...");

    // Create Organizations
    const orgs = await db.insert(organizations).values(
      Array.from({ length: 3 }).map(() => ({
        name: faker.company.name(),
      }))
    ).returning();

    // Create Users
    const usersList = [];
    for (const org of orgs) {
      const createdUsers = await db.insert(users).values(
        Array.from({ length: 5 }).map(() => ({
          orgId: org.id,
          fname: faker.person.firstName(),
          lname: faker.person.lastName(),
          email: faker.internet.email(),
          clerkId: faker.string.uuid(),
          role: faker.helpers.arrayElement(["user", "admin"]),
        }))
      ).returning();
      usersList.push(...createdUsers);
    }

    // Create Groups
    const groupsList = [];
    for (const org of orgs) {
      const createdGroups = await db.insert(groups).values(
        Array.from({ length: 2 }).map(() => ({
          orgId: org.id,
          name: faker.commerce.department(),
          description: faker.lorem.sentence(),
        }))
      ).returning();
      groupsList.push(...createdGroups);
    }

    // Create Components
    const componentsList = [];
    for (const group of groupsList) {
      const createdComponents = await db.insert(components).values(
        Array.from({ length: 3 }).map(() => ({
          groupId: group.id,
          orgId: group.orgId,
          name: faker.commerce.productName(),
          description: faker.lorem.sentence(),
          url: faker.internet.url(),
          status: faker.helpers.arrayElement([
            "OPERATIONAL",
            "PERFORMANCE_ISSUES",
            "PARTIAL_OUTAGE",
            "MAJOR_OUTAGE",
            "UNKNOWN",
          ]) || "UNKNOWN", // Ensure status is always set
        }))
      ).returning();
      componentsList.push(...createdComponents);
    }

    // Create Status History
    for (const component of componentsList) {
      await db.insert(statusHistory).values(
        Array.from({ length: 2 }).map(() => ({
          componentId: component.id,
          status: faker.helpers.arrayElement([
            "OPERATIONAL",
            "PERFORMANCE_ISSUES",
            "PARTIAL_OUTAGE",
            "MAJOR_OUTAGE",
            "UNKNOWN",
          ]) || "UNKNOWN", // Ensure status is always set
          updatedAt: new Date(),
          notes: faker.lorem.sentence(),
        }))
      );
    }

    // Create Incidents
    for (const component of componentsList) {
      await db.insert(incidents).values(
        Array.from({ length: 1 }).map(() => ({
          componentId: component.id,
          title: faker.lorem.words(5),
          description: faker.lorem.sentence(),
          status: faker.helpers.arrayElement(["OPEN", "INVESTIGATING", "RESOLVED"]) || "OPEN", // Ensure status is always set
          occurredAt: new Date(),
        }))
      );
    }

    // Create Public Components
    for (const component of componentsList) {
      await db.insert(publicComponents).values({
        componentId: component.id,
      });
    }

    console.log("Database seeding complete.");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

seedDatabase();
