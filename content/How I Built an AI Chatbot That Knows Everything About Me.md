![[Screencast From 2025-10-13 13-57-56.mp4]]

> Hello, I’m Murali -- a web developer.

Recently, I realized that my old portfolio -- [portfolio.tobioffice.dev](https://portfolio.tobioffice.dev) website doesn’t quite capture _who I am_ or introduce me effectively to visitors. So, I decided to design a new portfolio from scratch — clean, minimal, and easy to read.

While exploring other developers’ portfolios for inspiration, one feature really stood out to me: an AI chatbot integrated right into the site. It knew everything about the creator and could even interact with their blogs as if it _was_ them. I found that idea fascinating

> "a living, intelligent extension of one’s own work."

That inspired me to bring the same concept to life in my own portfolio — [tobioffice.dev](https://tobioffice.dev)

### Why I Chose [[RAG]] Instead of a Big [[System Prompt]]

you might ask this:

> [!QUESTION]
> Why can't I just push everything about me to the "system prompt"? Why do we go through this hassle of:
> - creating and maintaining a vector database
> - gathering and splitting documents
> - pushing documents to cloud database - whenever they update
> - retrieving documents
> - feeding them to the [[LLM]]

Well, that works, but it's not scalable or practical for several key reasons:

1.  **Context Window Limitations:** LLMs have a finite "context window" (the amount of text they can process at one time). Even with large context windows, there's a limit. Your entire personal history, preferences, and documents would quickly exceed this, leading to truncation or the LLM "forgetting" earlier parts of the prompt.
2.  **Cost:** Sending an extremely long system prompt with every interaction would be significantly more expensive, as LLM APIs charge per token.
3.  **Relevance and Focus:** You rarely need *all* information about you for *every* query. Dumping everything in the system prompt makes the LLM sift through irrelevant data, potentially reducing its ability to focus on the specific task or leading to the "lost in the middle" problem where important details are overlooked. [[RAG]] ensures only the most relevant snippets are provided.
4. **Maintenance and Updates:** If your personal information changes or you publish/update a blog, you'd constantly be rewriting and updating a colossal system prompt. With a vector database, you update specific documents, and the system dynamically retrieves the freshest information.

## So let's just start building ❤️‍🔥

### 1. [[vector database]] setup
I choose **ChromaDB** for its simplicity,
you can have a cloud instance worth 5$ for the start on the [ChromaDB](https://www.trychroma.com) official website or you can absolutely spin a local container

**DOCKER** :
```bash
docker run -v ./chroma-data:/data -p 8000:8000 chromadb/chroma
```

**PODMAN:**
```bash
docker run --network=host -v ./chroma-data:/data -p 8000:8000 chromadb/chroma
```

I am using an **Oracle Ubuntu Virtual Machine** to deploy the container, as public access to the database is required and don't want use Chroma's cloud platform

if you want to do the same here is your command:
1. create a volume :
	```bash
	   docker volume create chroma_data
	```
2. run the container
	```bash
	sudo docker run -d \
	    --name chroma \
	    -p 8000:8000 \
	    -e IS_PERSISTENT=TRUE \
	    -e PERSIST_DIRECTORY=/chroma/chroma \
		-e CHROMA_SERVER_AUTHN_PROVIDER="chromadb.auth.token_authn.TokenAuthenticationServerProvider" \
	    -e CHROMA_SERVER_AUTHN_CREDENTIALS="your_auth_token_can_be_anything" \
	    -e CHROMA_AUTH_TOKEN_TRANSPORT_HEADER="Authorization" \
	    -v chroma_data:/chroma/chroma \
	    chromadb/chroma
	```

> [!NOTE]
> make sure to configure firewall rules according to your cloud provider

### 2. Creating a workflow to load documents to the vector DB
For better organisation, I highly recommend keeping all your blogs in a centralised folder. ==Speaking of which, I've actually configured an Obsidian workflow for publishing my own blogs! Let me know if you'd be interested in a guide on how to set up your very own blog publishing workflow.==

Create a GitHub Action to load documents.  

The source for this workflow is available in my GitHub repository: [`.github/workflows/loaddocs.yaml`](https://github.com/tobioffice/quartz/blob/main/.github/workflows/loaddocs.yaml).

And we need a script that

1.  **Load Markdown Files:** Implement functionality to load all Markdown files from a designated directory.
2.  **Chunking for LLM Processing:** Develop a mechanism to split these Markdown files into appropriately sized chunks, optimizing them for efficient processing by a Large Language Model (LLM).
3.  **Vector Embedding:** Create an embedding function that utilizes a specified embedding model to convert the document chunks into vector representations.

While Chroma offers a default embedding model, you can often achieve better results by using custom models tailored to your needs. For detailed specifications and available options, I recommend exploring [Chroma's official documentation](https://docs.trychroma.com/docs/embeddings/embedding-functions) on embedding functions.

Currently, I am utilizing [Google's embedding model](https://docs.trychroma.com/integrations/embedding-models/google-gemini).

**Collection Store:**  
You can find the source code for the collection store in my [GitHub repository](https://github.com/tobioffice/quartz/blob/main/scripts/collectionStore.js).

**Loader:**  
The source code for the document loader is also available in my [GitHub repository](https://github.com/tobioffice/quartz/blob/main/scripts/loadDocs.js).

Running the command `node scripts/loadDocs.js` within a GitHub Actions workflow triggers the document loader.

### 3.Implementation on portfolio site
I designed and implemented an elegant, toggle-able chatbot interface for my [portfolio website](https://tobioffice.dev)

![[Screencast From 2025-10-13 13-57-56.mp4]]

I then developed an API endpoint, `/api/chat`, to handle and respond to the frontend's chat requests, ensuring smooth communication between the user interface and backend.
```ts
import { getResponce } from "@/app/api/chat/langchain";

export async function POST(request: Request) {
  const body = await request.json();
  const { messages } = body;

  const responce = await getResponce(messages);

  return new Response(
    JSON.stringify({
      role: "assistant",
      content:
        responce?.content ||
        "I'm sorry, I couldn't process your request at the moment.",
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    },
  );
}

```

I also implemented a retriever that performs Retrieval-Augmented Generation ([[RAG]]) on my blog content, allowing the chatbot to pull relevant information and provide more accurate, context-aware responses.
```ts
import { getChromaCollection } from "@/app/api/chat/collectionStore";

export const retriever = async (question: string) => {
  const chromaCollection = await getChromaCollection();

  const results = await chromaCollection.query({
    queryTexts: [question],
    nResults: 2,
    include: ["metadatas", "documents", "distances"],
  });
  return results;
};
```

Next, I wrote the logic to render messages based on the responses from the API, ensuring a dynamic and responsive chat experience.
```tsx
{messages.map((message, index) => (
  <div
    key={index}
    className={`my-2 flex w-full items-start gap-3 px-3 text-sm ${
      message.role === "user"
        ? "flex-row-reverse self-end"
        : "self-start"
    }`}
      >
      {message.role === "assistant" && (
        <div>
          <Bot className="mt-2 h-5 w-5" />
        </div>
      )}
      <div
        className={`max-w-[80%] rounded-md p-2 text-left ${
          message.role === "user"
            ? "bg-gray-900 text-white"
            : "bg-gray-200 text-gray-700"
        }`}
      >
        <Markdown>{message.content}</Markdown>
  </div>
</div>
```

### 4. the final workflow 🎉
1. The user sends a message to Tobi Support.
2. Tobi Support performs a similarity search on the vector database containing all blog content.    
3. The retrieved relevant information is attached as context to the user’s message.
4. This enriched message, along with the conversation history, is forwarded to the AI model.
5. The AI model generates a response, which Tobi Support then displays on the user interface.


![[rag workflow.png]]


