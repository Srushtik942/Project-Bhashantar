const express = require("express");
const OpenAI = require("openai");
const { QdrantClient } = require("@qdrant/js-client-rest");
const { createEmbedding } = require("../services/embedding.service");
const { resumeToPipeableStream } = require("react-dom/server");
require("dotenv").config({ path: require("path").resolve(__dirname, "../../.env") });


const router = express.Router();

const data = new OpenAI({
 apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1"
})

const qdrant = new QdrantClient({
  url: process.env.QDRANT_URL || "http://localhost:6333"
});

router.post("/ask",async(req,res)=>{
    try{
        const {question} = req.body;

        if(!question){
            return res.status(400).json({error: "Missing 'question' in request body"})
        }

        // Embed the question

        const vector = await createEmbedding(question);

        console.log("vector",vector);

        // retrive top matching chunks
        const result = await qdrant.query("bhashantar_documents",{
            query: vector,
            limit: 3,
            with_payload: true
        });

        console.log("result",result);

       const context = result.points
      .map((r, i) => `[${i + 1}] ${r.payload.text} (Source: ${r.payload.source})`)
      .join("\n");

      // 3. for building a grounded prompt
    const prompt = `Answer the question using ONLY the context below. If the answer isn't in the context, say you don't know.
    Respond in the same language the question was asked in.


           Context:
           ${context}

          Question: ${question}

       Answer:`;


// ask the llm

const response = await data.chat.completions.create({
    model: process.env.CHAT_MODEL ,
    messages:[{
        role:"user",
        content:prompt
    }]
});
console.log("response",response)


res.json({
    question: question,
    answer: response.choices[0].message.content,
    sources: result.points.map(r =>({
        text: r.payload.text,
        source: r.payload.source
    }))
});
    }catch(err){
        res.status(500).json({message:"Internal server error",err:err.message});
    }
})

module.exports = router;