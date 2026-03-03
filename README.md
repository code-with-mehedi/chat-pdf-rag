# Chat PDF RAG

A full-stack application that allows users to upload PDF documents and chat with them using AI. Built with RAG (Retrieval-Augmented Generation) architecture.

## Features

- 📄 **PDF Upload** - Upload any PDF document
- 💬 **AI Chat** - Ask questions about your uploaded documents
- 🔍 **Semantic Search** - Find relevant content using vector embeddings
- ⚡ **Real-time Processing** - Background job processing with BullMQ
- 🎨 **Modern UI** - Clean, responsive chat interface

## Tech Stack

### Frontend
- [Next.js](https://nextjs.org/) - React framework
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [TypeScript](https://www.typescriptlang.org/) - Type safety

### Backend
- [Express.js](https://expressjs.com/) - Node.js web framework
- [LangChain](https://js.langchain.com/) - LLM framework
- [OpenAI](https://openai.com/) - Embeddings & Chat completions
- [Qdrant](https://qdrant.tech/) - Vector database
- [BullMQ](https://bullmq.io/) - Job queue
- [Redis](https://redis.io/) - Queue backend

## Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Next.js   │────▶│   Express   │────▶│   OpenAI    │
│   Frontend  │     │   Backend   │     │   GPT-3.5   │
└─────────────┘     └──────┬──────┘     └─────────────┘
                           │
                    ┌──────┴──────┐
                    │             │
              ┌─────▼─────┐ ┌─────▼─────┐
              │   Redis   │ │   Qdrant  │
              │  (Queue)  │ │  (Vector) │
              └───────────┘ └───────────┘
```

## Prerequisites

- Node.js 18+
- pnpm
- Docker (for Redis & Qdrant)
- OpenAI API key

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/chat-pdf-rag.git
cd chat-pdf-rag
```

### 2. Start Redis & Qdrant

```bash
# Redis
docker run -d -p 6379:6379 redis

# Qdrant
docker run -d -p 6333:6333 qdrant/qdrant
```

### 3. Setup Backend

```bash
cd server
pnpm install

# Create .env file
echo "OPENAI_API_KEY=your_openai_api_key" > .env
```

### 4. Setup Frontend

```bash
cd client
pnpm install
```

## Running the Application

### Start Backend Server

```bash
cd server
pnpm dev
# Server runs on http://localhost:8000
```

### Start Worker (separate terminal)

```bash
cd server
pnpm dev:worker
```

### Start Frontend

```bash
cd client
pnpm dev
# App runs on http://localhost:3000
```

## API Endpoints

### Upload PDF
```
POST /upload/pdf
Content-Type: multipart/form-data

Body: pdf (file)
```

### Chat
```
GET /chat?query=your+question+here

Response:
{
  "result": "AI response based on PDF content",
  "docs": [...]
}
```

## Project Structure

```
chat-pdf-rag/
├── client/                 # Next.js frontend
│   ├── app/
│   │   ├── components/
│   │   │   └── chat.tsx   # Chat component
│   │   └── page.tsx
│   └── package.json
├── server/                 # Express backend
│   ├── index.js           # API server
│   ├── worker.js          # PDF processing worker
│   ├── uploads/           # Uploaded PDFs
│   └── package.json
├── .gitignore
└── README.md
```

## How It Works

1. **Upload**: User uploads a PDF through the frontend
2. **Queue**: Backend adds the PDF to a BullMQ job queue
3. **Process**: Worker picks up the job:
   - Loads PDF using LangChain's PDFLoader
   - Splits text into chunks
   - Creates embeddings using OpenAI
   - Stores vectors in Qdrant
4. **Chat**: User asks a question:
   - Query is embedded using OpenAI
   - Similar chunks are retrieved from Qdrant
   - Context + question sent to GPT-3.5
   - Response returned to user

## Environment Variables

### Server (.env)

| Variable | Description |
|----------|-------------|
| `OPENAI_API_KEY` | Your OpenAI API key |

## Troubleshooting

### PDF not parsing
Make sure you have `pdf-parse@1.1.1` installed. Newer versions have ESM compatibility issues.

```bash
pnpm add pdf-parse@1.1.1
```

### CORS errors
Ensure the server CORS is configured for your frontend URL:
```javascript
app.use(cors({
  origin: "http://localhost:3000"
}));
```

### Qdrant connection issues
Verify Qdrant is running:
```bash
curl http://localhost:6333/collections
```

## License

MIT

## Contributing

Pull requests are welcome. For major changes, please open an issue first.
