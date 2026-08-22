const { QdrantClient } = require("@qdrant/js-client-rest");

const qdrant = new QdrantClient({
    url: process.env.QDRANT_URL || "http://localhost:6333"
})

async function createCollection() {
    await qdrant.createCollection("bhashantar_documents",{
        vectors:{
            size: 1536,
            distance: "Cosine"
        }

    });
    console.log("Collection created!");

}
createCollection().catch(console.error);