// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// server/storage.ts
import { randomUUID } from "crypto";
var MemStorage = class {
  users;
  files;
  constructor() {
    this.users = /* @__PURE__ */ new Map();
    this.files = /* @__PURE__ */ new Map();
    const demoUser = {
      id: "demo-user-id",
      username: "demo",
      password: "demo123",
      email: "demo@pacsend.com",
      plan: "free",
      storageUsed: 536870912,
      // 512MB
      storageLimit: 107374182400
      // 100GB
    };
    this.users.set(demoUser.id, demoUser);
    const demoFiles = [
      {
        id: "file-1",
        userId: "demo-user-id",
        title: "videoclip_2023",
        filename: "videoclip_2023.mp4",
        size: 209715200,
        // 200MB
        type: "MP4",
        thumbnailUrl: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=225",
        uploadDate: /* @__PURE__ */ new Date("2026-03-09T11:09:00Z"),
        isPublic: false
      },
      {
        id: "file-2",
        userId: "demo-user-id",
        title: "videoclip3_2023",
        filename: "videoclip3_2023.mp4",
        size: 157286400,
        // 150MB
        type: "MP4",
        thumbnailUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=225",
        uploadDate: /* @__PURE__ */ new Date("2026-03-09T11:09:00Z"),
        isPublic: false
      },
      {
        id: "file-3",
        userId: "demo-user-id",
        title: "videoclip4_2023",
        filename: "videoclip4_2023.mp4",
        size: 209715200,
        // 200MB
        type: "MP4",
        thumbnailUrl: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=225",
        uploadDate: /* @__PURE__ */ new Date("2026-03-09T11:09:00Z"),
        isPublic: false
      },
      {
        id: "file-4",
        userId: "demo-user-id",
        title: "videoclip5_2023",
        filename: "videoclip5_2023.mp4",
        size: 157286400,
        // 150MB
        type: "MP4",
        thumbnailUrl: "https://images.unsplash.com/photo-1496024840928-4c417adf211d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=225",
        uploadDate: /* @__PURE__ */ new Date("2026-03-09T11:09:00Z"),
        isPublic: false
      },
      {
        id: "file-5",
        userId: "demo-user-id",
        title: "videoclip6_2023",
        filename: "videoclip6_2023.mp4",
        size: 209715200,
        // 200MB
        type: "MP4",
        thumbnailUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=225",
        uploadDate: /* @__PURE__ */ new Date("2026-03-09T11:09:00Z"),
        isPublic: false
      }
    ];
    demoFiles.forEach((file) => this.files.set(file.id, file));
  }
  async getUser(id) {
    return this.users.get(id);
  }
  async getUserByUsername(username) {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }
  async createUser(insertUser) {
    const id = randomUUID();
    const user = {
      ...insertUser,
      id,
      plan: insertUser.plan || "free",
      storageUsed: 0,
      storageLimit: insertUser.plan === "free" ? 107374182400 : 1099511627776
      // 100GB or 1TB
    };
    this.users.set(id, user);
    return user;
  }
  async getUserFiles(userId) {
    return Array.from(this.files.values()).filter((file) => file.userId === userId);
  }
  async createFile(insertFile) {
    const id = randomUUID();
    const file = {
      ...insertFile,
      id,
      thumbnailUrl: insertFile.thumbnailUrl || null,
      isPublic: insertFile.isPublic || false,
      uploadDate: /* @__PURE__ */ new Date()
    };
    this.files.set(id, file);
    return file;
  }
  async deleteFile(id) {
    return this.files.delete(id);
  }
  async getFile(id) {
    return this.files.get(id);
  }
};
var storage = new MemStorage();

// shared/schema.ts
import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
var users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  plan: text("plan").notNull().default("free"),
  storageUsed: integer("storage_used").notNull().default(0),
  storageLimit: integer("storage_limit").notNull().default(107374182400)
  // 100GB in bytes
});
var files = pgTable("files", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  filename: text("filename").notNull(),
  size: integer("size").notNull(),
  type: text("type").notNull(),
  thumbnailUrl: text("thumbnail_url"),
  uploadDate: timestamp("upload_date").notNull().defaultNow(),
  isPublic: boolean("is_public").notNull().default(false)
});
var insertUserSchema = createInsertSchema(users).omit({
  id: true,
  storageUsed: true,
  storageLimit: true
});
var insertFileSchema = createInsertSchema(files).omit({
  id: true,
  uploadDate: true
});

// server/routes.ts
async function registerRoutes(app2) {
  app2.get("/api/files", async (req, res) => {
    try {
      const files2 = await storage.getUserFiles("demo-user-id");
      res.json(files2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch files" });
    }
  });
  app2.post("/api/files", async (req, res) => {
    try {
      const validation = insertFileSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ message: "Invalid file data" });
      }
      const file = await storage.createFile(validation.data);
      res.json(file);
    } catch (error) {
      res.status(500).json({ message: "Failed to upload file" });
    }
  });
  app2.delete("/api/files/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteFile(id);
      if (!success) {
        return res.status(404).json({ message: "File not found" });
      }
      res.json({ message: "File deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete file" });
    }
  });
  app2.get("/api/user", async (req, res) => {
    try {
      const user = await storage.getUser("demo-user-id");
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      ),
      await import("@replit/vite-plugin-dev-banner").then(
        (m) => m.devBanner()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client", "src"),
      "@shared": path.resolve(__dirname, "shared"),
      "@assets": path.resolve(__dirname, "attached_assets")
    }
  },
  root: path.resolve(__dirname, "client"),
  build: {
    outDir: path.resolve(__dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
import { fileURLToPath as fileURLToPath2 } from "url";
var __filename2 = fileURLToPath2(import.meta.url);
var __dirname2 = path2.dirname(__filename2);
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        __dirname2,
        // ✅ fixed
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(__dirname2, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = parseInt(process.env.PORT || "9000", 10);
  const listenOptions = {
    port,
    host: "0.0.0.0"
  };
  if (process.platform !== "win32") {
    listenOptions.reusePort = true;
  }
  server.listen(listenOptions, () => {
    log(`serving on port ${port}`);
  });
})();
