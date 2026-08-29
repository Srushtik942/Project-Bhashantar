## Progress Logs
```
## Day 1 :


- **Embedding service working** — connected to OpenRouter (OpenAI-compatible API) using
  `openai/text-embedding-3-small`. Confirmed vector output length = **1536**.
- **Qdrant running locally** via Docker (`docker run -p 6333:6333 -p 6334:6334 ...`),
  dashboard verified at `http://localhost:6333/dashboard`.
- **Collection created** — `bhashantar_documents`, vector size `1536`, distance metric `Cosine`.

**Key decisions made:**
- Using OpenRouter instead of OpenAI directly, for unified API access.
- Cosine similarity chosen over Euclidean/Dot — correct choice for text embeddings
  since OpenAI's model outputs are direction-based, not magnitude-based.


**Next up:**
-  Insert 3–5 chunks manually into the collection
-  Run a similarity search against them
-  Connect retrieved chunks to the LLM (first RAG round-trip)
```

```
### Day 2 — Core RAG loop working ✅

Full pipeline confirmed end-to-end:
question → embed (OpenRouter) → retrieve (Qdrant) → LLM answers using
only retrieved context → source cited.

Test query: "How many paid leave days do I get?"
→ Correctly answered using only the relevant chunk, ignored unrelated
  retrieved chunks (WFH, insurance).

**Next up:** PDF ingestion — replace hand-typed test chunks with real
document chunking + upload.
```

![alt text](image-1.png)
![alt text](image.png)


```
### Day 3 - PDF ingestion + Ask API

**What got built:**
- **Chunking utility** (`src/utils/chunker.js`) — splits raw extracted text into
  ~500-word chunks with 50-word overlap, so meaning isn't lost at chunk boundaries.

- **PDF upload route** (`POST /api/upload`) — accepts a real PDF via multipart
  form-data, extracts text with `pdf-parse`, chunks it, embeds each chunk, and
  upserts all of them into Qdrant in a single batch.

- **Ask route** (`POST /api/ask`) — replaces the old hardcoded `rag-test.js` script.
  Takes `{ "question": "..." }` in the request body, embeds it, retrieves matching
  chunks from Qdrant, and returns a grounded LLM answer with sources — callable by
  any client (Postman, a future frontend) without editing code.

**Verified working:**
- Uploaded a real PDF (`ResearchPaper.pdf`) → 13 chunks extracted, embedded, and
  stored automatically (`200 OK`, confirmed on Qdrant dashboard point count).

- `/api/ask` tested in Postman — returns a grounded answer + source list for a
  fresh question, no script editing required.

**Key decisions:**
- File uploads kept in memory (`multer.memoryStorage()`), not written to disk —
  only the extracted text is needed long-term.
- Chunk overlap added to avoid splitting a sentence across two chunks.
- `/ask` built as a stateless POST endpoint (question in → answer out), reusable
  by any future client instead of a one-off script.

**Bugs fixed:**
- Stray top-level `await` outside a function (leftover from a copy-paste) — syntax error.
- Qdrant lost its collection after a restart — container was re-run from a different
  working directory, so the volume mount pointed at an empty folder. Fix: always
  launch Qdrant from the same project root.
- OpenRouter key accidentally logged via a stray `console.log` of the full client
  object — rotated the key, removed the log.

image-3.png
image-2.png

```
