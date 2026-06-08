import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, decimal, foreignKey } from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable(
  "users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  isArtist: boolean("isArtist").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Extended user type with artist profile
export type UserWithArtist = User & {
  artists?: Artist[];
};

/**
 * Artists table - stores artist profiles
 */
export const artists = mysqlTable(
  "artists",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    bio: text("bio"),
    genre: varchar("genre", { length: 100 }),
    category: varchar("category", { length: 100 }).notNull(),
    priceFrom: varchar("priceFrom", { length: 50 }),
    city: varchar("city", { length: 100 }),
    country: varchar("country", { length: 100 }),
    avatarUrl: text("avatarUrl"),
    coverUrl: text("coverUrl"),
    photo2: text("photo2"),
    photo3: text("photo3"),
    video1: text("video1"),
    video2: text("video2"),
    video3: text("video3"),
    instagram: varchar("instagram", { length: 255 }),
    spotify: varchar("spotify", { length: 255 }),
    website: varchar("website", { length: 255 }),
    subscriptionPlan: mysqlEnum("subscriptionPlan", ["free", "standard", "pro"]).default("free").notNull(),
    verified: boolean("verified").default(false).notNull(),
    viewCount: int("viewCount").default(0).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    userIdFk: foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
    }),
  })
);

export type Artist = typeof artists.$inferSelect;
export type InsertArtist = typeof artists.$inferInsert;

/**
 * Events table - stores events published by artists
 */
export const events = mysqlTable(
  "events",
  {
    id: int("id").autoincrement().primaryKey(),
    artistId: int("artistId"),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    eventDate: varchar("eventDate", { length: 50 }).notNull(),
    eventTime: varchar("eventTime", { length: 50 }),
    venue: varchar("venue", { length: 255 }).notNull(),
    city: varchar("city", { length: 100 }).notNull(),
    country: varchar("country", { length: 100 }).notNull(),
    imageUrl: text("imageUrl"),
    ticketUrl: text("ticketUrl"),
    price: varchar("price", { length: 50 }),
    contactEmail: varchar("contactEmail", { length: 255 }).notNull(),
    contactPhone: varchar("contactPhone", { length: 20 }),
    submitterName: varchar("submitterName", { length: 255 }),
    published: boolean("published").default(false).notNull(),
    viewCount: int("viewCount").default(0).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    artistIdFk: foreignKey({
      columns: [table.artistId],
      foreignColumns: [artists.id],
    }),
  })
);

export type Event = typeof events.$inferSelect;
export type InsertEvent = typeof events.$inferInsert;

/**
 * Inquiries table - stores contact/consultation requests
 */
export const inquiries = mysqlTable(
  "inquiries",
  {
    id: int("id").autoincrement().primaryKey(),
    artistId: int("artistId").notNull(),
    eventId: int("eventId"),
    senderName: varchar("senderName", { length: 255 }).notNull(),
    senderEmail: varchar("senderEmail", { length: 255 }).notNull(),
    senderPhone: varchar("senderPhone", { length: 20 }),
    subject: varchar("subject", { length: 255 }).notNull(),
    message: text("message").notNull(),
    status: mysqlEnum("status", ["pending", "read", "replied", "closed"]).default("pending").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    artistIdFk: foreignKey({
      columns: [table.artistId],
      foreignColumns: [artists.id],
    }),
    eventIdFk: foreignKey({
      columns: [table.eventId],
      foreignColumns: [events.id],
    }),
  })
);

export type Inquiry = typeof inquiries.$inferSelect;
export type InsertInquiry = typeof inquiries.$inferInsert;

/**
 * Subscription Plans table - stores pricing plans
 */
export const subscriptionPlans = mysqlTable("subscriptionPlans", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 50 }).notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  billingPeriod: mysqlEnum("billingPeriod", ["monthly", "yearly"]).default("monthly").notNull(),
  maxPhotos: int("maxPhotos").default(1).notNull(),
  maxVideos: int("maxVideos").default(0).notNull(),
  maxEvents: int("maxEvents").default(5).notNull(),
  features: text("features"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SubscriptionPlan = typeof subscriptionPlans.$inferSelect;
export type InsertSubscriptionPlan = typeof subscriptionPlans.$inferInsert;

/**
 * Relations
 */
export const usersRelations = relations(users, ({ many }) => ({
  artists: many(artists),
}));

export const artistsRelations = relations(artists, ({ one, many }) => ({
  user: one(users, {
    fields: [artists.userId],
    references: [users.id],
  }),
  events: many(events),
  inquiries: many(inquiries),
}));

export const eventsRelations = relations(events, ({ one, many }) => ({
  artist: one(artists, {
    fields: [events.artistId],
    references: [artists.id],
  }),
  inquiries: many(inquiries),
}));

export const inquiriesRelations = relations(inquiries, ({ one }) => ({
  artist: one(artists, {
    fields: [inquiries.artistId],
    references: [artists.id],
  }),
  event: one(events, {
    fields: [inquiries.eventId],
    references: [events.id],
  }),
}));