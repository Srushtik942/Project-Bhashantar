const OpenAI = require("openai");
const { QdrantClient } = require("@qdrant/js-client-rest");
const { createEmbedding } = require("./embedding.service");
require("dotenv").config({ path: require("path").resolve(__dirname, "../../.env") });

const llm = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1"
});

const qdrant = new QdrantClient({
  url: process.env.QDRANT_URL || "http://localhost:6333"
});

async function askRAG(question) {
  // 1. Embed the question
  const vector = await createEmbedding(question);

  // 2. Retrieve top matching chunks
  const results = await qdrant.query("bhashantar_documents", {
    query: vector,
    limit: 3,
    with_payload: true
  });

  const context = results.points
    .map((r, i) => `[${i + 1}] ${r.payload.text} (Source: ${r.payload.source}, Page: ${r.payload.page})`)
    .join("\n");

  // 3. Build a grounded prompt
  const prompt = `Answer the question using ONLY the context below. If the answer isn't in the context, say you don't know.

Context:
${context}

Question: ${question}

Answer:`;

  // 4. Ask the LLM
  const response = await llm.chat.completions.create({
    model: "openai/gpt-4o-mini",
    messages: [{ role: "user", content: prompt }]
  });

  console.log(`\nQuestion: ${question}`);
  console.log(`\nAnswer: ${response.choices[0].message.content}`);
  console.log(`\n--- Sources used ---\n${context}`);
}

askRAG("How many paid leave days do I get?").catch(console.error);