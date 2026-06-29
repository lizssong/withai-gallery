import { and, asc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { artists, artworks, InsertArtist, InsertArtwork, InsertUser, users } from "../drizzle/schema";
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
