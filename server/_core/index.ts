import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { registerStorageProxy } from "./storageProxy";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { getArtworkById, getArtistById, getArtworksByArtistId, getExhibitionBySlug } from "../db";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "100mb" }));
  app.use(express.urlencoded({ limit: "100mb", extended: true }));
  registerStorageProxy(app);
  registerOAuthRoutes(app);

  // ── 동적 OG 메타태그 엔드포인트 ──────────────────────────────────────────
  // 카카오톡/SNS 크롤러는 JS를 실행하지 않으므로 서버에서 직접 HTML을 반환
  const SITE_URL = process.env.VITE_SITE_URL || "https://minkyungart-ojktjxwr.manus.space";
  const DEFAULT_OG_IMAGE = `${SITE_URL}/manus-storage/artworks/1784352997546-pl9th2odreb_0de0d559.png`;
  const SITE_TITLE = "위드AI아트작가갤러리 온라인전시회 | By 송민경 캔바지국장";
  const SITE_DESC = "위드AI솔루션 AI올인원과정 1기 작가들이 AI와 함께 그려낸 상상과 감성의 세계. By 송민경 캔바지국장";
  const GOOGLE_VERIFICATION_FILE = "googlecd30b39fbc4e7b73.html";
  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${SITE_URL}/</loc><lastmod>2026-08-13</lastmod><changefreq>weekly</changefreq><priority>1.0</priority></url>
  <url><loc>${SITE_URL}/gallery</loc><lastmod>2026-08-13</lastmod><changefreq>weekly</changefreq><priority>0.9</priority></url>
  <url><loc>${SITE_URL}/artists</loc><lastmod>2026-08-13</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>
  <url><loc>${SITE_URL}/artists/1</loc><lastmod>2026-08-13</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>
  <url><loc>${SITE_URL}/artists/30001</loc><lastmod>2026-08-13</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>
  <url><loc>${SITE_URL}/artists/60001</loc><lastmod>2026-08-13</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>
  <url><loc>${SITE_URL}/artists/90001</loc><lastmod>2026-08-13</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>
  <url><loc>${SITE_URL}/artists/120001</loc><lastmod>2026-08-13</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>
  <url><loc>${SITE_URL}/artists/150001</loc><lastmod>2026-08-13</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>
  <url><loc>${SITE_URL}/artists/180001</loc><lastmod>2026-08-13</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>
  <url><loc>${SITE_URL}/exhibitions</loc><lastmod>2026-08-13</lastmod><changefreq>weekly</changefreq><priority>0.8</priority></url>
  <url><loc>${SITE_URL}/exhibition/ai-art-2025</loc><lastmod>2026-08-13</lastmod><changefreq>weekly</changefreq><priority>0.9</priority></url>
  <url><loc>${SITE_URL}/epilogue</loc><lastmod>2026-08-13</lastmod><changefreq>monthly</changefreq><priority>0.6</priority></url>
</urlset>`;

  // 검색 엔진·Search Console은 배포 환경에서 정적 파일 대신 이 명시적 응답을 우선 사용한다.
  app.get("/robots.txt", (_req, res) => {
    res.type("text/plain").send(`User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`);
  });
  app.get("/sitemap.xml", (_req, res) => {
    res.type("application/xml").send(sitemapXml);
  });
  app.get(`/${GOOGLE_VERIFICATION_FILE}`, (_req, res) => {
    res.type("text/html").send(`google-site-verification: ${GOOGLE_VERIFICATION_FILE}`);
  });

  function buildOgHtml(opts: { title: string; description: string; image: string; url: string }) {
    return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8" />
  <title>${opts.title}</title>
  <meta name="description" content="${opts.description}" />
  <meta property="og:type" content="website" />
  <meta property="og:title" content="${opts.title}" />
  <meta property="og:description" content="${opts.description}" />
  <meta property="og:image" content="${opts.image}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:url" content="${opts.url}" />
  <meta property="og:locale" content="ko_KR" />
  <meta property="og:site_name" content="위드AI아트작가갤러리" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${opts.title}" />
  <meta name="twitter:description" content="${opts.description}" />
  <meta name="twitter:image" content="${opts.image}" />
  <meta http-equiv="refresh" content="0; url=${opts.url}" />
  <script>window.location.href = "${opts.url}";</script>
</head>
<body><p>잠시 후 이동합니다... <a href="${opts.url}">클릭하여 이동</a></p></body>
</html>`;
  }

  // /og/artwork/:id — 작품 공유용
  app.get("/og/artwork/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const artwork = await getArtworkById(id);
      if (!artwork) return res.redirect("/");
      const image = artwork.mediaUrl
        ? (artwork.mediaUrl.startsWith("http") ? artwork.mediaUrl : `${SITE_URL}${artwork.mediaUrl}`)
        : DEFAULT_OG_IMAGE;
      const artist = await getArtistById(artwork.artistId);
      const title = `${artwork.titleKo} — ${artist?.name ?? "작가"} | 위드AI아트갤러리`;
      const desc = artwork.description?.slice(0, 120) ?? SITE_DESC;
      const url = `${SITE_URL}/artists/${artwork.artistId}/artwork/${id}`;
      res.set("Content-Type", "text/html; charset=utf-8").send(buildOgHtml({ title, description: desc, image, url }));
    } catch { res.redirect("/"); }
  });

  // /og/artist/:id — 작가 공유용
  app.get("/og/artist/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const artist = await getArtistById(id);
      if (!artist) return res.redirect("/");
      // 첫 번째 작품 이미지를 OG 이미지로 사용
      const artworks = await getArtworksByArtistId(id, true);
      const firstImg = artworks.find(a => a.mediaUrl && a.mediaType === "image")?.mediaUrl;
      const image = firstImg
        ? (firstImg.startsWith("http") ? firstImg : `${SITE_URL}${firstImg}`)
        : (artist.profileImageUrl?.startsWith("http") ? artist.profileImageUrl : `${SITE_URL}${artist.profileImageUrl ?? ""}`) || DEFAULT_OG_IMAGE;
      const title = `${artist.name} — AI 아트 작가 | 위드AI아트갤러리`;
      const desc = artist.bio?.slice(0, 120) ?? SITE_DESC;
      const url = `${SITE_URL}/artists/${id}`;
      res.set("Content-Type", "text/html; charset=utf-8").send(buildOgHtml({ title, description: desc, image, url }));
    } catch { res.redirect("/"); }
  });

  // /og/exhibition/:slug — 전시회 공유용
  app.get("/og/exhibition/:slug", async (req, res) => {
    try {
      const ex = await getExhibitionBySlug(req.params.slug);
      if (!ex) return res.redirect("/");
      const image = ex.coverImageUrl
        ? (ex.coverImageUrl.startsWith("http") ? ex.coverImageUrl : `${SITE_URL}${ex.coverImageUrl}`)
        : DEFAULT_OG_IMAGE;
      const title = `${ex.titleKo} — 온라인 전시회 | 위드AI아트갤러리`;
      const desc = `위드AI솔루션 AI올인원과정 1기 온라인 전시회 — ${ex.titleKo}`;
      const url = `${SITE_URL}/exhibition/${ex.slug}`;
      res.set("Content-Type", "text/html; charset=utf-8").send(buildOgHtml({ title, description: desc, image, url }));
    } catch { res.redirect("/"); }
  });

  // /og — 홈 공유용
  app.get("/og", async (_req, res) => {
    res.set("Content-Type", "text/html; charset=utf-8").send(
      buildOgHtml({ title: SITE_TITLE, description: SITE_DESC, image: DEFAULT_OG_IMAGE, url: SITE_URL })
    );
  });

  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
