import { Worker } from "bullmq";
import { OpenAIEmbeddings } from "@langchain/openai";
import { QdrantVectorStore } from "@langchain/qdrant";
import { Document } from "@langchain/core/documents";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import {
  CharacterTextSplitter,
  TextSplitter,
  RecursiveCharacterTextSplitter,
} from "@langchain/textsplitters";
import dotenv from "dotenv";

dotenv.config();


const worker = new Worker("pdf-upload-queue", 
    async (job) => {
        console.log("Processing job:", job.id, "with data:", job.data);

        const data = JSON.parse(job.data);
        /**
         * Path: data.path
         * read the pdf from path,
         * chunk the pdf,
         * call the open ai embedding model for every chunk
         * store the chunk in qdrant db
         */
        // load the PDF file
        const loader = new PDFLoader(data.path);
        const docs = await loader.load();
        //const splitter = new CharacterTextSplitter({
        //  chunkSize: 300,
        //  chunkOverlap: 0,
        //});
        //const texts = await splitter.splitText(docs[0].pageContent);
        const splitter = new RecursiveCharacterTextSplitter({
          chunkSize: 2000,
          chunkOverlap: 100,
        });
        const chunks = await splitter.splitDocuments(docs);
        
        // Connect to Qdrant and store embeddings
        const embeddings = new OpenAIEmbeddings({
          model: "text-embedding-3-small",
          apiKey: process.env.OPENAI_API_KEY,
        });

        const vectorStore = await QdrantVectorStore.fromExistingCollection(
          embeddings,
          {
            url: "http://localhost:6333",
            collectionName: "pdf-docs",
          }
        );

        await vectorStore.addDocuments(chunks);
        console.log(`All docs are added to vector store`);
        

}, {
    concurrency: 100,
    connection: {
        host: "localhost",
        port: 6379,
    },
}
);


