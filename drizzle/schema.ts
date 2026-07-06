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
  /** 소속 전시회 ID */
  exhibitionId: int("exhibitionId"),
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
  /** AI 생성 프롬프트 */
  aiPrompt: text("aiPrompt"),
  displayOrder: int("displayOrder").default(0),
  isPublished: boolean("isPublished").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Artwork = typeof artworks.$inferSelect;
export type InsertArtwork = typeof artworks.$inferInsert;

// ── Invitations (작가 초대 링크) ────────────────────────────────────────────
export const invitations = mysqlTable("invitations", {
  id: int("id").autoincrement().primaryKey(),
  /** 작가 슬롯 식별자 (이 토큰으로 등록 시 해당 슬롯에 작가 프로필 연결) */
  token: varchar("token", { length: 64 }).notNull().unique(),
  /** 슬롯 이름 (예: 작가 1번, 작가 2번) — 관리자가 지정 */
  slotLabel: varchar("slotLabel", { length: 100 }).notNull().default(""),
  /** 사용 여부 */
  isUsed: boolean("isUsed").default(false).notNull(),
  /** 수락 시 연결된 작가 ID */
  artistId: int("artistId"),
  /** 만료 시간 (null = 무제한) */
  expiresAt: timestamp("expiresAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Invitation = typeof invitations.$inferSelect;
export type InsertInvitation = typeof invitations.$inferInsert;

// ── ArtworkLikes (작품 좋아요) ───────────────────────────────────────────
export const artworkLikes = mysqlTable("artworkLikes", {
  id: int("id").autoincrement().primaryKey(),
  artworkId: int("artworkId").notNull(),
  /** 로그인 사용자 ID (비로그인은 null) */
  userId: int("userId"),
  /** 비로그인 중복 방지용 fingerprint (IP + UA 해시) */
  fingerprint: varchar("fingerprint", { length: 64 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ArtworkLike = typeof artworkLikes.$inferSelect;
export type InsertArtworkLike = typeof artworkLikes.$inferInsert;

// ── ArtworkComments (작품 감상 댓글) ─────────────────────────────────────
export const artworkComments = mysqlTable("artworkComments", {
  id: int("id").autoincrement().primaryKey(),
  artworkId: int("artworkId").notNull(),
  /** 로그인 사용자 ID */
  userId: int("userId"),
  /** 비로그인 닉네임 */
  guestName: varchar("guestName", { length: 50 }),
  content: text("content").notNull(),
  isHidden: boolean("isHidden").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ArtworkComment = typeof artworkComments.$inferSelect;
export type InsertArtworkComment = typeof artworkComments.$inferInsert;

// ── Exhibitions (전시회) ───────────────────────────────────────────────
export const exhibitions = mysqlTable("exhibitions", {
  id: int("id").autoincrement().primaryKey(),
  /** URL 슬러그 (e.g. spring-2025) */
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  /** 전시회 제목 (한글) */
  titleKo: varchar("titleKo", { length: 200 }).notNull(),
  /** 전시회 제목 (영문) */
  titleEn: varchar("titleEn", { length: 200 }).notNull().default(""),
  /** 전시회 소개문 */
  description: text("description"),
  /** 큐레이터 이름 */
  curatorName: varchar("curatorName", { length: 100 }),
  /** 초대장 부제목 */
  subtitle: varchar("subtitle", { length: 300 }),
  /** 전시 시작일 */
  startDate: timestamp("startDate"),
  /** 전시 종료일 */
  endDate: timestamp("endDate"),
  /** 최대 상시 인원 (0 = 무제한) */
  maxArtists: int("maxArtists").default(10).notNull(),
  /** 전시회 상태 */
  status: mysqlEnum("status", ["draft", "active", "closed"]).default("draft").notNull(),
  /** 대표 이미지 URL */
  coverImageUrl: text("coverImageUrl"),
  coverImageKey: text("coverImageKey"),
  /** 장르 */
  genre: varchar("genre", { length: 100 }),
  /** 시즘 */
  season: varchar("season", { length: 50 }),
  /** 공개 여부 */
  isPublished: boolean("isPublished").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Exhibition = typeof exhibitions.$inferSelect;
export type InsertExhibition = typeof exhibitions.$inferInsert;