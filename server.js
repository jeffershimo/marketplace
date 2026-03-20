require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3001;
const isProd = process.env.NODE_ENV === "production";

app.set("trust proxy", 1);

app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }));
app.use(cors({ origin: isProd ? true : (process.env.FRONTEND_URL || "http://localhost:5173"), credentials: true }));
app.use(express.json({ limit: "10mb" }));

app.use("/api/", rateLimit({ windowMs: 15 * 60 * 1000, max: 300 }));
app.use("/api/auth/login", rateLimit({ windowMs: 15 * 60 * 1000, max: 20 }));
app.use("/api/auth/register", rateLimit({ windowMs: 15 * 60 * 1000, max: 20 }));

app.use("/api/auth",       require("./backend/routes/auth"));
app.use("/api/products",   require("./backend/routes/products"));
app.use("/api/orders",     require("./backend/routes/orders"));
app.use("/api/wallet",     require("./backend/routes/wallet"));
app.use("/api/categories", require("./backend/routes/categories"));
app.use("/api/admin",      require("./backend/routes/admin"));

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

if (isProd) {
  app.use(express.static(path.join(__dirname, "frontend", "dist")));
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "frontend", "dist", "index.html"));
  });
}

app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`Marketplace running on port ${PORT} [${isProd ? "PRODUCTION" : "DEV"}]`);
});
```

Save, then push:
```
cd C:\SIT\marketplace-deploy
git add .
git commit -m "Fix trust proxy and connection port"
git push