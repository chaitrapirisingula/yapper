import dotenv from "dotenv";
import express, { Request, Response } from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { OpenAI } from "openai";

dotenv.config();

const app = express();
const port = 3000;
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

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
      type: string;
      previousQuestions: string[];
    }

    const userInput: UserInput = req.body;

    const prompt = `
    You are a language tutor.
    You will come up with questions for people to practice ${
      userInput.language
    }. 
    In all the questions, use the actual phrases along with the romanized version of them so it is easy for English speakers to learn.
    Generate one question that follows this type: ${
      userInput.type
    }. The question should be for a ${userInput.level} learner. 
    The question should be short and something one can quickly type up an answer for. 
    Please ask a very easy question with simple words for beginner levels.
    Also, here are the previously asked questions: ${userInput.previousQuestions.join()}. Do not repeat any of these.
    Only say the question. Do not include any other information.
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
    Only respond with true or false. (true if correct, false if not)
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
