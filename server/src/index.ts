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

    const prompt = `Say hello in the following language: ${userInput.language}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });

    const message = response.choices[0].message.content;
    console.log(message);

    res.json({ message: message });
  } catch (error) {
    console.error("Error generating layouts:", error);
    res.status(500).json({ error: "Failed to generate layouts" });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
