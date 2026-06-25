import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import uploadRoutes from "./routes/uploadRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use("/uploads", express.static("uploads"));

app.use("/api/upload", uploadRoutes);
app.use("/api/chat", chatRoutes);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "FIFA RAG API is running" });
});


app.use((err, req, res, next) => {
  console.error("Global Error:", err.stack);
  res.status(500).json({ error: err.message || "Internal Server Error" });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
