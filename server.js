require("dotenv").config();

const path = require("node:path");
const express = require("express");
const helmet = require("helmet");
const mongoose = require("mongoose");
const { router: apiRouter } = require("./src/api");
const { seedIfEmpty } = require("./src/seed");

const app = express();
const port = Number(process.env.PORT || 8000);
const root = __dirname;

if (process.env.NODE_ENV === "production" && (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32 || process.env.JWT_SECRET.startsWith("replace-with"))) {
  throw new Error("Set JWT_SECRET to a unique random value of at least 32 characters before starting in production.");
}
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.startsWith("replace-with")) {
  if (process.env.NODE_ENV === "production") throw new Error("Set a unique JWT_SECRET of at least 32 characters before starting in production.");
  process.env.JWT_SECRET = "readasil-local-development-secret-change-before-hosting-2026";
  console.warn("Read@SIL is using its local development JWT secret. Set JWT_SECRET in .env before hosting.");
}

app.disable("x-powered-by");
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      frameAncestors: ["'self'"],
      upgradeInsecureRequests: null,
    },
  },
  crossOriginResourcePolicy: { policy: "cross-origin" },
}));
app.use(express.json({ limit: "1mb", strict: true }));

app.get("/", (_req, res) => res.sendFile(path.join(root, "index.html")));
app.get("/app.js", (_req, res) => res.sendFile(path.join(root, "app.js")));
app.get("/styles.css", (_req, res) => res.sendFile(path.join(root, "styles.css")));
app.get("/api/health", (_req, res) => res.json({ ok: true, service: "Read@SIL" }));
app.use("/api", apiRouter);
app.use((_req, res) => res.status(404).json({ error: "Page not found." }));

async function start() {
  const mongoUri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/readasil";
  await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 10000 });
  const seeded = await seedIfEmpty();
  const server = app.listen(port, "0.0.0.0", () => {
    console.log(`Read@SIL is ready at http://localhost:${port}`);
    console.log(`MongoDB: ${mongoose.connection.host}/${mongoose.connection.name}`);
    if (seeded) console.log("Demo workspaces created. Shared demo password: Read@2026");
  });
  const shutdown = async () => {
    server.close(async () => {
      await mongoose.disconnect();
      process.exit(0);
    });
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

start().catch((error) => {
  console.error("Could not start Read@SIL.");
  if (error.name === "MongooseServerSelectionError") {
    console.error("MongoDB could not be reached. Start MongoDB locally or set MONGODB_URI in .env.");
  }
  console.error(error.message);
  process.exit(1);
});
