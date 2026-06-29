import { and, asc, desc, eq, inArray, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  artists, artworks, artworkComments, artworkLikes,
  invitations,
  InsertArtist, InsertArtwork, InsertArtworkComment, InsertArtworkLike, InsertInvitation,
  InsertUser, users
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ── Artists ───────────────────────────────────────────────────────────────────────────────────────
export async function getAllArtists() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(artists).where(eq(artists.isPublished, true)).orderBy(asc(artists.displayOrder), asc(artists.id));
}

export async function getAllArtistsAdmin() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(artists).orderBy(asc(artists.displayOrder), asc(artists.id));
}

export async function getArtistById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(artists).where(eq(artists.id, id)).limit(1);
  return result[0];
}

export async function getArtistByUserId(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(artists).where(eq(artists.userId, userId)).limit(1);
  return result[0];
}

export async function createArtist(data: InsertArtist) {
  const db = await getDb();
  if (!db) throw new Error('DB not available');
  await db.insert(artists).values(data);
  const result = await db.select().from(artists).orderBy(asc(artists.id));
  return result[result.length - 1];
}

export async function updateArtist(id: number, data: Partial<InsertArtist>) {
  const db = await getDb();
  if (!db) throw new Error('DB not available');
  await db.update(artists).set(data).where(eq(artists.id, id));
  return getArtistById(id);
}

export async function deleteArtist(id: number) {
  const db = await getDb();
  if (!db) throw new Error('DB not available');
  await db.delete(artworks).where(eq(artworks.artistId, id));
  await db.delete(artists).where(eq(artists.id, id));
}

// ── Artworks ────────────────────────────────────────────────────────────────────────────────────
export async function getArtworksByArtistId(artistId: number, publishedOnly = true) {
  const db = await getDb();
  if (!db) return [];
  const conditions = publishedOnly
    ? and(eq(artworks.artistId, artistId), eq(artworks.isPublished, true))
    : eq(artworks.artistId, artistId);
  return db.select().from(artworks).where(conditions).orderBy(asc(artworks.displayOrder), asc(artworks.id));
}

export async function getArtworkById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(artworks).where(eq(artworks.id, id)).limit(1);
  return result[0];
}

export async function createArtwork(data: InsertArtwork) {
  const db = await getDb();
  if (!db) throw new Error('DB not available');
  await db.insert(artworks).values(data);
  const all = await db.select().from(artworks).where(eq(artworks.artistId, data.artistId)).orderBy(asc(artworks.id));
  return all[all.length - 1];
}

export async function updateArtwork(id: number, data: Partial<InsertArtwork>) {
  const db = await getDb();
  if (!db) throw new Error('DB not available');
  await db.update(artworks).set(data).where(eq(artworks.id, id));
  return getArtworkById(id);
}

export async function deleteArtwork(id: number) {
  const db = await getDb();
  if (!db) throw new Error('DB not available');
  await db.delete(artworks).where(eq(artworks.id, id));
}

export async function getAllArtworks() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(artworks).orderBy(asc(artworks.artistId), asc(artworks.displayOrder), asc(artworks.id));
}

export async function getArtworkCountsByArtistIds(artistIds: number[]): Promise<Record<number, number>> {
  if (!artistIds.length) return {};
  const db = await getDb();
  if (!db) return {};
  const rows = await db
    .select({ artistId: artworks.artistId, count: sql<number>`count(*) as count` })
    .from(artworks)
    .where(and(inArray(artworks.artistId, artistIds), eq(artworks.isPublished, true)))
    .groupBy(artworks.artistId);
  const result: Record<number, number> = {};
  for (const row of rows) {
    if (row.artistId !== null) result[row.artistId] = Number(row.count);
  }
  return result;
}

// ── Invitations ───────────────────────────────────────────────────────────────────────
export async function createInvitation(data: InsertInvitation) {
  const db = await getDb();
  if (!db) throw new Error('DB not available');
  await db.insert(invitations).values(data);
  const result = await db.select().from(invitations).where(eq(invitations.token, data.token)).limit(1);
  return result[0];
}

export async function getAllInvitations() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(invitations).orderBy(desc(invitations.createdAt));
}

export async function getInvitationByToken(token: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(invitations).where(eq(invitations.token, token)).limit(1);
  return result[0];
}

export async function markInvitationUsed(token: string, artistId: number) {
  const db = await getDb();
  if (!db) throw new Error('DB not available');
  await db.update(invitations).set({ isUsed: true, artistId }).where(eq(invitations.token, token));
}

export async function deleteInvitation(id: number) {
  const db = await getDb();
  if (!db) throw new Error('DB not available');
  await db.delete(invitations).where(eq(invitations.id, id));
}

// ── ArtworkLikes ──────────────────────────────────────────────────────────────────────
export async function getLikeCount(artworkId: number): Promise<number> {
  const db = await getDb();
  if (!db) return 0;
  const rows = await db
    .select({ count: sql<number>`count(*) as count` })
    .from(artworkLikes)
    .where(eq(artworkLikes.artworkId, artworkId));
  return Number(rows[0]?.count ?? 0);
}

export async function hasLiked(artworkId: number, userId: number | null, fingerprint: string): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  const condition = userId
    ? and(eq(artworkLikes.artworkId, artworkId), eq(artworkLikes.userId, userId))
    : and(eq(artworkLikes.artworkId, artworkId), eq(artworkLikes.fingerprint, fingerprint));
  const rows = await db.select().from(artworkLikes).where(condition).limit(1);
  return rows.length > 0;
}

export async function addLike(data: InsertArtworkLike) {
  const db = await getDb();
  if (!db) throw new Error('DB not available');
  await db.insert(artworkLikes).values(data);
}

export async function removeLike(artworkId: number, userId: number | null, fingerprint: string) {
  const db = await getDb();
  if (!db) throw new Error('DB not available');
  const condition = userId
    ? and(eq(artworkLikes.artworkId, artworkId), eq(artworkLikes.userId, userId))
    : and(eq(artworkLikes.artworkId, artworkId), eq(artworkLikes.fingerprint, fingerprint));
  await db.delete(artworkLikes).where(condition);
}

// ── ArtworkComments ──────────────────────────────────────────────────────────────────
export async function getCommentsByArtworkId(artworkId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(artworkComments)
    .where(and(eq(artworkComments.artworkId, artworkId), eq(artworkComments.isHidden, false)))
    .orderBy(asc(artworkComments.createdAt));
}

export async function addComment(data: InsertArtworkComment) {
  const db = await getDb();
  if (!db) throw new Error('DB not available');
  await db.insert(artworkComments).values(data);
  const all = await db.select().from(artworkComments).where(eq(artworkComments.artworkId, data.artworkId)).orderBy(desc(artworkComments.createdAt));
  return all[0];
}

export async function deleteComment(id: number) {
  const db = await getDb();
  if (!db) throw new Error('DB not available');
  await db.delete(artworkComments).where(eq(artworkComments.id, id));
}

export async function hideComment(id: number) {
  const db = await getDb();
  if (!db) throw new Error('DB not available');
  await db.update(artworkComments).set({ isHidden: true }).where(eq(artworkComments.id, id));
}
