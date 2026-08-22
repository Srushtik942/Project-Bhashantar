const {createEmbedding} = require("./src/services/embedding.service");

createEmbedding("Employee get 18 paid leaves per year")
.then(vector => console.log("First 5 values",vector.slice(0,5)))
.catch(err=> console.error("Test failed",err));