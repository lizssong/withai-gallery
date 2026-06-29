import {
  boolean,
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
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
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ── Artists (작가 프로필) ──────────────────────────────────────────────────────
export const artists = mysqlTable("artists", {
  id: int("id").autoincrement().primaryKey(),
  /** 연결된 사용자 계정 */
  userId: int("userId"),
  name: varchar("name", { length: 100 }).notNull(),
  nameEn: varchar("nameEn", { length: 100 }).notNull().default(""),
  specialty: text("specialty"),
  bio: text("bio"),
  tools: text("tools"),
  profileImageUrl: text("profileImageUrl"),
  profileImageKey: text("profileImageKey"),
  sns: varchar("sns", { length: 500 }),
  displayOrder: int("displayOrder").default(0),
  isPublished: boolean("isPublished").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Artist = typeof artists.$inferSelect;
export type InsertArtist = typeof artists.$inferInsert;

// ── Artworks (작품) ────────────────────────────────────────────────────────────
export const artworks = mysqlTable("artworks", {
  id: int("id").autoincrement().primaryKey(),
  artistId: int("artistId").notNull(),
  titleKo: varchar("titleKo", { length: 200 }).notNull(),
  titleEn: varchar("titleEn", { length: 200 }).notNull().default(""),
  description: text("description"),
  year: varchar("year", { length: 10 }).default("2025"),
  medium: varchar("medium", { length: 200 }),
  mediaType: mysqlEnum("mediaType", ["image", "video"]).default("image").notNull(),
  mediaUrl: text("mediaUrl"),
  mediaKey: text("mediaKey"),
  thumbnailUrl: text("thumbnailUrl"),
  thumbnailKey: text("thumbnailKey"),
  tags: text("tags"),
  displayOrder: int("displayOrder").default(0),
  isPublished: boolean("isPublished").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Artwork = typeof artworks.$inferSelect;
export type InsertArtwork = typeof artworks.$inferInsert;