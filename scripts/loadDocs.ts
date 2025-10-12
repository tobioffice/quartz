import fs from "fs"
import path from "path"
import { execSync } from "child_process"
import { MarkdownTextSplitter } from "@langchain/textsplitters"
import { getChromaCollection } from "./collectionStore.js"
import { Metadata } from "chromadb"
import { client } from "./collectionStore.js"

try {
  await client.deleteCollection({
    name: "my_collection",
  })
} catch (error) {
  console.warn("Collection 'my_collection' does not exist, skipping deletion.")
}

type documentsType = {
  pageContent: string
  metadata: { source: string }
}[]

export const loadDocs = (filePath: string): documentsType => {
  const documents: documentsType = []

  const isIgnored = (filePath: string): boolean => {
    try {
      execSync(`git check-ignore "${filePath}"`, { stdio: "ignore" })
      return true
    } catch {
      return false
    }
  }

  const getAllMdFiles = (dir: string): void => {
    const entries = fs.readdirSync(dir, { withFileTypes: true })

    entries.forEach((entry) => {
      const fullPath = path.join(dir, entry.name)
      if (isIgnored(fullPath)) return

      if (entry.isDirectory()) {
        getAllMdFiles(fullPath)
      } else if (entry.isFile() && entry.name.endsWith(".md")) {
        const content = fs.readFileSync(fullPath, "utf-8")
        documents.push({
          pageContent: content,
          metadata: { source: entry.name },
        })
      }
    })
  }

  getAllMdFiles(filePath)
  return documents
}

const splitter = new MarkdownTextSplitter({
  chunkSize: 1000,
  chunkOverlap: 200,
})

const docs = await splitter.splitDocuments(loadDocs("./content"))

const ids = docs.map((_, i) => `doc-${i}`)

const chromaCollection = await getChromaCollection()

await chromaCollection.add({
  documents: docs.map((doc) => doc.pageContent),
  metadatas: docs.map((doc) => ({
    source: doc.metadata["source"] as string,
  })) as Metadata[],
  ids: ids,
})

console.log("Documents added to ChromaDB")
