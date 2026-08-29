const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const app = express();
const uploadRoute = require("./src/routes/upload.route");
const askRoute = require("./src/routes/ask.route");
app.use(express.json());
app.use(cors());
dotenv.config();


app.get("/api/health",(req,res)=>{
    console.log("Health check endpoint hit");
    res.status(200).json({message:"Successfully Hit the health check endpoint"});
})

app.use("/api",uploadRoute);
app.use("/api",askRoute);







app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
})