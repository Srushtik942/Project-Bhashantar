const express = require("express");
const multer = require("multer");
const pdfParse = require("pdf-parse");
const { QdrantClient } = require("@qdrant/js-client-rest");
const { createEmbedding } = require("../services/embedding.service");
const { chunkText } = require("../utils/chunker");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

const qdrant = new QdrantClient({
  url: process.env.QDRANT_URL || "http://localhost:6333"
});

router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // 1. Extract raw text from the PDF buffer
    const data = await pdfParse(req.file.buffer);
    const fullText = data.text;

    // 2. Split into chunks
    const chunks = chunkText(fullText, 500, 50);
    console.log(`Extracted ${chunks.length} chunks from ${req.file.originalname}`);

    // 3. Embed + upsert each chunk
    const points = [];
    for (let i = 0; i < chunks.length; i++) {
      const vector = await createEmbedding(chunks[i]);
      points.push({
        id: Date.now() + i, //  unique id
        vector: vector,
        payload: {
          text: chunks[i],
          source: req.file.originalname,
          chunkIndex: i
        }
      });
    }

    await qdrant.upsert("bhashantar_documents", { points });

    res.json({
      message: "File processed successfully",
      filename: req.file.originalname,
      chunksCreated: chunks.length
    });

  } catch (error) {
    console.error("Upload error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;