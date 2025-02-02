import { pgTableCreator, varchar, uuid, timestamp, text } from 'drizzle-orm/pg-core';
import { relations, sql } from 'drizzle-orm';

export type ComponentStatus =
  | "OPERATIONAL"
  | "PERFORMANCE_ISSUES"
  | "PARTIAL_OUTAGE"
  | "MAJOR_OUTAGE"
  | "UNKNOWN";

// Create tables
export const createTable = pgTableCreator(name => `democheck_${name}`);

// Organizations Table
export const organizations = createTable("organization", {
  id: uuid("id").primaryKey().notNull().defaultRandom(), // shortened
  name: varchar("name", { length: 255 }).notNull(),
});

// Users Table
export const users = createTable("user", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  orgId: uuid("org_id")
    .references(() => organizations.id)
    .notNull(),
  fname: varchar("fname", { length: 255 }),
  lname: varchar("lname", { length: 255 }),
  email: varchar("email", { length: 255 }).notNull(),
  clerkId: varchar("clerk_id", { length: 255 }).notNull(),
  role: varchar("role", { length: 50 }),
});

// Groups Table
export const groups = createTable("group", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  orgId: uuid("org_id")
    .references(() => organizations.id)
    .notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
});

// Components Table
export const components = createTable("component", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  groupId: uuid("group_id")
    .references(() => groups.id)
    .notNull(),
  orgId: uuid("org_id")
    .references(() => organizations.id)
    .notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  url: varchar("url", { length: 255 }),
  status: varchar("status", { length: 50 }).notNull().default("UNKNOWN"),
});

// Status History Table
export const statusHistory = createTable("status_history", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  componentId: uuid("component_id")
    .references(() => components.id)
    .notNull(),
  status: varchar("status", { length: 50 }),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`),
  notes: text("notes"),
});

// Incidents Table
export const incidents = createTable("incident", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  componentId: uuid("component_id")
    .references(() => components.id)
    .notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  status: varchar("status", { length: 50 }),
  occurredAt: timestamp("occurred_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`),
});

// Public Components Table
export const publicComponents = createTable("public_component", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  componentId: uuid("component_id")
    .references(() => components.id)
    .notNull(),
});

// -------------------------------------------------
// Relations
// -------------------------------------------------

// -- PARENT side (Organizations) uses "many(...)" without fields/references
export const organizationsRelations = relations(organizations, ({ many }) => ({
  users: many(users),
  groups: many(groups),
  components: many(components),
}));

// -- CHILD side (Users) has the actual foreign key, so we define it
export const usersRelations = relations(users, ({ one }) => ({
  organization: one(organizations, {
    fields: [users.orgId],
    references: [organizations.id],
  }),
}));

// Similarly for Groups
export const groupsRelations = relations(groups, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [groups.orgId],
    references: [organizations.id],
  }),
  components: many(components),
}));

// Similarly for Components
export const componentsRelations = relations(components, ({ one, many }) => ({
  group: one(groups, {
    fields: [components.groupId],
    references: [groups.id],
  }),
  organization: one(organizations, {
    fields: [components.orgId],
    references: [organizations.id],
  }),
  statusHistory: many(statusHistory),
  incidents: many(incidents),
  publicComponent: many(publicComponents),
}));

// Status History
export const statusHistoryRelations = relations(statusHistory, ({ one }) => ({
  component: one(components, {
    fields: [statusHistory.componentId],
    references: [components.id],
  }),
}));

// Incidents
export const incidentsRelations = relations(incidents, ({ one }) => ({
  component: one(components, {
    fields: [incidents.componentId],
    references: [components.id],
  }),
}));

// Public Components
export const publicComponentsRelations = relations(publicComponents, ({ one }) => ({
  component: one(components, {
    fields: [publicComponents.componentId],
    references: [components.id],
  }),
}));
