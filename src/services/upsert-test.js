const { QdrantClient } = require("@qdrant/js-client-rest");
const { createEmbedding } = require("./embedding.service");
require("dotenv").config();

const qdrant = new QdrantClient({
  url: process.env.QDRANT_URL || "http://localhost:6333"
});

const testChunks = [
  { text: "Employees get 18 paid leaves per year.", source: "hr_policy.pdf", page: 1 },
  { text: "The notice period for resignation is 30 days.", source: "hr_policy.pdf", page: 2 },
  { text: "Health insurance covers the employee and up to 4 dependents.", source: "hr_policy.pdf", page: 3 },
  { text: "Work from home is allowed up to 2 days per week.", source: "hr_policy.pdf", page: 4 },
  { text: "Salary is credited on the last working day of every month.", source: "hr_policy.pdf", page: 5 }
];

async function upsertTestChunks() {
  const points = [];

  for (let i = 0; i < testChunks.length; i++) {
    const chunk = testChunks[i];
    const vector = await createEmbedding(chunk.text);

    points.push({
      id: i + 1,               
      vector: vector,
      payload: {
        text: chunk.text,
        source: chunk.source,
        page: chunk.page
      }
    });
  }

  await qdrant.upsert("bhashantar_documents", { points });
  console.log(`Upserted ${points.length} chunks successfully.`);
}

upsertTestChunks().catch(console.error);