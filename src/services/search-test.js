const { QdrantClient } = require("@qdrant/js-client-rest");
const { createEmbedding } = require("./embedding.service");
require("dotenv").config({ path: require("path").resolve(__dirname, "../../.env") });

const qdrant = new QdrantClient({
  url: process.env.QDRANT_URL || "http://localhost:6333"
});

async function searchTest(question) {
  const vector = await createEmbedding(question);

  const results = await qdrant.query("bhashantar_documents", {
    query: vector,
    limit: 3,
    with_payload: true
  });

  console.log(`\nQuery: "${question}"\n`);
  results.points.forEach((r, i) => {
    console.log(`${i + 1}. Score: ${r.score.toFixed(4)}`);
    console.log(`   Text: ${r.payload.text}`);
    console.log(`   Source: ${r.payload.source}, Page: ${r.payload.page}\n`);
  });
}

searchTest("How many paid leave days do I get?").catch(console.error);
searchTest("Whats the WFH policy?").catch(console.error);