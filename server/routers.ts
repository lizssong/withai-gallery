import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import {
  createArtist, createArtwork, deleteArtist, deleteArtwork,
  getAllArtists, getAllArtistsAdmin, getAllArtworks, getArtistById, getArtistByUserId,
  getArtworkById, getArtworksByArtistId, updateArtist, updateArtwork,
  getArtworkCountsByArtistIds,
  createInvitation, getAllInvitations, getInvitationByToken, markInvitationUsed, deleteInvitation,
  getLikeCount, hasLiked, addLike, removeLike,
  getCommentsByArtworkId, addComment, deleteComment, hideComment,
} from "./db";
import { nanoid } from "nanoid";
import { storagePut } from "./storage";

async function uploadBase64(base64: string, mimeType: string, folder: string) {
  const data = base64.replace(/^data:[^;]+;base64,/, "");
  const buffer = Buffer.from(data, "base64");
  const ext = mimeType.split("/")[1]?.split(";")[0] ?? "bin";
  const key = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  return storagePut(key, buffer, mimeType);
}

const galleryRouter = router({
  listArtists: publicProcedure.query(() => getAllArtists()),
  artworkCounts: publicProcedure.query(async () => {
    const artistList = await getAllArtists();
    const ids = artistList.map(a => a.id);
    return getArtworkCountsByArtistIds(ids);
  }),
  getArtist: publicProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
    const a = await getArtistById(input.id);
    if (!a) throw new TRPCError({ code: "NOT_FOUND" });
    return a;
  }),
  listArtworks: publicProcedure.input(z.object({ artistId: z.number() })).query(async ({ input }) => {
    const artworks = await getArtworksByArtistId(input.artistId, true);
    // 좋아요 수 집계
    const withLikes = await Promise.all(
      artworks.map(async (w) => ({ ...w, likeCount: await getLikeCount(w.id) }))
    );
    return withLikes;
  }),
  getArtwork: publicProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
    const w = await getArtworkById(input.id);
    if (!w) throw new TRPCError({ code: "NOT_FOUND" });
    return w;
  }),
});

const artistRouter = router({
  myProfile: protectedProcedure.query(async ({ ctx }) => {
    const result = await getArtistByUserId(ctx.user.id);
    return result ?? null;
  }),
  myArtworks: protectedProcedure.query(async ({ ctx }) => {
    const a = await getArtistByUserId(ctx.user.id);
    if (!a) return [];
    return getArtworksByArtistId(a.id, false);
  }),
  createProfile: protectedProcedure.input(z.object({
    name: z.string().min(1), nameEn: z.string().default(""),
    specialty: z.string().optional(), bio: z.string().optional(),
    tools: z.string().optional(), sns: z.string().optional(),
    profileImageBase64: z.string().optional(), profileImageMime: z.string().optional(),
  })).mutation(async ({ ctx, input }) => {
    const existing = await getArtistByUserId(ctx.user.id);
    if (existing) throw new TRPCError({ code: "CONFLICT", message: "이미 작가 프로필이 있습니다." });
    let profileImageUrl: string | undefined, profileImageKey: string | undefined;
    if (input.profileImageBase64 && input.profileImageMime) {
      const r = await uploadBase64(input.profileImageBase64, input.profileImageMime, "profiles");
      profileImageUrl = r.url; profileImageKey = r.key;
    }
    return createArtist({ userId: ctx.user.id, name: input.name, nameEn: input.nameEn,
      specialty: input.specialty, bio: input.bio, tools: input.tools, sns: input.sns,
      profileImageUrl, profileImageKey });
  }),
  updateProfile: protectedProcedure.input(z.object({
    name: z.string().min(1).optional(), nameEn: z.string().optional(),
    specialty: z.string().optional(), bio: z.string().optional(),
    tools: z.string().optional(), sns: z.string().optional(),
    profileImageBase64: z.string().optional(), profileImageMime: z.string().optional(),
  })).mutation(async ({ ctx, input }) => {
    const artist = await getArtistByUserId(ctx.user.id);
    if (!artist) throw new TRPCError({ code: "NOT_FOUND", message: "작가 프로필이 없습니다." });
    const update: Record<string, unknown> = {};
    if (input.name !== undefined) update.name = input.name;
    if (input.nameEn !== undefined) update.nameEn = input.nameEn;
    if (input.specialty !== undefined) update.specialty = input.specialty;
    if (input.bio !== undefined) update.bio = input.bio;
    if (input.tools !== undefined) update.tools = input.tools;
    if (input.sns !== undefined) update.sns = input.sns;
    if (input.profileImageBase64 && input.profileImageMime) {
      const r = await uploadBase64(input.profileImageBase64, input.profileImageMime, "profiles");
      update.profileImageUrl = r.url; update.profileImageKey = r.key;
    }
    return updateArtist(artist.id, update as any);
  }),
  uploadArtwork: protectedProcedure.input(z.object({
    titleKo: z.string().min(1), titleEn: z.string().default(""),
    description: z.string().optional(), year: z.string().default("2025"),
    medium: z.string().optional(), mediaType: z.enum(["image", "video"]).default("image"),
    mediaBase64: z.string(), mediaMime: z.string(),
    thumbnailBase64: z.string().optional(), thumbnailMime: z.string().optional(),
    tags: z.string().optional(),
  })).mutation(async ({ ctx, input }) => {
    const artist = await getArtistByUserId(ctx.user.id);
    if (!artist) throw new TRPCError({ code: "NOT_FOUND", message: "먼저 작가 프로필을 만들어 주세요." });
    const folder = input.mediaType === "video" ? "videos" : "artworks";
    const media = await uploadBase64(input.mediaBase64, input.mediaMime, folder);
    let thumbnailUrl: string | undefined, thumbnailKey: string | undefined;
    if (input.thumbnailBase64 && input.thumbnailMime) {
      const t = await uploadBase64(input.thumbnailBase64, input.thumbnailMime, "thumbnails");
      thumbnailUrl = t.url; thumbnailKey = t.key;
    }
    return createArtwork({ artistId: artist.id, titleKo: input.titleKo, titleEn: input.titleEn,
      description: input.description, year: input.year, medium: input.medium,
      mediaType: input.mediaType, mediaUrl: media.url, mediaKey: media.key,
      thumbnailUrl, thumbnailKey, tags: input.tags, isPublished: true });
  }),
  updateArtwork: protectedProcedure.input(z.object({
    id: z.number(), titleKo: z.string().min(1).optional(), titleEn: z.string().optional(),
    description: z.string().optional(), year: z.string().optional(),
    medium: z.string().optional(), tags: z.string().optional(), isPublished: z.boolean().optional(),
  })).mutation(async ({ ctx, input }) => {
    const artist = await getArtistByUserId(ctx.user.id);
    if (!artist) throw new TRPCError({ code: "NOT_FOUND" });
    const artwork = await getArtworkById(input.id);
    if (!artwork || artwork.artistId !== artist.id) throw new TRPCError({ code: "FORBIDDEN" });
    const { id, ...rest } = input;
    return updateArtwork(id, rest as any);
  }),
  deleteArtwork: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ ctx, input }) => {
    const artist = await getArtistByUserId(ctx.user.id);
    if (!artist) throw new TRPCError({ code: "NOT_FOUND" });
    const artwork = await getArtworkById(input.id);
    if (!artwork || artwork.artistId !== artist.id) throw new TRPCError({ code: "FORBIDDEN" });
    await deleteArtwork(input.id);
    return { success: true };
  }),
});

const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
  return next({ ctx });
});

const adminRouter = router({
  listAllArtists: adminProcedure.query(async () => {
    const artistList = await getAllArtistsAdmin();
    const ids = artistList.map(a => a.id);
    const counts = await getArtworkCountsByArtistIds(ids);
    return artistList.map(a => ({ ...a, _artworkCount: counts[a.id] ?? 0 }));
  }),
  listAllArtworks: adminProcedure.query(() => getAllArtworks()),
  toggleArtistPublish: adminProcedure.input(z.object({ id: z.number(), isPublished: z.boolean() })).mutation(async ({ input }) => {
    return updateArtist(input.id, { isPublished: input.isPublished });
  }),
  toggleArtworkPublish: adminProcedure.input(z.object({ id: z.number(), isPublished: z.boolean() })).mutation(async ({ input }) => {
    return updateArtwork(input.id, { isPublished: input.isPublished });
  }),
  updateArtist: adminProcedure.input(z.object({
    id: z.number(), name: z.string().optional(), nameEn: z.string().optional(),
    specialty: z.string().optional(), bio: z.string().optional(), tools: z.string().optional(),
    sns: z.string().optional(), displayOrder: z.number().optional(), isPublished: z.boolean().optional(),
  })).mutation(async ({ input }) => { const { id, ...rest } = input; return updateArtist(id, rest as any); }),
  deleteArtist: adminProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
    await deleteArtist(input.id); return { success: true };
  }),
  updateArtwork: adminProcedure.input(z.object({
    id: z.number(), titleKo: z.string().optional(), titleEn: z.string().optional(),
    description: z.string().optional(), isPublished: z.boolean().optional(), displayOrder: z.number().optional(),
  })).mutation(async ({ input }) => { const { id, ...rest } = input; return updateArtwork(id, rest as any); }),
  deleteArtwork: adminProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
    await deleteArtwork(input.id); return { success: true };
  }),
});

// ── Invitation Router ──────────────────────────────────────────────────────────────────────
const invitationRouter = router({
  /** 관리자: 초대 링크 생성 */
  create: adminProcedure.input(z.object({
    slotLabel: z.string().min(1),
    expiresAt: z.date().optional(),
  })).mutation(async ({ input }) => {
    const token = nanoid(32);
    return createInvitation({ token, slotLabel: input.slotLabel, expiresAt: input.expiresAt });
  }),
  /** 관리자: 전체 초대 링크 목록 */
  list: adminProcedure.query(() => getAllInvitations()),
  /** 관리자: 초대 링크 삭제 */
  delete: adminProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
    await deleteInvitation(input.id);
    return { success: true };
  }),
  /** 작가: 초대 토큰 유효성 확인 */
  verify: publicProcedure.input(z.object({ token: z.string() })).query(async ({ input }) => {
    const inv = await getInvitationByToken(input.token);
    if (!inv) throw new TRPCError({ code: "NOT_FOUND", message: "유효하지 않은 초대 링크입니다." });
    if (inv.isUsed) throw new TRPCError({ code: "CONFLICT", message: "이미 사용된 초대 링크입니다." });
    if (inv.expiresAt && inv.expiresAt < new Date()) throw new TRPCError({ code: "FORBIDDEN", message: "만료된 초대 링크입니다." });
    return inv;
  }),
  /** 작가: 초대 토큰으로 작가 등록 (= 마이페이지 작가 프로필 생성 후 토큰 연결) */
  accept: protectedProcedure.input(z.object({ token: z.string() })).mutation(async ({ ctx, input }) => {
    const inv = await getInvitationByToken(input.token);
    if (!inv) throw new TRPCError({ code: "NOT_FOUND", message: "유효하지 않은 초대 링크입니다." });
    if (inv.isUsed) throw new TRPCError({ code: "CONFLICT", message: "이미 사용된 초대 링크입니다." });
    if (inv.expiresAt && inv.expiresAt < new Date()) throw new TRPCError({ code: "FORBIDDEN", message: "만료된 초대 링크입니다." });
    // 작가 프로필이 없으면 자동 생성
    let artist = await getArtistByUserId(ctx.user.id);
    if (!artist) {
      artist = await createArtist({
        userId: ctx.user.id,
        name: ctx.user.name ?? "작가",
        nameEn: "",
        isPublished: false,
      });
    }
    await markInvitationUsed(input.token, artist!.id);
    return { success: true, artistId: artist!.id };
  }),
});

// ── Like Router ───────────────────────────────────────────────────────────────────────────
const likeRouter = router({
  /** 작품 좋아요 수 + 내가 눈렀는지 */
  status: publicProcedure.input(z.object({
    artworkId: z.number(),
    fingerprint: z.string(),
  })).query(async ({ ctx, input }) => {
    const count = await getLikeCount(input.artworkId);
    const liked = await hasLiked(input.artworkId, ctx.user?.id ?? null, input.fingerprint);
    return { count, liked };
  }),
  /** 좋아요 토글 */
  toggle: publicProcedure.input(z.object({
    artworkId: z.number(),
    fingerprint: z.string(),
  })).mutation(async ({ ctx, input }) => {
    const userId = ctx.user?.id ?? null;
    const already = await hasLiked(input.artworkId, userId, input.fingerprint);
    if (already) {
      await removeLike(input.artworkId, userId, input.fingerprint);
    } else {
      await addLike({ artworkId: input.artworkId, userId, fingerprint: input.fingerprint });
    }
    const count = await getLikeCount(input.artworkId);
    return { liked: !already, count };
  }),
});

// ── Comment Router ─────────────────────────────────────────────────────────────────────
const commentRouter = router({
  /** 작품 감상 댓글 목록 */
  list: publicProcedure.input(z.object({ artworkId: z.number() })).query(({ input }) =>
    getCommentsByArtworkId(input.artworkId)),
  /** 댓글 작성 (비로그인도 닉네임 입력 후 가능) */
  add: publicProcedure.input(z.object({
    artworkId: z.number(),
    content: z.string().min(1).max(500),
    guestName: z.string().max(30).optional(),
  })).mutation(async ({ ctx, input }) => {
    if (input.content.trim().length === 0) throw new TRPCError({ code: "BAD_REQUEST" });
    return addComment({
      artworkId: input.artworkId,
      userId: ctx.user?.id ?? null,
      guestName: ctx.user ? (ctx.user.name ?? undefined) : (input.guestName ?? "익명의 관람객"),
      content: input.content.trim(),
    });
  }),
  /** 댓글 삭제 (본인 또는 관리자) */
  delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ ctx, input }) => {
    if (ctx.user.role === "admin") {
      await deleteComment(input.id);
    } else {
      await hideComment(input.id);
    }
    return { success: true };
  }),
});

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  gallery: galleryRouter,
  artist: artistRouter,
  admin: adminRouter,
  invitation: invitationRouter,
  like: likeRouter,
  comment: commentRouter,
});

export type AppRouter = typeof appRouter;
