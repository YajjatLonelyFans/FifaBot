import express from "express";
import { upload } from "../middleware/upload.js";
import { processFile } from "../utils/fileHandler.js";
import { ingestFile } from "../services/ragService.js";

const router = express.Router();

router.post("/", upload.array("files", 2), async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "No files uploaded." });
    }

    const results = [];

    for (const file of req.files) {
      console.log(`Processing file: ${file.originalname}...`);
    
      const { type, content } = await processFile(file);
      const vectorsCreated = await ingestFile(file.originalname, type, content);
      
      results.push({
        filename: file.originalname,
        status: "success",
        vectorsStored: vectorsCreated,
      });
    }

    res.status(200).json({
      message: "Upload and ingestion complete.",
      results,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
