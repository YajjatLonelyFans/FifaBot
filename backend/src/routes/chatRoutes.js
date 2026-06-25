import express from "express";
import { queryRAGStream } from "../services/ragService.js";

const router = express.Router();

router.post("/", async (req, res, next) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: "Message is required." });
    }

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    await queryRAGStream(message, res);
    
  } catch (error) {
    if (!res.headersSent) {
      next(error);
    } else {
      console.error("Chat Stream error:", error);
      res.write(`data: ${JSON.stringify({ type: 'error', message: 'Internal Server Error during stream' })}\n\n`);
      res.end();
    }
  }
});

export default router;
