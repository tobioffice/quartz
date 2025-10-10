Hello, I’m Murali — a web developer.

Recently, I realized that my old portfolio -- [portfolio.tobioffice.dev](https://portfolio.tobioffice.dev) website doesn’t quite capture _who I am_ or introduce me effectively to visitors. So, I decided to design a new portfolio from scratch — clean, minimal, and easy to read.

While exploring other developers’ portfolios for inspiration, one feature really stood out to me: an AI chatbot integrated right into the site. It knew everything about the creator and could even interact with their blogs as if it _was_ them. I found that idea fascinating — a living, intelligent extension of one’s own work.

That inspired me to bring the same concept to life in my own portfolio — [tobioffice.dev](https://tobioffice.dev)

### Why I Chose [[RAG]] Instead of a Big System Prompt

```python
def fetch_answer(user_query):
    # Step 1: Retrieve relevant documents from the knowledge base
    relevant_docs = retrieve_documents(user_query)

    # Step 2: Construct a prompt with the retrieved documents
    prompt = construct_prompt(relevant_docs, user_query)

    # Step 3: Generate an answer using a language model
    answer = generate_answer(prompt)

    return answer
```
