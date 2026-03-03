import express from "express";
import cors from "cors";
import multer from "multer";
import { Queue } from "bullmq";
import path from "path";
import dotenv from "dotenv";
import { OpenAIEmbeddings } from "@langchain/openai";
import { QdrantVectorStore } from "@langchain/qdrant";
import OpenAI from "openai";

dotenv.config();

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const queue = new Queue("pdf-upload-queue", {
  connection: {
    host: "localhost",
    port: 6379,
  },
});

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}-${file.originalname}` );
  },
});

const upload = multer({ storage: storage });

const app = express();
const PORT = 8000;

app.use(express.json());
app.use(cors({
  origin: "http://localhost:3000",
  methods: ["GET", "POST", "PUT", "DELETE"],
}));

app.get("/chat", async (req, res) => {
    
    const embeddings = new OpenAIEmbeddings({
      model: "text-embedding-3-small",
      apiKey: process.env.OPENAI_API_KEY,
    });

    const { query } = req.query;
    const vectorStore = await QdrantVectorStore.fromExistingCollection(
      embeddings,
      {
        url: "http://localhost:6333",
        collectionName: "pdf-docs",
      },
    );
    const retriever = vectorStore.asRetriever({
        k:2
    });

    const result = await retriever.invoke(query);

    const SYSTEM_PROMPT = `You are a helpful assistant who will question answer based on the avaialble pdf file
    context: ${JSON.stringify(result)}
    `;
    
    const chatrestult = await client.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: query }
        ]
    });

    return res.json({
        result: chatrestult.choices[0].message.content,
        docs: result
    });
});

app.post("/upload/pdf", upload.single('pdf'), async (req, res) => {
    await queue.add("process-pdf", JSON.stringify({ 
        fileName: req.file.originalname, 
        destination: req.file.destination,
        path: req.file.path
    }));
    // Handle file upload logic here
    res.send("File uploaded successfully!");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
