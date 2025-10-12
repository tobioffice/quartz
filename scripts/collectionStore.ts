import { GoogleGeminiEmbeddingFunction } from "@chroma-core/google-gemini"
import { ChromaClient } from "chromadb"
import { config } from "dotenv"
config()

export const client = new ChromaClient({
  host: `${process.env["CHROMA_HOST"]}`,
  port: parseInt(`${process.env["CHROMA_PORT"]}`),
  headers: {
    Authorization: `Bearer ${process.env["CHROMA_API_KEY"]}`,
  },
})

const embedder = new GoogleGeminiEmbeddingFunction({
  apiKey: `${process.env["GOOGLE_API_KEY"]}`,
})

export const getChromaCollection = async () => {
  const chromaCollection = await client.getOrCreateCollection({
    name: "my_collection",
    embeddingFunction: embedder,
  })

  return chromaCollection
}
