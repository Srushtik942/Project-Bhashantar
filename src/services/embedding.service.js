const OpenAI = require("openai");
const baseURL = 'https://openrouter.ai/api/v1';
const dotenv = require("dotenv");
dotenv.config()

const data = new OpenAI({apiKey: process.env.OPENROUTER_API_KEY,baseURL: baseURL});

// creating embbedings using openai api
const createEmbedding = async(text)=>{
    try{
        const result = await data.embeddings.create({
             model: process.env.EMBEDDING_MODEL,
             input: text
             });
        const vector = result.data[0].embedding;
        console.log("Embedding created successfully",vector.length);
        return vector;

    }catch(error){
        console.error("Error creating embedding:", error.message);
        throw error;
    }
}




module.exports = { createEmbedding };