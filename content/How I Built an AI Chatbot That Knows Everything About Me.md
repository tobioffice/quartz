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

### so let's just build the thing ❤️‍🔥

#### 1. [[vector database]] setup
I choose ChromaDB for its simplicity, 
you can have a cloud instance worth 5$ for the start on the [ChromaDB](https://www.trychroma.com) official website or you can absolutely spin a local container 

**DOCKER** :
```bash
docker run -v ./chroma-data:/data -p 8000:8000 chromadb/chroma
```

PODMAN:
```bash
docker run --network=host -v ./chroma-data:/data -p 8000:8000 chromadb/chroma
```




![[rag workflow.png]]



