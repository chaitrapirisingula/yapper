import dotenv from "dotenv";
import express, { Request, Response } from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { OpenAI } from "openai";

dotenv.config();

const app = express();
const port = 3000;
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

// Store conversation history per user
const userConversations: Record<string, { role: string; content: string }[]> =
  {};

type QuestionType =
  | "word to definition"
  | "definition to word"
  | "fill in blank"
  | "synonyms"
  | "antonyms";

const questionTypeMap = new Map<
  QuestionType,
  { example: string; description: string }
>([
  [
    "word to definition",
    {
      example: "What does 'gato' mean in English?",
      description:
        "Given a word in the target language, provide its definition or translation in the native language.",
    },
  ],
  [
    "definition to word",
    {
      example: "What is the Spanish word for 'cat'?",
      description:
        "Given a definition or an English word, provide the equivalent word in the target language.",
    },
  ],
  [
    "fill in blank",
    {
      example: "El _____ (cat) está en la casa.",
      description:
        "A sentence is given with a missing word; the user must fill in the blank with the correct word in the target language.",
    },
  ],
  [
    "synonyms",
    {
      example: "What is a synonym for 'rápido' (fast) in Spanish?",
      description:
        "Provide a synonym in the target language that has a similar meaning.",
    },
  ],
  [
    "antonyms",
    {
      example: "What is the opposite of 'caliente' (hot) in Spanish?",
      description:
        "Provide a word in the target language with the opposite meaning.",
    },
  ],
]);

app.use(cors());
app.use(bodyParser.json());

app.get("/", async (_req: Request, res: Response) => {
  res.json({ message: "welcome" });
});

// Function to manage conversation history
function getOrCreateConversation(userId: string, systemMessage: string) {
  if (!userConversations[userId]) {
    userConversations[userId] = [{ role: "system", content: systemMessage }];
  }
  return userConversations[userId];
}

// Function to trim conversation history to avoid token overflow
function trimConversation(userId: string) {
  if (userConversations[userId].length > 10) {
    userConversations[userId] = [
      userConversations[userId][0], // Keep system message
      ...userConversations[userId].slice(-9), // Keep latest 9 exchanges
    ];
  }
}

app.post("/hello", async (req: Request, res: Response) => {
  try {
    const userId = req.body.userId; // Unique user identifier
    const language = req.body.language;

    const systemMessage =
      "You are a language tutor that helps users greet in different languages.";
    const conversation = getOrCreateConversation(userId, systemMessage);

    conversation.push({
      role: "user",
      content: `Say hello in ${language}, including the romanized version.`,
    });

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: conversation as OpenAI.ChatCompletionMessageParam[],
      temperature: 0.7,
    });

    const message = response.choices[0].message.content;
    conversation.push({ role: "assistant", content: message || "" });

    trimConversation(userId);

    res.json({ message });
  } catch (error) {
    console.error("Error getting response:", error);
    res.status(500).json({ error: "Failed to get message." });
  }
});

app.post("/get-question", async (req: Request, res: Response) => {
  try {
    const { userId, language, level, type, previousQuestions } = req.body;

    const systemMessage = `You are a ${language} tutor. Generate practice questions for language learners. 
    Learners are English speakers so use romanized versions of words.`;
    const conversation = getOrCreateConversation(userId, systemMessage);

    const prompt = `
      Generate a ${level} level question for learning ${language}.
      The question should be of type '${type}': ${
      questionTypeMap.get(type)?.description
    }.
      Example question for Spanish: ${questionTypeMap.get(type)?.example}.
      Do not repeat any past questions: ${previousQuestions.join(", ")}.
      Use romanized versions of words in the question.
      Keep the question concise. Do NOT include the answer.
    `;

    conversation.push({ role: "user", content: prompt });

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: conversation as OpenAI.ChatCompletionMessageParam[],
      temperature: 0.7,
    });

    const message = response.choices[0].message.content;
    conversation.push({ role: "assistant", content: message || "" });

    trimConversation(userId);

    res.json({ message });
  } catch (error) {
    console.error("Error getting response:", error);
    res.status(500).json({ error: "Failed to get question." });
  }
});

app.post("/grade-answer", async (req: Request, res: Response) => {
  try {
    const { userId, language, question, answer } = req.body;

    const systemMessage = `You are a ${language} tutor grading student answers. Be lenient on spelling and accents.`;
    const conversation = getOrCreateConversation(userId, systemMessage);

    const prompt = `
      Grade this ${language} answer.
      Question: "${question}"
      Student's answer: "${answer}"
      If correct, respond with "true". If incorrect, respond with "false, it should be {correct answer}".
      Accept romanized answers if they match the expected pronunciation.
    `;

    conversation.push({ role: "user", content: prompt });

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: conversation as OpenAI.ChatCompletionMessageParam[],
      temperature: 0.7,
    });

    const message = response.choices[0].message.content;
    conversation.push({ role: "assistant", content: message || "" });

    trimConversation(userId);

    res.json({ message });
  } catch (error) {
    console.error("Error getting response:", error);
    res.status(500).json({ error: "Failed to grade." });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
