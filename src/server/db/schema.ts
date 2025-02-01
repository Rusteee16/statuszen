import { pgTableCreator, varchar, uuid, timestamp, foreignKey, text, jsonb, integer, boolean } from 'drizzle-orm/pg-core';
import { relations, sql } from 'drizzle-orm';

export const createTable = pgTableCreator((name) => `democheck_${name}`);

// Users Table
export const users = createTable("user", {
  id: uuid("id").defaultRandom().primaryKey(),
  orgId: uuid("org_id"),
  fname: varchar("fname", { length: 255 }),
  lname: varchar("lname", { length: 255 }),
  email: varchar("email", { length: 255 }).notNull(),
  clerkId: varchar("clerk_id", { length: 255 }).notNull(),
  role: varchar("role", { length: 50 }),
});

// Organizations Table
export const organizations = createTable("organization", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  ownerId: uuid("owner_id"),
});

// Groups Table
export const groups = createTable("group", {
  id: uuid("id").defaultRandom().primaryKey(),
  orgId: uuid("org_id"),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
});

// Components Table
export const components = createTable("component", {
  id: uuid("id").defaultRandom().primaryKey(),
  groupId: uuid("group_id"),
  orgId: uuid("org_id"),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  url: varchar("url", { length: 255 }),
  status: varchar("status", { length: 50 }),
});

// Status History Table
export const statusHistory = createTable("status_history", {
  id: uuid("id").defaultRandom().primaryKey(),
  componentId: uuid("component_id"),
  status: varchar("status", { length: 50 }),
  updatedAt: timestamp("updated_at", { withTimezone: true }).default(sql`CURRENT_TIMESTAMP`),
  notes: text("notes"),
});

// Incidents Table
export const incidents = createTable("incident", {
  id: uuid("id").defaultRandom().primaryKey(),
  componentId: uuid("component_id"),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  status: varchar("status", { length: 50 }),
  occurredAt: timestamp("occurred_at", { withTimezone: true }).default(sql`CURRENT_TIMESTAMP`),
});

// Public Components Table
export const publicComponents = createTable("public_component", {
  id: uuid("id").defaultRandom().primaryKey(),
  componentId: uuid("component_id"),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  organizations: many(organizations),
}));

export const organizationsRelations = relations(organizations, ({ many, one }) => ({
  users: many(users),
  groups: many(groups),
  components: many(components),
  owner: one(users, {
    fields: [organizations.ownerId],
    references: [users.id],
  }),
}));

export const groupsRelations = relations(groups, ({ many, one }) => ({
  components: many(components),
  organization: one(organizations, {
    fields: [groups.orgId],
    references: [organizations.id],
  }),
}));

export const componentsRelations = relations(components, ({ many, one }) => ({
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
}));

export const statusHistoryRelations = relations(statusHistory, ({ one }) => ({
  component: one(components, {
    fields: [statusHistory.componentId],
    references: [components.id],
  }),
}));

export const incidentsRelations = relations(incidents, ({ one }) => ({
  component: one(components, {
    fields: [incidents.componentId],
    references: [components.id],
  }),
}));
