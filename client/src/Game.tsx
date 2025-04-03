import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Timer } from "./Timer";
import { QuestionCard } from "./Question";
import { GameOver } from "./Score";

const Game: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Get query parameters
  const language = searchParams.get("language");
  const level = searchParams.get("level");
  const timeLimit = searchParams.get("timeLimit");
  const questionTypes = searchParams.get("questionTypes")?.split(",") || [];

  // Game state
  const [currentQuestion, setCurrentQuestion] = useState<string>("");
  const [currentQuestionType, setCurrentQuestionType] = useState<string>("");
  const [userAnswer, setUserAnswer] = useState<string>("");
  const [feedback, setFeedback] = useState<string>("");
  const [score, setScore] = useState(0);
  const [previousQuestions, setPreviousQuestions] = useState<string[]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Convert timeLimit to seconds for the timer
  const timeLimitInSeconds = parseInt(timeLimit || "0") * 60;

  useEffect(() => {
    // Redirect to home if any required param is missing
    if (!language || !level || !timeLimit || !questionTypes.length) {
      navigate("/");
      return;
    }

    // Initial question fetch
    fetchNextQuestion();
  }, []);

  const fetchNextQuestion = async () => {
    try {
      setLoading(true);

      const randomType =
        questionTypes[Math.floor(Math.random() * questionTypes.length)];

      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/get-question`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            language: language,
            level: level,
            type: randomType,
            previousQuestions: [...previousQuestions, currentQuestion],
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch question");
      }

      const data = await response.json();
      setCurrentQuestion(data.message);
      setCurrentQuestionType(randomType);
      setUserAnswer("");
    } catch (error) {
      console.error("Error fetching question:", error);
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
            language: language,
            question: currentQuestion,
            answer: userAnswer,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to grade answer");
      }

      const data = await response.json();

      if (data.message.toLowerCase() === "true") {
        // Add current question to previous questions to avoid repetition
        setPreviousQuestions([...previousQuestions, currentQuestion]);
        // Increment score
        setScore(score + 1);

        // Add a success message or feedback
        setFeedback("nice work!");

        // Wait for a short time before fetching the next question
        setTimeout(() => {
          // Clear any feedback
          setFeedback("");
          // Fetch next question
          fetchNextQuestion();
        }, 500); // 0.5 seconds delay
      } else {
        // For incorrect answers, stay on the current question
        setFeedback(data.message);
      }
    } catch (error) {
      console.error("Error grading answer:", error);
      setError("Failed to grade answer. Please try again.");
    }
  };

  const handleTimeUp = () => {
    setGameOver(true);
  };

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
        <img src="./logo.png" alt="yapper" className="h-16"></img>
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
