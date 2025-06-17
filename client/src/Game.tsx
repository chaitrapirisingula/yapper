import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { Timer } from "./Timer";
import { QuestionCard } from "./Question";
import { GameOver } from "./Score";

const Game: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const uid = uuidv4();

  const language = searchParams.get("language");
  const level = searchParams.get("level");
  const timeLimit = searchParams.get("timeLimit");
  const questionTypes = searchParams.get("questionTypes")?.split(",") || [];

  const [currentQuestion, setCurrentQuestion] = useState<string>("");
  const [currentQuestionType, setCurrentQuestionType] = useState<string>("");
  const [userAnswer, setUserAnswer] = useState<string>("");
  const [feedback, setFeedback] = useState<string>("");
  const [score, setScore] = useState(0);
  const [previousQuestions, setPreviousQuestions] = useState<string[]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const timeLimitInSeconds = parseInt(timeLimit || "0") * 60;

  const LOCAL_STORAGE_KEY = `previousQuestionsFor${language}`;

  useEffect(() => {
    if (!language || !level || !timeLimit || !questionTypes.length) {
      navigate("/");
      return;
    }

    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (stored) {
      setPreviousQuestions(JSON.parse(stored));
    }

    fetchNextQuestion();
  }, []);

  const fetchNextQuestion = async () => {
    try {
      setLoading(true);

      const randomType =
        questionTypes[Math.floor(Math.random() * questionTypes.length)];

      const recentQuestions = [
        ...previousQuestions.slice(-50),
        currentQuestion,
      ].filter(Boolean); // avoid empty strings

      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/get-question`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: uid,
            language,
            level,
            type: randomType,
            previousQuestions: recentQuestions,
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to fetch question");

      const data = await response.json();
      setCurrentQuestion(data.message);
      setCurrentQuestionType(randomType);
      setUserAnswer("");
    } catch (err) {
      console.error("Error fetching question:", err);
      setError("Failed to load question. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!currentQuestion || !userAnswer.trim()) return;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/grade-answer`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: uid,
            language,
            question: currentQuestion,
            answer: userAnswer,
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to grade answer");

      const data = await response.json();

      if (data.message.toLowerCase() === "true") {
        const updatedQuestions = [...previousQuestions, currentQuestion];
        setPreviousQuestions(updatedQuestions);
        localStorage.setItem(
          LOCAL_STORAGE_KEY,
          JSON.stringify(updatedQuestions)
        );

        setScore(score + 1);
        setFeedback("nice work!");

        setTimeout(() => {
          setFeedback("");
          fetchNextQuestion();
        }, 500);
      } else {
        setFeedback(data.message);
      }
    } catch (err) {
      console.error("Error grading answer:", err);
      setError("Failed to grade answer. Please try again.");
    }
  };

  const handleTimeUp = () => setGameOver(true);

  if (gameOver) {
    return (
      <GameOver
        score={score}
        language={language || ""}
        level={level || ""}
        timeLimit={Number(timeLimit || "0")}
      />
    );
  }

  return (
    <div className="w-full max-w-xl mx-auto p-6">
      <div className="flex flex-row items-center justify-center gap-2">
        <img src="./logo.png" alt="yapper" className="h-16" />
        <h2 className="text-2xl text-gray-800 text-center font-bold">yapper</h2>
      </div>

      <div className="my-6 flex justify-between items-center">
        <h1 className="text-xl">
          {language} - {level}
        </h1>
        <Timer initialSeconds={timeLimitInSeconds} onTimeUp={handleTimeUp} />
      </div>

      <div className="mb-4 text-center">
        <span className="font-bold">Score: {score}</span>
      </div>

      {loading ? (
        <div className="text-center py-10">Loading question...</div>
      ) : error ? (
        <div className="text-center py-10 text-red-500">{error}</div>
      ) : currentQuestion ? (
        <QuestionCard
          questionType={currentQuestionType}
          question={currentQuestion}
          userAnswer={userAnswer}
          feedback={feedback}
          setUserAnswer={setUserAnswer}
          onSubmit={handleSubmitAnswer}
        />
      ) : (
        <div className="text-center py-10">No question available</div>
      )}
    </div>
  );
};

export default Game;
