// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration

import { sql } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  json,
  pgTableCreator,
  text,
  timestamp,
  unique,
  varchar,
} from "drizzle-orm/pg-core";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator((name) => `statuszen_${name}`);
// Organizations Table
export const organizations = createTable(
  "organizations",
  {
    id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
    name: varchar("name", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 255 }).unique().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).default(sql`CURRENT_TIMESTAMP`).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(() => new Date()),
  }
);

// Users Table
export const users = createTable(
  "users",
  {
    id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
    clerkUserId: varchar("clerk_user_id", { length: 255 }).unique().notNull(),
    email: varchar("email", { length: 255 }).unique().notNull(),
    name: varchar("name", { length: 255 }),
    role: varchar("role", { length: 50 }).default("Member"),
    organizationId: integer("organization_id").references(() => organizations.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).default(sql`CURRENT_TIMESTAMP`).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(() => new Date()),
  }
);


// Teams Table
export const teams = createTable(
  "teams",
  {
    id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
    name: varchar("name", { length: 255 }).notNull(),
    organizationId: integer("organization_id").references(() => organizations.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).default(sql`CURRENT_TIMESTAMP`).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(() => new Date()),
  }
);


// services.ts
export const services = createTable(
  "services",
  {
    id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    url: varchar("url", { length: 512 }).notNull(),
    status: varchar("status", { length: 50 }).default("Operational"),
    isPublic: boolean("is_public").default(false),
    organizationId: integer("organization_id")
      .references(() => organizations.id, { onDelete: "cascade" }),  // Optional reference
    createdAt: timestamp("created_at", { withTimezone: true }).default(sql`CURRENT_TIMESTAMP`).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(() => new Date()),
  }
);


// Incidents Table
export const incidents = createTable(
  "incidents",
  {
    id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    status: varchar("status", { length: 50 }).default("Open"),
    impact: varchar("impact", { length: 50 }),
    serviceId: integer("service_id").references(() => services.id, { onDelete: "cascade" }),
    createdBy: integer("created_by").references(() => users.id, { onDelete: "set null" }),
    startedAt: timestamp("started_at", { withTimezone: true }).default(sql`CURRENT_TIMESTAMP`).notNull(),
    resolvedAt: timestamp("resolved_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).default(sql`CURRENT_TIMESTAMP`).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(() => new Date()),
  }
);

// Incident Updates Table
export const incidentUpdates = createTable(
  "incident_updates",
  {
    id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
    incidentId: integer("incident_id").references(() => incidents.id, { onDelete: "cascade" }),
    message: text("message").notNull(),
    status: varchar("status", { length: 50 }).default("Investigating"),
    createdBy: integer("created_by").references(() => users.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).default(sql`CURRENT_TIMESTAMP`).notNull(),
  }
);

// Status History Table
export const statusHistory = createTable(
  "status_history",
  {
    id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
    serviceId: integer("service_id").references(() => services.id, { onDelete: "cascade" }),
    previousStatus: varchar("previous_status", { length: 50 }),
    currentStatus: varchar("current_status", { length: 50 }).notNull(),
    changedBy: integer("changed_by").references(() => users.id, { onDelete: "set null" }),
    changedAt: timestamp("changed_at", { withTimezone: true }).default(sql`CURRENT_TIMESTAMP`).notNull(),
  }
);

