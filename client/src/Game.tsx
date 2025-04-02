import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

const Game: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [hello, setHello] = useState("hello");
  const navigate = useNavigate();

  const language = searchParams.get("language");
  const level = searchParams.get("level");
  const timeLimit = searchParams.get("timeLimit");
  const questionTypes = searchParams.get("questionTypes");

  useEffect(() => {
    // Redirect to home if any required param is missing
    if (!language || !level || !timeLimit || !questionTypes) {
      navigate("/");
    }

    const getHello = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/hello`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ language: language }),
          }
        );
        if (!response.ok) {
          throw new Error("Failed to fetch hello message");
        }
        const data = await response.json(); // Assuming it's plain text, change to `.json()` if JSON
        setHello(data.message);
      } catch (error) {
        console.error("Error fetching hello:", error);
      }
    };

    getHello();
  }, [language, level, timeLimit, questionTypes, navigate]);

  return (
    <div className="w-full max-w-xl mx-auto p-6">
      <h1 className="text-center">{hello}</h1>
      <h1>Game</h1>
      <p>Language: {language}</p>
      <p>Level: {level}</p>
      <p>Question Types: {questionTypes?.split(",").join(", ")}</p>
      <p>Time Limit: {timeLimit} minutes</p>
    </div>
  );
};

export default Game;
