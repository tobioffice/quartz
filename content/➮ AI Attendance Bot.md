# AI Attendance Bot: Full Execution Plan

This document outlines the complete step-by-step process for building a conversational AI attendance bot using Node.js and the Gemini API.

---

## Stacks & Technologies

-   **Language**: Node.js
-   **Telegram API**: `node-telegram-bot-api`
-   **AI Agent Framework**: `langchain` & `@langchain/google-genai`
-   **Database**: `sqlite3`

---

## Phase 1: The Backend Foundation

### 1. Database Setup (`SQLite`)

Create a database file (e.g., `bot_memory.db`) with two tables.

-   **`users`**: To permanently map a user's Telegram `chat_id` to their `roll_number`.

-   **`chat_history`**: To store every message for conversation context.

**SQL Schema:**

```sql
CREATE TABLE IF NOT EXISTS users (
    chat_id INTEGER PRIMARY KEY,
    roll_number TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS chat_history (
    message_id INTEGER PRIMARY KEY AUTOINCREMENT,
    chat_id INTEGER NOT NULL,
    role TEXT NOT NULL, -- 'user' or 'bot'
    content TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (chat_id) REFERENCES users (chat_id)
);
````

### 2. The Web Scraper (Completed)

This is a function that logs into the college website and retrieves attendance data.

- **Input**: `roll_number` (String)
    
- **Output**: A structured JSON object.
    

**Expected JSON Output:**

JSON

```json
{
  "student_id": "24kb1a0357",
  "branch": "2_MECH_B",
  "overall_percentage": 68.72,
  "classes_attended": 134,
  "total_classes": 195,
  "subjects": [
    {"name": "UHV", "attended": 11, "total": 15, "last_updated": "18 days ago"},
    {"name": "TD-", "attended": 11, "total": 20, "last_updated": "21 days ago"}
  ]
}
```

---

## Phase 2: The Core Application Logic

This is the main application loop run by `node-telegram-bot-api`. It acts as the "librarian" that manages data flow for the AI.

**For every incoming message:**

1. **Receive Message**: Get the `message_text` and `chat_id`.
    
2. **Log User Message**: Immediately save the user's message to the `chat_history` table using a function like `save_chat_message(chat_id, 'user', message_text)`.
    
3. **Fetch User History**: Query the `chat_history` table to get the last 5-10 messages for that specific `chat_id`.
    
4. **Instantiate Memory**: Create a new `ConversationBufferWindowMemory` object from LangChain (`k=5`). Load the fetched history into this object.
    
5. **Run Agent**: Execute the AI agent, providing it with the new message and the pre-loaded memory object.
    
6. **Receive Agent's Response**: Get the final text response from the agent.
    
7. **Log Bot Message**: Save the bot's response to the `chat_history` table using `save_chat_message(chat_id, 'bot', agent_response_text)`.
    
8. **Send Reply**: Send the agent's response back to the user on Telegram.
    

---

## Phase 3: The AI Agent's Brain (LangChain.js)

This is where the intelligent decision-making happens.

### 1. The Tools (Agent's Abilities)

These are the JavaScript functions the agent can choose to call.

- `get_user_roll_number(chat_id)`: Checks the `users` table. Returns the roll number if the user exists, otherwise returns `null`.
    
- `save_user_roll_number(chat_id, roll_number)`: Saves or updates a user's roll number in the `users` table.
    
- `get_overall_attendance(roll_number)`: Calls the scraper but returns only the `overall_percentage`.
    
- `get_detailed_attendance(roll_number)`: Calls the scraper and returns the full JSON object with all subject details.
    

### 2. The Agent Executor

You'll use a LangChain agent executor (e.g., one designed for Gemini's function calling). You provide it with:

- The Gemini LLM instance.
    
- Your array of tools.
    
- The user-scoped memory object created in the core logic loop.
    

---

## Phase 4: Conversation Flow Example

### Flow: A Returning User Asks for a Detailed Report

1. **User sends**: "Show me the full report."
    
2. **Core Logic**:
    
    - Receives message and `chat_id`.
    - Logs "Show me the full report" to the database.
    - Fetches the last 5 conversation turns for this user.
    - Creates a `ConversationBufferWindowMemory` and loads the history.

3. **Agent Execution**:
    - The agent is invoked with the new message and the memory.
    - **Agent's Thought Process**:

4. "The user wants a full report. I need their roll number first."
    
5. _DECISION_: Call the `get_user_roll_number` tool with the current `chat_id`.
    
6. _TOOL EXECUTES_: The function queries the `users` table and returns "24kb1a0357".
    P
7. "Okay, I have the roll number. Now I need the detailed data."
    
8. _DECISION_: Call the `get_detailed_attendance` tool with "24kb1a0357".
    
9. _TOOL EXECUTES_: Your scraper runs and returns the full attendance JSON.
    
10. "I have all the data. Now I will format it into a user-friendly report."
    
    - The agent generates the final, formatted text message.

11. **Core Logic**:
    
    - Receives the formatted report from the agent.

    - Logs the bot's full report message to the database.

    - Sends the report to the user on Telegram.

