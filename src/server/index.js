import express from "express";
import cors from "cors";
import "dotenv/config";
import authRoutes from "./routes/authRoutes.js";
import lessonRoutes from "./routes/lessonRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

app.use("/api/auth", authRoutes);
app.use("/api/lessons", lessonRoutes);
app.use("/api/admin", adminRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || "Something went wrong!",
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
