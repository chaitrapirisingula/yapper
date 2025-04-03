import dotenv from "dotenv";
import express, { Request, Response } from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { OpenAI } from "openai";

dotenv.config();

const app = express();
const port = 3000;
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

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

app.post("/hello", async (req: Request, res: Response) => {
  try {
    interface UserInput {
      language: string;
    }

    const userInput: UserInput = req.body;

    const prompt = `Say hello in the following language: ${userInput.language} (say the actual phrase and the romanized version of it, do not include any words or information other than that, if there is a more formal or traditional word for hello use that)`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });

    const message = response.choices[0].message.content;
    console.log(message);

    res.json({ message: message });
  } catch (error) {
    console.error("Error getting response:", error);
    res.status(500).json({ error: "Failed to get message." });
  }
});

app.post("/get-question", async (req: Request, res: Response) => {
  try {
    interface UserInput {
      language: string;
      level: string;
      type: QuestionType;
      previousQuestions: string[];
    }

    const userInput: UserInput = req.body;

    const prompt = `
    You are a language tutor.
    You will come up with questions for people to practice ${
      userInput.language
    }. 
    In all the questions, use the actual phrases along with the romanized version of them so it is easy for English speakers to learn.
    Make sure the answer is not revealed anywhere in either of the phrases.
    Generate one question that follows this type: ${
      userInput.type
    }. The question should be for a ${userInput.level} learner. 
    Questions for that type should follow this EXACT format: ${
      questionTypeMap.get(userInput.type)?.description
    }. Here is an example for a spanish beginner question of that type: ${
      questionTypeMap.get(userInput.type)?.example
    }. Base the question off this and change it for given language (${
      userInput.language
    }).
    The question should be short and something one can quickly type up an answer for. 
    Please ask a very easy question with simple words for beginner levels.
    Also, here are the previously asked questions: ${userInput.previousQuestions.join()}. Do not repeat any of these.
    Only say the question. Do not include the answer to the question or any other information. 
    ONCE AGAIN THE ANSWER SHOULD NOT BE REVEALED IN YOUR RESPONSE.
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });

    const message = response.choices[0].message.content;
    console.log(message);

    res.json({ message: message });
  } catch (error) {
    console.error("Error getting response:", error);
    res.status(500).json({ error: "Failed to get question." });
  }
});

app.post("/grade-answer", async (req: Request, res: Response) => {
  try {
    interface UserInput {
      language: string;
      question: string;
      answer: string;
    }

    const userInput: UserInput = req.body;

    const prompt = `
    You are a language tutor teaching ${userInput.language}.
    You will are grading a student's answer to this question: ${userInput.question}. 
    The student answered this: ${userInput.answer}. Is this correct?
    Use the best judgement for determining if the student's answer is close enough to the expected answer.
    It is ok for the student to respond in the romanized answer.
    It should be considered correct if the students answer sounds like the romanized version of the expected answer.
    For example, if the student is learning telugu and the expected answer includes "ఎక్కువ", it should be considered correct if they answer "ekkuva".
    Assume they are unable to use the special characters.
    Be leniant on tildes, accents, and special characters. If that is the only thing the student's answer is missing, it should be considered correct.
    Also be leniant on spelling unless it is crucial to the question. 
    REMEMBER THERE CAN BE MULTIPLE CORRECT ANSWERS SO IF THE STUDENTS ANSWER SEEMS CLOSE TO WHAT YOU EXPECT, IT SHOULD BE CONSIDERED CORRECT.
    The student's answer will be short and you should consider answers correct even if the spelling is slightly off.
    If the answer is incorrect, respond with "false, it should be " followed by the correct answer. 
    If the answer is correct, respond with just "true".
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });

    const message = response.choices[0].message.content;
    console.log(message);

    res.json({ message: message });
  } catch (error) {
    console.error("Error getting response:", error);
    res.status(500).json({ error: "Failed to grade." });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
